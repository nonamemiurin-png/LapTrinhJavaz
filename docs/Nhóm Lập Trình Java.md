# BÁO CÁO ĐỒ ÁN LẬP TRÌNH JAVA

## Xây dựng chatbot hỏi đáp tài liệu môn học và nghiên cứu RAG so với Fine-tuning trong bối cảnh tiếng Việt

---

## THÔNG TIN ĐỒ ÁN

| Hạng mục | Thông tin |
|---|---|
| Tên đề tài | Xây dựng chatbot cho phép sinh viên hỏi đáp dựa trên tài liệu môn học, đồng thời nghiên cứu và so sánh hiệu quả giữa RAG và Fine-tuning trong bối cảnh tiếng Việt |
| Tên viết tắt | Student Learning Chatbot RBL |
| Loại sản phẩm | Web application và báo cáo nghiên cứu thực nghiệm |
| Backend bắt buộc | Java 17, Spring Boot, Spring AI |
| Frontend | Next.js, React, TypeScript |
| Cơ sở dữ liệu | PostgreSQL và PGVector |
| Repository | <https://github.com/ilymeowmeow/LapTrinhJava> |
| Giảng viên hướng dẫn | Nguyễn Văn Chiến |
| Mã đồ án | 012012213605 |
| Học kỳ/Năm học | 2/2026 |

## THÀNH VIÊN NHÓM

| Họ và tên | Vai trò | Email | Mã số sinh viên | Contribution rate (100%) |
|---|---|---|---|---:|
| Nguyễn Văn Chiến | Supervisor | <chiennv@ut.edu.vn> | None |  |
| Đỗ Thiên Phúc | Leader | <phucdt0164@ut.edu.vn> | 068206000164 |  |
| Huỳnh Lê Bảo Trâm | Member | <nonamemiurin@gmail.com> | 064306011123 |  |
| Huỳnh Thành Phát | Member | <phatht5156@ut.edu.vn> | 093206005156 |  |
| Hà Hữu Tường | Member | <tuonghh2477@ut.edu.vn> | 068206002477 |  |
| Dương Đình Khôi | Member | <khoidd1318@ut.edu.vn> | 096206001318 |  |

> Cột Contribution rate được để trống để nhóm thống nhất và bổ sung sau.

---

# TÓM TẮT (ABSTRACT)

Đồ án xây dựng một chatbot web hỗ trợ sinh viên hỏi đáp dựa trên tài liệu môn học tiếng Việt. Hệ thống sử dụng Java Spring Boot cho backend, Next.js cho frontend, PostgreSQL/PGVector để lưu trữ vector và mô hình ngôn ngữ lớn để sinh câu trả lời. Tài liệu do người dùng tải lên được trích xuất nội dung, chia thành các đoạn nhỏ, tạo embedding và lập chỉ mục trong vector database. Khi sinh viên đặt câu hỏi, hệ thống truy xuất các đoạn liên quan, kết hợp chúng với câu hỏi và gửi tới mô hình sinh để tạo câu trả lời có căn cứ tài liệu.

Bên cạnh sản phẩm kỹ thuật, đồ án nghiên cứu sự khác biệt giữa Retrieval-Augmented Generation (RAG) và Fine-tuning trong bối cảnh chatbot giáo dục tiếng Việt. Thực nghiệm dự kiến đánh giá độ chính xác, khả năng từ chối câu hỏi ngoài phạm vi, chất lượng truy xuất, độ trễ, chi phí triển khai và khả năng cập nhật tri thức. Nghiên cứu đồng thời so sánh các chiến lược chunking gồm fixed-size, semantic và hierarchical; cũng như các embedding model gồm multilingual-e5, PhoBERT, BGE-M3 và OpenAI embedding khi điều kiện API cho phép.

Kết quả cuối cùng cần trả lời liệu RAG hay Fine-tuning phù hợp hơn cho chatbot hỗ trợ học tập, chiến lược chunking nào hiệu quả hơn với tài liệu bài giảng và embedding model nào phù hợp với tài liệu kỹ thuật tiếng Việt. Các kết luận chỉ được hoàn thiện sau khi số liệu thực nghiệm được nhóm xác minh.

**Từ khóa:** chatbot giáo dục, RAG, Fine-tuning, Spring Boot, Spring AI, PGVector, tiếng Việt, embedding, chunking, RAGAS.

---

# MỤC LỤC BÁO CÁO

1. Giới thiệu đề tài
2. Yêu cầu và phạm vi hệ thống
3. Cơ sở lý thuyết và công nghệ
4. Phân tích và thiết kế hệ thống
5. Triển khai hệ thống
6. Thiết kế thực nghiệm
7. Kết quả và thảo luận
8. Kiểm thử và hướng dẫn triển khai
9. Quản lý dự án và đóng góp
10. Kết luận và hướng phát triển
11. Tài liệu tham khảo
12. Phụ lục

---

# I. GIỚI THIỆU ĐỀ TÀI

## 1.1. Bối cảnh và lý do chọn đề tài

Sinh viên đại học thường phải tra cứu lượng lớn giáo trình, slide bài giảng, tài liệu thực hành và tài liệu tham khảo. Việc tìm đúng đoạn thông tin trong nhiều tài liệu mất thời gian, trong khi mô hình ngôn ngữ tổng quát có thể trả lời thiếu căn cứ hoặc tạo thông tin không có trong tài liệu môn học. Vì vậy, một chatbot có khả năng hỏi đáp dựa trên nguồn tài liệu xác định sẽ hỗ trợ quá trình tự học và giảm thời gian tra cứu.

RAG và Fine-tuning là hai hướng tiếp cận phổ biến để điều chỉnh chatbot theo miền tri thức. RAG bổ sung tri thức tại thời điểm truy vấn thông qua retrieval, còn Fine-tuning điều chỉnh tham số hoặc adapter của mô hình bằng dữ liệu huấn luyện chuyên biệt. Hai phương pháp có sự khác biệt đáng kể về độ chính xác, chi phí, khả năng cập nhật và yêu cầu vận hành. Việc đánh giá trong ngữ cảnh tài liệu kỹ thuật tiếng Việt có ý nghĩa cả về kỹ thuật lẫn nghiên cứu.

## 1.2. Mục tiêu tổng quát

Xây dựng một web application chatbot hỗ trợ sinh viên hỏi đáp theo tài liệu môn học, đồng thời thiết kế và thực hiện nghiên cứu so sánh RAG với Fine-tuning trong bối cảnh tiếng Việt.

## 1.3. Mục tiêu cụ thể

