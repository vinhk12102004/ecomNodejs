# 🛍️ E-Commerce Platform

A full-stack e-commerce platform built with React, Node.js, Express, and MongoDB. This project includes features like product management, shopping cart, order processing, payment integration (VNPAY), loyalty program, and an admin dashboard.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Scaling](#-scaling)


## 🛠️ Tech Stack

### Frontend
- **React 18**: UI library
- **React Router DOM**: Routing
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **Axios**: HTTP client
- **Recharts**: Data visualization
- **Google OAuth**: Social authentication

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **Socket.IO**: WebSocket support
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Nodemailer**: Email service
- **Zod**: Schema validation
- **VNPAY SDK**: Payment gateway integration

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Load balancer and reverse proxy
- **MongoDB**: Database
- **MailHog**: Email testing (development)

## 📁 Project Structure

```
ecomNodejs/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.js       # Express server
│   ├── database/           # Database scripts
│   ├── Dockerfile          # Backend Docker image
│   └── package.json
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── screens/        # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── routes/         # Route definitions
│   ├── Dockerfile          # Frontend Docker image
│   └── package.json
├── nginx/                  # Nginx configuration
│   ├── nginx.conf          # Nginx config
│   └── Dockerfile          # Nginx Docker image
├── docker-compose.yml      # Docker Compose configuration
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **MongoDB** (or use Docker)
- **Git**

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/vinhk12102004/ecomNodejs
cd ecomNodejs
```

### 2. Set up environment variables

#### Backend (.env)

Create `backend/.env` file:

```env
# Database
MONGODB_URI=mongodb://

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email (Development - MailHog)
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@ecommerce.com

# VNPAY
VNP_TMN_CODE=your-vnpay-merchant-code
VNP_HASH_SECRET=your-vnpay-hash-secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost/api/payment/vnpay/return
VNP_IPN_URL=http://your-domain.com/api/payment/vnpay/ipn

# Frontend URL
FRONTEND_URL=http://localhost
CORS_ORIGIN=http://localhost

# Server
PORT=4000
```

#### Frontend (.env)

Create `frontend/.env` file (optional, already in docker-compose.yml):

```env
VITE_API_BASE_URL=http://localhost/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. (Optional) Install dependencies for local development

> ⚠️ Bỏ qua bước này nếu bạn chỉ chạy ứng dụng bằng Docker.

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## ⚙️ Configuration

### MongoDB

The MongoDB connection is configured in `backend/.env`. For Docker deployment, MongoDB is automatically set up via `docker-compose.yml`.

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID to `.env` file

### VNPAY Payment

1. Register at [VNPAY](https://www.vnpayment.vn/)
2. Get your Merchant Code (TMN Code) and Hash Secret
3. Configure in `.env` file
4. Set Return URL and IPN URL in VNPAY dashboard

## 🏃 Running the Application

### Docker Compose (Default Workflow)

```bash
# Start all services (frontend, backend, nginx, mongo, mailhog)
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

Access once the stack is up:
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api (proxied via nginx)
- **Swagger UI**: http://localhost/api/docs
- **MailHog UI**: http://localhost:8025 (email testing)
- **MongoDB**: localhost:27017

### API Endpoints Overview

#### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### Products

- `GET /api/products` - List products (with filters, search, pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products/:id/reviews` - Create review (no auth required)
- `GET /api/products/:id/reviews` - List reviews
- `POST /api/products/:id/ratings` - Create/update rating (auth required)
- `GET /api/products/:id/ratings/me` - Get user's rating
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

#### Cart

- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove item from cart

#### Checkout

- `POST /api/checkout/confirm` - Confirm order and create payment
- `GET /api/orders/my` - Get user orders
- `GET /api/orders/:id` - Get order details

#### Payment (VNPAY)

- `POST /api/payment/vnpay/create` - Create VNPAY payment URL
- `GET /api/payment/vnpay/return` - Handle VNPAY return
- `POST /api/payment/vnpay/ipn` - Handle VNPAY IPN

#### Admin

- `GET /api/admin/dashboard/simple` - Simple dashboard stats
- `GET /api/admin/dashboard/advanced` - Advanced dashboard with analytics
- `GET /api/admin/users` - List users
- `GET /api/admin/orders` - List orders
- `GET /api/admin/coupons` - List coupons
- `POST /api/admin/coupons` - Create coupon

#### Health

- `GET /api/health` - Health check endpoint

## 🚀 Deployment

### Docker Compose Deployment

1. Update environment variables in `docker-compose.yml`
2. Build and start services:

```bash
docker-compose up -d --build
```

3. Check service status:

```bash
docker-compose ps
```

### Scaling Backend

Scale the backend service to multiple instances:

```bash
# Stop all services
docker-compose down

# Scale to 3 instances
docker-compose up -d --scale api=3

# Check status
docker-compose ps
```

**Note**: Remove port mapping for the `api` service in `docker-compose.yml` before scaling. Nginx will automatically load balance between instances.

### Production Deployment

1. **Update environment variables** for production:
   - Set `MONGODB_URI` to production MongoDB
   - Set `FRONTEND_URL` to production domain
   - Set `VNP_RETURN_URL` and `VNP_IPN_URL` to production URLs
   - Configure real SMTP server (Gmail, SendGrid, etc.)

2. **Build production images**:

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

3. **Configure Nginx** for SSL/TLS (HTTPS)

4. **Set up monitoring** and logging

## 📊 Scaling

### Horizontal Scaling

The application supports horizontal scaling:

- **Stateless Architecture**: JWT tokens, no session storage
- **Load Balancing**: Nginx round-robin load balancing
- **Shared Database**: MongoDB shared across instances
- **Scalable Backend**: Multiple API instances via Docker Compose

### Scaling Commands

```bash
# Scale backend to 3 instances
docker-compose up -d --scale api=3

# Scale backend to 5 instances
docker-compose up -d --scale api=5

# View logs from all instances
docker-compose logs -f api
```

## 🧪 Testing

### Test VNPAY Payment

1. Add items to cart
2. Proceed to checkout
3. Select VNPAY payment method
4. Use test card: `9704198526191432198` (VNPAY sandbox)
5. OTP: Any 6 digits

### Test Email

1. Register a new user
2. Place an order
3. Check MailHog UI at http://localhost:8025

## 📝 Scripts

### Backend Scripts

```bash
# Development
npm run dev

# Seed database
npm run seed

# Create admin user
npm run create-admin

# Export products
npm run export:products

# Import products
npm run import:products
```

### Frontend Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

This project is licensed under the MIT License.


## 📚 API Documentation (Swagger)

The API documentation is available at:
- **Swagger UI**: http://localhost:4000/api/docs (Development)
- **Swagger UI**: http://localhost/api/docs (Production via Nginx)
- **Swagger JSON**: http://localhost:4000/api/docs.json

### Features:
- Interactive API documentation
- Test endpoints directly from Swagger UI
- JWT authentication support (use "Authorize" button)
- Request/response schemas
- Example requests and responses

### Using Swagger UI:
1. Start the stack: `docker compose up -d`
2. Open http://localhost/api/docs (proxied via nginx)
3. Click "Authorize" button to add JWT token (Bearer token)
4. Test endpoints directly from the UI

## 🔗 Links

- **GitHub Repository**: https://github.com/vinhk12102004/ecomNodejs
- **Demo**: https://youtu.be/UqbkiGuqmX0
- **API Documentation**: http://localhost:4000/api/docs (Swagger UI)

## 📞 Support

For support, email trongvinhle04@gmail.com or open an issue in the repository.


Update CI/CD test new new new✔dsadâsđdasasddas
d