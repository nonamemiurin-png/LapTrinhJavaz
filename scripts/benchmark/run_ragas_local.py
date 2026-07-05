#!/usr/bin/env python3
"""Offline, reproducible semantic fallback for the four RAGAS dimensions.

This is intended for quota-constrained experiments. It uses a local sentence
embedding model instead of an LLM judge and records that methodology in its
summary so the output cannot be mistaken for standard LLM-judged RAGAS.
"""

import argparse
import ast
import csv
import json
import re
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer


def parse_contexts(value: str) -> list[str]:
    if not value:
        return []
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        parsed = ast.literal_eval(value)
    return [str(item).strip() for item in parsed if str(item).strip()]


def sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    return [part.strip() for part in parts if len(part.strip().split()) >= 3]


def average_precision(verdicts: list[int]) -> float:
    relevant = sum(verdicts)
    if not relevant:
        return 0.0
    return sum(
        (sum(verdicts[: index + 1]) / (index + 1)) * verdict
        for index, verdict in enumerate(verdicts)
    ) / relevant


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("raw_results", type=Path)
    parser.add_argument("--output", type=Path, default=Path("evaluation/ragas-benchmark.csv"))
    parser.add_argument("--summary", type=Path, default=Path("evaluation/ragas-summary.json"))
    parser.add_argument("--model", default="BAAI/bge-m3")
    parser.add_argument("--threshold", type=float, default=0.55)
    args = parser.parse_args()

    with args.raw_results.open(encoding="utf-8-sig", newline="") as file:
        rows = [
            row for row in csv.DictReader(file)
            if row.get("mode") == "rag" and not row.get("error") and row.get("answer")
        ]
    if not rows:
        raise SystemExit("No successful RAG rows found")

    prepared = []
    texts: list[str] = []
    for row in rows:
        contexts = parse_contexts(row.get("contexts_json", ""))
        answer_sentences = sentences(row["answer"]) or [row["answer"]]
        reference_sentences = sentences(row["ground_truth"]) or [row["ground_truth"]]
        record = {
            "id": row.get("id", ""),
            "question": row["question"],
            "answer": row["answer"],
            "contexts": contexts,
            "answer_sentences": answer_sentences,
            "reference_sentences": reference_sentences,
        }
        prepared.append(record)
        texts.extend([record["question"], record["answer"]])
        texts.extend(contexts)
        texts.extend(answer_sentences)
        texts.extend(reference_sentences)

    unique_texts = list(dict.fromkeys(texts))
    model = SentenceTransformer(args.model)
    vectors = model.encode(
        unique_texts,
        batch_size=8,
        normalize_embeddings=True,
        show_progress_bar=True,
    )
    embeddings = dict(zip(unique_texts, vectors))

    def similarity(left: str, right: str) -> float:
        return float(np.dot(embeddings[left], embeddings[right]))

    results = []
    for row in prepared:
        contexts = row["contexts"]
        if not contexts:
            faithfulness = context_precision = context_recall = 0.0
        else:
            answer_support = [
                max(similarity(statement, context) for context in contexts)
                for statement in row["answer_sentences"]
            ]
            faithfulness = sum(score >= args.threshold for score in answer_support) / len(answer_support)

            context_verdicts = [
                int(max(similarity(context, ref) for ref in row["reference_sentences"]) >= args.threshold)
                for context in contexts
            ]
            context_precision = average_precision(context_verdicts)

            reference_support = [
                max(similarity(ref, context) for context in contexts)
                for ref in row["reference_sentences"]
            ]
            context_recall = sum(score >= args.threshold for score in reference_support) / len(reference_support)

        results.append({
            "id": row["id"],
            "faithfulness": round(float(faithfulness), 4),
            "answer_relevancy": round(similarity(row["question"], row["answer"]), 4),
            "context_precision": round(float(context_precision), 4),
            "context_recall": round(float(context_recall), 4),
        })

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(results[0]))
        writer.writeheader()
        writer.writerows(results)

    metrics = ("faithfulness", "answer_relevancy", "context_precision", "context_recall")
    summary = {
        metric: round(sum(row[metric] for row in results) / len(results), 4)
        for metric in metrics
    }
    summary.update({
        "sample_size": len(results),
        "method": "local-semantic-fallback",
        "embedding_model": args.model,
        "support_threshold": args.threshold,
        "note": "RAGAS-compatible dimensions; local semantic judge, not standard LLM-judged RAGAS.",
    })
    args.summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