- Xây dựng backend Java Spring Boot cung cấp API quản lý tài liệu, hội thoại và hỏi đáp.
- Xây dựng frontend Next.js cho phép đăng nhập, upload tài liệu, chat và xem dashboard nghiên cứu.
- Trích xuất nội dung PDF, DOCX và PPTX; chunk, embed và lưu vào PGVector.
- Giới hạn câu trả lời RAG trong phạm vi tài liệu và hỗ trợ trích dẫn nguồn.
- Lưu lịch sử hội thoại theo phiên.
- Tích hợp mô hình fine-tuned chạy cục bộ để so sánh với RAG.
- Chuẩn bị test set 50 câu hỏi cùng ground truth do con người rà soát.
- Đánh giá các chiến lược chunking và embedding model.
- Tổng hợp số liệu, phân tích chi phí và trả lời các câu hỏi nghiên cứu.

## 1.4. Câu hỏi nghiên cứu

### RQ chính

RAG hay Fine-tuning hiệu quả hơn cho chatbot hỗ trợ học tập với tài liệu tiếng Việt, xét theo độ chính xác, chi phí triển khai và khả năng cập nhật kiến thức?

### RQ phụ 1

Chiến lược chunking nào trong fixed-size, semantic và hierarchical cho retrieval accuracy cao nhất với slide bài giảng PDF?

### RQ phụ 2

Embedding model nào trong multilingual-e5, PhoBERT, BGE-M3 và OpenAI embedding phù hợp nhất cho tài liệu kỹ thuật tiếng Việt?

## 1.5. Đối tượng và phạm vi nghiên cứu

- **Đối tượng sử dụng:** sinh viên và giảng viên.
- **Miền demo:** một môn học thuộc ngành Công nghệ thông tin; báo cáo hiện định hướng nội dung Lập trình Java.
- **Ngôn ngữ:** câu hỏi, tài liệu và câu trả lời chủ yếu bằng tiếng Việt.
- **Dữ liệu:** tài liệu học tập hợp pháp do nhóm chuẩn bị; test set 50 câu có ground truth.
- **Mô hình:** Gemini cho RAG và mô hình nguồn mở fine-tuned chạy local khi khả dụng.
- **Giới hạn:** đồ án không thay thế giảng viên và không bảo đảm câu trả lời luôn đúng tuyệt đối.

## 1.6. Sản phẩm bàn giao

### Sản phẩm kỹ thuật

- Web application chatbot.
- Source code trên GitHub kèm README.
- Test set 50 câu hỏi và ground truth.
- Fine-tuned adapter/checkpoint hoặc hướng dẫn tái lập.

### Sản phẩm nghiên cứu

- Báo cáo thực nghiệm so sánh RAG và Fine-tuning.
- Bảng số liệu benchmark retrieval, generation và RAGAS.
- Dashboard hiển thị kết quả thực nghiệm.

---

# II. YÊU CẦU VÀ PHẠM VI HỆ THỐNG

## 2.1. Yêu cầu chức năng

| Mã | Nhóm chức năng | Mô tả |
|---|---|---|
| FR-01 | Xác thực | Người dùng đăng nhập bằng Google OAuth. |
| FR-02 | Upload tài liệu | Upload PDF, DOCX và PPTX cùng môn học/chương. |
| FR-03 | Xử lý tài liệu | Parse, chunk, embed và index tài liệu tự động. |
| FR-04 | Danh sách tài liệu | Xem tên file, môn học, chương, ngày upload và trạng thái. |
| FR-05 | Xóa tài liệu | Xóa metadata và vector liên quan. |
| FR-06 | Quản lý phiên chat | Tạo, xem lịch sử và xóa phiên hội thoại. |
| FR-07 | RAG chat | Truy xuất context và sinh câu trả lời theo tài liệu. |
| FR-08 | Trích dẫn | Hiển thị nguồn/chunk được dùng để trả lời. |
| FR-09 | Giới hạn phạm vi | Từ chối khi tài liệu không có đủ thông tin. |
| FR-10 | Fine-tuned chat | Gửi câu hỏi tới local fine-tuned model endpoint. |
| FR-11 | A/B benchmark | So sánh RAG với fine-tuned model trên cùng câu hỏi. |
| FR-12 | Research dashboard | Hiển thị generation, retrieval, chunking và embedding metrics. |

## 2.2. Yêu cầu phi chức năng

| Mã | Thuộc tính | Yêu cầu |
|---|---|---|
| NFR-01 | Bảo mật | Không hard-code hoặc commit API key/OAuth secret. |
| NFR-02 | Hiệu năng | Ghi nhận latency và giới hạn top-k retrieval hợp lý. |
| NFR-03 | Khả dụng | Hiển thị lỗi rõ ràng khi database, API hoặc local model không hoạt động. |
| NFR-04 | Bảo trì | Tách Controller, Service, Repository và DTO. |
| NFR-05 | Tái lập | Cấu hình và script benchmark phải được lưu cùng source. |
| NFR-06 | Toàn vẹn dữ liệu | Xóa tài liệu phải xóa cả metadata và vector liên quan. |
| NFR-07 | Minh bạch nghiên cứu | Không sử dụng số liệu giả; ghi rõ model, cấu hình và giới hạn quota. |

## 2.3. Tác nhân hệ thống

- **Sinh viên:** đăng nhập, tạo phiên, đặt câu hỏi và xem lịch sử.
- **Giảng viên/Quản trị viên:** quản lý tài liệu và theo dõi kết quả nghiên cứu.
- **Nhà nghiên cứu:** chạy benchmark và phân tích kết quả.
- **Dịch vụ ngoài:** Google OAuth, Gemini API và local fine-tuned model endpoint.

> Source hiện tại chưa có cơ chế phân quyền vai trò hoàn chỉnh; đây là yêu cầu cần tiếp tục kiểm tra khi hoàn thiện sản phẩm.

---

# III. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

## 3.1. Retrieval-Augmented Generation

RAG kết hợp retrieval với generation. Hệ thống tìm các đoạn văn bản liên quan trong kho tri thức, đưa chúng vào prompt cùng câu hỏi và yêu cầu LLM trả lời dựa trên context. RAG phù hợp với tri thức thường xuyên thay đổi vì chỉ cần index lại tài liệu thay vì huấn luyện lại mô hình.

Quy trình RAG của đồ án:

1. Tải và trích xuất văn bản từ tài liệu.
2. Chia văn bản thành chunks.
3. Tạo embedding cho chunks.
4. Lưu vector và metadata vào PGVector.
5. Tạo embedding cho câu hỏi.
6. Truy xuất top-k chunks gần nhất.
7. Ghép context với prompt.
8. Gọi LLM và trả câu trả lời kèm nguồn.

## 3.2. Fine-tuning

