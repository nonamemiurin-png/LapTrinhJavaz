#!/usr/bin/env python3
"""Run the Vietnamese RAG test set against the local Spring Boot API."""

import argparse
import csv
import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_TEST_SET = ROOT / "evaluation" / "test-set.csv"
REFUSAL = "tôi không tìm thấy thông tin này trong tài liệu môn học"


def normalize(text: str) -> list[str]:
    text = unicodedata.normalize("NFC", (text or "").lower())
    return re.findall(r"[\wÀ-ỹ]+", text, flags=re.UNICODE)


def token_f1(prediction: str, ground_truth: str) -> float:
    predicted = Counter(normalize(prediction))
    expected = Counter(normalize(ground_truth))
    overlap = sum((predicted & expected).values())
    if not predicted or not expected or overlap == 0:
        return 0.0
    precision = overlap / sum(predicted.values())
    recall = overlap / sum(expected.values())
    return 2 * precision * recall / (precision + recall)


def ask(api_url: str, row: dict, session_id: str, mode: str) -> tuple[dict, int]:
    payload = json.dumps({
        "message": row["question"],
        "mode": mode,
        "sessionId": session_id,
        "subject": row["subject"],
    }, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        api_url,
        data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    started = time.perf_counter()
    with urllib.request.urlopen(request, timeout=120) as response:
        result = json.loads(response.read().decode("utf-8"))
    return result, round((time.perf_counter() - started) * 1000)


def write_raw(path: Path, results: list[dict]) -> None:
    if not results:
        return
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-url", default="http://localhost:8080/api/chat")
    parser.add_argument("--test-set", type=Path, default=DEFAULT_TEST_SET)
    parser.add_argument("--limit", type=int, default=0, help="0 runs the full test set")
    parser.add_argument("--delay", type=float, default=7.0, help="Seconds between requests")
    parser.add_argument(
        "--retry-errors-from",
        type=Path,
        default=None,
        help="Run only question IDs that contain an error in a previous raw-results.csv",
    )
    parser.add_argument(
        "--modes",
        nargs="+",
        choices=("rag", "finetuned"),
        default=("rag", "finetuned"),
        help="Conditions evaluated on the same test set",
    )
    args = parser.parse_args()

    with args.test_set.open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    if args.retry_errors_from:
        with args.retry_errors_from.open(encoding="utf-8-sig", newline="") as file:
            failed_ids = {
                row["id"] for row in csv.DictReader(file) if row.get("error", "").strip()
            }
        rows = [row for row in rows if row["id"] in failed_ids]
    if args.limit > 0:
        rows = rows[: args.limit]

    run_id = datetime.now().strftime("%Y%m%d-%H%M%S")
    output_dir = ROOT / "evaluation" / "runs" / run_id
    output_dir.mkdir(parents=True, exist_ok=False)
    raw_path = output_dir / "raw-results.csv"
    results = []

    jobs = [(mode, row) for mode in args.modes for row in rows]
    for index, (mode, row) in enumerate(jobs, start=1):
        print(f"[{index}/{len(jobs)}] {mode} {row['id']}: {row['question']}", flush=True)
        base_result = {**row, "mode": mode}
        try:
            response, latency_ms = ask(
                args.api_url, row, f"benchmark-{run_id}-{mode}-{row['id']}", mode
            )
            answer = response.get("answer") or ""
            sources = response.get("sources") or []
            citations = response.get("citations") or []
            contexts = [item.get("excerpt", "") for item in citations if item.get("excerpt")]
            answerable = row["answerable"].lower() == "true"
            refusal_correct = (not answerable) and REFUSAL in " ".join(normalize(answer))
            results.append({
                **base_result,
                "answer": answer,
                "sources": "|".join(sources),
                "contexts_json": json.dumps(contexts, ensure_ascii=False),
                "latency_ms": latency_ms,
                "token_f1": round(token_f1(answer, row["ground_truth"]), 4) if answerable else "",
                "citation_hit": (
                    str(row["evidence_document"] in sources).lower()
                    if answerable and mode == "rag" else ""
                ),
                "refusal_correct": str(refusal_correct).lower() if not answerable else "",
                "error": "",
            })
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            results.append({**base_result, "answer": "", "sources": "", "contexts_json": "[]", "latency_ms": "",
                            "token_f1": "", "citation_hit": "", "refusal_correct": "",
                            "error": str(error)})
        write_raw(raw_path, results)
        if index < len(jobs):
            time.sleep(args.delay)

    by_mode = {}
    for mode in args.modes:
        mode_results = [row for row in results if row["mode"] == mode]
        valid_f1 = [float(row["token_f1"]) for row in mode_results if row["token_f1"] != ""]
        citations = [row["citation_hit"] == "true" for row in mode_results if row["citation_hit"] != ""]
        refusals = [row["refusal_correct"] == "true" for row in mode_results if row["refusal_correct"] != ""]
        latencies = [int(row["latency_ms"]) for row in mode_results if row["latency_ms"] != ""]
        by_mode[mode] = {
            "questions": len(mode_results),
            "successful_requests": len(latencies),
            "mean_token_f1": round(sum(valid_f1) / len(valid_f1), 4) if valid_f1 else None,
            "citation_hit_rate": round(sum(citations) / len(citations), 4) if citations else None,
            "refusal_accuracy": round(sum(refusals) / len(refusals), 4) if refusals else None,
            "mean_latency_ms": round(sum(latencies) / len(latencies)) if latencies else None,
        }

    successful_requests = sum(item["successful_requests"] for item in by_mode.values())
    summary = {
        "run_id": run_id,
        "total_requests": len(results),
        "successful_requests": successful_requests,
        "results_by_mode": by_mode,
        "configuration": {
            "modes": list(args.modes),
            "api_url": args.api_url,
            "test_set": str(args.test_set),
        },
    }
    (output_dir / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"Results: {output_dir}")
    return 0 if successful_requests == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
