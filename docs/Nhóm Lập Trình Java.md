# Nhóm Lập Trình Java

##    Project Document

|  |  |  |
| --- | --- | --- |
| Group Members |  |  |
| Supervisor | Nguyễn Văn Chiến |  |
| Capstone Project code |  |  |

# I. Project Introduction

## **1. Overview**

### **1.1 Project Information**

- **Project Name:** "Xây dựng chatbot cho phép sinh viên hỏi đáp dựa trên tài liệu môn học, đồng thời nghiên cứu và so sánh hiệu quả giữa RAG và fine-tuning trong bối cảnh tiếng Việt".
- **Abbreviation:** 
- **GitHub Repository:** <https://github.com/ilymeowmeow/LapTrinhJava> 
- **Software Type:** 
- **Target Users:** Student

### **1.2 Core Technology:**

- **Backend Framework:** Spring Boot
- **Frontend:**
- **Database:** 
- **AI Integration:** 
- **Development Tools: Github, VS Code, Intellij**

### **1.3 Project Team**

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| **Full Name** | **Role** | **Email** | **ID Student** | **Contribution rate (100%)** |  |  |
| Nguyễn Văn Chiến | Supervisor | <chiennv@ut.edu.vn> | None |  |  |  |
| Đỗ Thiên Phúc | Leader | <phucdt0164@ut.edu.vn> | 068206000164 |  |  |  |
|  | Member |  |  |  |  |  |
| Huỳnh Thành Phát | Member | <phatht5156@ut.edu.vn> | 093206005156 |  |  |  |
| Hà Hữu Tường | Member | <tuonghh2477@ut.edu.vn> | 068206002477 |  |  |  |
| Dương Đình Khôi | Member | <khoidd1318@ut.edu.vn> | 096206001318 |  |  |  |

## TÓM TẮT (ABSTRACT)

Trong kỷ nguyên số hóa giáo dục, nhu cầu tự học và tra cứu tài liệu môn học của sinh viên ngày càng tăng cao, đòi hỏi các giải pháp hỗ trợ tức thời và chính xác. Nghiên cứu này trình bày quá trình thiết kế và xây dựng một hệ thống chatbot thông minh hỗ trợ học tập sử dụng ngôn ngữ lập trình **Java** làm nền tảng phát triển cốt lõi (framework **spring boot**), kết hợp với cơ sở dữ liệu vector (**Vector Database**) để lưu trữ tri thức môn học.

Trọng tâm của nghiên cứu hướng vào việc phân tích, thực nghiệm và so sánh hiệu quả giữa hai phương pháp tiếp cận tiên tiến nhất hiện nay trong việc cá nhân hóa mô hình ngôn ngữ lớn (LLM): **Truy xuất tăng cường (Retrieval-Augmented Generation - RAG)** và **Tinh chỉnh mô hình (Fine-tuning)** trong bối cảnh tiếng Việt.

Thông qua các thử nghiệm đánh giá định tính và định lượng, kết quả cho thấy:

- **RAG** thể hiện ưu thế vượt trội trong việc truy xuất chính xác thông tin từ tài liệu giáo trình, loại bỏ hầu hết hiện tượng ảo giác (hallucination), dễ dàng cập nhật tài liệu mới mà không tốn chi phí huấn luyện lại mô hình. Tuy nhiên, chất lượng câu trả lời phụ thuộc nhiều vào giải pháp phân tách từ tiếng Việt (tokenization/segmentation) và hiệu năng của mô hình nhúng (Embedding Model).
- **Fine-tuning** giúp mô hình nắm vững cấu trúc ngữ pháp tiếng Việt, hiểu sâu các thuật ngữ chuyên ngành đặc thù của môn học, đồng thời chuẩn hóa giọng điệu phản hồi mang tính sư phạm. Tuy nhiên, phương pháp này đòi hỏi tài nguyên tính toán lớn (GPU), quy trình gán nhãn dữ liệu Q&A phức tạp và dễ gặp hiện tượng ảo giác nếu thông tin cần truy vấn nằm ngoài tập dữ liệu huấn luyện.