Fine-tuning điều chỉnh mô hình có sẵn trên tập dữ liệu chuyên biệt. Trong đồ án, hướng triển khai phù hợp là Parameter-Efficient Fine-Tuning, ví dụ LoRA, nhằm giảm VRAM và thời gian huấn luyện. Fine-tuning có thể cải thiện phong cách hoặc hành vi của mô hình nhưng cập nhật tri thức mới khó hơn RAG và cần kiểm soát overfitting/hallucination.

## 3.3. Chunking strategies

| Strategy | Mô tả | Ưu điểm | Hạn chế |
|---|---|---|---|
| Fixed-size | Chia theo số ký tự/token cố định, có thể overlap | Nhanh, dễ tái lập | Có thể cắt sai ranh giới ngữ nghĩa |
| Semantic | Chia theo đoạn/chủ đề hoặc độ tương đồng ngữ nghĩa | Giữ ngữ cảnh tốt | Tốn tài nguyên, phụ thuộc model/heuristic |
| Hierarchical | Chia theo cấu trúc chương, mục, đoạn, câu | Bảo toàn cấu trúc tài liệu | Cài đặt và đánh giá phức tạp hơn |

## 3.4. Embedding models

| Model | Đặc điểm sử dụng trong nghiên cứu |
|---|---|
| multilingual-e5-base | Sentence embedding đa ngôn ngữ, có thể chạy local. |
| PhoBERT-base | Mô hình tiếng Việt; cần pooling/word segmentation phù hợp khi dùng cho retrieval. |
| BGE-M3 | Embedding đa ngôn ngữ, hỗ trợ tài liệu dài và chạy local. |
| text-embedding-3-small | Dịch vụ OpenAI; cần API credit và ghi nhận chi phí. |

## 3.5. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 17, Spring Boot, Spring Web, Spring Data JPA, Spring AI |
| Frontend | Next.js, React, TypeScript, Tailwind CSS/Recharts |
| Database | PostgreSQL, PGVector |
| Document parsing | Apache Tika/PDF reader |
| Authentication | NextAuth, Google OAuth |
| RAG model | Gemini thông qua OpenAI-compatible endpoint |
| Fine-tuning | Python, Transformers/PEFT/LoRA tùy cấu hình |
| Container | Docker Compose |
| Build tools | Maven, npm |

---

# IV. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 4.1. Kiến trúc tổng thể

Hệ thống áp dụng kiến trúc phân lớp:

- **Presentation layer:** Next.js UI.
- **API layer:** Spring REST Controller.
- **Business layer:** ChatService, DocumentService và FineTuningService.
- **Data access layer:** Spring Data JPA Repository và VectorStore.
- **Infrastructure:** PostgreSQL/PGVector, Gemini API, Google OAuth và local model API.

## 4.2. Biểu đồ Use Case

<!-- Nhóm sẽ cập nhật nội dung và hình Use Case Diagram sau. -->

## 4.3. Biểu đồ Lớp

<!-- Nhóm sẽ cập nhật nội dung và hình Class Diagram sau. -->

## 4.4. Biểu đồ Quan hệ Thực thể (ERD)

<!-- Nhóm sẽ cập nhật nội dung và hình ERD sau. -->

## 4.5. Biểu đồ Tuần tự

### 4.5.1. File sơ đồ

- **Draw.io:** [sequence-diagrams.drawio](./sequence-diagrams.drawio)
- **Tài liệu đối chiếu:** [AUDIT_AND_RESEARCH_PLAN.md](./AUDIT_AND_RESEARCH_PLAN.md)
- **Quy ước:** actor, participant, lifeline nét đứt, activation bar, message đánh số, return nét đứt và UML frame.

### 4.5.2. Danh sách sequence diagram

| STT | Biểu đồ | Trạng thái |
|---:|---|---|
| 1 | Đăng nhập Google OAuth | Đã triển khai bằng NextAuth |
| 2 | Upload và index tài liệu | Đã triển khai với 3 chunking strategies |
| 3 | Hỏi đáp bằng RAG | Đã triển khai, có memory và citation có cấu trúc |
| 4 | Quản lý phiên và lịch sử chat | Đã triển khai qua `ChatHistoryService` |
| 5 | Hỏi đáp bằng fine-tuned model local | Đã triển khai bằng Qwen + LoRA/FastAPI |
| 6 | A/B Benchmark: RAG và Fine-tuned | Đã triển khai tại `/api/evaluate/compare` |
| 7 | Benchmark Chunking Strategies | Đã có runner, CSV/JSON và dashboard |
| 8 | Benchmark Embedding Models | Đã có runner, CSV/JSON và dashboard |

### 4.5.3. Mô tả chi tiết các sequence diagram

#### a. Đăng nhập Google OAuth

- **Mục đích:** xác thực người dùng trước khi truy cập web application mà không lưu mật khẩu Google trong hệ thống.
- **Actor:** Sinh viên hoặc giảng viên.
- **Thành phần tham gia:** trình duyệt, Next.js, NextAuth và Google OAuth Authorization Server.
- **Thực thể/dữ liệu liên quan:** OAuth authorization code, access token, profile và session NextAuth. Source hiện tại chưa có entity người dùng riêng trong PostgreSQL.
- **Luồng chính:** người dùng chọn đăng nhập; NextAuth chuyển hướng đến Google; Google xác thực và trả authorization code; NextAuth đổi code lấy token/profile, tạo session rồi chuyển về ứng dụng.
- **Ngoại lệ:** Client ID/Secret sai, redirect URI không khớp, người dùng từ chối quyền hoặc email chưa thuộc test users. Hệ thống không tạo session và hiển thị lỗi.
- **Yêu cầu liên quan:** FR-01, NFR-01.

#### b. Upload, chunk, embed và index tài liệu

- **Mục đích:** biến tài liệu môn học thành vector có thể truy xuất trong RAG.
- **Actor:** Giảng viên hoặc người quản trị tài liệu.
- **Thành phần tham gia:** Documents UI, `DocumentController`, `DocumentProcessingService`, `ChunkingService`, `VectorStore`, Gemini embedding và PostgreSQL/PGVector.
- **Thực thể/dữ liệu liên quan:** `Document`, bảng `vector_store`; metadata gồm `documentId`, `filename`, `subject`, `chapter`, `chunkStrategy`.
- **Luồng chính:** frontend gửi file cùng môn/chương/strategy; backend lưu metadata với `PROCESSING`; parser đọc nội dung; `ChunkingService` chạy fixed, semantic hoặc hierarchical; embedding model sinh vector; PGVector lưu vector/metadata; trạng thái chuyển thành `COMPLETED`.
- **Ngoại lệ:** file rỗng/không hỗ trợ, parser lỗi, embedding API lỗi hoặc database không sẵn sàng. Backend cập nhật trạng thái `FAILED` và trả lỗi.
- **Yêu cầu liên quan:** FR-02, FR-03, NFR-03, NFR-05, NFR-06.

