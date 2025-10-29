# 🧪 HƯỚNG DẪN TEST CART & CHECKOUT

**Ngày:** 29/10/2025  
**Hệ thống:** Cart + Checkout APIs

---

## 📋 CHUẨN BỊ

### Kiểm tra API đang chạy:
```powershell
curl http://localhost:4000/health
```

Kết quả mong đợi: `{"ok":true}`

### Kiểm tra có sản phẩm trong database:
```powershell
curl http://localhost:4000/products
```

Nếu chưa có sản phẩm, seed data:
```powershell
docker exec ecomnodejs-api-1 npm run seed:products
```

---

## 🛒 TEST 1: GIỎ HÀNG (CART)

### Bước 1: Xem giỏ hàng rỗng
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:4000/cart"
$response.Content
```

**Kết quả mong đợi:**
```json
{"items":[],"subtotal":0}
```

**Lưu ý:** Response header sẽ có `x-guest-token` - đây là token cho guest user.

---

### Bước 2: Lấy ID của 1 sản phẩm
```powershell
# Lấy danh sách sản phẩm
$products = (Invoke-WebRequest "http://localhost:4000/products").Content | ConvertFrom-Json

# Xem sản phẩm đầu tiên
$product1 = $products.data[0]
Write-Host "Sản phẩm: $($product1.name)"
Write-Host "Giá: $($product1.price)"
Write-Host "ID: $($product1._id)"

# Lưu ID để dùng
$productId = $product1._id
```

---

### Bước 3: Thêm sản phẩm vào giỏ
```powershell
# Tạo request body
$addBody = @{
    productId = $productId
    qty = 2
} | ConvertTo-Json

# Gửi request
$addResponse = Invoke-WebRequest -Uri "http://localhost:4000/cart/items" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $addBody

# Xem kết quả
$addResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# LƯU GUEST TOKEN để dùng tiếp
$guestToken = $addResponse.Headers['x-guest-token']
Write-Host "`nGuest Token của bạn: $guestToken" -ForegroundColor Green
```

**Kết quả mong đợi:**
```json
{
  "items": [
    {
      "product": {
        "_id": "...",
        "name": "Tên sản phẩm",
        "price": 1299
      },
      "qty": 2,
      "priceAtAdd": 1299
    }
  ],
  "subtotal": 2598
}
```

---

### Bước 4: Xem giỏ hàng với guest token
```powershell
$cartResponse = Invoke-WebRequest -Uri "http://localhost:4000/cart" `
    -Headers @{"x-guest-token"=$guestToken}

$cartResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

---

### Bước 5: Thêm sản phẩm thứ 2 vào giỏ
```powershell
# Lấy sản phẩm thứ 2
$product2 = $products.data[1]
$productId2 = $product2._id
Write-Host "Thêm sản phẩm: $($product2.name)"

# Thêm vào giỏ
$addBody2 = @{
    productId = $productId2
    qty = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/cart/items" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-guest-token"=$guestToken
    } `
    -Body $addBody2 | Select-Object -ExpandProperty Content
```

---

### Bước 6: Cập nhật số lượng sản phẩm
```powershell
# Tăng số lượng sản phẩm đầu tiên lên 3
$updateBody = @{ qty = 3 } | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/cart/items/$productId" `
    -Method PATCH `
    -Headers @{
        "Content-Type"="application/json"
        "x-guest-token"=$guestToken
    } `
    -Body $updateBody | Select-Object -ExpandProperty Content
```

**Kiểm tra:** Subtotal phải tăng lên (3 * giá sản phẩm 1 + 1 * giá sản phẩm 2)

---

### Bước 7: Xóa 1 sản phẩm khỏi giỏ
```powershell
# Xóa sản phẩm thứ 2
Invoke-WebRequest -Uri "http://localhost:4000/cart/items/$productId2" `
    -Method DELETE `
    -Headers @{"x-guest-token"=$guestToken} | Select-Object -ExpandProperty Content