Từ những phát hiện đó, nghiên cứu đề xuất một **kiến trúc lai (Hybrid Architecture)** phối hợp sức mạnh của cả hai phương pháp: sử dụng mô hình nền tảng đã được tinh chỉnh (Fine-tuned LLM) về mặt ngôn ngữ tiếng Việt chuyên ngành làm bộ não xử lý thông tin đầu ra cho hệ thống RAG. Giải pháp này giúp chatbot đạt được cả độ chính xác cao về kiến thức tài liệu lẫn văn phong phản hồi tự nhiên, học thuật và thuần Việt.


## 1. MỞ ĐẦU

### 1.1. Lý do chọn đề tài

Trong những năm gần đây, sự bùng nổ của Trí tuệ Nhân tạo, đặc biệt là các mô hình ngôn ngữ Lớn (LLMs - Large Language Models) như GPT, LLaMA, hay Gemini, đã mở ra những hướng đi mới trong việc tối ưu hóa quy trình dạy và học. Tại môi trường đại học, sinh viên thường phải đối mặt với một khối lượng tài liệu học thuật khổng lồ, từ giáo trình, bài giảng slide, đến tài liệu hướng dẫn thực hành và ngân hàng câu hỏi ôn tập. Việc tìm kiếm thông tin cụ thể hoặc giải đáp các thắc mắc chuyên môn ngoài giờ lên lớp thường gặp nhiều trở ngại do sự giới hạn về thời gian của giảng viên và trợ giảng. Do đó, nhu cầu xây dựng một trợ lý học tập ảo (chatbot) có khả năng hỏi đáp tự động, chính xác dựa trên tài liệu môn học là vô cùng cấp thiết.

Tuy nhiên, việc áp dụng trực tiếp các mô hình ngôn ngữ lớn thương mại sẵn có gặp phải hai thách thức lớn:

- **Ảo giác thông tin và thiếu tri thức nội bộ:** LLM nguyên bản không có quyền truy cập vào tài liệu môn học đặc thù của trường hoặc của giảng viên, dẫn đến việc chatbot trả lời sai lệch hoặc tự bịa đặt câu trả lời.
- **Khó khăn trong ngôn ngữ tiếng việt chuyên ngành:** Ngữ nghĩa tiếng Việt có độ phức tạp cao, đặc biệt khi kết hợp với các thuật ngữ chuyên ngành công nghệ thông tin và lập trình java, đòi hỏi hệ thống phải có khả năng hiểu ngữ cảnh rất sâu.

Để giải quyết vấn đề này, hai hướng tiếp cận chính thường được áp dụng là:

1. **Retrieval-Augmented Generation (RAG):** Truy xuất thông tin liên quan từ tài liệu ngoại vi và đưa vào ngữ cảnh (prompt) của mô hình để sinh câu trả lời.
2. **Fine-tuning (Tinh chỉnh mô hình):** Huấn luyện lại một phần hoặc toàn bộ các trọng số của mô hình ngôn ngữ trên tập dữ liệu chuyên biệt để thay đổi hành vi và tri thức của nó.

Việc so sánh hiệu quả giữa RAG và Fine-tuning trong bối cảnh tiếng Việt, đặc biệt là tích hợp trong một hệ thống ứng dụng được phát triển thuần túy bằng ngôn ngữ Java dựa trên framework Spring Boot, sẽ mang lại những đóng góp khoa học và thực tiễn giá trị cho việc triển khai chatbot giáo dục.

### 1.2. Mục tiêu nghiên cứu

Đề tài hướng tới các mục tiêu cụ thể sau:

