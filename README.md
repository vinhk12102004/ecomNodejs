# ecomNodejs - E-commerce Laptop Store

Dự án website bán laptop được xây dựng với Node.js, Express, MongoDB, React và Docker.

## 🚀 Công nghệ sử dụng

### Backend
- **Node.js** v20 + Express
- **MongoDB** với Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Zod

### Frontend
- **React** 18 + Vite
- **React Router** v6
- **Tailwind CSS** v3
- **Axios** cho API calls

### DevOps
- **Docker** + Docker Compose
- Hot reload cho cả frontend và backend

## 📦 Cấu trúc dự án

```
ecomNodejs/
├── backend/              # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/  # Controllers
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth & validation
│   │   └── config/       # Database config
│   ├── database/         # Seed scripts
│   └── Dockerfile
├── frontend/             # Frontend React
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── screens/      # Pages
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # API helpers
│   │   └── routes/       # Router config
│   └── Dockerfile
└── docker-compose.yml
```

## 📚 Hướng dẫn Chi tiết

- 📖 **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - ⚡ Lệnh thường dùng nhất (Cheat Sheet)
- 🚀 **[REBUILD_AND_TEST_GUIDE.md](./REBUILD_AND_TEST_GUIDE.md)** - 🔄 Rebuild + 🗄️ Database + 🧪 Test (Complete Guide)
- 🌱 **[Database Seed System](./backend/database/README.md)** - ⭐ Seed System Overview & Final Assignment Compliance
- 💾 **Backup Scripts:**
  - `backup-db.sh` (Linux/Mac)
  - `backup-db.bat` (Windows)

---

## 🛠️ Cài đặt và chạy

### Yêu cầu
- Docker Desktop (Windows/Mac/Linux)
- Git

### Bước 1: Clone repository
```bash
git clone https://github.com/vinhk12102004/ecomNodejs.git
cd ecomNodejs
```

### Bước 2: Tạo file .env cho backend
```bash
# Tạo file backend/.env với nội dung:
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development
GOOGLE_CLIENT_ID=385225605871-pg5d0rvifvgupu7s5rasu5itpbd4gsiu.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET= (optional, not required for ID token verify)
```

### Bước 3: Chạy với Docker
```bash
# Build và chạy tất cả services
docker-compose up --build

# Hoặc chạy ở background
docker-compose up -d --build
```

### Bước 4: Seed dữ liệu (Optional)
```bash
# Vào container backend
docker exec -it ecomnodejs-api-1 sh

# 1. Chạy seed products (14 laptop samples)
npm run seed:products

# 2. Chạy seed images & descriptions (3+ images per product, 200+ chars)
node database/seed-products-images.js

# 3. Chạy seed variants (2-3 variants per product)
npm run seed:variants

# 4. Export dữ liệu từ MongoDB ra file JSON (để backup hoặc seed lại)
npm run export:products

# Hoặc chạy trực tiếp từ host machine:
docker exec ecomnodejs-api-1 npm run seed:products
docker exec ecomnodejs-api-1 node database/seed-products-images.js
docker exec ecomnodejs-api-1 npm run seed:variants
docker exec ecomnodejs-api-1 npm run export:products
```

## 🌐 Truy cập

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health
- **Sitemap**: http://localhost:4000/sitemap.xml

## 📚 API Documentation
### Google Login

1) Tạo OAuth 2.0 Client (Web) trong Google Cloud Console và lấy `Client ID`.
2) FE gửi `idToken` nhận được từ Google đến endpoint dưới đây:

```bash
POST /auth/google
Content-Type: application/json

{ "idToken": "<GOOGLE_ID_TOKEN>" }
```

Response trả về `{ user, accessToken }` và set cookie refresh token như login thường.

Frontend: cấu hình trong `docker-compose.yml`:

```yaml
environment:
  - VITE_GOOGLE_CLIENT_ID=385225605871-pg5d0rvifvgupu7s5rasu5itpbd4gsiu.apps.googleusercontent.com
```

**⚠️ QUAN TRỌNG:** Nếu gặp lỗi "no registered origin" hoặc "invalid_client", vui lòng xem **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** để cấu hình Google Cloud Console OAuth.


