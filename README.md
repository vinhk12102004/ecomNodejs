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
NODE_ENV=development
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

# Chạy seed
npm run seed:products
```

## 🌐 Truy cập

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health

## 📚 API Documentation

Xem file [TEST_API.md](./TEST_API.md) để biết chi tiết về các API endpoints.

## 🎯 Tính năng

### Frontend
- ✅ Danh sách sản phẩm với pagination
- ✅ Tìm kiếm theo tên
- ✅ Lọc theo brand, giá (min/max)
- ✅ Sắp xếp (mới nhất, giá tăng/giảm)
- ✅ Chi tiết sản phẩm với full specs
- ✅ Responsive design

### Backend
- ✅ RESTful API
- ✅ Authentication (JWT)
- ✅ Product CRUD operations
- ✅ Advanced filtering & sorting
- ✅ Pagination
- ✅ Input validation

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

