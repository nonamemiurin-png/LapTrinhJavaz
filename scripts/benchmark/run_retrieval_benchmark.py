#!/usr/bin/env python3
"""Benchmark chunking and embedding choices on the Vietnamese course corpus."""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import time
from pathlib import Path

try:
    import numpy as np
except ImportError:
    np = None


ROOT = Path(__file__).resolve().parents[2]
CORPUS = ROOT / "data" / "corpus" / "ctdlgt"
TEST_SET = ROOT / "evaluation" / "test-set.csv"
MODEL_IDS = {
    "multilingual-e5-base": "intfloat/multilingual-e5-base",
    "phobert-base": "vinai/phobert-base-v2",
    "bge-m3": "BAAI/bge-m3",
}


def normalize(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    return vectors / np.maximum(norms, 1e-12)


class Embedder:
    def __init__(self, name: str):
        self.name = name
        if name == "text-embedding-3-small":
            from openai import OpenAI
            api_key = os.environ.get("OPENAI_EMBEDDING_API_KEY")
            if not api_key:
                raise RuntimeError("Set OPENAI_EMBEDDING_API_KEY with a real OpenAI API key")
            self.client = OpenAI(api_key=api_key)
        elif name == "phobert-base":
            import torch
            from transformers import AutoModel, AutoTokenizer
            self.torch = torch
            self.tokenizer = AutoTokenizer.from_pretrained(MODEL_IDS[name])
            self.model = AutoModel.from_pretrained(MODEL_IDS[name]).eval()
        else:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(MODEL_IDS[name])

    def encode(self, texts: list[str], query: bool = False) -> np.ndarray:
        if self.name == "text-embedding-3-small":
            response = self.client.embeddings.create(
                model=self.name, input=texts, dimensions=768
            )
            return normalize(np.asarray([item.embedding for item in response.data], dtype=np.float32))
        if self.name == "phobert-base":
            batches = []
            with self.torch.no_grad():
                for start in range(0, len(texts), 16):
                    encoded = self.tokenizer(
                        texts[start:start + 16], padding=True, truncation=True,
                        max_length=256, return_tensors="pt"
                    )
                    output = self.model(**encoded).last_hidden_state
                    mask = encoded["attention_mask"].unsqueeze(-1)
                    pooled = (output * mask).sum(1) / mask.sum(1).clamp(min=1)
                    batches.append(pooled.cpu().numpy())
            return normalize(np.concatenate(batches))
        prepared = texts
        if self.name == "multilingual-e5-base":
            prefix = "query: " if query else "passage: "
            prepared = [prefix + text for text in texts]
        return normalize(np.asarray(self.model.encode(prepared, batch_size=16), dtype=np.float32))


def paragraphs(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"(?:\r?\n\s*){2,}", text) if part.strip()]


def fixed_chunks(text: str, size: int = 512, overlap: int = 51) -> list[str]:
    words = text.split()
    step = max(1, size - overlap)
    return [" ".join(words[start:start + size]) for start in range(0, len(words), step)]


def semantic_chunks(text: str, embedder: Embedder, threshold: float = 0.65) -> list[str]:
    parts = paragraphs(text)
    if len(parts) < 2:
        return parts
    vectors = embedder.encode(parts)
    chunks, current = [], parts[0]
    for index in range(1, len(parts)):
        similarity = float(vectors[index - 1] @ vectors[index])
        if similarity >= threshold and len((current + parts[index]).split()) <= 512:
            current += "\n\n" + parts[index]
        else:
            chunks.append(current)
            current = parts[index]
    chunks.append(current)
    return chunks


def hierarchical_chunks(text: str) -> list[str]:
    sections, heading, content = [], "Tài liệu", []
    for line in text.splitlines():
        stripped = line.strip()
        is_heading = bool(re.match(r"(?iu)^(chương|chapter|phần|bài|mục)\s+", stripped))
        if is_heading:
            if content:
                sections.extend(f"[{heading}]\n{chunk}" for chunk in fixed_chunks(" ".join(content)))
            heading, content = stripped, []
        elif stripped:
            content.append(stripped)
    if content:
        sections.extend(f"[{heading}]\n{chunk}" for chunk in fixed_chunks(" ".join(content)))
    return sections or fixed_chunks(text)


def build_index(strategy: str, embedder: Embedder) -> tuple[list[dict], np.ndarray]:
    chunks = []
    for path in sorted(CORPUS.glob("*.txt")):
        text = path.read_text(encoding="utf-8-sig")
        if strategy == "fixed":
            values = fixed_chunks(text)
        elif strategy == "semantic":
            values = semantic_chunks(text, embedder)
        else:
            values = hierarchical_chunks(text)
        chunks.extend({"document": path.name, "text": value} for value in values)
    vectors = embedder.encode([chunk["text"] for chunk in chunks])
    return chunks, vectors


def evaluate(chunks: list[dict], vectors: np.ndarray, queries: list[dict], embedder: Embedder, top_k: int) -> dict:
    query_vectors = embedder.encode([row["question"] for row in queries], query=True)
    hits, reciprocal_ranks, ndcgs = [], [], []
    for row, query_vector in zip(queries, query_vectors):
        ranking = np.argsort(vectors @ query_vector)[::-1][:top_k]
        relevant = row["evidence_document"]
        ranks = [rank for rank, index in enumerate(ranking, start=1) if chunks[index]["document"] == relevant]
        first_rank = min(ranks) if ranks else None
        hits.append(1 if first_rank else 0)
        reciprocal_ranks.append(1 / first_rank if first_rank else 0)
        ndcgs.append(1 / math.log2(first_rank + 1) if first_rank else 0)
    return {
        f"hit@{top_k}": round(float(np.mean(hits)), 4),
        "mrr": round(float(np.mean(reciprocal_ranks)), 4),
        f"ndcg@{top_k}": round(float(np.mean(ndcgs)), 4),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--models", nargs="+", default=list(MODEL_IDS) + ["text-embedding-3-small"])
    parser.add_argument("--strategies", nargs="+", choices=("fixed", "semantic", "hierarchical"), default=("fixed", "semantic", "hierarchical"))
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    if np is None:
        raise SystemExit(
            "Missing retrieval dependencies. Run: "
            "pip install -r scripts/benchmark/requirements-retrieval.txt"
        )

    with TEST_SET.open(encoding="utf-8-sig", newline="") as file:
        queries = [row for row in csv.DictReader(file) if row["answerable"].lower() == "true"]
    if args.limit:
        queries = queries[:args.limit]

    output_dir = ROOT / "evaluation" / "runs" / time.strftime("retrieval-%Y%m%d-%H%M%S")
    output_dir.mkdir(parents=True)
    results = []
    for model_name in args.models:
        embedder = Embedder(model_name)
        for strategy in args.strategies:
            started = time.perf_counter()
            chunks, vectors = build_index(strategy, embedder)
            metrics = evaluate(chunks, vectors, queries, embedder, args.top_k)
            result = {
                "embedding_model": model_name,
                "chunk_strategy": strategy,
                "questions": len(queries),
                "chunks": len(chunks),
                "duration_seconds": round(time.perf_counter() - started, 2),
                **metrics,
            }
            print(json.dumps(result, ensure_ascii=False))
            results.append(result)
            with (output_dir / "retrieval-summary.csv").open("w", encoding="utf-8-sig", newline="") as file:
                writer = csv.DictWriter(file, fieldnames=results[0].keys())
                writer.writeheader()
                writer.writerows(results)
    print(f"Results: {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
