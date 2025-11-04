# 🔐 Hướng dẫn cấu hình Google OAuth

## ⚠️ Các lỗi thường gặp:

### 1. "Missing GOOGLE_CLIENT_ID"
- **Nguyên nhân**: Environment variable không được load vào Vite dev server
- **Giải pháp**: Đã cập nhật `vite.config.js` để đọc env vars từ `process.env`. Restart container nếu vẫn lỗi.

### 2. "no registered origin" / "invalid_client" / "[GSI_LOGGER]: The given origin is not allowed"
- **Nguyên nhân**: Google Cloud Console OAuth chưa được cấu hình đúng. Cần thêm **Authorized JavaScript origins** vào Google Cloud Console.

## 📋 Các bước cấu hình:

### Bước 1: Vào Google Cloud Console
1. Truy cập: https://console.cloud.google.com/
2. Chọn project của bạn (hoặc tạo mới)
3. Vào **APIs & Services** → **Credentials**

### Bước 2: Tìm hoặc tạo OAuth 2.0 Client ID
1. Tìm OAuth 2.0 Client ID với ID: `385225605871-pg5d0rvifvgupu7s5rasu5itpbd4gsiu`
2. Hoặc tạo mới nếu chưa có:
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `EcomNodejs Local`

### Bước 3: Cấu hình Authorized JavaScript origins
1. Trong **Authorized JavaScript origins**, click **+ ADD URI**
2. Thêm các origins sau:
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   ```
3. Lưu ý: **KHÔNG** có dấu `/` ở cuối!

### Bước 4: Cấu hình Authorized redirect URIs (nếu cần)
1. Trong **Authorized redirect URIs**, click **+ ADD URI**
2. Thêm các URIs sau (nếu dùng redirect flow):
   ```
   http://localhost:5173
   http://localhost:3000
   ```
3. Lưu ý: **KHÔNG** có dấu `/` ở cuối!

### Bước 5: Copy Client ID
1. Copy **Client ID** (ví dụ: `385225605871-pg5d0rvifvgupu7s5rasu5itpbd4gsiu.apps.googleusercontent.com`)
2. Cập nhật vào `docker-compose.yml`:
   ```yaml
   environment:
     - VITE_GOOGLE_CLIENT_ID=<YOUR_CLIENT_ID>
   ```

### Bước 6: Restart containers
```bash
docker-compose restart web
```

## ✅ Kiểm tra

1. Mở Developer Console (F12) trên trang login
2. Kiểm tra log:
   - Nếu thấy: `Google Client ID loaded: 385225605871...` → Client ID đã được load
   - Nếu thấy: `VITE_GOOGLE_CLIENT_ID is missing!` → Cần restart container hoặc kiểm tra docker-compose.yml

3. Thử đăng nhập lại:
   - Nếu vẫn lỗi "no registered origin" → Kiểm tra lại Bước 3 (Authorized JavaScript origins)
   - Nếu lỗi "invalid_client" → Kiểm tra lại Client ID có đúng không

## 🔍 Troubleshooting

### Lỗi: "no registered origin"
- ✅ Đã thêm `http://localhost:5173` vào Authorized JavaScript origins?
- ✅ Không có dấu `/` ở cuối URI?
- ✅ Đã restart container sau khi thêm origin?

### Lỗi: "invalid_client"
- ✅ Client ID trong `docker-compose.yml` có đúng không?
- ✅ Client ID có format: `xxxxx.apps.googleusercontent.com`?
- ✅ Đã restart container sau khi thay đổi env var?

### Client ID không được load
- ✅ Kiểm tra `docker-compose.yml` có `VITE_GOOGLE_CLIENT_ID`?
- ✅ Đã restart container?
- ✅ Kiểm tra trong browser console có log gì không?

## 📞 Liên hệ

Nếu vẫn gặp vấn đề, kiểm tra:
1. Google Cloud Console → Credentials → OAuth 2.0 Client IDs
2. Xem "Authorized JavaScript origins" và "Authorized redirect URIs"
3. So sánh với Client ID trong `docker-compose.yml`

