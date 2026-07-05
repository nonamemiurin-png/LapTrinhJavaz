# Rà soát yêu cầu và kết quả nghiên cứu

Tài liệu này phản ánh source hiện tại của repository cá nhân `LapTrinhJavaz`.

## Kết luận

Web app, backend, PostgreSQL/PGVector, RAG, local fine-tuned model, dashboard và
bộ benchmark 50 câu đã có đủ cho phạm vi demo. Luồng A/B thực tế chạy qua
`/api/evaluate/compare`; RAG trả citation có cấu trúc và fine-tuned API sử dụng
Qwen2.5-0.5B-Instruct cùng LoRA adapter.

RAGAS hiện dùng `local-semantic-fallback` với BGE-M3, không phải toàn bộ metric
được chấm bằng LLM-judge chuẩn. Báo cáo và dashboard phải giữ chú thích này.

## Ma trận yêu cầu

| Yêu cầu | Trạng thái | Bằng chứng chính |
|---|---|---|
| PDF, DOCX, PPT/PPTX, TXT | Hoàn thành | `DocumentController`, `DocumentProcessingService` |
| Tự động chunk/embed | Hoàn thành | `ChunkingService`, `GeminiEmbeddingModel`, PGVector |
| Môn học/chương | Hoàn thành | metadata document/chunk và subject filter |
| Danh sách/reindex/xóa tài liệu | Hoàn thành | `/api/documents`, `/{id}/reindex`, `DELETE /{id}` |
| Chat theo phiên | Hoàn thành | `MessageWindowChatMemory`, `ChatHistoryService` |
| Citation có cấu trúc | Hoàn thành | `Citation`, `ChatResponse` |
| Giới hạn trong tài liệu | Hoàn thành | out-of-scope response khi retrieval rỗng |
| Fine-tuned model local | Hoàn thành | `finetuning/api_server.py`, LoRA adapter |
| RAG vs fine-tuning | Hoàn thành | `/api/evaluate/compare`, LLM-as-a-judge |
| Fixed/Semantic/Hierarchical | Hoàn thành | `ChunkingService`, upload/reindex strategy |
| Benchmark embedding | Hoàn thành trong phạm vi miễn phí | E5/PhoBERT/BGE-M3; OpenAI loại do thiếu credit |
| Dashboard benchmark | Hoàn thành | `/research`, `benchmark-summary.json` |
| Test set 50 câu | Hoàn thành | `evaluation/test-set.csv` |
| Bảng RAGAS | Hoàn thành có điều kiện | CSV/JSON 50 câu, local semantic fallback |

## Artifact nghiên cứu

```text
evaluation/
  test-set.csv
  final-results.json
  chunking-benchmark.csv
  embedding-benchmark.csv
  ragas-benchmark.csv
  ragas-llm-benchmark.csv
  ragas-summary.json
  ragas-llm-benchmark-summary.json
  runs/
frontend/public/
  benchmark-summary.json
reports/
  experimental-report.md
scripts/benchmark/
  run_rag_benchmark.py
  run_retrieval_benchmark.py
  run_ragas.py
  run_ragas_local.py
```

## Điểm cần lưu ý trước khi nộp

1. Không commit `.env.local`, API key, OAuth client secret hoặc token.
2. Rà lại 50 ground truth và citation bằng con người trước khi kết luận chính thức.
3. Không gọi local semantic fallback là RAGAS LLM-judge chuẩn.
4. OpenAI embedding chỉ được đưa vào kết quả khi có lần chạy thật; không dùng số liệu giả.
5. Ghi rõ model/checkpoint, corpus, chunking, top-k và thời điểm chạy trong báo cáo.
6. Fine-tuned model có chất lượng thấp hơn RAG trong kết quả hiện tại; đây là kết quả nghiên cứu, không phải lỗi runtime.

## Tài liệu liên quan

- [README](../README.md)
- [Hướng dẫn Windows](./RUN_WINDOWS.md)
- [Báo cáo nhóm](./Nhóm%20Lập%20Trình%20Java.md)
- [Sequence diagrams](./sequence-diagrams.drawio)
- [Báo cáo thực nghiệm](../reports/experimental-report.md)
