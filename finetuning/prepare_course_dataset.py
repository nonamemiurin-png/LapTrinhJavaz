#!/usr/bin/env python3
"""Build instruction data from the course corpus without reading the evaluation test set."""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CORPUS_DIR = ROOT / "data" / "corpus" / "ctdlgt"
OUTPUT = Path(__file__).resolve().parent / "data" / "training_data.jsonl"


def paragraphs(text: str) -> list[str]:
    return [item.strip() for item in re.split(r"(?:\r?\n\s*){2,}", text) if item.strip()]


def training_text(chapter: str, index: int, content: str) -> str:
    question = (
        f"Hãy trình bày nội dung số {index} của {chapter} trong môn "
        "Cấu trúc dữ liệu và Giải thuật."
    )
    return (
        f"<|im_start|>user\n{question}<|im_end|>\n"
        f"<|im_start|>assistant\n{content}<|im_end|>"
    )


def main() -> int:
    rows = []
    for source in sorted(CORPUS_DIR.glob("*.txt")):
        chunks = paragraphs(source.read_text(encoding="utf-8-sig"))
        if not chunks:
            continue
        heading_lines = chunks[0].splitlines()
        chapter = heading_lines[1] if len(heading_lines) > 1 else source.stem
        for index, content in enumerate(chunks, start=1):
            rows.append({
                "text": training_text(chapter, index, content),
                "source": source.name,
                "split": "train",
            })

    if not rows:
        raise SystemExit(f"No corpus text found in {CORPUS_DIR}")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8", newline="\n") as file:
        for row in rows:
            file.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(f"Wrote {len(rows)} training rows to {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
