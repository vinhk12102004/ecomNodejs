# TODO - Danh sách yêu cầu dự án E-commerce

## 📋 Tổng quan
File này liệt kê tất cả các yêu cầu từ tài liệu dự án và trạng thái triển khai của chúng.

---

## ✅ 1. Landing Page (Home Page)

### ✅ 1.1 - Trang chủ đầu tiên
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/HomePage.jsx`
- **Mô tả**: Trang chủ hiển thị banner và danh sách sản phẩm

### ✅ 1.2 - Hiển thị sản phẩm theo categories (nâng cấp)
- **Trạng thái**: ✅ Hoàn thành + Cải tiến
- **File**: 
  - `frontend/src/screens/HomePage.jsx`
  - `frontend/src/components/SectionGrid.jsx`
- **Mô tả mới**: 
  - Thêm hiệu ứng tự động trượt sản phẩm (auto-scroll) cho các SectionGrid.
  - Giảm layout chính còn 3 sản phẩm mỗi hàng (tối ưu UX/UI).
  - Hiển thị mượt, tương thích responsive.

### ✅ 1.3 - Không yêu cầu đăng nhập để xem sản phẩm
- **Trạng thái**: ✅ Hoàn thành
- **Mô tả**: Người dùng có thể xem sản phẩm mà không cần đăng nhập

### ✅ 1.4 - Guest Checkout (Tự động tạo tài khoản)
- **Trạng thái**: ✅ Hoàn thành
- **File**: `backend/src/controllers/checkout.controller.js` (dòng 261-283)
- **Mô tả**: Khi guest checkout, hệ thống tự động tạo tài khoản nếu chưa có

### ✅ 1.5 - Pre-fill địa chỉ mặc định khi đăng nhập
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/CheckoutPage.jsx`
- **Mô tả**: Nếu user đã đăng nhập, địa chỉ mặc định sẽ được điền sẵn

### ✅ 1.6 - Hai loại user: Customer và Admin
- **Trạng thái**: ✅ Hoàn thành
- **File**: `backend/src/models/user.model.js`
- **Mô tả**: Hệ thống hỗ trợ role `customer` và `admin`

---

## ✅ 2. User Management

### ✅ 2.1 - Đăng ký và Đăng nhập
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `frontend/src/screens/SignupPage.jsx`
  - `frontend/src/screens/LoginPage.jsx`
  - `backend/src/controllers/auth.controller.js`
- **Mô tả**: User có thể đăng ký với email, name và địa chỉ

### ✅ 2.2 - Social Media Authentication (Google OAuth)
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `frontend/src/screens/LoginPage.jsx` (dòng 32-43, 127-136)
  - `backend/src/controllers/auth.controller.js` (dòng 183-227)
- **Mô tả**: Hỗ trợ đăng nhập bằng Google OAuth

### ✅ 2.3 - Quản lý Profile
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/ProfilePage.jsx`
- **Mô tả**: User có thể cập nhật thông tin, đổi mật khẩu, quản lý nhiều địa chỉ

---

## ✅ 3. Product Management

### ✅ 3.1 - Product Catalog (Trang riêng)
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/HomePage.jsx`
- **Mô tả**: Trang hiển thị danh sách sản phẩm với thông tin cơ bản

### ❌ 3.2 - Listview và Gridview
- **Trạng thái**: ❌ Chưa hoàn thành
- **Mô tả**: Cần thêm toggle để chuyển đổi giữa listview và gridview
- **Cần làm**: Thêm button toggle và CSS cho listview

### ✅ 3.3 - Pagination
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/components/Pagination.jsx`
- **Mô tả**: Pagination hoạt động trên tất cả trang hiển thị sản phẩm

### ❌ 3.4 - Categories và Tags
- **Trạng thái**: ❌ Chưa hoàn thành
- **File**: `backend/src/models/product.model.js`
- **Mô tả**: Cần thêm field `category` và `tags` vào Product model
- **Ghi chú**: Hiện tại chỉ có `brand`, chưa có `category` và `tags`
- **Cần làm**: Thêm field `category` và `tags` vào Product model và schema

### ✅ 3.5 - Pagination hoạt động mọi nơi
- **Trạng thái**: ✅ Hoàn thành
- **Mô tả**: Pagination được áp dụng trên tất cả trang hiển thị sản phẩm

### ✅ 3.6 - Hiển thị số trang dù chỉ có 1 trang
- **File**: 
  - `backend/src/controllers/product.controller.js` (đã thêm `pages`)
  - `frontend/src/components/Pagination.jsx` (đã bỏ `if (pages <= 1) return null;`)
  - `frontend/src/screens/HomePage.jsx` (đã bỏ điều kiện `meta.pages > 1`)
- **Trạng thái**: ✅ Hoàn thành

---

## ✅ 4. Product Details

### ✅ 4.1 - Thông tin chi tiết sản phẩm
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/ProductDetail.jsx`
- **Mô tả**: Hiển thị name, price, brand, variants, description (ít nhất 5 dòng), ít nhất 3 hình ảnh