#### c. Hỏi đáp bằng RAG

- **Mục đích:** tạo câu trả lời có căn cứ trên tài liệu môn học.
- **Actor:** Sinh viên.
- **Thành phần tham gia:** Chat UI, `ChatController`, `RagService`, `ChatHistoryService`, PGVector và Gemini `ChatClient`.
- **Thực thể/dữ liệu liên quan:** `ChatSession`, `ChatMessage`, `Citation`, các record `vector_store` và metadata nguồn.
- **Luồng chính:** sinh viên gửi câu hỏi; backend lưu USER message; PGVector trả chunks; service ghép context vào prompt, dùng conversation ID cho memory và gọi Gemini; BOT message được lưu rồi trả về cùng sources/citations.
- **Ngoại lệ:** không có context, vector database lỗi hoặc Gemini lỗi/quota. Hệ thống cần từ chối ngoài phạm vi hoặc trả lỗi rõ ràng, không tạo thông tin không có căn cứ.
- **Hạn chế hiện tại:** memory dạng cửa sổ nằm trong tiến trình backend; lịch sử DB vẫn là nguồn bền vững để hiển thị lại phiên.
- **Yêu cầu liên quan:** FR-07, FR-08, FR-09, NFR-02, NFR-03, NFR-07.

#### d. Quản lý phiên và lịch sử chat

- **Mục đích:** tách từng cuộc hội thoại và cho phép xem lại tin nhắn theo thời gian.
- **Actor:** Sinh viên.
- **Thành phần tham gia:** Chat UI, `ChatHistoryController`, `ChatHistoryService`, repository và PostgreSQL.
- **Thực thể/dữ liệu liên quan:** `ChatSession` quan hệ một-nhiều với `ChatMessage`; message chứa role, content và createdAt.
- **Luồng chính:** mỗi request mang session ID; USER/BOT messages được ghi theo phiên; `GET /api/chat/sessions/{id}/messages` mở lại lịch sử và `DELETE` cùng đường dẫn xóa phiên.
- **Ngoại lệ:** session không tồn tại, ID không hợp lệ hoặc database lỗi. Backend cần trả response phù hợp và không trộn dữ liệu giữa các phiên.
- **Cấu hình hiện tại:** `ddl-auto=update`, vì vậy lịch sử không bị tạo lại chỉ vì restart backend.
- **Yêu cầu liên quan:** FR-06, NFR-03, NFR-06.

#### e. Hỏi đáp bằng fine-tuned model local

- **Mục đích:** sử dụng model đã fine-tune chạy local và tạo cơ sở so sánh với RAG.
- **Actor:** Sinh viên hoặc nhà nghiên cứu.
- **Thành phần tham gia:** Chat UI, `ChatController`, `FineTunedModelService`, `RestClient`, local FastAPI và PostgreSQL.
- **Thực thể/dữ liệu liên quan:** `ChatSession`, `ChatMessage`, endpoint URL, model name, prompt và model response.
- **Luồng chính:** người dùng chọn Fine-tune; backend lưu USER message và gửi `{model, prompt, stream:false}` tới endpoint cấu hình; Qwen2.5 + LoRA sinh response; backend lưu BOT message và trả kết quả.
- **Ngoại lệ:** endpoint rỗng, server chưa chạy, payload không tương thích, timeout hoặc response thiếu trường kết quả. Backend trả thông báo cấu hình/kết nối.
- **Yêu cầu liên quan:** FR-10, NFR-03, NFR-05.

#### f. A/B Benchmark RAG và Fine-tuned model

- **Mục đích:** chạy cùng câu hỏi qua hai pipeline và so sánh answer, citation và latency.
- **Actor:** Nhà nghiên cứu hoặc thành viên nhóm.
- **Thành phần tham gia:** Research Dashboard, `EvaluationController`, `RagService`, `FineTunedModelService`, `EvaluationService`, Gemini và local FastAPI.
- **Thực thể/dữ liệu liên quan:** question, ground truth, hai answers, retrieved contexts/sources, latency và evaluation scores. Chưa có experiment entity được xác minh trong source.
- **Luồng chính:** UI gửi câu hỏi đến `/api/evaluate/compare`; backend chạy RAG và fine-tuned trên cùng query; Gemini LLM-as-a-judge chấm hai câu trả lời; endpoint trả hai kết quả, sources và evaluation score.
- **Ngoại lệ:** một model lỗi/timeout. Kết quả cần ghi lỗi riêng và không tự động coi request lỗi là điểm 0 nếu protocol không quy định.
- **Trạng thái:** đã chạy end-to-end; nếu local endpoint chưa sẵn sàng response có `valid_experiment=false`.
- **Yêu cầu liên quan:** FR-11, FR-12, NFR-02, NFR-05, NFR-07.

#### g. Benchmark Chunking Strategies

- **Mục đích:** xác định chunking strategy có retrieval accuracy tốt nhất trên cùng corpus và test set.
- **Actor:** Nhà nghiên cứu.
- **Thành phần tham gia:** Research Dashboard, retrieval benchmark runner, fixed/semantic/hierarchical chunker, embedding model cố định, vector index và retrieval evaluator.
- **Thực thể/dữ liệu liên quan:** corpus version, strategy/config, chunks, questions, evidence, ranked results, Hit@k, MRR và nDCG@k; kết quả nên lưu CSV/JSON hoặc experiment run.
- **Luồng chính:** chunk cùng corpus bằng từng strategy; embed bằng cùng model; index; retrieve top-k; đối chiếu evidence; tính Hit@5/MRR/nDCG@5; lưu CSV/JSON và cập nhật `benchmark-summary.json`.
- **Ngoại lệ:** chunk rỗng, số chunks quá lớn, embedding lỗi hoặc evidence chưa gán nhãn. Runner phải lưu lỗi và cấu hình.
- **Trạng thái:** hoàn thành trong phạm vi bộ test hiện tại; dashboard hiển thị kết quả đã version hóa.
- **Yêu cầu liên quan:** FR-12, NFR-02, NFR-05, NFR-07; phục vụ RQ phụ 1.

#### h. Benchmark Embedding Models

