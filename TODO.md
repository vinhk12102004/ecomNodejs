# 📝 TODO LIST - ECOM LAPTOP PROJECT

**Cập nhật:** 29/10/2025

---

## 🔥 PRIORITY 1 - CART & CHECKOUT (CRITICAL)

### [ ] 1. Cart System Backend
- [ ] Tạo `backend/src/models/cart.model.js`
  ```javascript
  {
    user: ObjectId (nullable),
    guestId: String (nullable),
    items: [{ product, quantity, priceAtAdd }],
    expiresAt: Date
  }
  ```
- [ ] Tạo `backend/src/controllers/cart.controller.js`
  - [ ] `GET /cart` - Lấy giỏ hàng
  - [ ] `POST /cart/items` - Thêm sản phẩm
  - [ ] `PUT /cart/items/:productId` - Cập nhật số lượng
  - [ ] `DELETE /cart/items/:productId` - Xóa sản phẩm
  - [ ] `DELETE /cart` - Xóa toàn bộ giỏ
- [ ] Tạo `backend/src/routes/cart.routes.js`
- [ ] Middleware xử lý guest cart (cookie-based)

### [ ] 2. Checkout Flow Backend
- [ ] Tạo `backend/src/controllers/checkout.controller.js`
  - [ ] `POST /checkout/preview` - Xem trước đơn hàng
    - [ ] Validate coupon
    - [ ] Tính discount
    - [ ] Tính total
  - [ ] `POST /checkout/confirm` - Xác nhận đơn hàng
    - [ ] Tạo Order
    - [ ] Trừ stock sản phẩm
    - [ ] Clear cart
    - [ ] Tạo tài khoản nếu guest chưa tồn tại
    - [ ] Cộng loyalty points
    - [ ] Gửi email xác nhận
- [ ] Tạo `backend/src/services/checkout.service.js`
  - [ ] validateCoupon()
  - [ ] calculateTotal()
  - [ ] createOrFindGuestUser()
  - [ ] processOrder()

### [ ] 3. Cart Frontend
- [ ] Tạo `frontend/src/screens/CartPage.jsx`
  - [ ] Hiển thị danh sách items
  - [ ] Update quantity (+/-)
  - [ ] Remove item
  - [ ] Tổng tiền
  - [ ] Button "Checkout"
- [ ] Tạo `frontend/src/components/CartItem.jsx`
- [ ] Tạo `frontend/src/components/CartSummary.jsx`
- [ ] Tạo `frontend/src/hooks/useCart.js`
  - [ ] addToCart()
  - [ ] updateQuantity()
  - [ ] removeItem()
  - [ ] clearCart()
- [ ] Thêm Cart icon vào header (số lượng items)

### [ ] 4. Checkout Frontend
- [ ] Tạo `frontend/src/screens/CheckoutPage.jsx`
  - [ ] Form thông tin giao hàng
  - [ ] Input coupon code
  - [ ] Order summary
  - [ ] Button "Đặt hàng"
- [ ] Tạo `frontend/src/hooks/useCheckout.js`
- [ ] Success page sau khi đặt hàng

---

## 🔥 PRIORITY 2 - EMAIL SERVICE

### [ ] 5. Email Setup
- [ ] Cài đặt: `npm install nodemailer`
- [ ] Tạo `backend/src/config/email.js`
  - [ ] Config Mailhog (dev) hoặc Gmail SMTP
- [ ] Tạo `backend/src/services/email.service.js`
  - [ ] sendOrderConfirmation()
  - [ ] sendPasswordReset()
  - [ ] sendWelcomeEmail()
- [ ] Tạo `backend/src/templates/email/`
  - [ ] `orderConfirmation.html`
  - [ ] `passwordReset.html`
  - [ ] `welcome.html`
- [ ] Test gửi email với Mailhog

---

## 🔥 PRIORITY 3 - REVIEWS & RATINGS

### [ ] 6. Reviews Backend
- [ ] Tạo `backend/src/models/review.model.js`
  ```javascript
  {
    product: ObjectId,
    user: ObjectId (nullable), // anonymous nếu null
    name: String, // cho anonymous
    comment: String,
    createdAt: Date
  }
  ```
- [ ] Tạo `backend/src/models/rating.model.js`
  ```javascript
  {
    product: ObjectId,
    user: ObjectId (required),
    stars: Number (1-5)
  }
  ```
- [ ] Tạo `backend/src/controllers/review.controller.js`
  - [ ] `POST /products/:id/reviews` - Thêm review (anonymous OK)
  - [ ] `GET /products/:id/reviews` - List reviews
  - [ ] `POST /products/:id/ratings` - Thêm rating (auth required)
  - [ ] `GET /products/:id/ratings/me` - Rating của user
- [ ] Auto tính average rating khi có rating mới

