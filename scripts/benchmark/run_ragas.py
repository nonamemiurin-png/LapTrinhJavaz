#!/usr/bin/env python3
"""Calculate RAGAS metrics from a completed RAG benchmark run."""

import argparse
import ast
import csv
import json
import math
import os
from pathlib import Path


def load_rows(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    return [
        row for row in rows
        if row.get("mode") == "rag" and not row.get("error") and row.get("answer")
    ]


def parse_contexts(value: str) -> list[str]:
    if not value:
        return []
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        parsed = ast.literal_eval(value)
    return [str(item) for item in parsed if str(item).strip()]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("raw_results", type=Path, help="evaluation/runs/<run-id>/raw-results.csv")
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--limit", type=int, default=None, help="Evaluate only the first N valid rows")
    parser.add_argument("--provider", choices=("gemini", "default"), default="gemini")
    parser.add_argument("--chat-model", default="gemini-2.5-flash")
    parser.add_argument("--embedding-model", default="models/gemini-embedding-001")
    args = parser.parse_args()

    try:
        # RAGAS 0.2 applies nest_asyncio at import time. On Python 3.14 that
        # breaks aiohttp's task detection in a normal command-line process.
        import nest_asyncio
        original_nest_apply = nest_asyncio.apply
        nest_asyncio.apply = lambda *args, **kwargs: None
        from datasets import Dataset
        from ragas import evaluate
        from ragas.run_config import RunConfig
        from ragas.metrics import (
            answer_relevancy,
            context_precision,
            context_recall,
            faithfulness,
        )
        nest_asyncio.apply = original_nest_apply
    except ImportError as error:
        raise SystemExit(
            "Missing RAGAS dependencies. Run: pip install -r scripts/benchmark/requirements-ragas.txt"
        ) from error

    rows = load_rows(args.raw_results)
    if args.limit is not None:
        if args.limit < 1:
            raise SystemExit("--limit must be at least 1")
        rows = rows[:args.limit]
    if not rows:
        raise SystemExit("No successful RAG rows found in raw results")

    llm = None
    embeddings = None
    if args.provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise SystemExit("Set GEMINI_API_KEY (or the backend OPENAI_API_KEY) first")
        from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
        from ragas.embeddings import LangchainEmbeddingsWrapper
        from ragas.llms import LangchainLLMWrapper

        llm = LangchainLLMWrapper(ChatGoogleGenerativeAI(
            model=args.chat_model,
            google_api_key=api_key,
            temperature=0,
        ))
        embeddings = LangchainEmbeddingsWrapper(GoogleGenerativeAIEmbeddings(
            model=args.embedding_model,
            google_api_key=api_key,
        ))

    dataset = Dataset.from_dict({
        "question": [row["question"] for row in rows],
        "answer": [row["answer"] for row in rows],
        "contexts": [parse_contexts(row.get("contexts_json", "")) for row in rows],
        "ground_truth": [row["ground_truth"] for row in rows],
    })
    result = evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
        llm=llm,
        embeddings=embeddings,
        run_config=RunConfig(timeout=600, max_retries=10, max_workers=1),
        batch_size=1,
    )

    output = args.output or args.raw_results.with_name("ragas-benchmark.csv")
    result_frame = result.to_pandas()
    metric_names = ("faithfulness", "answer_relevancy", "context_precision", "context_recall")
    summary = {
        key: round(float(result_frame[key].mean()), 4)
        for key in metric_names
        if key in result_frame.columns
    }
    invalid_metrics = [
        key for key in metric_names
        if key not in summary or math.isnan(summary[key])
    ]
    if invalid_metrics:
        raise SystemExit(
            "RAGAS did not produce valid scores for: " + ", ".join(invalid_metrics)
            + ". Check API quota/rate-limit; no output was saved."
        )
    result_frame.to_csv(output, index=False, encoding="utf-8-sig")
    summary.update({
        "sample_size": len(rows),
        "provider": args.provider,
        "chat_model": args.chat_model if args.provider == "gemini" else "default",
        "embedding_model": args.embedding_model if args.provider == "gemini" else "default",
    })
    output.with_name(f"{output.stem}-summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"RAGAS rows: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
