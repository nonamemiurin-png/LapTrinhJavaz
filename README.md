# Chatbot AI Education

Hệ thống trợ lý hỏi đáp dành cho sinh viên, kết hợp **RAG (Retrieval-Augmented
Generation)** và **mô hình fine-tuned** để trả lời câu hỏi dựa trên tài liệu môn
học tiếng Việt. Dự án đồng thời cung cấp module nghiên cứu nhằm so sánh độ chính
xác, chi phí triển khai và khả năng cập nhật kiến thức của hai phương pháp.

## Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và khởi chạy](#cài-đặt-và-khởi-chạy)
- [Cách sử dụng](#cách-sử-dụng)
- [Module nghiên cứu](#module-nghiên-cứu)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Bảo mật và xử lý lỗi](#bảo-mật-và-xử-lý-lỗi)
- [Thành viên và đóng góp](#thành-viên-và-đóng-góp)

## Tính năng

### Quản lý tài liệu

- Upload và xóa tài liệu học tập.
- Hỗ trợ tài liệu PDF, DOCX, PPT/PPTX và văn bản.
- Tự động chia tài liệu thành chunks và tạo vector embedding.
- Lưu vector bằng PostgreSQL với extension PGVector.
- Quản lý tài liệu theo môn học/chương và xem trạng thái index.

### Chat và hỏi đáp

- Hội thoại theo phiên và lưu lịch sử tin nhắn.
- Chế độ RAG chỉ sử dụng nội dung truy xuất từ tài liệu môn học.
- Hiển thị tài liệu tham khảo và citation đi kèm câu trả lời.
- Từ chối trả lời khi không tìm thấy thông tin phù hợp trong tài liệu.
- Chế độ local fine-tuned sử dụng Qwen2.5-0.5B-Instruct cùng LoRA adapter.

### Module nghiên cứu

- So sánh trực tiếp RAG và mô hình fine-tuned.
- So sánh các chiến lược chunking: fixed-size, semantic và hierarchical.
- So sánh các embedding model tiếng Việt/đa ngôn ngữ.
- Dashboard hiển thị độ chính xác, độ trễ và kết quả thực nghiệm.
- Hỗ trợ test set 50 câu hỏi kèm ground truth và bảng đánh giá RAGAS.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 17, Spring Boot, Spring AI, Spring Data JPA |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, NextAuth |
| Database | PostgreSQL, PGVector |
| LLM | Google Gemini qua OpenAI-compatible API |
| Fine-tuning | Python, PyTorch, Transformers, PEFT/LoRA, Qwen2.5 |
| Hạ tầng | Docker, Docker Compose, Maven, npm |

Các embedding model phục vụ thực nghiệm gồm multilingual-e5, PhoBERT,
BGE-M3 và có thể mở rộng với `text-embedding-3-small` khi có OpenAI credit.

## Yêu cầu hệ thống

- Java 17.
- Maven 3.8 trở lên.
- Node.js 18 trở lên và npm.
- Python 3.10 trở lên cho fine-tuning/benchmark.
- Docker Desktop.
- Git.

Kiểm tra nhanh:

```powershell
java -version
mvn -version
node --version
npm --version
python --version
docker --version
```

## Cài đặt và khởi chạy

### 1. Clone source code

```powershell
git clone https://github.com/ilymeowmeow/LapTrinhJava.git
cd LapTrinhJava
```

### 2. Khởi động PostgreSQL và PGVector

Mở Docker Desktop, sau đó chạy tại thư mục gốc:

```powershell
docker compose up -d
docker compose ps
```

Cấu hình mặc định:

- Host: `localhost:15432`
- Database: `vector_db`
- Username: `tuong`
- Password: cấu hình trong `docker-compose.yml` hoặc biến môi trường

Không dùng `docker compose down -v` nếu muốn giữ dữ liệu đã index.

### 3. Cấu hình Gemini API key

Tạo key tại [Google AI Studio](https://aistudio.google.com/app/apikey), sau đó
đặt biến môi trường trong PowerShell:

```powershell
$env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Backend vẫn chấp nhận `OPENAI_API_KEY` để tương thích cấu hình cũ, nhưng nên dùng
`GEMINI_API_KEY` để không nhầm với OpenAI API key.

Không ghi key thật vào `application.yml`, README hoặc commit lên Git. Nếu key
từng bị công khai, cần thu hồi và tạo key mới ngay.

### 4. Cấu hình Google OAuth cho frontend

1. Tạo project tại [Google Cloud Console](https://console.cloud.google.com/).
2. Cấu hình OAuth consent screen.
3. Tạo OAuth Client ID loại **Web application**.
4. Thêm redirect URI:
   `http://localhost:3000/api/auth/callback/google`.
5. Tạo `frontend/.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret
```

### 5. Khởi chạy backend

```powershell
cd backend
mvn clean spring-boot:run
```

Backend chạy tại `http://localhost:8080`.

### 6. Khởi chạy local fine-tuned model

Ở terminal khác:

```powershell
cd finetuning
pip install -r requirements.txt
python api_server.py
```

Local inference API chạy tại `http://localhost:8001/api/generate`. Backend cần
được cấu hình endpoint này khi chạy chế độ fine-tuned.

Việc train lại model là tùy chọn:

```powershell
cd finetuning
python train_qwen.py
```

Checkpoint LoRA được lưu trong `finetuning/finetuned_model`.

### 7. Khởi chạy frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Mở `http://localhost:3000` trên trình duyệt. Dùng `npm.cmd` trên PowerShell nếu
máy chặn thực thi `npm.ps1`.

## Cách sử dụng

### Sinh viên

1. Đăng nhập và mở trang Chat.
2. Tạo hoặc chọn một phiên hội thoại.
3. Chọn môn học và chế độ RAG/fine-tuned.
4. Nhập câu hỏi và gửi.
5. Kiểm tra câu trả lời cùng citation/tài liệu tham khảo.

### Quản lý tài liệu

1. Mở trang Documents.
2. Chọn file, nhập môn học, chương và chiến lược chunking.
3. Upload và chờ trạng thái index hoàn tất.
4. Xem danh sách hoặc xóa tài liệu không còn sử dụng.

### Dashboard nghiên cứu

Mở `http://localhost:3000/research` để xem:

1. RAG so với fine-tuned model.
2. Fixed-size so với semantic và hierarchical chunking.
3. So sánh các embedding model.

## Module nghiên cứu

### Câu hỏi nghiên cứu

- **RQ chính:** RAG hay fine-tuning hiệu quả hơn cho chatbot hỗ trợ học tập với
  tài liệu tiếng Việt xét theo độ chính xác, chi phí và khả năng cập nhật?
- **RQ phụ 1:** Chiến lược chunking nào cho retrieval accuracy tốt nhất với
  slide/PDF bài giảng?
- **RQ phụ 2:** Embedding model nào phù hợp nhất với tài liệu kỹ thuật tiếng Việt?

### API chính

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/chat` | Gửi câu hỏi RAG/fine-tuned |
| `GET` | `/api/chat/sessions/{id}/messages` | Lấy lịch sử phiên |
| `DELETE` | `/api/chat/sessions/{id}` | Xóa lịch sử phiên |
| `POST` | `/api/documents/upload` | Upload và index tài liệu |
| `GET` | `/api/documents` | Danh sách tài liệu |
| `DELETE` | `/api/documents/{id}` | Xóa tài liệu |
| `POST` | `/api/documents/{id}/reindex` | Index lại với chunk strategy mới |
| `POST` | `/api/evaluate/compare` | So sánh RAG/fine-tuned và LLM judge |
| `POST` | `/api/evaluation/retrieve` | Đánh giá retrieval top-k |
| `GET` | `/api/metrics/comparison` | Lấy metric so sánh |

Kết quả benchmark và báo cáo thực nghiệm được lưu trong `evaluation/` và
`reports/` (nếu đã được sinh). Tài liệu phân tích, thiết kế và báo cáo nhóm được
đặt trong `docs/`.

## Cấu trúc dự án

```text
LapTrinhJava/
├── backend/              # Spring Boot REST API, RAG và persistence
├── frontend/             # Next.js web app
├── finetuning/           # Dataset, train script, LoRA adapter, local API
├── evaluation/           # Test set và kết quả đánh giá
├── scripts/              # Benchmark/utility scripts
├── reports/              # Báo cáo thực nghiệm
├── docs/                 # Tài liệu phân tích, thiết kế và báo cáo nhóm
├── docker-compose.yml    # PostgreSQL + PGVector
└── README.md
```

Backend được tổ chức theo kiến trúc phân lớp:

```text
Controller → Service → Repository → PostgreSQL/PGVector
```

## Bảo mật và xử lý lỗi

### Nguyên tắc bảo mật

- Không commit API key, OAuth secret hoặc file `.env.local`.
- Không ghi API key trực tiếp trong mã nguồn.
- Chỉ upload tài liệu được phép sử dụng.
- Thu hồi key ngay nếu từng xuất hiện trong terminal log hoặc Git history.

### Lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| Maven không thấy Spring Boot plugin | Chạy Maven trong thư mục `backend` |
| `npm.ps1 cannot be loaded` | Dùng `npm.cmd install` và `npm.cmd run dev` |
| Google OAuth `invalid_client` | Kiểm tra Client ID/Secret và redirect URI |
| Backend không kết nối database | Kiểm tra Docker và cổng PostgreSQL 15432 |
| Gemini trả quota error | Kiểm tra quota/project gắn với API key |
| Fine-tuned model chưa sẵn sàng | Chạy `python api_server.py` và kiểm tra cổng 8001 |

## Thành viên và đóng góp

| Thành viên | Hạng mục phụ trách | GitHub |
|---|---|---|
| Đỗ Thiên Phúc | Backend Engineer | [ilymeowmeow](https://github.com/ilymeowmeow) |
| Huỳnh Thành Phát | AI/Backend Lead | [thanhphatblue2104-glitch](https://github.com/thanhphatblue2104-glitch) |
| Huỳnh Lê Bảo Trâm | Frontend Engineer | [nonamemiurin-png](https://github.com/nonamemiurin-png) |
| Hà Hữu Tường | Backend Engineer | [tuonghh2477-dot](https://github.com/tuonghh2477-dot) |
| Dương Đình Khôi | Frontend Engineer | [khoidd1318-247](https://github.com/khoidd1318-247) |

## Tài liệu tham khảo

- [Báo cáo nhóm](./docs/Nhóm%20Lập%20Trình%20Java.md)
- [Sơ đồ sequence Draw.io](./docs/sequence-diagrams.drawio)
- [Hướng dẫn chạy trên Windows](./docs/RUN_WINDOWS.md)
- [Rà soát yêu cầu và kế hoạch nghiên cứu](./docs/AUDIT_AND_RESEARCH_PLAN.md)
- [Spring AI](https://spring.io/projects/spring-ai)
- [Next.js](https://nextjs.org/docs)
- [PGVector](https://github.com/pgvector/pgvector)
- [Google AI Studio](https://aistudio.google.com/)

> Cập nhật: tháng 7 năm 2026.
