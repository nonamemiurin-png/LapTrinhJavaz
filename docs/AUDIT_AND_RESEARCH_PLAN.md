# Rà soát yêu cầu và kế hoạch nghiên cứu

Tài liệu này phản ánh source code hiện tại của repository tại thời điểm tháng
7/2026. Không xem các tính năng chỉ xuất hiện trong ảnh hoặc bản sao khác là đã
được triển khai nếu chúng không tồn tại trong checkout này.

## 1. Kết luận hiện trạng

Repository cá nhân hiện có đầy đủ frontend, backend, PostgreSQL/PGVector, RAG,
local fine-tuned API, dashboard nghiên cứu và bộ artifact benchmark 50 câu.
Upload/reindex hỗ trợ fixed, semantic và hierarchical; RAG có memory theo session,
lịch sử DB và citation có cấu trúc. Endpoint `/api/evaluate/compare` chạy RAG,
fine-tuned và Gemini LLM-as-a-judge trên cùng câu hỏi.

RAGAS hiện dùng `local-semantic-fallback` với BGE-M3. Đây là đánh giá semantic
offline, không được mô tả như RAGAS LLM-judge chuẩn. OpenAI embedding được loại
khỏi kết quả khi không có API credit, không dùng số liệu mô phỏng.

## 2. Ma trận đối chiếu yêu cầu

| Yêu cầu | Trạng thái trong source hiện tại | Việc cần hoàn thiện/xác minh |
|---|---|---|
| Upload PDF, DOCX, slide/TXT | Hoàn thành | Cần OCR riêng nếu PDF chỉ chứa ảnh |
| Tự động chunk và embed | Hoàn thành | `ChunkingService`, Gemini embedding, PGVector |
| Môn học/chương | Hoàn thành | Metadata và subject filter |
| Danh sách/reindex/xóa | Hoàn thành | API documents và xóa vector theo documentId |
| Chat theo phiên | Hoàn thành | Memory window + lịch sử PostgreSQL |
| Citation | Hoàn thành | Filename, subject, chapter, chunkId, excerpt |
| Giới hạn trong tài liệu | Hoàn thành | Câu từ chối cố định khi retrieval rỗng |
| RAG vs fine-tuning | Hoàn thành | `/api/evaluate/compare` + LLM judge |
| 3 chunking strategies | Hoàn thành | Fixed, semantic, hierarchical |
| Nhiều embedding models | Hoàn thành trong phạm vi miễn phí | OpenAI loại do thiếu credit |
| Dashboard benchmark | Hoàn thành | Batch 50 câu + chunking + embedding + RAGAS |
| Test set 50 câu | Hoàn thành | `evaluation/test-set.csv` |
| RAGAS report | Hoàn thành có điều kiện | Local semantic fallback, phải ghi rõ phương pháp |

## 3. Những điểm cần sửa ưu tiên

### P0 — đã hoàn thành

1. Frontend có đủ source và build thành công.
2. Gemini key đọc từ `GEMINI_API_KEY`, không hard-code.
3. JPA dùng `ddl-auto=update`.
4. Fine-tuned API, RAG và A/B benchmark đã chạy end-to-end.
5. Backend hiện có 5 unit tests pass; vẫn nên bổ sung integration tests.

### P1 — đã hoàn thành phần cốt lõi

1. Upload/reindex nhận fixed, semantic hoặc hierarchical.
2. Metadata lưu documentId, filename, subject, chapter và chunk strategy.
3. API trả citation có cấu trúc.
4. RAG dùng `MessageWindowChatMemory` theo conversation ID.
5. Có câu từ chối cố định; similarity threshold có thể tiếp tục hiệu chỉnh.

### P2 — thực nghiệm có thể tái lập

1. Chốt một corpus môn học và tạo manifest gồm file, chương, checksum/version.
2. Chuẩn bị 50 câu hỏi, ground truth và evidence page/slide do con người duyệt.
3. Tạo index riêng cho từng `(corpus, chunker, embedding model)`.
4. Đánh giá retrieval bằng Hit@k/Recall@k, MRR và nDCG@k.
5. Đánh giá generation bằng faithfulness, answer relevancy, context precision,
   context recall và human review/LLM judge có rubric.
6. Chạy cùng test set cho base model, fine-tuned model và RAG; lưu latency p50,
   p95, chi phí API/GPU, thời gian index/retrain.
7. Lưu raw per-question results, cấu hình và Git commit cho từng run.

## 4. Thiết kế benchmark phù hợp với câu hỏi nghiên cứu

### RQ chính: RAG so với fine-tuning

Giữ cố định test set và rubric. So sánh:

- Độ chính xác/faithfulness.
- Tỷ lệ từ chối đúng với câu ngoài phạm vi.
- Latency và chi phí triển khai.
- Thời gian/công sức cập nhật khi tài liệu thay đổi.

### RQ phụ 1: Chunking strategy

Giữ cố định embedding model và top-k; thay đổi fixed-size, semantic,
hierarchical. Báo Recall@k, MRR, nDCG@k và latency. Không kết luận strategy tốt
nhất chỉ dựa trên số chunks hoặc thời gian chia văn bản.

### RQ phụ 2: Embedding model

Giữ cố định corpus, chunking và top-k; tạo index riêng cho multilingual-e5,
PhoBERT, BGE-M3 và OpenAI nếu có credit. PhoBERT cần mô tả rõ pooling hoặc
fine-tuning vì không phải sentence embedding model mặc định.

## 5. Cấu trúc deliverables đề xuất

```text
docs/
  Nhóm Lập Trình Java.md
  sequence-diagrams.drawio
  RUN_WINDOWS.md
  AUDIT_AND_RESEARCH_PLAN.md
evaluation/
  test-set.csv
  experiment-matrix.csv
  runs/<run-id>/raw-results.csv
  runs/<run-id>/summary.json
reports/
  experimental-report.md
  ragas-benchmark.csv
  figures/
data/
  corpus-manifest.csv
```

Mỗi run nên lưu timestamp, Git commit, corpus version, chunker config,
embedding model/revision, generator/checkpoint, prompt hash, top-k, temperature
và seed. Không dùng số liệu giả làm kết quả thực nghiệm chính thức.

## 6. Liên kết tài liệu

- [Báo cáo nhóm](./Nhóm%20Lập%20Trình%20Java.md)
- [Sơ đồ sequence](./sequence-diagrams.drawio)
- [Hướng dẫn chạy Windows](./RUN_WINDOWS.md)
- [README dự án](../README.md)