```

---

## 🛍️ TEST 2: CHECKOUT (KHÔNG CÓ COUPON)

### Bước 1: Xem trước đơn hàng (Preview)
```powershell
# Preview không có coupon
$previewBody = @{} | ConvertTo-Json

$preview = Invoke-WebRequest -Uri "http://localhost:4000/checkout/preview" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-guest-token"=$guestToken
    } `
    -Body $previewBody

$preview.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Kết quả mong đợi:**
```json
{
  "items": [...],
  "pricing": {
    "subtotal": 3897,
    "discount": 0,
    "total": 3897
  },
  "coupon": null
}
```

---

### Bước 2: Xác nhận đơn hàng (Confirm)
```powershell
$confirmBody = @{
    email = "khachhang@example.com"
} | ConvertTo-Json

$order = Invoke-WebRequest -Uri "http://localhost:4000/checkout/confirm" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-guest-token"=$guestToken
    } `
    -Body $confirmBody

$orderResult = $order.Content | ConvertFrom-Json
$orderResult | ConvertTo-Json -Depth 5

Write-Host "`n✅ ĐẶT HÀNG THÀNH CÔNG!" -ForegroundColor Green
Write-Host "Mã đơn hàng: $($orderResult.order.orderNumber)" -ForegroundColor Yellow
Write-Host "Tổng tiền: $($orderResult.order.totalAmount)" -ForegroundColor Yellow
```

**Điều gì đã xảy ra:**
- ✅ Đơn hàng được tạo trong database
- ✅ Số lượng tồn kho sản phẩm đã giảm
- ✅ Giỏ hàng đã được xóa
- ✅ Email xác nhận đã được gửi (nếu có Mailhog)
- ✅ Tài khoản tự động được tạo cho email mới

---

### Bước 3: Kiểm tra giỏ hàng đã bị xóa chưa
```powershell
Invoke-WebRequest -Uri "http://localhost:4000/cart" `
    -Headers @{"x-guest-token"=$guestToken} | Select-Object -ExpandProperty Content
```

**Kết quả mong đợi:**
```json
{"items":[],"subtotal":0}
```

---

## 🎟️ TEST 3: CHECKOUT VỚI COUPON

### Bước 1: Đăng nhập Admin để tạo coupon

```powershell
# Đăng ký tài khoản admin (lần đầu)
$signupBody = @{
    email = "admin@ecomlaptop.com"
    password = "Admin@123"
    name = "Admin"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "http://localhost:4000/auth/signup" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $signupBody
} catch {
    Write-Host "Tài khoản đã tồn tại, đăng nhập..." -ForegroundColor Yellow
}

# Đăng nhập
$loginBody = @{
    email = "admin@ecomlaptop.com"
    password = "Admin@123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:4000/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $loginBody

$adminToken = ($loginResponse.Content | ConvertFrom-Json).accessToken
Write-Host "Admin Token: $adminToken" -ForegroundColor Green
```

**LƯU Ý:** Tài khoản này mặc định là "customer". Bạn cần vào MongoDB để đổi role thành "admin":

```powershell
# Vào MongoDB container
docker exec -it ecomnodejs-mongodb-1 mongosh -u admin -p admin123 --authenticationDatabase admin

# Trong mongosh:
use ecommerce
db.users.updateOne(
  {email: "admin@ecomlaptop.com"},
  {$set: {role: "admin"}}
)
exit
```

---

### Bước 2: Tạo Coupon
```powershell
$couponBody = @{
    code = "GIAM20"
    discountPercent = 20
    usage_limit = 100
} | ConvertTo-Json

$coupon = Invoke-WebRequest -Uri "http://localhost:4000/admin/coupons" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "Authorization"="Bearer $adminToken"
    } `
    -Body $couponBody

$coupon.Content | ConvertFrom-Json | ConvertTo-Json

Write-Host "`n✅ Đã tạo coupon: GIAM20 (giảm 20%)" -ForegroundColor Green
```

---

### Bước 3: Thêm sản phẩm vào giỏ (token mới)
```powershell
# Tạo giỏ hàng mới
$newAddResponse = Invoke-WebRequest -Uri "http://localhost:4000/cart/items" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (@{productId=$productId; qty=2} | ConvertTo-Json)

