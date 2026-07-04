#!/usr/bin/env python3
"""Benchmark retrieval for each backend chunking strategy without generation calls."""

import argparse
import csv
import json
import math
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
TEST_SET = ROOT / "evaluation" / "test-set.csv"


def request_json(url: str, method: str = "GET", body: dict | None = None):
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    request = urllib.request.Request(
        url, data=data, method=method,
        headers={"Content-Type": "application/json; charset=utf-8"} if data else {},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.loads(response.read().decode("utf-8"))


def request_with_retry(url: str, method: str = "GET", body: dict | None = None):
    for attempt in range(3):
        try:
            return request_json(url, method, body)
        except urllib.error.HTTPError:
            if attempt == 2:
                raise
            time.sleep(60)


def wait_for_index(api: str, ids: list[int], timeout: int = 180) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        documents = request_json(f"{api}/documents")
        selected = [item for item in documents if item["id"] in ids]
        if selected and all(item["status"] == "COMPLETED" for item in selected):
            return
        failed = [item for item in selected if item["status"] == "FAILED"]
        if failed:
            raise RuntimeError(f"Index failed: {failed}")
        time.sleep(2)
    raise TimeoutError("Indexing did not complete")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", default="http://localhost:8080/api")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--delay", type=float, default=1.5)
    parser.add_argument("--strategies", nargs="+", default=["fixed", "semantic", "hierarchical"])
    args = parser.parse_args()

    with TEST_SET.open(encoding="utf-8-sig", newline="") as file:
        questions = [row for row in csv.DictReader(file) if row["answerable"].lower() == "true"]
    documents = request_json(f"{args.api}/documents")
    ids = [item["id"] for item in documents]
    results = []

    for strategy in args.strategies:
        for document_id in ids:
            request_json(
                f"{args.api}/documents/{document_id}/reindex?chunkStrategy={strategy}",
                method="POST",
            )
        wait_for_index(args.api, ids)

        hits, reciprocal_ranks, ndcgs = [], [], []
        started = time.perf_counter()
        for row in questions:
            response = request_with_retry(f"{args.api}/evaluation/retrieve", method="POST", body={
                "question": row["question"], "subject": row["subject"], "topK": args.top_k,
            })
            filenames = [hit["filename"] for hit in response["hits"]]
            ranks = [index for index, filename in enumerate(filenames, start=1)
                     if filename == row["evidence_document"]]
            rank = min(ranks) if ranks else None
            hits.append(1 if rank else 0)
            reciprocal_ranks.append(1 / rank if rank else 0)
            ndcgs.append(1 / math.log2(rank + 1) if rank else 0)
            time.sleep(args.delay)

        results.append({
            "chunk_strategy": strategy,
            "embedding_model": "gemini-embedding-001",
            "questions": len(questions),
            f"hit@{args.top_k}": round(sum(hits) / len(hits), 4),
            "mrr": round(sum(reciprocal_ranks) / len(reciprocal_ranks), 4),
            f"ndcg@{args.top_k}": round(sum(ndcgs) / len(ndcgs), 4),
            "duration_seconds": round(time.perf_counter() - started, 2),
        })
        print(json.dumps(results[-1], ensure_ascii=False))
        output = ROOT / "evaluation" / "chunking-benchmark.csv"
        existing = []
        if output.exists():
            with output.open(encoding="utf-8-sig", newline="") as file:
                existing = [row for row in csv.DictReader(file)
                            if row["chunk_strategy"] != strategy]
        merged = existing + [results[-1]]
        with output.open("w", encoding="utf-8-sig", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(merged)
    print(f"Results: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