- **Mục đích:** chọn embedding model phù hợp nhất với tài liệu kỹ thuật tiếng Việt khi giữ nguyên chunking strategy.
- **Actor:** Nhà nghiên cứu.
- **Thành phần tham gia:** Research Dashboard, benchmark runner, adapter E5/PhoBERT/BGE-M3/OpenAI, vector index và retrieval evaluator.
- **Thực thể/dữ liệu liên quan:** model/version, vector dimension, chunking config, corpus version, question/evidence, ranked results, retrieval metrics, latency và chi phí; mỗi run cần ID/timestamp.
- **Luồng chính:** lần lượt embed cùng corpus/questions; tạo index; retrieve top-k; tính Hit@5/MRR/nDCG@5; ghi latency; lưu artifact và cập nhật dashboard.
- **Ngoại lệ:** thiếu API credit, model không tải được, dimension không khớp hoặc PhoBERT chưa pooling/word segmentation phù hợp. Model lỗi phải đánh dấu `EXCLUDED/FAILED`, không điền số liệu giả.
- **Trạng thái:** runner và artifact đã có; OpenAI bị loại khi không có credit và không dùng số liệu mô phỏng.
- **Yêu cầu liên quan:** FR-12, NFR-02, NFR-05, NFR-07; phục vụ RQ phụ 2.

## 4.6. Thiết kế dữ liệu

Các thực thể chính trong source hiện tại:

- `ChatSession`: lưu ID, tiêu đề, thời điểm tạo và danh sách tin nhắn.
- `ChatMessage`: lưu session, vai trò USER/BOT, nội dung và thời điểm tạo.
- `CourseDocument`: lưu filename, subject, chapter, upload date và trạng thái index.
- `vector_store`: bảng PGVector do Spring AI quản lý, lưu vector, content và metadata.

## 4.7. Thiết kế API

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/chat/session` | Tạo phiên chat. |
| GET | `/api/chat/session/{id}/messages` | Xem lịch sử phiên. |
| DELETE | `/api/chat/session/{id}` | Xóa phiên. |
| POST | `/api/chat/ask/{id}` | Hỏi theo session. |
| POST | `/api/chat` | Hỏi theo endpoint frontend hiện tại. |
| POST | `/api/documents/upload` | Upload và index tài liệu. |
| GET | `/api/documents` | Lấy danh sách tài liệu. |
| DELETE | `/api/documents/{id}` | Xóa tài liệu và vector. |
| POST | `/api/finetuning/generate-script` | Sinh script fine-tuning. |
| POST | `/api/evaluation/compare` | Endpoint UI mong đợi; backend chưa xác minh. |

---

# V. TRIỂN KHAI HỆ THỐNG

## 5.1. Module quản lý tài liệu

`DocumentService` lưu metadata ở trạng thái `PROCESSING`, đọc nội dung bằng Tika, gắn metadata, chia chunks bằng splitter và thêm vào `VectorStore`. Sau khi thành công, trạng thái chuyển thành `INDEXED`; khi lỗi chuyển thành `FAILED`. Khi xóa, service xóa vector theo `doc_id` và xóa metadata quan hệ.

## 5.2. Module RAG Chat

`ChatService` lưu câu hỏi của người dùng, truy vấn top-k chunks từ vector store, tạo prompt có context và gọi chat model. Kết quả được lưu dưới vai trò BOT. Prompt yêu cầu từ chối nếu tài liệu không chứa thông tin và yêu cầu ghi nguồn.

Các khoảng trống cần hoàn thiện:

- Đưa lịch sử hội thoại vào prompt để bảo đảm chat theo ngữ cảnh.
- Trả `sources` có cấu trúc thay vì chỉ dựa vào text do LLM sinh.
- Áp dụng similarity threshold hoặc kiểm tra context rỗng trước khi gọi LLM.

## 5.3. Module Fine-tuned Chat

Ở chế độ Fine-tuning, backend gửi HTTP request tới local model endpoint do người dùng cấu hình. Kết quả local model được lưu vào lịch sử tương tự RAG. Cần đồng bộ payload giữa backend và API server của mô hình thật.

## 5.4. Module nghiên cứu

Trang Research cung cấp A/B Testing qua `/api/evaluate/compare`, kết quả LLM-as-a-judge và dashboard batch 50 câu. Dashboard đọc `frontend/public/benchmark-summary.json` để hiển thị RAG/fine-tuned, ba chunking strategies, ba embedding models và RAGAS local semantic fallback. Backend, local model và endpoint evaluation đã được kiểm thử end-to-end.

## 5.5. Xác thực và cấu hình bí mật

Frontend sử dụng NextAuth và GoogleProvider. Các biến cần thiết:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```

Backend đọc Gemini key từ biến môi trường; tuyệt đối không ghi key thật vào báo cáo hoặc source.

---

# VI. THIẾT KẾ THỰC NGHIỆM

## 6.1. Corpus và môn học demo

| Thuộc tính | Giá trị |
|---|---|
| Môn học | Lập trình Java / _nhóm xác nhận tên cuối_ |
| Ngôn ngữ | Tiếng Việt, có thuật ngữ kỹ thuật tiếng Anh |
| Định dạng | PDF, DOCX, PPTX |
| Số tài liệu demo đã index | 5 |
| Số chương | 5 |
| Tổng số chunks trong lần smoke test | 14 |

## 6.2. Test set

- Tổng số câu: 50.
- Mỗi câu gồm: ID, question, ground truth, chapter, evidence document/section, answerable và trạng thái review.
- Câu answerable dùng để đo retrieval/generation.
- Câu unanswerable dùng để đo refusal accuracy.
- Ground truth cần được ít nhất một thành viên đọc và xác nhận thủ công.

## 6.3. Biến thực nghiệm

### Biến độc lập

- Phương pháp: RAG hoặc Fine-tuned model.
- Chunking: fixed-size, semantic, hierarchical.
- Embedding: E5, PhoBERT, BGE-M3, OpenAI khi có credit.

### Biến kiểm soát

- Cùng corpus và test set.
- Cùng top-k khi so sánh retrieval.
- Cùng generator/prompt khi so sánh chunking và embedding.
- Cùng phần cứng hoặc ghi rõ cấu hình khác biệt.

### Biến phụ thuộc

- Token F1/answer correctness.
- Citation hit rate và refusal accuracy.
- Hit@k, MRR, nDCG@k.
- Faithfulness, answer relevancy, context precision, context recall.
- Mean/p50/p95 latency.
- Chi phí API, GPU và dung lượng model.

## 6.4. Ma trận thí nghiệm

| ID | Thí nghiệm | Cấu hình | Trạng thái |
|---|---|---|---|
| EXP-01 | RAG vs Fine-tuned | 50 câu hỏi chung | _Nhóm cập nhật_ |
| EXP-02 | Fixed-size chunking | Embedding cố định, top-k cố định | _Nhóm cập nhật_ |
| EXP-03 | Semantic chunking | Embedding cố định, top-k cố định | _Nhóm cập nhật_ |
| EXP-04 | Hierarchical chunking | Embedding cố định, top-k cố định | _Nhóm cập nhật_ |
| EXP-05 | multilingual-e5 | Chunking cố định | _Nhóm cập nhật_ |
| EXP-06 | PhoBERT | Chunking cố định | _Nhóm cập nhật_ |
| EXP-07 | BGE-M3 | Chunking cố định | _Nhóm cập nhật_ |
| EXP-08 | OpenAI embedding | Chỉ chạy khi có API credit | _Nhóm cập nhật_ |