### [ ] 7. Reviews Frontend
- [ ] Tạo `frontend/src/components/ReviewForm.jsx`
- [ ] Tạo `frontend/src/components/ReviewList.jsx`
- [ ] Tạo `frontend/src/components/RatingStars.jsx`
- [ ] Thêm reviews vào ProductDetail page

---

## 🔥 PRIORITY 4 - PASSWORD RESET

### [ ] 8. Password Reset Backend
- [ ] Thêm vào User model:
  ```javascript
  resetPasswordToken: String,
  resetPasswordExpires: Date
  ```
- [ ] Tạo `backend/src/controllers/password.controller.js`
  - [ ] `POST /auth/password/forgot` - Gửi email reset
  - [ ] `POST /auth/password/reset` - Reset với token
- [ ] Generate reset token (crypto.randomBytes)
- [ ] Gửi email với link reset

### [ ] 9. Password Reset Frontend
- [ ] Tạo `frontend/src/screens/ForgotPasswordPage.jsx`
- [ ] Tạo `frontend/src/screens/ResetPasswordPage.jsx`
- [ ] Link "Quên mật khẩu?" ở Login page

---

## 🔥 PRIORITY 5 - RATE LIMITING & VALIDATION

### [ ] 10. Rate Limiting
- [ ] Cài đặt: `npm install express-rate-limit`
- [ ] Tạo `backend/src/middleware/rateLimit.js`
  - [ ] authLimiter (10 requests/15min)
  - [ ] apiLimiter (100 requests/15min)
- [ ] Apply cho `/auth/*` routes

### [ ] 11. Validation Improvements
- [ ] Tạo Zod schemas cho auth endpoints:
  - [ ] SignupSchema
  - [ ] LoginSchema
  - [ ] PasswordResetSchema
- [ ] Apply validate middleware cho auth routes

---

## 🟡 PRIORITY 6 - ADDRESSES MANAGEMENT

### [ ] 12. Addresses Backend
- [ ] Thêm vào User model:
  ```javascript
  addresses: [{
    fullName: String,
    phone: String,
    address: String,
    city: String,
    district: String,
    ward: String,
    isDefault: Boolean
  }]
  ```
- [ ] Tạo `backend/src/controllers/address.controller.js`
  - [ ] `GET /me/addresses`
  - [ ] `POST /me/addresses`
  - [ ] `PUT /me/addresses/:id`
  - [ ] `DELETE /me/addresses/:id`
  - [ ] `PUT /me/addresses/:id/default`

### [ ] 13. Addresses Frontend
- [ ] Tạo `frontend/src/components/AddressForm.jsx`
- [ ] Tạo `frontend/src/screens/AddressesPage.jsx`
- [ ] Select address khi checkout

---

## 🟡 PRIORITY 7 - LOYALTY POINTS

### [ ] 14. Loyalty System Backend
- [ ] Tạo `backend/src/models/pointsLedger.model.js`
  ```javascript
  {
    user: ObjectId,
    order: ObjectId,
    points: Number,
    type: 'earn' | 'redeem',
    description: String,
    createdAt: Date
  }
  ```
- [ ] Thêm vào User model:
  ```javascript
  totalPoints: Number (default: 0)
  ```
- [ ] Tạo `backend/src/services/loyalty.service.js`
  - [ ] earnPoints(userId, orderId, amount)
  - [ ] redeemPoints(userId, points)
  - [ ] getPointsBalance(userId)
- [ ] Hook: Cộng 10% points sau khi checkout confirm

### [ ] 15. Loyalty Frontend
- [ ] Hiển thị points balance ở profile
- [ ] Cho phép dùng points khi checkout
- [ ] Points history page

---

## 🟡 PRIORITY 8 - SOCKET.IO REALTIME

### [ ] 16. Socket.IO Backend
- [ ] Cài đặt: `npm install socket.io`
- [ ] Tạo `backend/src/config/socket.js`
- [ ] Setup Socket.IO server trong `server.js`
- [ ] Tạo rooms cho từng product: `product:<id>`
- [ ] Emit event khi có review/rating mới:
  ```javascript
  io.to(`product:${productId}`).emit('newReview', review)
  io.to(`product:${productId}`).emit('newRating', rating)
  ```

### [ ] 17. Socket.IO Frontend
- [ ] Cài đặt: `npm install socket.io-client`
- [ ] Tạo `frontend/src/hooks/useSocket.js`
- [ ] Connect socket ở ProductDetail page
- [ ] Join room `product:<id>`
- [ ] Listen events và update UI realtime

---

## 🟡 PRIORITY 9 - ADMIN PANEL FRONTEND

### [ ] 18. Admin Layout
- [ ] Tạo `frontend/src/screens/admin/AdminLayout.jsx`
  - [ ] Sidebar menu
  - [ ] Header với user info
  - [ ] Protected route (admin only)
- [ ] Tạo `frontend/src/hooks/useAuth.js`
  - [ ] Login/logout
  - [ ] Check role