Chi tiết về API endpoints và testing được mô tả trong:
- **[REBUILD_AND_TEST_GUIDE.md](./REBUILD_AND_TEST_GUIDE.md#test-api)** - 🧪 Test API section với cURL examples
- Các API endpoints chính được liệt kê bên dưới

### Product Variants API

#### List variants for a product
```bash
GET /products/:id/variants?page=1&limit=20

Response:
{
  "data": [
    {
      "_id": "...",
      "product": "...",
      "sku": "SKU-ABC123",
      "name": "16GB / 512GB / Silver",
      "price": 25000000,
      "stock": 30,
      "attributes": {
        "ramGB": 16,
        "storageGB": 512,
        "color": "Silver"
      },
      "isActive": true
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### Get single variant by SKU
```bash
GET /variants/:sku

Example: GET /variants/SKU-ABC123
```

#### Create variant (Admin only)
```bash
POST /admin/products/:id/variants
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "sku": "SKU-LAPTOP-16-512-SILVER",
  "name": "16GB / 512GB / Silver",
  "price": 25000000,
  "stock": 50,
  "attributes": {
    "ramGB": 16,
    "storageGB": 512,
    "color": "Silver"
  }
}
```

#### Update variant (Admin only)
```bash
PATCH /admin/variants/:sku
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 24000000,
  "stock": 45
}
```

#### Delete/Deactivate variant (Admin only)
```bash
DELETE /admin/variants/:sku
Authorization: Bearer <admin_token>

# Soft delete (recommended):
DELETE /admin/variants/:sku

# Permanent delete (use with caution):
DELETE /admin/variants/:sku?permanent=true
```

### Cart with Variants

Khi thêm variant vào giỏ hàng, cần gửi `skuId`:

```bash
POST /cart/items
Content-Type: application/json

{
  "productId": "product_id_here",
  "skuId": "SKU-ABC123",
  "qty": 1
}
```

**Lưu ý:** 
- Mỗi product phải có ít nhất 2 variants
- Mỗi variant có stock độc lập
- SKU phải unique trong toàn bộ hệ thống

### Bulk Add to Cart

Thêm nhiều sản phẩm cùng lúc (maximum 20 items):

```bash
POST /cart/items/bulk
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id_1",
      "skuId": "SKU-ABC123",
      "qty": 2
    },
    {
      "productId": "product_id_2",
      "qty": 1
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "success": true,
      "productId": "product_id_1",
      "skuId": "SKU-ABC123",
      "addedQty": 2
    },
    {
      "success": false,
      "productId": "product_id_2",
      "error": "Out of stock"
    }
  ],
  "warnings": [
    {
      "type": "stock_cap",
      "message": "Product X: Capped to available stock (5)",
      "allowedQty": 5
    }
  ],
  "cart": {
    "items": [...],
    "subtotal": 3000,
    "count": 3
  }
}
```

**Features:**
- ✅ Thêm tối đa 20 items mỗi request
- ✅ Mỗi item được validate độc lập
- ✅ Failed items không block successful items
- ✅ Detailed results cho từng item
- ✅ Warnings cho stock caps và limits

## 🎯 Tính năng

### Frontend
- ✅ **Landing Page Sections** - Hero, New Products, Best Sellers, Categories
- ✅ **Product Categories** - Gaming, Business, Ultrabooks sections
- ✅ Danh sách sản phẩm với pagination
- ✅ Tìm kiếm theo tên
- ✅ Lọc theo brand, giá (min/max), **rating** (3★+, 4★+, 5★)
- ✅ Sắp xếp (mới nhất, giá tăng/giảm, **tên A-Z/Z-A**, đánh giá cao)
- ✅ Chi tiết sản phẩm với full specs
- ✅ **Product Images Gallery** - 3+ images với thumbnails
- ✅ **Extended Description** - Mô tả chi tiết 200+ ký tự
- ✅ **Product Variants** - Chọn RAM/Storage/Color với variant selector UI
- ✅ **Variant Tooltip** - Cảnh báo khi chưa chọn variant
- ✅ Cart với variant support (skuId)
- ✅ **Bulk Add to Cart** - Thêm nhiều sản phẩm cùng lúc với modal kết quả
- ✅ Guest checkout
- ✅ Responsive design với modern UI

### Backend
- ✅ RESTful API
- ✅ Authentication (JWT)
- ✅ Product CRUD operations
- ✅ **Bulk Add API** - Thêm tối đa 20 items cùng lúc với detailed results
- ✅ **Product Images Validation** - Minimum 3 images required
- ✅ **Description Validation** - Minimum 200 characters
- ✅ **Product Variants** - Independent inventory tracking
- ✅ **Rating Filter** - Filter by rating (≥3, ≥4, =5)
- ✅ **Sort by Name** - Alphabetical sorting (A-Z, Z-A)
- ✅ Cart & Checkout system
- ✅ Advanced filtering & sorting (brand, price, RAM, rating)
- ✅ Pagination
- ✅ Input validation
- ✅ Email notifications

## 🐳 Docker Commands

```bash
# Khởi động services
docker-compose up

# Khởi động và rebuild
docker-compose up --build

# Chạy background
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

## 🔧 Development

### Backend Hot Reload
Code thay đổi trong `backend/src/` sẽ tự động restart nhờ nodemon.

### Frontend Hot Reload
Code thay đổi trong `frontend/src/` sẽ tự động reload nhờ Vite HMR.

## 📝 License

MIT License

## 👨‍💻 Author

Vinh K - [GitHub](https://github.com/vinhk12102004)