- **Xây dựng hệ thống chatbot hoàn chỉnh:** Thiết kế và lập trình phần mềm chatbot bằng ngôn ngữ Java (sử dụng framework Spring Boot kết hợp module Spring AI), tích hợp cơ sở dữ liệu vector và LLM để sinh viên dễ dàng tương tác.
- **Nghiên cứu lý thuyết sâu sắc:** Phân tích bản chất kỹ thuật, luồng xử lý và cách tối ưu hóa của cả hai phương pháp RAG và Fine-tuning.
- **Đánh giá thực nghiệm và so sánh đối chiếu:** Tiến hành các thực nghiệm trên tập dữ liệu tài liệu môn học tiếng Việt nhằm so sánh hai phương pháp về: độ chính xác của câu trả lời, chi phí tài nguyên tính toán (GPU/CPU), thời gian phản hồi, khả năng cập nhật tri thức mới và mức độ ảo giác.
- **Đề xuất mô hình tối ưu:** Đưa ra giải pháp kiến trúc lai hiệu quả nhất cho chatbot giáo dục phục vụ sinh viên CNTT tại Việt Nam.

### 1.3. Đối tượng và phạm vi nghiên cứu

- **Đối tượng nghiên cứu:**
    - Các tài liệu học tập của môn học Lập trình Java (Bài giảng, slide, giáo trình, code mẫu thực hành).
    - Phương pháp xây dựng chatbot dựa trên RAG và Fine-tuning.
    - Các thư viện, công cụ hỗ trợ AI chính thức trong hệ sinh thái Java (Spring Boot, Spring AI).
- **Phạm vi nghiên cứu:**
    - Thử nghiệm trên mô hình ngôn ngữ lớn nguồn mở (như LLaMA-3, Qwen-2) và mô hình thương mại (như GPT-4o, Gemini-1.5-Pro).
    - Sử dụng cơ sở dữ liệu Vector (như Pgvector, Milvus hoặc Chroma) thông qua các cấu hình kết nối của Spring Boot.
    - Đánh giá chất lượng câu trả lời bằng tiếng Việt chuyên ngành lập trình.Phân tích và Thiết kế Hệ thống Chatbot AI  
1. Biểu đồ Use Case (Use Case Diagram)

**Tác nhân (Actors):** Hệ thống có hai đối tượng tương tác chính là **Sinh viên** (End-user cấp thấp) và **Giảng viên** (Admin cấp cao).

**Phân quyền tương tác:**

- **Sinh viên** chỉ được cấp quyền truy cập vào các tác vụ cơ bản: *Quản lý phiên trò chuyện* (Tạo mới, xem lịch sử) và *Trò chuyện với AI* (để nhận câu trả lời cho các câu hỏi học thuật).
- **Giảng viên** được kế thừa toàn bộ quyền của Sinh viên, đồng thời được cấp thêm các quyền đặc quyền quản trị dữ liệu: *Thêm/Xóa Tài liệu Học thuật* (nạp kiến thức mới cho RAG) và *Huấn luyện mô hình - FineTuning* (tinh chỉnh mô hình AI cho bài toán cụ thể).

Nguyên tắc này đảm bảo **Tính Toàn vẹn dữ liệu (Data Integrity)** và **Tính Bảo mật (Security)**, ngăn chặn việc người dùng thông thường vô tình can thiệp vào cơ sở tri thức hoặc bộ trọng số của hệ thống AI.

## 2. Biểu đồ Lớp (Class Diagram)

### Nguyên lý thiết kế mã nguồn (Class Architecture Principles)

- **Kiến trúc phân lớp N-Tier (N-Tier Architecture):** Mã nguồn tuân thủ nghiêm ngặt mô hình 3 lớp (Controller -\> Service -\> Repository).
    - **Controller Layer (**`ChatController`**, **`DocumentController`**):** Chỉ đóng vai trò như một API Gateway, tiếp nhận HTTP Request, bóc tách Payload và trả về HTTP Response. Tuyệt đối không chứa logic nghiệp vụ (Business Logic).
    - **Service Layer (**`ChatService`**, **`DocumentService`**):** Đây là lõi trung tâm của hệ thống (Core Logic). Chứa thuật toán, logic xử lý RAG, logic Fine-tuning và thao tác tính toán nghiệp vụ.
    - **Repository Layer (Spring Data JPA):** Đảm nhiệm việc giao tiếp với Database (ORM - Object Relational Mapping).
