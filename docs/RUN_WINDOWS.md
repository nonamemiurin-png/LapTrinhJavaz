# Chạy dự án trên Windows

## Biến môi trường

Đặt Gemini API key trong PowerShell trước khi mở ứng dụng:

```powershell
$env:GEMINI_API_KEY="YOUR_GEMINI_KEY"
```

`GEMINI_API_KEY` và OpenAI API key là hai loại khóa khác nhau. Backend chỉ dùng
OpenAI-compatible protocol để gọi Gemini; không dùng OpenAI key cho luồng này.

## Thứ tự khởi động

1. Mở Docker Desktop và chạy `docker compose up -d`.
2. Chạy `run-finetuned.cmd` trong terminal thứ nhất.
3. Đợi `http://localhost:8001/health` trả `{"status":"UP"}`.
4. Chạy `run-backend.cmd` trong terminal thứ hai.
5. Trong `frontend`, chạy `npm.cmd install` rồi `npm.cmd run dev`.
6. Mở `http://localhost:3000`.

`run-backend.cmd` cấu hình Java dùng Windows certificate store. Cách này xử lý
lỗi `PKIX path building failed` khi Avast hoặc antivirus khác quét HTTPS mà vẫn
giữ xác minh chứng chỉ TLS.

## Kiểm tra nhanh

- Backend: `http://localhost:8080/api/health`
- Fine-tuned API: `http://localhost:8001/health`
- Frontend: `http://localhost:3000`
- Dashboard nghiên cứu: `http://localhost:3000/research`

