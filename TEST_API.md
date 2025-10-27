# Hướng dẫn Test API Auth

## 🚀 Bước 1: Khởi động Docker

```bash
docker-compose up --build
```

Sau khi chạy, bạn sẽ thấy:
- API chạy trên: `http://localhost:4000`
- Frontend chạy trên: `http://localhost:5173`

---

## 🧪 Bước 2: Test các API Endpoints

### 1. Health Check (kiểm tra server chạy)
```bash
curl http://localhost:4000/health
```

### 2. Đăng ký tài khoản mới
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

**Response thành công (201):**
```json
{
  "user": {
    "_id": "...",
    "email": "admin@test.com",
    "role": "customer",
    "name": "Admin User",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookie được set:** `refresh_token` (httpOnly)

---

### 3. Đăng nhập
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }' \
  -c cookies.txt
```

**Response thành công (200):**
```json
{
  "user": {
    "_id": "...",
    "email": "admin@test.com",
    "role": "customer",
    "name": "Admin User"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Lưu ý:** Cookie được lưu vào `cookies.txt`

---

### 4. Lấy thông tin user hiện tại (cần accessToken)

**Lưu accessToken từ bước trước và dùng:**

```bash
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Response thành công (200):**
```json
{
  "_id": "...",
  "email": "admin@test.com",
  "role": "customer",
  "name": "Admin User",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 5. Refresh Token (để lấy accessToken mới)

```bash
curl -X POST http://localhost:4000/auth/refresh \
  -b cookies.txt
```

**Response thành công (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 6. Test Admin Route (yêu cầu role admin)

**Trước tiên, cần tạo user admin trong DB hoặc update role thủ công.**

**Sau đó test:**
```bash
curl http://localhost:4000/admin/ping \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Response thành công (200):**
```json
{
  "ok": true,
  "role": "admin"
}
```

---

### 7. Đăng xuất
```bash
curl -X POST http://localhost:4000/auth/logout \
  -b cookies.txt
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 🎯 Test với Postman/Thunder Client

### Collection setup:

**1. Đăng ký:**
- Method: `POST`
- URL: `http://localhost:4000/auth/signup`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**2. Đăng nhập:**
- Method: `POST`
- URL: `http://localhost:4000/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**3. Get Me:**
- Method: `GET`
- URL: `http://localhost:4000/auth/me`
- Headers: 
  - Key: `Authorization`
  - Value: `Bearer <access_token>`

**4. Refresh Token:**
- Method: `POST`
- URL: `http://localhost:4000/auth/refresh`
- Enable "Send Cookies"

**5. Logout:**
- Method: `POST`
- URL: `http://localhost:4000/auth/logout`

---

## 🛠 Test với trình duyệt (Fetch API)

Mở Console trình duyệt và chạy:

```javascript
// 1. Signup
fetch('http://localhost:4000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  })
}).then(r => r.json()).then(console.log);

// 2. Login
fetch('http://localhost:4000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
}).then(r => r.json()).then(console.log);

// 3. Get Me (sau khi có accessToken)
const ACCESS_TOKEN = 'YOUR_TOKEN_HERE';
fetch('http://localhost:4000/auth/me', {
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  },
  credentials: 'include'
}).then(r => r.json()).then(console.log);

// 4. Refresh
fetch('http://localhost:4000/auth/refresh', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log);

// 5. Logout
fetch('http://localhost:4000/auth/logout', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

---

## ❗ Lưu ý quan trọng

1. **CORS:** Frontend cần gọi từ `http://localhost:5173`
2. **Cookies:** Phải có `credentials: 'include'` trong fetch
3. **AccessToken:** Có thời hạn 15 phút
4. **RefreshToken:** Có thời hạn 7 ngày, lưu trong cookie httpOnly
5. **Environment:** Cần file `.env` với JWT secrets

---

## 🔧 Debug

**Xem logs Docker:**
```bash
docker-compose logs -f api
```

**Restart services:**
```bash
docker-compose restart api
```

**Kiểm tra MongoDB connection:**
- Kiểm tra `MONGODB_URI` trong `.env`
- Đảm bảo IP whitelisted trong MongoDB Atlas
