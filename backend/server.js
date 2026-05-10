require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// In-memory audio store: id → Buffer, auto-cleaned after 2 minutes
const audioStore = new Map();
function storeAudio(buffer) {
  const id = crypto.randomUUID();
  audioStore.set(id, buffer);
  setTimeout(() => audioStore.delete(id), 120_000);
  return id;
}

// Use Adam for both — free-tier compatible, eleven_multilingual_v2 auto-detects language
const VOICE_IDS = {
  en: process.env.ELEVENLABS_VOICE_EN || 'pNInz6obpgDQGcFmaJgB',
  ur: process.env.ELEVENLABS_VOICE_UR || 'pNInz6obpgDQGcFmaJgB',
};

app.use(cors());
app.use(express.json());

/**
 * POST /api/tts
 * Body: { text, language }
 * language: 'en' or 'ur'
 * Returns: { audioUrl: "data:audio/mpeg;base64,..." }
 */
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text || !language) {
      return res.status(400).json({ error: 'Missing text or language' });
    }

    if (!['en', 'ur'].includes(language)) {
      return res.status(400).json({ error: 'Language must be "en" or "ur"' });
    }

    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
    }

    const voiceId = VOICE_IDS[language];
    console.log(`📢 ElevenLabs TTS [${language}]: "${text.substring(0, 50)}..."`);

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );

    const audioBuffer = Buffer.from(response.data);
    const audioId = storeAudio(audioBuffer);

    console.log(`✅ ElevenLabs TTS generated (${audioBuffer.byteLength} bytes), id=${audioId}`);

    return res.json({ audioId, language, textLength: text.length });
  } catch (error) {
    const detail = error.response
      ? `ElevenLabs ${error.response.status}: ${Buffer.from(error.response.data).toString('utf8')}`
      : error.message;
    console.error('❌ TTS Error:', detail);
    return res.status(500).json({ error: 'Failed to generate speech', message: detail });
  }
});

app.get('/api/audio/:id', (req, res) => {
  const buffer = audioStore.get(req.params.id);
  if (!buffer) return res.status(404).json({ error: 'Audio not found or expired' });
  res.set('Content-Type', 'audio/mpeg');
  res.set('Content-Length', buffer.byteLength);
  res.send(buffer);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LeafEye backend is running' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 LeafEye backend running on http://localhost:${PORT}`);
  console.log(`📢 TTS endpoint: POST http://localhost:${PORT}/api/tts`);
  console.log(`✅ Health check: GET http://localhost:${PORT}/health\n`);
});
