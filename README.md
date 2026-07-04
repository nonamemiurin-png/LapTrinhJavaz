# Chatbot AI Education 🤖📚

> Trạng thái: prototype. Xem [rà soát yêu cầu và kế hoạch thực nghiệm](docs/AUDIT_AND_RESEARCH_PLAN.md) trước khi dùng số liệu để viết kết luận nghiên cứu.

Hệ thống Trợ lý Hỏi đáp thông minh dành cho giáo dục, hỗ trợ sinh viên với khả năng truy xuất tài liệu (RAG Mode) và sử dụng kiến thức nội tại của LLM (Fine-Tuning Mode).

Dự án này bao gồm hai phần:
- **Backend:** Java Spring Boot, Spring AI, PostgreSQL (PGVector).
- **Frontend:** Next.js (React), Tailwind CSS.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống (Prerequisites)
Để chạy được dự án, máy tính của bạn (và người bạn chia sẻ) cần cài đặt sẵn:
- **Java 17** (Dùng cho Spring Boot Backend)
- **Node.js (v18 hoặc v20+)** (Dùng cho Next.js Frontend)
- **Docker Desktop** (Dùng để chạy Database PostgreSQL với PGVector)
- **Git** (Để clone source code)
- **Maven** (Để build và chạy Java)

### 2. Thiết lập Database (Postgres + PGVector)
Hệ thống lưu trữ dữ liệu và vector của tài liệu vào PostgreSQL.
1. Mở Terminal / CMD tại thư mục gốc của dự án.
2. Chạy lệnh sau để khởi động Database:
   ```bash
   docker-compose up -d
   ```
   *(Đợi Docker kéo image về và khởi chạy container `rag_db` trên port `5432`)*.
3. Database `rag_db` và Extension `vector` sẽ tự động được tạo và cấu hình.

### 3. Thiết lập API Key (Bảo mật)
Dự án sử dụng Gemini (Google) cho RAG và một endpoint Qwen cục bộ cho chế độ fine-tuned. Không hard-code API key vào source code.
1. Tạo các biến môi trường (Environment Variables) trên hệ điều hành của bạn, hoặc thêm vào cấu hình chạy của IDE (IntelliJ, Eclipse, VSCode):
   - `OPENAI_API_KEY`: Điền API Key của Google Gemini vào đây.
   - `FINE_TUNED_MODEL_ENDPOINT`: URL sinh văn bản của local model, mặc định khi chạy module kèm theo là `http://localhost:8001/api/generate`.
   - `FINE_TUNED_MODEL_NAME`: Tên checkpoint để ghi nhận trong thực nghiệm, ví dụ `qwen2.5-0.5b-ctdlgt`.
2. Spring Boot sẽ tự động đọc các biến môi trường này vào `application.yml` khi ứng dụng khởi chạy.

### 4. Khởi chạy Backend (Spring Boot)
1. Mở một Terminal / CMD và di chuyển vào thư mục `backend/`:
   ```bash
   cd backend
   ```
2. Chạy ứng dụng bằng Maven:
   ```bash
   mvn clean spring-boot:run
   ```
3. Đợi vài giây cho đến khi terminal hiện dòng chữ `Started ChatbotApplication...`. Backend sẽ khởi chạy và lắng nghe tại: **http://localhost:8080**

### 5. Khởi chạy Frontend (Next.js)
1. Mở một Terminal / CMD MỚI, giữ nguyên terminal của Backend đang chạy.
2. Di chuyển vào thư mục `frontend/`:
   ```bash
   cd frontend
   ```
3. Cài đặt các thư viện cần thiết (Chỉ cần chạy lần đầu):
   ```bash
   npm install
   ```
4. Khởi chạy ứng dụng Frontend:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập: **http://localhost:3000** để trải nghiệm ứng dụng.

### 6. Fine-tuning và benchmark

Module `finetuning/` huấn luyện Qwen2.5-0.5B bằng LoRA. Checkpoint sinh ra không được commit vào Git.

```powershell
cd finetuning
python prepare_course_dataset.py
python train_qwen.py
python api_server.py
```

Sau khi backend, database và local model đang chạy, chạy cùng test set cho cả hai điều kiện:

```powershell
python scripts/benchmark/run_rag_benchmark.py --modes rag finetuned --delay 7
```

Kết quả thô và summary được ghi vào `evaluation/runs/<run-id>/`. Chạy RAGAS trên kết quả RAG:

```powershell
pip install -r scripts/benchmark/requirements-ragas.txt
python scripts/benchmark/run_ragas.py evaluation/runs/<run-id>/raw-results.csv
```

Chạy ma trận retrieval cho ba chunking strategy và các embedding model:

```powershell
pip install -r scripts/benchmark/requirements-retrieval.txt
python scripts/benchmark/run_retrieval_benchmark.py --top-k 5
```

Để chạy `text-embedding-3-small`, đặt key OpenAI thật trong biến `OPENAI_EMBEDDING_API_KEY`. Biến `OPENAI_API_KEY` của backend hiện chứa Gemini key và không được dùng thay thế.

Mẫu báo cáo nằm tại `reports/experimental-report.md`. Chỉ điền kết luận sau khi test set và citation được con người duyệt.

---

## 🛠 Cấu trúc dự án
- `/backend`: Mã nguồn Spring Boot, xử lý API, RAG, nhúng Vector và kết nối LLM.
  - Tích hợp Native Gemini API (sử dụng Model: `gemini-robotics-er-1.6-preview` & `gemini-embedding-2`).
  - Tích hợp Groq API (sử dụng Model: `llama-3.1-8b-instant`).
- `/frontend`: Mã nguồn giao diện Next.js, hiển thị Chat UI, Quản lý tài liệu và Đánh giá Model.
- `/scripts`: Các script Python hỗ trợ huấn luyện dữ liệu nội bộ (Local Fine-Tuning).
- `.cursorrules`: Cấu hình nguyên tắc lập trình cho AI Agent (như Cursor/Copilot) để không làm vỡ kiến trúc code.

---

## 📝 Lưu ý quan trọng cho Developers & AI Agents
Dự án này đã thiết lập file `.cursorrules` ở thư mục gốc. **Tuyệt đối không được xoá** và khi nếu dùng AI để coding, AI đó sẽ tự động tuân thủ các quy tắc bảo vệ cấu trúc này (VD: Không phá lớp tích hợp Native Gemini, không hard-code API Keys).