### ✅ 4.2 - Product Variants với inventory độc lập
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/models/productVariant.model.js`
  - `backend/src/controllers/variant.controller.js`
- **Mô tả**: Mỗi variant có stock riêng, được quản lý độc lập

### ✅ 4.3 - Reviews và Ratings
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `frontend/src/components/ProductReviews.jsx`
  - `backend/src/controllers/review.controller.js`
  - `backend/src/controllers/rating.controller.js`
- **Mô tả**: 
  - Reviews: Không cần đăng nhập
  - Ratings: Cần đăng nhập (không cần mua hàng)

### ✅ 4.4 - Websockets cho real-time updates
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/server.js` (dòng 37-42)
  - `backend/src/controllers/review.controller.js` (dòng 24-26)
  - `backend/src/controllers/rating.controller.js` (dòng 19-22)
- **Mô tả**: Sử dụng Socket.IO để cập nhật reviews và ratings real-time

---

## ✅ 5. Product Ordering (Sorting)

### ⚠️ 5.1 - Sắp xếp theo nhiều tiêu chí
- **Trạng thái**: ⚠️ Thiếu sắp xếp theo tên
- **File**: `frontend/src/screens/HomePage.jsx` (dòng 43-52)
- **Mô tả**: Hiện tại hỗ trợ:
  - ✅ Mới nhất (-createdAt)
  - ✅ Giá: Cao đến thấp (-price)
  - ✅ Giá: Thấp đến cao (price)
  - ✅ Đánh giá (-rating)
  - ❌ Tên: A-Z (name)
  - ❌ Tên: Z-A (-name)
- **Cần làm**: Thêm 2 options sắp xếp theo tên (A-Z, Z-A) để đạt đầy đủ yêu cầu (ít nhất 4 tiêu chí)

---

## ✅ 6. Product Search and Filtering

### ✅ 6.1 - Tìm kiếm sản phẩm
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/controllers/product.controller.js` (dòng 13-15)
  - `frontend/src/components/Filters.jsx`
- **Mô tả**: Hỗ trợ text search với MongoDB text index

### ✅ 6.2 - Filter theo Price
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/controllers/product.controller.js` (dòng 22-27)
  - `frontend/src/components/Filters.jsx` (dòng 8-9)
- **Mô tả**: Filter theo minPrice và maxPrice

### ✅ 6.3 - Filter theo Brand
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/controllers/product.controller.js` (dòng 17-20)
  - `frontend/src/components/Filters.jsx` (dòng 6)
- **Mô tả**: Filter theo brand (bắt buộc)

### ✅ 6.4 - Filter theo Rating
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/controllers/product.controller.js` (dòng 34-40)
  - `frontend/src/components/Filters.jsx` (dòng 10)
- **Mô tả**: Filter theo rating >= giá trị

### ✅ 6.5 - Ít nhất 3 tiêu chí filter
- **Trạng thái**: ✅ Hoàn thành
- **Mô tả**: Có Price, Brand, Rating (3 tiêu chí)

---

## ✅ 7. Cart and Checkout

### ✅ 7.1 - Add to Cart
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `frontend/src/contexts/CartContext.jsx`
  - `backend/src/services/cart.service.js`
- **Mô tả**: Thêm sản phẩm vào giỏ hàng

### ✅ 7.2 - Update quantity và Remove items
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `frontend/src/contexts/CartContext.jsx` (dòng 169-223)
  - `backend/src/services/cart.service.js`
- **Mô tả**: Cập nhật số lượng và xóa sản phẩm