- **Tính đóng gói (Encapsulation) & DI (Dependency Injection):** Các thuộc tính của Entity (`id`, `title`, `content`) đều được định nghĩa là `private` (-) để ẩn giấu dữ liệu. Các Service được tiêm (Inject) vào Controller thông qua cơ chế IoC (Inversion of Control) của Spring Boot, giúp giảm bớt sự phụ thuộc cứng (Loose Coupling).

## 3. Biểu đồ Tuần tự (Sequence Diagram)

File sơ đồ hoàn chỉnh: [`sequence-diagrams.drawio`](./sequence-diagrams.drawio). Sơ đồ gồm tám trang và đã được đối chiếu với source `com.chatbot` hiện tại.

### 3.1. Đăng nhập Google OAuth

NextAuth chuyển sinh viên đến Google OAuth, nhận callback, đổi authorization code lấy hồ sơ và tạo session. Luồng yêu cầu `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL` và `NEXTAUTH_SECRET` trong `frontend/.env.local`.

### 3.2. Upload, chunk, embedding và index tài liệu

`Documents UI` gửi file, môn, chương và `chunkStrategy` tới `POST /api/documents/upload`. `DocumentController` lưu metadata, sau đó `DocumentProcessingService` parse file và gọi `ChunkingService` với fixed, semantic hoặc hierarchical. Chunks được gắn `documentId`, filename, subject, chapter và strategy trước khi `VectorStore` tạo embedding/lưu PGVector. Trạng thái tài liệu chuyển từ `PROCESSING` sang `COMPLETED` hoặc `FAILED`.

### 3.3. Hỏi đáp bằng RAG

`ChatController` nhận `ChatRequest`, sau đó `RagService` lưu USER message, tạo embedding cho câu hỏi, truy xuất các chunks liên quan (có thể lọc subject), ghép context vào system prompt và gọi Gemini. BOT message được lưu lại; response trả cả `sources` và danh sách `Citation` gồm filename, subject, chapter, chunkId và excerpt. Nếu không có context, hệ thống trả câu từ chối cố định.

### 3.4. Quản lý phiên và lịch sử chat

`GET /api/chat/sessions/{sessionId}/messages` đọc lịch sử qua `ChatHistoryService`; `DELETE` cùng đường dẫn xóa phiên. `RagService` đồng thời dùng `MessageWindowChatMemory` và conversation ID để duy trì ngữ cảnh trong thời gian backend hoạt động.

### 3.5. Hỏi đáp bằng mô hình fine-tuned local

Khi mode là fine-tuned, `FineTunedModelService` gửi `{model, prompt, stream:false}` đến endpoint cấu hình bởi `FINE_TUNED_MODEL_ENDPOINT`. FastAPI cổng 8001 nạp Qwen2.5-0.5B-Instruct cùng LoRA adapter và trả trường `response`. Nếu endpoint chưa cấu hình, backend trả mode `FINE_TUNED_UNAVAILABLE` thay vì giả lập kết quả.

### 3.6. A/B benchmark RAG và fine-tuned

Research UI gửi câu hỏi đến `POST /api/evaluate/compare`. `EvaluationController` gọi cùng câu hỏi qua `RagService` và `FineTunedModelService`, sau đó `EvaluationService` sử dụng Gemini làm LLM-as-a-judge. Response gồm hai câu trả lời, nguồn RAG, kết quả chấm và cờ `valid_experiment`.

### 3.7. Benchmark chunking

Runner `run_retrieval_benchmark.py` hoặc `run_api_retrieval_benchmark.py` chạy cùng test set với fixed, semantic và hierarchical. Mỗi cấu hình index/retrieve chunks rồi tính Hit@5, MRR và nDCG@5. Kết quả được lưu CSV/JSON, tổng hợp vào `frontend/public/benchmark-summary.json` và hiển thị trên Research Dashboard.

### 3.8. Benchmark embedding và RAGAS

