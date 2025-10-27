# Hướng dẫn Fix MongoDB Connection

## 📝 Bước 1: Cập nhật file `.env`

Bạn cần thay thế các giá trị placeholder trong file `backend/.env`:

### 1. Lấy MongoDB Connection String từ MongoDB Atlas

1. Đăng nhập vào [MongoDB Atlas](https://cloud.mongodb.com/)
2. Vào **Clusters** → Chọn cluster của bạn
3. Click **Connect** → **Connect your application**
4. Copy connection string có dạng:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
   ```

### 2. Cập nhật file `backend/.env`

Mở file `backend/.env` và thay thế:

```env
PORT=4000

# Thay đổi dòng này với connection string thật
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.emyqoot.mongodb.net/ecommerce?retryWrites=true&w=majority

JWT_SECRET=4e1f7c2a96f5b6d30a0e2e1bd1a65a6b1b21d809a7f3f88ab76d2b5e20b71d13
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=ea92f03e0fb27d8f35f61e2de31a74ddda1b0c9bb1fba8c65cf1e6dbfcf57dbaf04b2bdfa6ad21ce37e2bb3a5d3bb501
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Lưu ý quan trọng:**
- Thay `YOUR_USERNAME` bằng username MongoDB Atlas của bạn
- Thay `YOUR_PASSWORD` bằng password MongoDB Atlas của bạn
- URL encode các ký tự đặc biệt trong password (nếu có)
- Đảm bảo `ecommerce` là tên database bạn muốn dùng

### 3. Ví dụ connection string đúng

```env
MONGODB_URI=mongodb+srv://myuser:myPass123@cluster0.emyqoot.mongodb.net/ecommerce?retryWrites=true&w=majority
```

---

## 🔧 Bước 2: Whitelist IP trong MongoDB Atlas

1. Vào MongoDB Atlas dashboard
2. Click **Network Access** (bên trái menu)
3. Click **Add IP Address**
4. Chọn **Allow Access from Anywhere** (0.0.0.0/0) **HOẶC** thêm IP của máy bạn
5. Click **Confirm**

---

## 🔄 Bước 3: Khởi động lại Docker Container

```bash
docker-compose restart api
```

Kiểm tra logs:
```bash
docker-compose logs -f api
```

Bạn sẽ thấy:
```
MongoDB Atlas connected & ping OK
```

---

## ✅ Bước 4: Test API

Sau khi MongoDB kết nối thành công, test signup:

```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

Hoặc test trong PowerShell:

```powershell
$body = '{"email":"test@example.com","password":"test123","name":"Test User"}'
Invoke-WebRequest -Uri "http://localhost:4000/auth/signup" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

---

## 🐛 Troubleshooting

### Lỗi: "connection timeout"
- Kiểm tra MongoDB Atlas đang running
- Kiểm tra Network Access đã whitelist IP
- Kiểm tra username/password đúng

### Lỗi: "authentication failed"
- Kiểm tra username/password
- Đảm bảo user có quyền read/write database
- Thử tạo user mới trong MongoDB Atlas

### Lỗi: "DNS resolution failed"
- Kiểm tra connection string format
- URL encode ký tự đặc biệt trong password
- Thử dùng connection string đầy đủ

---

## 📚 Tài liệu tham khảo

- [MongoDB Atlas Connection String](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