## 6.5. Công thức đánh giá

- **Hit@k:** tỷ lệ câu hỏi có tài liệu đúng trong top-k.
- **MRR:** trung bình nghịch đảo thứ hạng của kết quả đúng đầu tiên.
- **nDCG@k:** chất lượng thứ hạng có xét vị trí và độ liên quan.
- **Token F1:** trung bình điều hòa precision/recall giữa token câu trả lời và ground truth.
- **Refusal accuracy:** tỷ lệ câu ngoài phạm vi được hệ thống từ chối đúng.
- **Citation hit rate:** tỷ lệ câu trả lời trích dẫn đúng tài liệu/chương evidence.
- **RAGAS:** faithfulness, answer relevancy, context precision và context recall; phải ghi rõ LLM judge hoặc local semantic fallback.

## 6.6. Quy trình chạy benchmark

1. Khởi động PostgreSQL/PGVector.
2. Index cùng corpus theo cấu hình thí nghiệm.
3. Chạy lần lượt 50 câu hỏi.
4. Lưu raw result, lỗi, model, cấu hình và timestamp.
5. Tính retrieval/generation metrics.
6. Chạy RAGAS hoặc phương án fallback được mô tả rõ.
7. Lặp lại latency nếu điều kiện cho phép.
8. Tổng hợp bảng, biểu đồ và trả lời RQ.

---

# VII. KẾT QUẢ VÀ THẢO LUẬN

Kết quả trong chương này được tổng hợp từ `evaluation/final-results.json`,
`evaluation/runs/final-comparison.json`, các file CSV benchmark và test set 50
câu. Không sử dụng số liệu mô phỏng cho model bị thiếu API credit.

## 7.1. RAG so với Fine-tuned model

| Metric | RAG | Fine-tuned | Nhận xét |
|---|---:|---:|---|
| Token F1 | **0.4708** | 0.1364 | RAG cao hơn khoảng 3.45 lần |
| Refusal accuracy | **1.0000** | 0.0000 | RAG từ chối đúng 5/5 câu ngoài phạm vi |
| Citation hit rate | **0.9778** | Không áp dụng | RAG trích đúng nguồn ở phần lớn câu answerable |
| Mean latency (ms) | **4,044** | 6,803 | RAG nhanh hơn trong môi trường đo hiện tại |
| p50 latency (ms) | **2,010** | 2,984 | RAG thấp hơn 974 ms |
| p95 latency (ms) | **5,911** | 25,709 | Fine-tuned có tail latency lớn do chạy local |
| Request thành công | 50/50 | 50/50 | Hai pipeline dùng cùng test set |
| Chi phí vận hành | API Gemini + re-index | GPU train + local inference | Chưa quy đổi thành tiền tuyệt đối |
| Cập nhật kiến thức | Upload/re-index tài liệu | Chuẩn bị dữ liệu và train lại adapter | RAG linh hoạt hơn |

RAG vượt trội về F1, khả năng kiểm soát câu ngoài phạm vi và citation. Fine-tuned
model dùng Qwen2.5-0.5B-Instruct LoRA được train trên 29 mẫu, 15 epochs, final
loss 2.848 với RTX 3050 6GB. Quy mô model/dataset nhỏ là nguyên nhân quan trọng
khi diễn giải khoảng cách chất lượng; kết quả không chứng minh mọi mô hình
fine-tuned đều kém RAG.

## 7.2. Benchmark chunking

| Strategy | Questions | Hit@5 | MRR | nDCG@5 | Duration (s) |
|---|---:|---:|---:|---:|---:|
| Fixed-size | 45 | 1.0000 | 0.9130 | 0.9352 | **20.20** |
| Semantic | 45 | 1.0000 | **0.9378** | **0.9536** | 87.75 |
| Hierarchical | 45 | 1.0000 | 0.9130 | 0.9352 | 88.14 |

Cả ba strategy đều đạt Hit@5 bằng 1.0 nên metric này đã bão hòa trên corpus nhỏ.
Semantic xếp đúng evidence lên vị trí cao hơn, thể hiện qua MRR và nDCG@5 tốt
nhất. Fixed-size nhanh hơn khoảng 4.3 lần và là lựa chọn phù hợp khi ưu tiên chi
phí/tốc độ; semantic phù hợp khi ưu tiên chất lượng thứ hạng retrieval.

## 7.3. Benchmark embedding

| Model | Questions | Hit@5 | MRR | nDCG@5 | Duration (s) | Trạng thái |
|---|---:|---:|---:|---:|---:|---|
| multilingual-e5-base | 45 | 1.0000 | **0.9741** | **0.9807** | 2.81 | Đã đo |
| PhoBERT-base | 45 | 1.0000 | 0.7000 | 0.7738 | **1.94** | Đã đo |
| BGE-M3 | 45 | 1.0000 | 0.8833 | 0.9130 | 9.12 | Đã đo |
| text-embedding-3-small | — | — | — | — | — | Loại: không có API credit |

multilingual-e5-base đạt chất lượng thứ hạng cao nhất. BGE-M3 đứng thứ hai nhưng
chậm hơn trong lần chạy này. PhoBERT nhanh nhất nhưng MRR/nDCG thấp nhất; model
này không phải sentence embedding model mặc định và kết quả phụ thuộc cách mean
pooling/word segmentation.

## 7.4. RAGAS

| Faithfulness | Answer relevancy | Context precision | Context recall | Judge/Method | Sample size |
|---:|---:|---:|---:|---|---:|
| **0.7793** | **0.7123** | **0.4567** | **0.6400** | Local semantic fallback, BAAI/bge-m3, threshold 0.55 | 50 |

Đây là RAGAS-compatible local semantic fallback do quota/kết nối Gemini, không
phải RAGAS LLM-judge chuẩn. Faithfulness khá tốt nhưng context precision thấp
hơn các metric khác, cho thấy retrieval còn đưa vào context dư thừa. File từng
câu nằm tại `evaluation/ragas-benchmark.csv`; summary nằm tại
`evaluation/ragas-summary.json`.

## 7.5. Trả lời câu hỏi nghiên cứu

### RQ chính

Trong phạm vi chatbot hỗ trợ môn Cấu trúc dữ liệu và Giải thuật bằng tiếng Việt,
**RAG hiệu quả hơn fine-tuning**. RAG đạt F1 cao hơn 3.45 lần, refusal accuracy
1.0, citation hit 0.9778 và latency tốt hơn. Khi tài liệu thay đổi, RAG chỉ cần
upload/re-index; fine-tuning phải tạo lại dữ liệu và train adapter. Fine-tuned
local tránh chi phí API khi inference nhưng phát sinh chi phí GPU, vận hành model
và chất lượng hiện thấp do model/dataset nhỏ. Vì vậy RAG phù hợp làm giải pháp
chính; fine-tuning phù hợp để thử nghiệm phong cách/hành vi chuyên biệt hoặc kết
hợp với RAG sau này.

