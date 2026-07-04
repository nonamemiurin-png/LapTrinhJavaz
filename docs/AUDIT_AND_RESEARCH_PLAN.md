# Rà soát và kế hoạch hoàn thiện

## Kết luận hiện trạng

Project hiện là prototype web app, chưa phải sản phẩm nghiên cứu hoàn chỉnh. Luồng upload → parse → fixed-size chunk → embedding → pgvector → RAG đã có. Chat có memory theo session và trả tên tài liệu nguồn. Các lỗi hợp đồng API chính giữa frontend/backend đã được sửa.

Chưa được phép dùng kết quả hiện tại để kết luận RAG tốt hơn fine-tuning, vì `FineTunedModelService` chỉ trả câu giả lập; chưa có benchmark batch, semantic/hierarchical chunking, nhiều embedding backend, RAGAS, test set có ground truth thật, hoặc đo chi phí.

## Ma trận yêu cầu

| Yêu cầu | Trạng thái | Việc còn lại |
|---|---|---|
| PDF, DOCX, PPTX, TXT | Có | Thử bằng tài liệu thật; bổ sung OCR cho PDF scan nếu cần |
| Tự động chunk/embed | Có một cấu hình fixed-size | Lưu `chunk_strategy`, `embedding_model`, version index |
| Môn học/chương | Có metadata | Thêm filter metadata khi retrieval |
| Danh sách tài liệu index | Có | Xóa đồng thời vectors khi xóa tài liệu |
| Chat theo phiên | In-memory | Persist session/message vào DB nếu cần qua restart |
| Citation | Mức tên file | Bổ sung trang/slide/chunk id và deep link |
| Giới hạn trong tài liệu | Prompt-only | Threshold retrieval + câu từ chối được kiểm thử |
| RAG vs fine-tuning | Chưa hợp lệ | Deploy checkpoint thật và benchmark cùng điều kiện |
| 3 chunking strategies | Chưa có | Implement fixed/semantic/hierarchical pipeline |
| Nhiều embedding models | Chưa có | Adapter + collection riêng theo model/dimension |
| Dashboard benchmark | Demo đơn câu | Đọc kết quả batch CSV/JSON, CI và chi phí |
| Test set 50 câu | Có template | Giảng viên/sinh viên điền ground truth và citations |
| RAGAS report | Chưa có | Chạy pipeline offline và export raw + aggregate |

## Plan triển khai đề xuất

### P0 — làm cho kết quả có giá trị (3–5 ngày)

1. Chọn đúng 1 môn và đóng băng phiên bản corpus; lập manifest tên file, chương, số trang và checksum.
2. Điền đủ `evaluation/test-set.csv`: 50 câu, đáp án chuẩn do người đọc tài liệu viết, trang/slide bằng chứng. Nên có 35 câu answerable, 10 câu tổng hợp nhiều đoạn và 5 câu ngoài phạm vi.
3. Thay mock fine-tuning bằng endpoint thật (Ollama/vLLM/OpenAI-compatible), lưu model id/checkpoint và prompt version.
4. Thêm retrieval threshold, filter môn/chương, citation trang/slide, và xóa vector theo `documentId`.
5. Thêm integration tests cho upload/list/chat/refusal và một smoke test Docker.

### P1 — thực nghiệm RQ phụ (5–7 ngày)

1. Chuẩn hóa interface `ChunkingStrategy`: fixed-size, semantic, hierarchical. Grid tối thiểu: fixed 256/512/768 tokens; overlap 10%/20%; semantic threshold được ghi rõ; hierarchical parent/child sizes được ghi rõ.
2. Chuẩn hóa `EmbeddingProvider`: multilingual-e5-base, PhoBERT-base, text-embedding-3-small; bge-m3 là thí nghiệm mở rộng. PhoBERT không phải sentence embedding model mặc định, phải mô tả pooling/fine-tuning rõ ràng.
3. Tạo index riêng cho từng `(corpus_version, chunker, embedding_model)` để tránh trộn dimension và dữ liệu.
4. Đánh giá retrieval trước generation: Hit@k/Recall@k, MRR, nDCG@k. Đây là metric chính cho RQ chunking/embedding.
5. Chạy lặp ít nhất 3 lần cho latency/cost; giữ nguyên LLM sinh đáp án, top-k, prompt và temperature.

### P2 — RAG vs fine-tuning và báo cáo (4–6 ngày)

1. Chạy ba condition: base model, fine-tuned model, RAG; có thể thêm fine-tuned + RAG nhưng không gộp vào hai nhóm chính.
2. Chạy RAGAS: faithfulness, answer relevancy, context precision, context recall; thêm exact/F1 hoặc LLM judge có rubric và human review mẫu.
3. Ghi latency p50/p95, token/API cost, GPU training/inference hours, storage, thời gian re-index/retrain khi cập nhật tài liệu.
4. Bootstrap 95% CI và báo cả raw per-question results, không chỉ trung bình.
5. Dashboard đọc file kết quả đã version hóa; viết Discussion theo ba trục của RQ chính: accuracy, deployment cost, knowledge updateability.

## Cấu trúc deliverables nên có

```text
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

Mỗi run cần lưu Git commit, timestamp, corpus version, chunker config, embedding model/revision, generator/checkpoint, prompt hash, top-k, temperature và seed. Không điền số liệu benchmark bằng dữ liệu giả.