Runner đánh giá multilingual-e5, PhoBERT/BGE-M3 và các model nằm trong ma trận thực nghiệm bằng cùng corpus/chunking/top-k; OpenAI được loại khi không có credit. `run_ragas.py` hoặc `run_ragas_local.py` sinh các chỉ số faithfulness, answer relevancy, context precision và context recall. Dashboard đọc file summary đã version hóa; local semantic fallback phải được ghi rõ là không tương đương RAGAS LLM-judge chuẩn.

### Nguyên lý kiến trúc

- Controller tiếp nhận request và trả response; Service chứa nghiệp vụ; Repository/JPA lưu metadata và lịch sử.
- PGVector lưu chunks/embedding; Gemini cung cấp chat, embedding và judge; FastAPI phục vụ Qwen fine-tuned.
- Dependency Injection giúp các lớp giảm phụ thuộc cứng và hỗ trợ kiểm thử.

## 4. Khái niệm và cơ chế hoạt động của RAG

RAG (*Retrieval-Augmented Generation*) là phương pháp cung cấp cho AI một "thư viện" hay một cơ sở dữ liệu bên ngoài để tra cứu. Khi nhận câu hỏi, AI sẽ **tìm kiếm** thông tin liên quan trong "thư viện" này trước, sau đó **tổng hợp** lại để tạo ra câu trả lời. AI không thay đổi "bộ não" của nó mà chỉ được phép "lật tài liệu" để trả lời.

Mục tiêu chính là giảm thiểu "ảo giác" và đảm bảo câu trả lời luôn dựa trên nguồn dữ liệu xác thực. Do đó, RAG đặc biệt phù hợp với các hệ thống hỏi - đáp cần dựa trên thông tin thực tế, chính xác 100% (ví dụ: chính sách bảo hành, tài liệu kỹ thuật, thông số sản phẩm) hoặc khi nguồn kiến thức cần được cập nhật liên tục.

- **Cơ chế hoạt động của RAG:** Khi người dùng hỏi, hệ thống RAG sẽ tìm kiếm tài liệu từ kho dữ liệu (như tệp PDF, tài liệu nội bộ) -\> trích xuất thông tin liên quan nhất -\> gửi đoạn thông tin đó kèm câu hỏi của bạn cho LLM -\> LLM tổng hợp và đưa ra câu trả lời chính xác, bám sát vào tài liệu gốc.

## 5. Khái niệm và cơ chế hoạt động của Fine-tuning

**Fine-tuning** (tinh chỉnh) là kỹ thuật điều chỉnh một mô hình AI đã được huấn luyện từ trước (pre-trained model) bằng một tập dữ liệu nhỏ và chuyên biệt hơn. Thay vì xây dựng và đào tạo AI từ đầu, phương pháp này giúp mô hình thích nghi, trở nên thông minh hơn và chuyên môn hóa cho các tác vụ cụ thể

Fine-tuning giúp mô hình thích nghi với một lĩnh vực hoặc nhiệm vụ cụ thể, trong khi RAG giúp mô hình truy cập kiến thức mới mà không cần huấn luyện lại. Hai kỹ thuật này thường được sử dụng bổ sung cho nhau trong các ứng dụng AI hiện đại.

Cơ chế hoạt động của fine-tuning: 

- Hoạt động dựa trên quy trình:
    - **Chuẩn bị dữ liệu**: Thu thập và định dạng dữ liệu huấn luyện (prompt–response hoặc instruction–response).
    - **Tiền xử lý**: Tokenize và chia dữ liệu thành các mini-batch.
    - **Nạp mô hình gốc**: Sử dụng một mô hình đã được pre-train.
    - **Forward Pass**: Mô hình dự đoán đầu ra dựa trên dữ liệu đầu vào.
    - **Tính Loss**: So sánh đầu ra dự đoán với đáp án chuẩn để đo mức sai lệch.
    - **Backpropagation**: Tính gradient của loss đối với từng tham số trong mô hình.
    - **Cập nhật tham số**: Optimizer (ví dụ AdamW) điều chỉnh các trọng số nhằm giảm loss.
    - **Lặp huấn luyện**: Thực hiện nhiều batch và nhiều epoch cho đến khi mô hình hội tụ hoặc đạt tiêu chí dừng.
    - **Đánh giá và triển khai**: Kiểm tra hiệu năng trên tập validation/test, sau đó lưu và triển khai mô hình fine-tuned.