### RQ phụ 1

**Semantic chunking cho retrieval ranking tốt nhất**, với MRR 0.9378 và nDCG@5
0.9536. Fixed và hierarchical cùng đạt MRR 0.9130, nDCG@5 0.9352. Tuy nhiên
fixed-size chỉ mất 20.20 giây so với gần 88 giây; nếu ưu tiên tốc độ và corpus
đơn giản, fixed-size có trade-off hợp lý.

### RQ phụ 2

**multilingual-e5-base phù hợp nhất trong ba model miễn phí đã đo**, đạt MRR
0.9741 và nDCG@5 0.9807. BGE-M3 đứng thứ hai (MRR 0.8833), còn PhoBERT thấp hơn
do không được thiết kế trực tiếp cho sentence embedding nếu chưa xử lý pooling
và word segmentation chuyên biệt. Không kết luận về text-embedding-3-small vì
model này bị loại do thiếu API credit.

## 7.6. Threats to validity

- Corpus chỉ thuộc một môn học nên chưa đại diện cho mọi lĩnh vực.
- Test set 50 câu còn nhỏ và phụ thuộc chất lượng ground truth.
- Fine-tuned model nhỏ có thể bất lợi khi so với model API lớn.
- API quota/rate limit có thể ảnh hưởng latency và số mẫu RAGAS.
- PhoBERT không phải sentence embedding model mặc định; pooling và word segmentation ảnh hưởng kết quả.
- Cần tránh dùng cùng câu hỏi cho cả training và testing.
- Ground truth hiện có reviewer/status là `Codex-draft`/`DRAFT`; cần con người
  đọc tài liệu và duyệt lại trước khi dùng làm kết quả học thuật chính thức.
- Hit@5 bằng 1.0 ở mọi cấu hình cho thấy corpus/test set nhỏ làm metric bão hòa;
  MRR và nDCG@5 có giá trị phân biệt cao hơn.
- Latency phụ thuộc mạng, quota Gemini, CPU/GPU và trạng thái warm-up; các duration
  hiện là kết quả của môi trường chạy cụ thể, chưa có confidence interval.
- RAG được chạy thành nhiều batch do quota nhưng giữ nguyên model/cấu hình; điều
  này vẫn có thể tạo nhiễu thời gian giữa các batch.

---

# VIII. KIỂM THỬ VÀ HƯỚNG DẪN TRIỂN KHAI

## 8.1. Kế hoạch kiểm thử

### 8.1.1. Test set đánh giá chatbot

`evaluation/test-set.csv` gồm 50 câu: 45 câu answerable và 5 câu ngoài phạm vi.

| Nhóm câu hỏi | Số lượng |
|---|---:|
| Fact | 20 |
| Definition | 9 |
| Reasoning | 8 |
| Comparison | 6 |
| Out-of-scope | 5 |
| Application | 1 |
| Multi-context | 1 |

Phân bố theo nội dung: Chương 1 có 8 câu, Chương 2 có 10, Chương 3 có 12,
Chương 4 có 7, Chương 5 có 8 và ngoài phạm vi có 5. Mỗi dòng có question,
ground truth, evidence document/section, question type và answerable flag. Hiện
50 dòng vẫn mang trạng thái `DRAFT`, do đó cần human review trước khi nộp chính thức.
Danh sách đầy đủ 50 test case và ground truth được bàn giao dưới dạng CSV tại
`evaluation/test-set.csv` để có thể chạy tự động; báo cáo không lặp lại toàn bộ
50 dòng nhằm tránh sai lệch giữa tài liệu và nguồn dữ liệu chuẩn.

### 8.1.2. Kết quả test kỹ thuật

| Mã test | Chức năng/kịch bản | Kết quả thực tế | Trạng thái |
|---|---|---|---|
| TC-01 | Maven unit tests | 5/5 pass: DocumentController 2, ChunkingService 3 | PASS |
| TC-02 | Frontend production build | Next.js compile, TypeScript và 7 routes thành công | PASS |
| TC-03 | PostgreSQL/PGVector | Container chạy, vector_store có dữ liệu | PASS |
| TC-04 | Health và danh sách tài liệu | `/api/health` và `/api/documents` trả HTTP 200 | PASS |
| TC-05 | RAG answerable | Trả lời BST đúng, có source và 3 citations | PASS |
| TC-06 | RAG không có context | Trả câu từ chối cố định, không bịa thông tin | PASS |
| TC-07 | Session history | Ghi/đọc USER và ASSISTANT theo session | PASS |
| TC-08 | Fine-tuned API | Qwen + LoRA load trên CPU và sinh response | PASS |
| TC-09 | A/B + LLM judge | `valid_experiment=true`, trả hai answer và điểm judge | PASS |
| TC-10 | Batch RAG/fine-tuned | 50/50 request thành công ở cả hai pipeline | PASS |
| TC-11 | RAGAS artifact | 50 dòng, metric hợp lệ trong khoảng 0–1 | PASS |
| TC-12 | Dashboard embedding | Hiển thị E5, PhoBERT và BGE-M3 | PASS |
| TC-13 | Google OAuth tương tác | Cần kiểm thử lại sau khi rotate Client Secret | PENDING |
| TC-14 | Upload PDF/DOCX/PPTX thật | Code hỗ trợ; chưa có biên bản test đủ ba định dạng | PENDING |
| TC-15 | Xóa/reindex tài liệu end-to-end | Có API/unit coverage; cần test thủ công trước demo | PARTIAL |

## 8.2. Yêu cầu môi trường

- JDK 17.
- Maven 3.8+.
- Node.js 18/20+.
- Docker Desktop.
- Python phù hợp với pipeline fine-tuning/benchmark.
- Gemini API key và Google OAuth credentials.

## 8.3. Khởi động database

```powershell
docker compose up -d
docker compose ps
```

## 8.4. Khởi động backend

```powershell
$env:GEMINI_API_KEY="GEMINI_API_KEY_CUA_BAN"
.\run-backend.cmd
```

Backend mặc định: `http://localhost:8080`.

## 8.5. Khởi động frontend

Tạo `frontend/.env.local` chứa OAuth credentials, sau đó:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Frontend mặc định: `http://localhost:3000`.

## 8.6. Cấu hình local model

