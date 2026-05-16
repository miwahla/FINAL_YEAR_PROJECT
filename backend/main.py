"""
LeafEye Chatbot + Disease Detection API
Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import io
import json
import logging
import os
import time
import uuid
from pathlib import Path
from threading import Timer
from typing import List

import httpx
import jwt
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from groq import Groq
from pydantic import BaseModel

from rag import collection, retrieve

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("leafeye")

app = FastAPI(title="LeafEye API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    logger.info(f"{request.method} {request.url.path}  →  {response.status_code}  ({ms:.0f}ms)"    )
    return response

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ──────────────────────────────────────────────
# TTS — in-memory audio store
# ──────────────────────────────────────────────
_audio_store: dict[str, bytes] = {}
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")  # Adam

def _schedule_audio_cleanup(audio_id: str, delay: int = 120):
    def _cleanup(): _audio_store.pop(audio_id, None)
    Timer(delay, _cleanup).start()

# ──────────────────────────────────────────────
# SUPABASE JWT AUTH
# ──────────────────────────────────────────────
_security = HTTPBearer()

_SUPABASE_URL = os.getenv("SUPABASE_URL", "https://uimcuhojeuscsubozsxf.supabase.co")
_SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

async def _verify_token(credentials: HTTPAuthorizationCredentials = Depends(_security)):
    token = credentials.credentials
    logger.info(f"AUTH token prefix={token[:20]}... supabase_url={_SUPABASE_URL} anon_key_set={bool(_SUPABASE_ANON_KEY)}")
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.get(
            f"{_SUPABASE_URL}/auth/v1/user",
            headers={"Authorization": f"Bearer {token}", "apikey": _SUPABASE_ANON_KEY},
        )
    logger.info(f"AUTH supabase response: {res.status_code}")
    if res.status_code == 401:
        raise HTTPException(401, "Token expired — please log in again")
    if res.status_code != 200:
        logger.error(f"Supabase auth check failed: {res.status_code} {res.text[:200]}")
        raise HTTPException(401, "Invalid token")
    user = res.json()
    logger.info(f"AUTH ok — user={user.get('email')}")
    return user

SYSTEM_PROMPT = (
    "You are LeafEye's expert farming assistant for Pakistani farmers and home gardeners. "
    "You help with crop care, plant diseases, fertilizers, irrigation, pest control, and harvesting. "
    "The LeafEye database contains information on 18 plants including field crops "
    "(Cotton, Maize, Wheat, Chilli, Coriander, Lemon, Garlic, Onion, Sugarcane, Sunflower, Tomato, Potato, Rice) "
    "and homegrown plants (Aloe Vera, Carrot, Ginger, Lettuce, Mint). "
    "Use the provided context from the LeafEye plant database to answer questions accurately. "
    "IMPORTANT: When the context includes product recommendations with zaraidawai.pk URLs, always include the full URL for each product you mention so the farmer can buy it directly. "
    "Always respond in English by default. "
    "Only switch to Urdu if the user writes in Urdu script (Arabic letters) or Roman Urdu (Urdu written in English letters like 'is plant me kya masla ha'). "
    "When replying in Urdu, use Urdu script — NOT Hindi. Never mix languages in a single response. "
    "Use simple, practical language. Be concise. If the context does not cover the question, say so honestly."
)

# ──────────────────────────────────────────────
# DISEASE DETECTION MODEL (loaded at startup)
# ──────────────────────────────────────────────
_model = None
_class_names: List[str] = []
_temperature: float = 1.0

_INFER_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


@app.on_event("startup")
async def load_detection_model():
    global _model, _class_names, _temperature
    here = Path(__file__).parent
    model_path = here / "efficientnet_leafeye_b3.pt"
    class_path = here / "class_names.json"
    if not (model_path.exists() and class_path.exists()):
        print("Detection model not found — /detect will return 503 until trained.")
        return
    with open(class_path) as f:
        _class_names = json.load(f)
    m = models.efficientnet_b3(weights=None)
    in_feats = m.classifier[1].in_features
    m.classifier = nn.Sequential(nn.Dropout(p=0.4), nn.Linear(in_feats, len(_class_names)))
    checkpoint = torch.load(model_path, map_location="cpu")
    # support both new format {state_dict, temperature} and old plain state_dict
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        m.load_state_dict(checkpoint["state_dict"])
        _temperature = float(checkpoint.get("temperature", 1.0))
    else:
        m.load_state_dict(checkpoint)
        _temperature = 1.0
    m.eval()
    _model = m
    print(f"Detection model loaded — {len(_class_names)} classes — temperature={_temperature:.4f}")


# ──────────────────────────────────────────────
# CHATBOT SCHEMAS
# ──────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []


class ChatResponse(BaseModel):
    reply: str


# ──────────────────────────────────────────────
# CHATBOT ENDPOINT
# ──────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, _user=Depends(_verify_token)):
    try:
        context = retrieve(request.message)

        user_content = request.message
        if context:
            user_content = (
                f"Relevant information from LeafEye plant database:\n\n"
                f"{context}\n\n"
                f"User question: {request.message}"
            )

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in request.history[-6:]:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": user_content})

        response = groq_client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=messages,
            temperature=0.3,
            max_tokens=2500,
            reasoning_effort="none",
        )

        return ChatResponse(reply=response.choices[0].message.content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# DISEASE DETECTION ENDPOINT
# ──────────────────────────────────────────────
class DetectResponse(BaseModel):
    crop: str
    disease: str
    display_disease: str
    confidence: float
    is_healthy: bool


@app.post("/detect", response_model=DetectResponse)
async def detect(crop: str = Form(...), image: UploadFile = File(...), _user=Depends(_verify_token)):
    if _model is None:
        raise HTTPException(503, "Detection model not ready. Run train.py first.")

    img_bytes = await image.read()
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    tensor = _INFER_TRANSFORM(img).unsqueeze(0)

    with torch.no_grad():
        logits = _model(tensor) / _temperature
        probs = torch.softmax(logits, dim=1)[0]

    crop_lower = crop.lower()
    crop_indices = [i for i, c in enumerate(_class_names) if c.startswith(crop_lower + "__")]

    if crop_indices:
        crop_probs = [(probs[i].item(), i) for i in crop_indices]
        best_conf, best_idx = max(crop_probs)
        # Renormalize: express confidence relative to this crop's classes only
        total_crop_prob = sum(p for p, _ in crop_probs)
        confidence = best_conf / total_crop_prob if total_crop_prob > 0 else best_conf
    else:
        best_idx = int(probs.argmax())
        confidence = probs[best_idx].item()

    class_name = _class_names[best_idx]
    disease = class_name.split("__", 1)[1]
    display_disease = disease.replace("_", " ").title()

    return DetectResponse(
        crop=crop,
        disease=disease,
        display_disease=display_disease,
        confidence=round(confidence, 4),
        is_healthy=(disease == "healthy"),
    )


# ──────────────────────────────────────────────
# TTS ENDPOINTS
# ──────────────────────────────────────────────
class TtsRequest(BaseModel):
    text: str
    language: str = "en"

class TtsResponse(BaseModel):
    audioId: str
    language: str
    textLength: int

@app.post("/api/tts", response_model=TtsResponse)
async def tts(req: TtsRequest, _user=Depends(_verify_token)):
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise HTTPException(500, "ELEVENLABS_API_KEY not configured")
    if not req.text.strip():
        raise HTTPException(400, "text is required")

    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
            headers={"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
            json={"text": req.text, "model_id": "eleven_multilingual_v2",
                  "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},
        )
    if res.status_code != 200:
        raise HTTPException(502, f"ElevenLabs error {res.status_code}: {res.text[:200]}")

    audio_id = str(uuid.uuid4())
    _audio_store[audio_id] = res.content
    _schedule_audio_cleanup(audio_id)
    logger.info(f"TTS generated ({len(res.content)} bytes) id={audio_id}")
    return TtsResponse(audioId=audio_id, language=req.language, textLength=len(req.text))

@app.get("/api/audio/{audio_id}")
async def get_audio(audio_id: str):
    buf = _audio_store.get(audio_id)
    if not buf:
        raise HTTPException(404, "Audio not found or expired")
    return Response(content=buf, media_type="audio/mpeg")

# ──────────────────────────────────────────────
# HEALTH CHECK
# ──────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "sections_indexed": collection.count(),
        "detection_model": "loaded" if _model is not None else "not found",
        "detection_classes": len(_class_names),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