### [ ] 19. Admin Dashboard
- [ ] Tạo `frontend/src/screens/admin/DashboardPage.jsx`
  - [ ] KPI cards (revenue, orders, users)
  - [ ] Charts (Chart.js hoặc Recharts)
  - [ ] Filter by time range

### [ ] 20. Admin Orders
- [ ] Tạo `frontend/src/screens/admin/OrdersPage.jsx`
  - [ ] Table danh sách orders
  - [ ] Pagination (20/page)
  - [ ] Filters: today, yesterday, week, month, range
  - [ ] Update status
  - [ ] View detail modal
- [ ] Tạo `frontend/src/components/admin/OrderTable.jsx`

### [ ] 21. Admin Products
- [ ] Tạo `frontend/src/screens/admin/ProductsPage.jsx`
  - [ ] Table danh sách products
  - [ ] Create/Edit/Delete
  - [ ] Form modal
- [ ] Tạo `frontend/src/components/admin/ProductForm.jsx`

### [ ] 22. Admin Users
- [ ] Tạo `frontend/src/screens/admin/UsersPage.jsx`
  - [ ] Table users
  - [ ] Update role
  - [ ] Ban/Unban user

### [ ] 23. Admin Coupons
- [ ] Tạo `frontend/src/screens/admin/CouponsPage.jsx`
  - [ ] CRUD coupons
  - [ ] Xem usage stats

---

## 🟢 PRIORITY 10 - GOOGLE OAUTH

### [ ] 24. Google OAuth Backend
- [ ] Cài đặt: `npm install passport passport-google-oauth20`
- [ ] Tạo Google OAuth App (console.cloud.google.com)
- [ ] Lấy Client ID & Secret → `.env`
- [ ] Tạo `backend/src/config/passport.js`
- [ ] Routes:
  - [ ] `GET /auth/google` - Redirect to Google
  - [ ] `GET /auth/google/callback` - Handle callback
- [ ] Lưu user vào DB nếu chưa tồn tại
- [ ] Return JWT tokens

### [ ] 25. Google OAuth Frontend
- [ ] Button "Đăng nhập với Google"
- [ ] Redirect về `/auth/google`

---

## 🟢 PRIORITY 11 - IMPROVEMENTS & POLISH

### [ ] 26. Error Handling
- [ ] Tạo `backend/src/middleware/errorHandler.js`
- [ ] Global error handler
- [ ] Custom error classes (ValidationError, NotFoundError, etc.)
- [ ] Consistent error response format

### [ ] 27. Logging
- [ ] Cài đặt: `npm install winston`
- [ ] Setup logger với winston
- [ ] Log errors, requests, important events

### [ ] 28. Testing (Optional)
- [ ] Setup Jest + Supertest
- [ ] Unit tests cho services
- [ ] Integration tests cho APIs
- [ ] E2E tests với Cypress (frontend)

### [ ] 29. Advanced Filters cho Orders
- [ ] Tích hợp `dateRange.util.js` vào `/admin/orders`
- [ ] Query params: `?period=today|yesterday|week|month`
- [ ] Custom range: `?from=2025-01-01&to=2025-01-31`

### [ ] 30. Product Variants (Optional)
- [ ] Tạo `backend/src/models/productVariant.model.js`
  ```javascript
  {
    product: ObjectId,
    sku: String,
    name: String, // e.g. "16GB RAM / 512GB SSD"
    price: Number,
    stock: Number,
    specs: Object
  }
  ```
- [ ] API để lấy variants của product
- [ ] Frontend select variant khi add to cart

---

## 📦 PACKAGES CẦN CÀI THÊM

### Backend:
```bash
npm install express-rate-limit
npm install passport passport-google-oauth20
npm install nodemailer
npm install socket.io
npm install winston
```

### Frontend:
```bash
npm install socket.io-client
npm install react-hook-form
npm install zustand
npm install recharts  # hoặc chart.js
```

---

## 🎯 ESTIMATED TIME

| Task | Time |
|------|------|
| Cart & Checkout | 3-5 days |
| Email Service | 1 day |
| Reviews & Ratings | 2-3 days |
| Password Reset | 1 day |
| Rate Limiting & Validation | 1 day |
| Addresses | 1-2 days |
| Loyalty Points | 1-2 days |
| Socket.IO | 1-2 days |
| Admin Panel Frontend | 5-7 days |
| Google OAuth | 1-2 days |
| Polish & Testing | 3-5 days |
| **TOTAL** | **20-35 days** |

---

## ✅ CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Tất cả APIs có error handling
- [ ] Validation cho mọi input
- [ ] Rate limiting cho auth endpoints
- [ ] CORS config đúng
- [ ] Environment variables trong `.env`
- [ ] Database indexes đủ
- [ ] Email service hoạt động
- [ ] Admin panel bảo mật
- [ ] Frontend error boundaries
- [ ] Loading states
- [ ] 404 pages
- [ ] README documentation
- [ ] API documentation (Postman/Swagger)

---

**Chúc bạn code vui vẻ! 🚀**