Từ thư mục gốc chạy `run-finetuned.cmd`. API mặc định ở
`http://localhost:8001/api/generate`; kiểm tra `/health` trả `UP` trước khi chạy
A/B. Backend dùng `FINE_TUNED_MODEL_ENDPOINT` để kết nối endpoint này.

## 8.7. Các lỗi đã ghi nhận khi rà soát

- Lỗi PKIX khi Avast quét HTTPS đã được xử lý trong `run-backend.cmd` bằng
  Windows certificate store, vẫn giữ xác minh TLS.
- Fine-tuned model từng lỗi PEFT/meta-device; API đã chuyển sang tải toàn bộ
  Qwen 0.5B bằng float32 trên CPU khi không có CUDA.
- Gemini LLM judge từng trả HTTP 400 vì request chỉ có system message; prompt đã
  chuyển thành user message.
- PGVector và Gemini embedding hiện thống nhất 768 dimensions.
- `frontend/.env.local` chứa OAuth secret và bị Git ignore. Secret từng xuất
  hiện trong ảnh chụp phải được rotate trước khi demo.
- Hai kiểm thử còn thiếu bằng chứng đầy đủ là OAuth tương tác và upload thủ công
  đủ PDF/DOCX/PPTX.

## 8.8. Truy vết artifact kiểm thử

| Artifact | Nội dung |
|---|---|
| `evaluation/test-set.csv` | 50 câu hỏi, ground truth và evidence |
| `evaluation/final-results.json` | Summary RAG, fine-tuned, chunking, embedding, RAGAS |
| `evaluation/runs/final-comparison.json` | So sánh RAG/fine-tuned 50 câu |
| `evaluation/chunking-benchmark.csv` | Retrieval metric của 3 strategies |
| `evaluation/embedding-benchmark.csv` | Retrieval metric của 3 embedding models |
| `evaluation/ragas-benchmark.csv` | Metric từng câu |
| `frontend/public/benchmark-summary.json` | Dữ liệu dashboard |
| `reports/experimental-report.md` | Báo cáo thực nghiệm chi tiết |

---

# IX. QUẢN LÝ DỰ ÁN VÀ ĐÓNG GÓP

## 9.1. Phân công công việc

| Thành viên | Hạng mục phụ trách | Deliverable/Commit | Trạng thái |
|---|---|---|---|
| Đỗ Thiên Phúc |  |  |  |
| Huỳnh Lê Bảo Trâm |  |  |  |
| Huỳnh Thành Phát |  |  |  |
| Hà Hữu Tường |  |  |  |
| Dương Đình Khôi |  |  |  |

## 9.2. Quy tắc Git

- Mỗi tính năng nên có commit message rõ ràng.
- Không commit API key, `.env.local`, cache, virtual environment hoặc raw checkpoint không cần thiết.
- Pull/rebase trước khi push để tránh ghi đè công việc thành viên.
- PR/commit cần ghi người thực hiện và nội dung kiểm thử.

## 9.3. Tiến độ

| Mốc | Công việc | Người phụ trách | Deadline | Trạng thái |
|---|---|---|---|---|
| M1 | Phân tích yêu cầu và kiến trúc |  |  |  |
| M2 | Quản lý tài liệu và RAG |  |  |  |
| M3 | Frontend và authentication |  |  |  |
| M4 | Fine-tuning/local model |  |  |  |
| M5 | Benchmark và dashboard |  |  |  |
| M6 | Báo cáo, sơ đồ và nghiệm thu |  |  |  |

---

# X. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 10.1. Kết luận

_Nhóm bổ sung sau khi hoàn thiện sản phẩm và xác minh số liệu._

Phần kết luận tối thiểu cần nêu:

- Mức độ hoàn thành web application.
- Kết quả trả lời RQ chính và hai RQ phụ.
- Trade-off giữa RAG và Fine-tuning.
- Hạn chế của corpus, model, quota và test set.

## 10.2. Hướng phát triển

- Hybrid RAG kết hợp fine-tuned generator.
- Reranker và hybrid search dense/sparse.
- Phân quyền Student/Lecturer/Admin hoàn chỉnh.
- Streaming response và citation theo trang/slide.
- Hỗ trợ nhiều môn học, nhiều tenant và LMS.
- Tự động hóa benchmark, version dataset và experiment tracking.
- Theo dõi chi phí, latency và chất lượng theo thời gian.

---

# XI. TÀI LIỆU THAM KHẢO

1. Lewis, P. et al. (2020), *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*.
2. Hu, E. J. et al. (2021), *LoRA: Low-Rank Adaptation of Large Language Models*.
3. Spring AI Reference Documentation: <https://docs.spring.io/spring-ai/reference/>.
4. Spring Boot Reference Documentation: <https://docs.spring.io/spring-boot/>.
5. PostgreSQL Documentation: <https://www.postgresql.org/docs/>.
6. PGVector Repository and Documentation: <https://github.com/pgvector/pgvector>.
7. Next.js Documentation: <https://nextjs.org/docs>.
8. RAGAS Documentation: <https://docs.ragas.io/>.
9. Tài liệu chính thức của các embedding model được sử dụng trong thực nghiệm.

> Nhóm bổ sung trích dẫn theo chuẩn IEEE/APA thống nhất trước khi nộp.

---

# XII. PHỤ LỤC

## Phụ lục A. Cấu trúc repository

```text
LapTrinhJava/
├── backend/                 # Spring Boot backend
├── frontend/                # Next.js frontend
├── finetuning/              # Adapter/checkpoint và training artifacts
├── scripts/                 # Utility/benchmark scripts
├── docs/                    # Báo cáo và sơ đồ
├── docker-compose.yml       # PostgreSQL/PGVector
└── README.md
```

## Phụ lục B. Danh sách tài liệu liên quan

- [Báo cáo nhóm](./Nhóm%20Lập%20Trình%20Java.md)
- [Rà soát yêu cầu và kế hoạch nghiên cứu](./AUDIT_AND_RESEARCH_PLAN.md)
- [File sequence diagram Draw.io](./sequence-diagrams.drawio)

## Phụ lục C. Checklist trước khi nộp

- [ ] Điền mã đồ án, học kỳ và contribution rate.
- [ ] Thêm Use Case Diagram.
- [ ] Thêm Class Diagram.
- [ ] Thêm ERD.
- [ ] Rà soát lại Sequence Diagram theo source cuối.
- [ ] Commit test set 50 câu và ground truth.
- [ ] Điền các bảng kết quả benchmark bằng số liệu đã xác minh.
- [ ] Chạy backend/frontend test trên máy nhóm.
- [ ] Kiểm tra README và hướng dẫn cài đặt.
- [ ] Kiểm tra không có API key/secret trong Git.
- [ ] Chuẩn hóa tài liệu tham khảo.
- [ ] Xuất báo cáo sang PDF và kiểm tra định dạng.