### ✅ 7.3 - Real-time cart updates (không reload)
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/contexts/CartContext.jsx`
- **Mô tả**: Sử dụng React Context và optimistic updates để cập nhật real-time

### ✅ 7.4 - Cart Summary
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/components/CartSummary.jsx`
- **Mô tả**: Hiển thị subtotal, tax, shipping, discount, total

### ✅ 7.5 - Multi-step Checkout
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/CheckoutPage.jsx`
- **Mô tả**: Quy trình checkout nhiều bước

### ✅ 7.6 - Guest Checkout
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/controllers/checkout.controller.js` (dòng 261-283)
  - `backend/src/middleware/guestToken.js`
- **Mô tả**: Cho phép checkout mà không cần tài khoản

### ✅ 7.7 - Discount Codes
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `frontend/src/components/ApplyCoupon.jsx`
  - `backend/src/models/coupon.model.js`
  - `backend/src/controllers/checkout.controller.js` (dòng 56-76, 174-200)
- **Mô tả**: 
  - Mã giảm giá 5 ký tự
  - Không có expiration date
  - Usage limit (tối đa 10 lần)
  - Hiển thị validity và effect trước khi thanh toán

---

## ✅ 8. Order Management

### ✅ 8.1 - Order Creation
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/controllers/checkout.controller.js` (dòng 286-306)
  - `frontend/src/screens/ThankYouPage.jsx`
- **Mô tả**: Tạo order sau khi thanh toán thành công, hiển thị success screen

### ✅ 8.2 - Order Confirmation Email
- **Trạng thái**: ✅ Hoàn thành
- **File**: `backend/src/controllers/checkout.controller.js` (dòng 359-369)
- **Mô tả**: Gửi email xác nhận đơn hàng

### ✅ 8.3 - Order Tracking
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `frontend/src/screens/OrderDetail.jsx`
  - `frontend/src/screens/MyOrders.jsx`
- **Mô tả**: User có thể theo dõi trạng thái đơn hàng (pending, confirmed, shipping, delivered)

### ✅ 8.4 - Order Status History
- **Trạng thái**: ✅ Hoàn thành
- **File**: `backend/src/models/order.model.js` (dòng 48)
- **Mô tả**: Lưu lịch sử thay đổi trạng thái với timestamp, hiển thị theo thứ tự ngược (mới nhất trước)

### ✅ 8.5 - Order History
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/MyOrders.jsx`
- **Mô tả**: Hiển thị danh sách đơn hàng với order number, date, total amount, status, danh sách sản phẩm

---

## ✅ 9. Loyalty Program

### ✅ 9.1 - Earn Points (10% của order total)
- **Trạng thái**: ✅ Hoàn thành
- **File**: `backend/src/controllers/checkout.controller.js` (dòng 324-354)
- **Mô tả**: User nhận 10% điểm từ tổng đơn hàng (ví dụ: 1,000,000 VND = 100 điểm = 100,000 VND)

### ✅ 9.2 - Redeem Points
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `backend/src/controllers/checkout.controller.js` (dòng 78-90, 324-354)
  - `frontend/src/screens/CheckoutPage.jsx` (dòng 458-490)
- **Mô tả**: User có thể dùng điểm ngay trong đơn hàng tiếp theo, không có hạn chế thêm

---

## ✅ 10. Admin Management

### ✅ 10.1 - Simple Dashboard
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/admin/DashboardSimple.jsx`
- **Mô tả**: Hiển thị:
  - Tổng số users
  - Số users mới (7 ngày)
  - Tổng đơn hàng
  - Tổng doanh thu
  - Top 5 sản phẩm bán chạy
  - Charts

### ✅ 10.2 - Advanced Dashboard
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/admin/DashboardAdvanced.jsx`
- **Mô tả**: 
  - Mặc định hiển thị theo năm
  - Có thể chọn: today, yesterday, this week, this month, custom range
  - Theo dõi: số đơn hàng, doanh thu, lợi nhuận
  - Comparative charts: revenue, profit, số sản phẩm, loại sản phẩm
  - Breakdown theo: year, month, quarter, week

### ✅ 10.3 - Product Management
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/admin/ProductsList.jsx`
- **Mô tả**: Admin có thể thêm, sửa, xóa sản phẩm, quản lý categories, quản lý inventory

### ✅ 10.4 - User Management
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/admin/UsersList.jsx`
- **Mô tả**: Admin có thể xem tất cả users, ban/unban users, cập nhật thông tin