$newGuestToken = $newAddResponse.Headers['x-guest-token']
Write-Host "Guest Token mới: $newGuestToken"
```

---

### Bước 4: Preview với coupon
```powershell
$previewWithCoupon = @{
    couponCode = "GIAM20"
} | ConvertTo-Json

$previewResult = Invoke-WebRequest -Uri "http://localhost:4000/checkout/preview" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-guest-token"=$newGuestToken
    } `
    -Body $previewWithCoupon

$previewData = $previewResult.Content | ConvertFrom-Json
$previewData | ConvertTo-Json -Depth 5

Write-Host "`nSubtotal: $($previewData.pricing.subtotal)" -ForegroundColor Cyan
Write-Host "Giảm giá: -$($previewData.pricing.discount)" -ForegroundColor Green
Write-Host "Tổng cộng: $($previewData.pricing.total)" -ForegroundColor Yellow
```

---

### Bước 5: Confirm với coupon
```powershell
$confirmWithCoupon = @{
    email = "customer2@example.com"
    couponCode = "GIAM20"
} | ConvertTo-Json

$finalOrder = Invoke-WebRequest -Uri "http://localhost:4000/checkout/confirm" `
    -Method POST `
    -Headers @{
        "Content-Type"="application/json"
        "x-guest-token"=$newGuestToken
    } `
    -Body $confirmWithCoupon

$finalOrderData = $finalOrder.Content | ConvertFrom-Json
$finalOrderData | ConvertTo-Json -Depth 5

Write-Host "`n🎉 ĐẶT HÀNG THÀNH CÔNG VỚI COUPON!" -ForegroundColor Green
Write-Host "Mã đơn: $($finalOrderData.order.orderNumber)"
Write-Host "Đã giảm: $($finalOrderData.order.pricing.discountValue)"
Write-Host "Tổng thanh toán: $($finalOrderData.order.totalAmount)"
```

---

## ❌ TEST 4: XỬ LÝ LỖI

### Test 1: Thêm số lượng vượt quá tồn kho
```powershell
$body = @{
    productId = $productId
    qty = 9999  # Số lượng lớn hơn stock
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "http://localhost:4000/cart/items" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body
} catch {
    $_.Exception.Response.StatusCode
    Write-Host "✅ Lỗi đúng: Insufficient stock" -ForegroundColor Green
}
```

---

### Test 2: Coupon không hợp lệ
```powershell
$body = @{couponCode = "KHONGTONTAI"} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "http://localhost:4000/checkout/preview" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "x-guest-token"=$newGuestToken} `
        -Body $body
} catch {
    Write-Host "✅ Lỗi đúng: Invalid coupon code" -ForegroundColor Green
}
```

---

### Test 3: Checkout giỏ hàng rỗng
```powershell
# Xóa giỏ hàng trước
Invoke-WebRequest -Uri "http://localhost:4000/cart" `
    -Method DELETE `
    -Headers @{"x-guest-token"=$newGuestToken}

# Thử checkout
$body = @{email="test@test.com"} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "http://localhost:4000/checkout/confirm" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "x-guest-token"=$newGuestToken} `
        -Body $body
} catch {
    Write-Host "✅ Lỗi đúng: Cart is empty" -ForegroundColor Green
}
```

---

## 📧 TEST 5: KIỂM TRA EMAIL (Nếu có Mailhog)

### Chạy Mailhog:
```powershell
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

### Mở Mailhog UI:
```
http://localhost:8025
```

### Thực hiện 1 đơn hàng:
- Làm theo Test 2 hoặc Test 3
- Mở Mailhog UI
- Bạn sẽ thấy email xác nhận đơn hàng với:
  - Bảng chi tiết sản phẩm
  - Tổng tiền, giảm giá
  - Mã đơn hàng
  - HTML đẹp mắt

---

## 📊 TEST 6: XEM ĐỚN HÀNG QUA ADMIN

