# Báo cáo thực nghiệm RAG và Fine-tuning

> Trạng thái: đã hoàn thành benchmark paired 50 câu cho RAG và fine-tuned Qwen.

## 1. Câu hỏi nghiên cứu

- RQ chính: RAG hay fine-tuning hiệu quả hơn cho chatbot học tập tiếng Việt về độ chính xác, chi phí triển khai và khả năng cập nhật kiến thức?
- RQ1: Fixed-size, semantic hay hierarchical chunking đạt retrieval accuracy tốt nhất với slide PDF?
- RQ2: multilingual-e5, PhoBERT hay BGE-M3 phù hợp nhất với tài liệu kỹ thuật tiếng Việt?

## 2. Thiết lập

| Thành phần | Giá trị |
|---|---|
| Corpus | Cấu trúc dữ liệu và Giải thuật, version v1 |
| Test set | `evaluation/test-set.csv`, 50 câu |
| Conditions chính | RAG, fine-tuned Qwen |
| Chunking | fixed, semantic, hierarchical |
| Embedding | multilingual-e5-base, PhoBERT-base, BGE-M3; OpenAI bị loại do không có API credit |
| Retrieval metrics | Hit@k, Recall@k, MRR, nDCG@k |
| Generation metrics | token F1, refusal accuracy, RAGAS |
| Operational metrics | latency p50/p95, API/token cost, GPU hours |

Ghi lại Git commit, model revision, prompt version, top-k, temperature, seed và corpus checksum cho mỗi run.

## 3. Kết quả

### 3.1 RAG và fine-tuning

| Condition | Token F1 | Refusal accuracy | Latency p50 | Latency p95 | Chi phí |
|---|---:|---:|---:|---:|---:|
| RAG | 0.4708 (50 câu) | 100% | 2010 ms | 5911 ms | Gemini API free tier |
| Fine-tuned | 0.1364 (50 câu) | 0% | 2984 ms | 25709 ms | RTX 3050 local |

So sánh paired trên cùng đầy đủ 50 câu:

| Condition | Mean token F1 | Mean latency |
|---|---:|---:|
| RAG | 0.4708 | 4044 ms |
| Fine-tuned | 0.1364 | 6803 ms |

Run nguồn:

- RAG: kết quả hợp nhất tại `evaluation/runs/final-rag-50` — 50/50 câu thành công; citation hit rate 97.78%.
- Fine-tuned: `evaluation/runs/20260704-035021` — 50/50 request thành công.

Kết quả thực nghiệm nghiêng rõ về RAG: token F1 cao hơn khoảng 3.45 lần, từ chối đúng toàn bộ câu ngoài phạm vi và có latency thấp hơn trên cấu hình thử nghiệm. Fine-tuned model nhỏ chạy hoàn toàn local nhưng độ chính xác thấp, không biết từ chối câu ngoài phạm vi và có p95 latency cao.

### 3.2 RAGAS

| Faithfulness | Answer relevancy | Context precision | Context recall |
|---:|---:|---:|---:|
| 0.7793 | 0.7123 | 0.4567 | 0.6400 |

Do Gemini bị giới hạn quota/kết nối, bảng trên dùng phương án **RAGAS-compatible local semantic fallback** trên đủ 50 câu, với `BAAI/bge-m3` và ngưỡng semantic support 0.55. Faithfulness đo tỷ lệ mệnh đề trong câu trả lời được context hỗ trợ; answer relevancy là cosine similarity giữa câu hỏi và câu trả lời; context precision/recall đo semantic support giữa context truy xuất và ground truth. Đây là phép đo cục bộ có thể tái lập, không được trình bày như kết quả LLM-judge RAGAS chuẩn. Kết quả từng câu nằm tại `evaluation/ragas-benchmark.csv`, summary tại `evaluation/ragas-summary.json`, script tại `scripts/benchmark/run_ragas_local.py`.

### 3.3 Chunking và embedding

Benchmark retrieval dùng 45 câu answerable, top-k = 5 và `gemini-embedding-001` cố định:

| Chunking strategy | Hit@5 | MRR | nDCG@5 |
|---|---:|---:|---:|
| Fixed-size | 1.0000 | 0.9130 | 0.9352 |
| Semantic | 1.0000 | **0.9378** | **0.9536** |
| Hierarchical | 1.0000 | 0.9130 | 0.9352 |

Semantic chunking xếp hạng tài liệu liên quan tốt nhất trên corpus demo. Tuy nhiên corpus hiện là văn bản TXT đã trích xuất, không phải tập slide PDF nguyên bản; kết quả này trả lời RQ1 trong phạm vi demo và cần lặp lại trên slide PDF thật để tăng external validity.

Benchmark embedding giữ fixed-size chunking và dùng 45 câu answerable:

| Embedding model | Hit@5 | MRR | nDCG@5 |
|---|---:|---:|---:|
| multilingual-e5-base | 1.0000 | **0.9741** | **0.9807** |
| bge-m3 | 1.0000 | 0.8833 | 0.9130 |
| PhoBERT-base (mean pooling) | 1.0000 | 0.7000 | 0.7738 |
| text-embedding-3-small | Loại khỏi phạm vi | Không đủ API credit | Không đủ API credit |

Trong ba model miễn phí đã đo, multilingual-e5-base phù hợp nhất cho retrieval tài liệu kỹ thuật tiếng Việt, tiếp theo là bge-m3 và PhoBERT-base. PhoBERT không phải sentence embedding model mặc định; mean pooling và việc chưa word-segment chuyên biệt là threat to validity. `text-embedding-3-small` được loại khỏi phạm vi thực nghiệm vì tài khoản không có API credit; không thay thế bằng Gemini vì đó là model khác.

## 4. Chi phí và cập nhật kiến thức

- RAG: ghi chi phí embedding/reindex, vector database và inference.
- Fine-tuning: ghi thời gian/GPU train, dung lượng checkpoint và inference.
- Đo riêng thời gian thêm một chương mới: reindex đối với RAG và chuẩn bị dữ liệu/retrain đối với fine-tuning.

## 5. Threats to validity

- Không dùng cùng câu hỏi để vừa train vừa test.
- Ground truth và citation cần được con người duyệt.
- Giữ nguyên generator/prompt khi so sánh chunking và embedding.
- Chạy lặp ít nhất ba lần cho latency và báo lỗi/quota bị loại.

## 6. Kết luận

Trong phạm vi corpus và test set hiện tại, RAG hiệu quả hơn fine-tuning Qwen2.5-0.5B về độ chính xác và khả năng kiểm soát phạm vi kiến thức. Fine-tuning có lợi thế không phụ thuộc API và có thể chạy offline, nhưng cần dataset lớn hơn, huấn luyện kỹ hơn và cơ chế từ chối riêng. Về cập nhật kiến thức, RAG chỉ cần index lại tài liệu mới, trong khi fine-tuning cần chuẩn bị lại dữ liệu và huấn luyện checkpoint mới.