### ✅ 10.5 - Order Management
- **Trạng thái**: ✅ Hoàn thành
- **Files**: 
  - `frontend/src/screens/admin/OrdersList.jsx`
  - `frontend/src/screens/AdminOrderDetail.jsx`
- **Mô tả**: 
  - Xem danh sách đơn hàng (sắp xếp mới nhất trước, pagination ~20 items/page)
  - Filter theo: today, yesterday, this week, this month, custom range
  - Xem chi tiết đơn hàng: buyer name, purchase time, total amount, discount applied, danh sách sản phẩm
  - Thay đổi trạng thái đơn hàng

### ✅ 10.6 - Discount Management
- **Trạng thái**: ✅ Hoàn thành
- **File**: `frontend/src/screens/admin/CouponsList.jsx`
- **Mô tả**: 
  - Xem danh sách discount codes
  - Hiển thị: creation time, discount value, số lần sử dụng/max usage, danh sách orders đã dùng
  - Tạo discount codes mới

---

## ✅ 11. Deployment

### ✅ 11.1 - Docker Compose
- **Trạng thái**: ✅ Hoàn thành
- **File**: `docker-compose.yml`
- **Mô tả**: 
  - Container riêng cho frontend, backend, database
  - Có `docker-compose.yml`
  - Có thể chạy bằng `docker compose up -d`
  - Pre-configured npm install trong Dockerfile

---

## ⚠️ 12. Other Requirements

### ✅ 12.1 - UI/UX
- **Trạng thái**: ✅ Hoàn thành
- **Mô tả**: 
  - Design rõ ràng, user-friendly
  - Navigation trực quan
  - Focus on UX
  - Load time nhanh
  - Dễ tương tác

### ⚠️ 12.2 - Team Collaboration
- **Trạng thái**: ⚠️ Cần kiểm tra
- **Mô tả**: 
  - Sử dụng Git
  - Chia công việc
  - Integration mượt mà
  - Communication thường xuyên
  - GitHub Insights screenshots
  - Dự án kéo dài ít nhất 1 tháng
  - Mỗi thành viên ít nhất 2 commits/tuần
- **Ghi chú**: Cần kiểm tra GitHub Insights

### ✅ 12.3 - Responsive Design
- **Trạng thái**: ✅ Hoàn thành
- **Mô tả**: 
  - Sử dụng Tailwind CSS
  - Responsive trên nhiều thiết bị
  - Sử dụng CSS Grid và Flexbox

### ❌ 12.4 - Horizontal Scaling
- **Trạng thái**: ❌ Chưa hoàn thành
- **Mô tả**: 
  - Stateless architecture
  - Load balancing
  - Microservices
  - Có thể triển khai trên public hosting hoặc Docker Compose
- **Cần làm**: 
  - Thiết kế stateless (đã có JWT tokens)
  - Thêm load balancer (nginx)
  - Chia thành microservices (nếu cần)

---

## 📝 Tổng kết

### ✅ Đã hoàn thành: ~95%
- Hầu hết các tính năng chính đã được triển khai
- UI/UX tốt
- Responsive design
- Docker Compose deployment

### ❌ Cần bổ sung:
1. **Listview/Gridview toggle** (3.2) - ❌ Chưa có
2. **Categories và Tags** (3.4) - ❌ Chưa có trong Product model
3. **Team Collaboration evidence** (12.2) - ⚠️ Cần kiểm tra GitHub Insights
4. **Horizontal Scaling** (12.4) - ❌ Chưa có

### ❌ Chưa hoàn thành:
1. **Listview/Gridview toggle** (3.2)
2. **Horizontal Scaling** (12.4)

---

## 🎯 Ưu tiên sửa chữa

### High Priority:
1. ❌ Categories và Tags trong Product model (3.4)

### Medium Priority:
1. ⚠️ Listview/Gridview toggle
2. ⚠️ Team Collaboration evidence (GitHub Insights)

### Low Priority:
1. ❌ Horizontal Scaling (có thể bỏ qua nếu không cần bonus)

---

**Cập nhật lần cuối**: 2025-11-07 by Hoàng Vũ