```powershell
# Đăng nhập admin (nếu chưa)
# ... (dùng code ở Test 3)

# Xem danh sách đơn hàng
$orders = Invoke-WebRequest -Uri "http://localhost:4000/admin/orders" `
    -Headers @{"Authorization"="Bearer $adminToken"}

$ordersData = $orders.Content | ConvertFrom-Json
$ordersData.data | Format-Table _id, totalAmount, status, createdAt

# Xem chi tiết 1 đơn
$orderId = $ordersData.data[0]._id
Invoke-WebRequest -Uri "http://localhost:4000/admin/orders/$orderId" `
    -Headers @{"Authorization"="Bearer $adminToken"} | Select-Object -ExpandProperty Content
```

---

## ✅ CHECKLIST TEST

- [ ] GET /cart - Giỏ hàng rỗng
- [ ] POST /cart/items - Thêm sản phẩm
- [ ] GET /cart - Xem giỏ hàng có sản phẩm
- [ ] PATCH /cart/items/:id - Cập nhật số lượng
- [ ] DELETE /cart/items/:id - Xóa sản phẩm
- [ ] DELETE /cart - Xóa toàn bộ giỏ
- [ ] POST /checkout/preview - Preview không coupon
- [ ] POST /checkout/preview - Preview với coupon
- [ ] POST /checkout/confirm - Đặt hàng không coupon
- [ ] POST /checkout/confirm - Đặt hàng với coupon
- [ ] Kiểm tra giỏ đã bị xóa sau checkout
- [ ] Kiểm tra stock đã giảm
- [ ] Kiểm tra email đã gửi (Mailhog)
- [ ] Test lỗi: stock không đủ
- [ ] Test lỗi: coupon không hợp lệ
- [ ] Test lỗi: checkout giỏ rỗng

---

## 🎯 SCRIPT TEST NHANH (ALL-IN-ONE)

```powershell
Write-Host "=== TEST CART & CHECKOUT ===" -ForegroundColor Cyan

# 1. Lấy sản phẩm
$products = (curl http://localhost:4000/products).Content | ConvertFrom-Json
$p1 = $products.data[0]._id
Write-Host "✓ Lấy product ID: $p1"

# 2. Thêm vào giỏ
$add = Invoke-WebRequest -Uri "http://localhost:4000/cart/items" -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body (@{productId=$p1;qty=2}|ConvertTo-Json)
$token = $add.Headers['x-guest-token']
Write-Host "✓ Thêm vào giỏ, token: $token"

# 3. Xem giỏ
$cart = (curl -H "x-guest-token: $token" http://localhost:4000/cart).Content | ConvertFrom-Json
Write-Host "✓ Giỏ có $($cart.items.Count) sản phẩm, tổng: $($cart.subtotal)"

# 4. Preview
$preview = (Invoke-WebRequest -Uri "http://localhost:4000/checkout/preview" -Method POST `
    -Headers @{"Content-Type"="application/json";"x-guest-token"=$token} `
    -Body (@{}|ConvertTo-Json)).Content | ConvertFrom-Json
Write-Host "✓ Preview: tổng = $($preview.pricing.total)"

# 5. Confirm
$confirm = (Invoke-WebRequest -Uri "http://localhost:4000/checkout/confirm" -Method POST `
    -Headers @{"Content-Type"="application/json";"x-guest-token"=$token} `
    -Body (@{email="test@example.com"}|ConvertTo-Json)).Content | ConvertFrom-Json
Write-Host "✓ Đặt hàng: #$($confirm.order.orderNumber)"

Write-Host "`n🎉 TẤT CẢ TEST PASSED!" -ForegroundColor Green
```

---

## 🆘 XỬ LÝ SỰ CỐ

### API không chạy:
```powershell
docker-compose ps
docker-compose logs api
```

### Rebuild nếu cần:
```powershell
docker-compose down
docker-compose up --build -d
```

### Xem logs realtime:
```powershell
docker-compose logs -f api
```

---

**Chúc bạn test thành công! 🚀**

