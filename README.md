# Chatbot AI Education 🤖📚

> Trạng thái: web app và bộ benchmark 50 câu đã hoàn thiện cho phạm vi demo. RAGAS hiện dùng local semantic fallback; xem [báo cáo thực nghiệm](reports/experimental-report.md) trước khi diễn giải kết quả.

Hệ thống Trợ lý Hỏi đáp thông minh dành cho giáo dục, hỗ trợ sinh viên với khả năng truy xuất tài liệu (RAG Mode) và sử dụng kiến thức nội tại của LLM (Fine-Tuning Mode).

Dự án này bao gồm bốn phần:
- **Backend:** Java Spring Boot, Spring AI, PostgreSQL (PGVector).
- **Frontend:** Next.js (React), Tailwind CSS.
- **Fine-tuning:** Qwen2.5-0.5B-Instruct với PEFT/LoRA và FastAPI local.
- **Evaluation:** test set 50 câu, RAGAS, benchmark chunking/embedding và dashboard RBL.

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
   *(Đợi Docker kéo image về và khởi chạy PostgreSQL/PGVector trên port `15432`)*.
3. Database `vector_db` và extension `vector` sẽ tự động được tạo và cấu hình.

### 3. Thiết lập API Key (Bảo mật)
Dự án sử dụng Gemini (Google) cho RAG và một endpoint Qwen cục bộ cho chế độ fine-tuned. Không hard-code API key vào source code.
1. Tạo các biến môi trường (Environment Variables) trên hệ điều hành của bạn, hoặc thêm vào cấu hình chạy của IDE (IntelliJ, Eclipse, VSCode):
   - `GEMINI_API_KEY`: Điền API Key của Google Gemini vào đây. `OPENAI_API_KEY` chỉ được giữ để tương thích cấu hình cũ.
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
   npm.cmd install
   ```
4. Khởi chạy ứng dụng Frontend:
   ```bash
   npm.cmd run dev
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
- `/backend`: Mã nguồn Spring Boot, RAG, Gemini 2.5 Flash, Gemini Embedding và PGVector.
- `/frontend`: Mã nguồn giao diện Next.js, hiển thị Chat UI, Quản lý tài liệu và Đánh giá Model.
- `/finetuning`: Train/serve Qwen local bằng LoRA.
- `/evaluation`: Test set và kết quả benchmark đã version hóa.
- `/scripts/benchmark`: Các runner RAG, RAGAS, chunking và embedding.
- `/docs`: Báo cáo nhóm, sequence diagram và hướng dẫn Windows.
- `.cursorrules`: Cấu hình nguyên tắc lập trình cho AI Agent (như Cursor/Copilot) để không làm vỡ kiến trúc code.

---

## 📝 Lưu ý quan trọng cho Developers & AI Agents
Dự án này đã thiết lập file `.cursorrules` ở thư mục gốc. **Tuyệt đối không được xoá** và khi nếu dùng AI để coding, AI đó sẽ tự động tuân thủ các quy tắc bảo vệ cấu trúc này (VD: Không phá lớp tích hợp Native Gemini, không hard-code API Keys).

## Tài liệu dự án

- [Báo cáo nhóm](docs/Nhóm%20Lập%20Trình%20Java.md)
- [Sequence diagrams](docs/sequence-diagrams.drawio)
- [Hướng dẫn chạy Windows](docs/RUN_WINDOWS.md)
- [Kế hoạch và rà soát nghiên cứu](docs/AUDIT_AND_RESEARCH_PLAN.md)
- [Báo cáo thực nghiệm](reports/experimental-report.md)

## Thành viên và đóng góp

| Thành viên | Hạng mục phụ trách | GitHub |
|---|---|---|
| Đỗ Thiên Phúc | Backend Engineer | [ilymeowmeow](https://github.com/ilymeowmeow) |
| Huỳnh Thành Phát | AI/Backend Lead | [thanhphatblue2104-glitch](https://github.com/thanhphatblue2104-glitch) |
| Huỳnh Lê Bảo Trâm | Frontend Engineer | [nonamemiurin-png](https://github.com/nonamemiurin-png) |
| Hà Hữu Tường | Backend Engineer | [tuonghh2477-dot](https://github.com/tuonghh2477-dot) |
| Dương Đình Khôi | Frontend Engineer | [khoidd1318-247](https://github.com/khoidd1318-247) |