## 6. Tổng hợp các phương pháp chunking văn bản

### 6.1. Khái niệm chunking văn bản:

**Chunking** là quá trình **chia một tài liệu dài thành nhiều đoạn văn bản nhỏ (chunks)** nhưng vẫn đảm bảo mỗi đoạn giữ được ngữ nghĩa và thông tin cần thiết để mô hình AI có thể xử lý hiệu quả.

Trong các hệ thống **LLM (Large Language Model)** và **RAG (Retrieval-Augmented Generation)**, chunking là bước tiền xử lý cực kỳ quan trọng trước khi tạo **embedding**, lưu vào **vector database**, hoặc đưa dữ liệu vào mô hình.

### 6.2. Các phương pháp chunking:

#### 6.2.1. Fixed-size Chunking: Đây là phương pháp đơn giản nhất. Văn bản được chia thành các đoạn có độ dài cố định theo số ký tự hoặc số token.

### - Ưu điểm:

- Dễ triển khai.
- Tốc độ xử lý nhanh.
- Chi phí tính toán thấp.

### - Nhược điểm:

- Có thể cắt giữa câu hoặc đoạn văn.
- Làm mất ngữ cảnh.
- Hiệu quả truy xuất không cao.

### - Phù hợp với:

- Tài liệu đơn giản.
- Dữ liệu có cấu trúc đều.

#### 6.2.2. Recursive Chunking: Recursive Chunking chia văn bản theo **cấu trúc phân cấp**.

### - Ưu điểm:

- Giữ được cấu trúc tài liệu.
- Ít làm mất ngữ cảnh.
- Phổ biến trong hệ thống RAG.

### - Nhược điểm:

- Chậm hơn Fixed-size.
- Cần xác định bộ phân tách phù hợp.

#### 6.2.3. Sentence-based Chunking: Văn bản được chia theo **câu**.

### - Ưu điểm:

- Không cắt giữa câu.
- Giữ được ý nghĩa cơ bản.

### - Nhược điểm:

- Nếu câu quá dài thì chunk cũng sẽ dài.
- Một chủ đề có thể trải dài qua nhiều câu.

#### jm

### - Ưu điểm:

- Phù hợp với LLM.
- Kiểm soát chính xác giới hạn context.

### - Nhược điểm:

- Cần tokenizer.
- Không đảm bảo giữ nguyên ranh giới câu hoặc đoạn văn.

#### 6.2.3. Semantic Chunking: Semantic Chunking chia văn bản dựa trên **ý nghĩa (semantic meaning)** thay vì độ dài.

### - Ưu điểm

- Giữ nguyên ngữ nghĩa.
- Tăng chất lượng truy xuất trong RAG.
- Hạn chế mất thông tin.

### - Nhược điểm

- Chi phí tính toán cao.
- Cần mô hình embedding.

### - Kết luận: Không có phương pháp chunking nào tối ưu cho mọi trường hợp. Việc lựa chọn phụ thuộc vào đặc điểm dữ liệu, yêu cầu về độ chính xác và chi phí xử lý. Với các hệ thống RAG hiện đại, **Recursive Chunking** thường được sử dụng làm phương pháp mặc định nhờ khả năng bảo toàn cấu trúc tài liệu. Khi cần nâng cao chất lượng truy xuất trên các tài liệu dài hoặc có nội dung phức tạp, **Semantic Chunking**, **Embedding-based Chunking** hoặc **Hybrid Chunking** thường mang lại kết quả tốt hơn nhờ duy trì được tính liền mạch về ngữ nghĩa giữa các đoạn văn bản.
