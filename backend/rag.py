"""
RAG pipeline: loads plants.json → embeds sections → stores in ChromaDB.
Call retrieve(query) to get relevant plant context for a user question.
"""

import os
import json
import chromadb
from sentence_transformers import SentenceTransformer

COLLECTION_NAME = "leafeye_plants"
DATA_PATH = os.path.join(os.path.dirname(__file__), "plants.json")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")

print("Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)


def _build_collection() -> chromadb.Collection:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            "plants.json not found. Run: python extract_data.py"
        )

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    sections = data["sections"]
    collection = chroma_client.create_collection(COLLECTION_NAME)

    documents, metadatas, ids = [], [], []
    for s in sections:
        text = f"{s['plant_name']} - {s['title_en']}\n{s['body_en']}"
        documents.append(text)
        metadatas.append({
            "plant_id":   s["plant_id"],
            "plant_name": s["plant_name"],
            "section":    s["title_en"],
        })
        ids.append(f"{s['plant_id']}_{s['order_index']}")

    print(f"Embedding {len(documents)} plant sections...")
    embeddings = embedder.encode(documents).tolist()

    collection.add(
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids,
    )
    print(f"RAG index built: {len(documents)} sections indexed.")
    return collection


def _get_collection() -> chromadb.Collection:
    try:
        col = chroma_client.get_collection(COLLECTION_NAME)
        print(f"Loaded existing RAG index ({col.count()} sections).")
        return col
    except Exception:
        print("No existing index — building now...")
        return _build_collection()


collection = _get_collection()


def retrieve(query: str, n: int = 4) -> str:
    """Return the top-n relevant plant sections as a formatted string."""
    query_vec = embedder.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_vec,
        n_results=n,
        include=["documents", "metadatas"],
    )

    if not results["documents"][0]:
        return ""

    parts = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        parts.append(f"[{meta['plant_name']} — {meta['section']}]\n{doc}")

    return "\n\n---\n\n".join(parts)
