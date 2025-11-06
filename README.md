# 📝 TODO LIST - ECOM LAPTOP PROJECT

**Cập nhật:** 30/10/2025

---

## ✅ NGÀY 1 - PRODUCT VARIANTS (HOÀN THÀNH)

### 🎯 Mục tiêu
Mỗi product có 2+ variants với stock độc lập. Cart dùng skuId khi có variant.

### ✅ Đã hoàn thành

#### 1. Backend - Models ✅
- ✅ Tạo `backend/src/models/productVariant.model.js`
  - Schema: product, sku (unique), name, price, stock, attributes (ramGB, storageGB, color)
  - Compound index: product + attributes
  - Pre-save validation

#### 2. Backend - Routes & Controllers ✅
- ✅ Tạo `backend/src/controllers/variant.controller.js`
  - `listByProduct()` - GET /products/:id/variants
  - `getVariantBySku()` - GET /variants/:sku
  - `create()` - POST /admin/products/:id/variants (admin)
  - `update()` - PATCH /admin/variants/:sku (admin)
  - `remove()` - DELETE /admin/variants/:sku (admin)
  
- ✅ Tạo `backend/src/routes/variant.routes.js`
- ✅ Mount routes trong `backend/src/routes/index.js`

#### 3. Backend - Cart Integration ✅
- ✅ Cập nhật `backend/src/services/cart.service.js`
  - Import ProductVariant model
  - `addItem()`: Validate variant, use variant price/stock
  - `updateItemQty()`: Check variant stock
  - `removeItem()`: Support skuId matching
  - Merge key: prioritize skuId

#### 4. Frontend - ProductDetail ✅
- ✅ Cập nhật `frontend/src/screens/ProductDetail.jsx`
  - Fetch variants via `getVariants(productId)`
  - Variant selector UI (cards với RAM/Storage/Color)
  - Auto-select first variant
  - Display variant price và stock
  - Pass `skuId` khi add to cart

#### 5. Frontend - API Integration ✅
- ✅ Cập nhật `frontend/src/lib/api.js`
  - Add `getVariants()` helper
  - Update `addItem()` to support skuId parameter
  
- ✅ Cập nhật `frontend/src/hooks/useCart.js`
  - Update `add()` function to accept skuId

#### 6. Seed Data ✅
- ✅ Tạo `backend/database/seed-variants.js`
  - Mỗi product: 2-3 variants
  - RAM configs: 8GB/256GB, 16GB/512GB, 32GB/1TB
  - Colors: Silver, Black, Space Gray, Gold, Blue
  - Stock: random 10-50
  - Auto-generate SKU: SKU-{productId}-{ramGB}GB-{storageGB}GB-{color}
  
- ✅ Add npm script: `"seed:variants": "node database/seed-variants.js"`

#### 7. Documentation ✅
- ✅ Cập nhật README.md
  - Product Variants API documentation
  - cURL examples
  - Cart with variants usage
  - Seed instructions

---

## 📊 THỐNG KÊ THỰC HIỆN

| Task | Status | File | Lines |
|------|--------|------|-------|
| ProductVariant Model | ✅ | backend/src/models/productVariant.model.js | 84 |
| Variant Controller | ✅ | backend/src/controllers/variant.controller.js | 209 |
| Variant Routes | ✅ | backend/src/routes/variant.routes.js | 34 |
| Cart Service Update | ✅ | backend/src/services/cart.service.js | Modified |
| Frontend ProductDetail | ✅ | frontend/src/screens/ProductDetail.jsx | Modified |
| Frontend API Helpers | ✅ | frontend/src/lib/api.js | Modified |
| Frontend useCart Hook | ✅ | frontend/src/hooks/useCart.js | Modified |
| Seed Variants Script | ✅ | backend/database/seed-variants.js | 118 |
| README Documentation | ✅ | README.md | Modified |

**Tổng cộng:** 9 files created/modified

---

## 🔍 CHI TIẾT KỸ THUẬT

### Database Schema
```javascript
ProductVariant {
  product: ObjectId (ref: Product, indexed),
  sku: String (unique, uppercase),
  name: String, // "16GB / 512GB / Silver"
  price: Number,
  stock: Number (independent!),
  attributes: {
    ramGB: Number,
    storageGB: Number,
    color: String
  },
  isActive: Boolean,
  timestamps: true
}
```

### API Endpoints
```
GET    /products/:id/variants       - List variants (public)
GET    /variants/:sku                - Get variant by SKU (public)
POST   /admin/products/:id/variants  - Create variant (admin)
PATCH  /admin/variants/:sku          - Update variant (admin)
DELETE /admin/variants/:sku          - Delete variant (admin)
```

### Cart Integration
```javascript
// Add to cart with variant
POST /cart/items
{
  "productId": "...",
  "skuId": "SKU-ABC123", // Required when product has variants
  "qty": 1
}
```

---

## 🧪 TESTING CHECKLIST

### Backend API
- [x] GET /products/:id/variants returns list với pagination
- [x] GET /variants/:sku returns single variant
- [x] POST /admin/products/:id/variants creates variant
- [x] PATCH /admin/variants/:sku updates variant
- [x] DELETE /admin/variants/:sku soft deletes variant
- [x] Cart service validates variant stock
- [x] Cart service uses variant price khi có skuId

### Frontend
- [x] ProductDetail fetches và displays variants
- [x] Variant selector highlights selected variant
- [x] Price updates khi chọn variant khác
- [x] Stock updates khi chọn variant khác
- [x] Add to cart gửi đúng skuId
- [x] Quantity selector respects variant stock limit

### Seed Data
- [x] Seed script creates 2+ variants per product
- [x] SKUs are unique
- [x] Stock is randomized (10-50)
- [x] Prices increase with RAM/Storage configs

---

## 🚀 DEPLOYMENT NOTES

### Chạy Seed Data
```bash
# Sau khi start docker
docker exec -it ecomnodejs-api-1 sh

# Trong container
npm run seed:products   # Trước tiên seed products
npm run seed:variants   # Sau đó seed variants
```

### Verify Data
```bash
# Check số lượng variants
db.product_variants.countDocuments()

# Check products có variants
db.product_variants.distinct("product").length

# Check sample variant
db.product_variants.findOne()
```

---

## 📝 NOTES & LESSONS LEARNED

1. **Variant Stock Independence**: Mỗi variant có stock riêng, không dùng product.stock
2. **SKU Uniqueness**: SKU phải unique toàn database, dùng index
3. **Cart Merge Key**: Prioritize skuId khi match cart items
4. **Price Source**: Variant price overrides product price
5. **Frontend Validation**: Validate variant selection trước khi add to cart
6. **Auto-selection**: Frontend auto-select variant đầu tiên để UX tốt hơn

---

## 🎯 TIẾP THEO - NGÀY 2 (DỰ KIẾN)

### Landing Page - Categories
- [ ] Tạo sections: New Products, Best Sellers
- [ ] Thêm 3+ category groups (Gaming, Business, Ultrabooks)
- [ ] Implement "Xem tất cả" links

### Product Sorting Enhancement
- [ ] Thêm sort by name (A-Z, Z-A)
- [ ] Verify sort by price (asc, desc) hoạt động

### Product Filter Enhancement
- [ ] Thêm rating filter (5 sao, 4+, 3+)
- [ ] Hoặc stock availability filter

---

## ✨ ACHIEVEMENTS

- 🎉 Product Variants system hoàn chỉnh
- 🎉 Independent inventory tracking
- 🎉 Cart integration with variants
- 🎉 Beautiful variant selector UI
- 🎉 Full API documentation
- 🎉 Seed data script
- 🎉 100% yêu cầu PRIORITY 1 đã đáp ứng!

**Status:** ✅ NGÀY 1 HOÀN THÀNH XUẤT SẮC!

---

## ✅ NGÀY 2 - COUPON VALIDATION (HOÀN THÀNH)

**Cập nhật:** 30/10/2025

### 🎯 Mục tiêu
- Code coupon chỉ 5 ký tự alphanumeric uppercase
- usage_limit ≤ 10
- Validation rõ ràng với error messages

### ✅ Đã hoàn thành

#### 1. Backend - Model Validation ✅
**File:** `backend/src/models/coupon.model.js`

**Changes:**
- ✅ Code field: minlength=5, maxlength=5
- ✅ Code validator: `/^[A-Z0-9]{5}$/`
- ✅ usage_limit: min=1, max=10, default=10
- ✅ Pre-save hook: Auto uppercase + validation
- ✅ Error messages: Clear and descriptive

```javascript
code: {
  type: String,
  required: [true, 'Coupon code is required'],
  unique: true,
  uppercase: true,
  trim: true,
  minlength: [5, 'CODE must be exactly 5 characters'],
  maxlength: [5, 'CODE must be exactly 5 characters'],
  validate: {
    validator: function(v) {
      return /^[A-Z0-9]{5}$/.test(v);
    },
    message: 'CODE must be 5 alphanumeric uppercase characters (A-Z, 0-9)'
  }
}
```

#### 2. Backend - Controller Validation ✅
**File:** `backend/src/controllers/admin/coupon.controller.js`

**Create Function:**
- ✅ Validate code format before database call
- ✅ Auto-convert to uppercase
- ✅ Validate usage_limit (1-10)
- ✅ Validate discountPercent (1-100)
- ✅ Handle duplicate code error (11000)
- ✅ Clear error messages

**Update Function:**
- ✅ Validate code if provided
- ✅ Validate usage_limit if provided
- ✅ Validate discountPercent if provided
- ✅ Run validators on update
- ✅ Handle duplicate code error

**Error Messages:**
```json
{
  "error": "CODE must be 5 alphanumeric uppercase characters (A-Z, 0-9). Example: ABC12, SAVE5"
}
{
  "error": "usage_limit must be between 1 and 10"
}
{
  "error": "Coupon code already exists"
}
```

#### 3. Test Documentation ✅
**File:** `TEST_COUPON.md` (NEW)

**Contents:**
- ✅ Validation rules documentation
- ✅ 12 comprehensive test cases:
  - ✅ Valid 5-char code → Success
  - ✅ Invalid 4-char code → 400 Fail
  - ✅ Invalid 6-char code → 400 Fail
  - ✅ Invalid special chars → 400 Fail
  - ✅ usage_limit > 10 → 400 Fail
  - ✅ usage_limit = 0 → 400 Fail
  - ✅ Lowercase auto-uppercase → Success
  - ✅ usage_limit = 1 (MIN) → Success
  - ✅ usage_limit = 10 (MAX) → Success
  - ✅ Duplicate code → 400 Fail
  - ✅ Update usage_limit → Success
  - ✅ Update usage_limit > 10 → 400 Fail
- ✅ cURL examples for each test
- ✅ Quick test bash script
- ✅ Valid/Invalid code examples

#### 4. README Update ✅
**File:** `README.md`

- ✅ Added link to TEST_COUPON.md
- ✅ Updated API Documentation section

---

## 📊 THỐNG KÊ NGÀY 2

| Task | Status | File | Changes |
|------|--------|------|---------|
| Model Validation | ✅ | coupon.model.js | +30 lines |
| Controller Validation | ✅ | coupon.controller.js | +90 lines |
| Test Documentation | ✅ | TEST_COUPON.md | NEW (400+ lines) |
| README Update | ✅ | README.md | Modified |

**Tổng cộng:** 3 files modified, 1 file created

---

## 🔍 CHI TIẾT KỸ THUẬT

### Validation Rules
```javascript
// Code Format
/^[A-Z0-9]{5}$/ // Exactly 5 alphanumeric uppercase

// Usage Limit
1 ≤ usage_limit ≤ 10 // Between 1 and 10 inclusive

// Discount Percent
1 ≤ discountPercent ≤ 100 // Between 1 and 100
```

### Auto Transformations
- Lowercase → Uppercase: `save5` → `SAVE5`
- Trim whitespace: ` ABC12 ` → `ABC12`

### Error Handling
- Validation errors: 400 Bad Request
- Duplicate code: 400 Bad Request (code 11000)
- Not found: 404 Not Found

---

## 🧪 TEST RESULTS

### Valid Codes (Examples)
✅ `ABC12` - Alphanumeric mix
✅ `SAVE5` - Letters + number
✅ `12345` - All numbers
✅ `AAAAA` - All letters
✅ `A1B2C` - Alternating

### Invalid Codes (Will Fail)
❌ `SAVE` - Only 4 chars
❌ `SAVE20` - 6 chars
❌ `SAV-5` - Special character
❌ `SAV 5` - Contains space
❌ `SAVÉ5` - Accent character

---

## ✨ ACHIEVEMENTS

- 🎉 Coupon validation 100% compliant with requirements
- 🎉 Code must be exactly 5 alphanumeric uppercase
- 🎉 usage_limit capped at 10
- 🎉 Clear error messages for debugging
- 🎉 Comprehensive test documentation (12 test cases)
- 🎉 Auto uppercase transformation
- 🎉 Duplicate code prevention

**Status:** ✅ NGÀY 2 HOÀN THÀNH!

---

## 🎯 TIẾP THEO - NGÀY 3 (DỰ KIẾN)

### Landing Page - Categories
- [ ] Section "New Products" (sort=-createdAt, limit=8)
- [ ] Section "Best Sellers" (sort by sales/rating)
- [ ] Section "Gaming Laptops" (filter brands)
- [ ] Section "Business Laptops" (filter brands)
- [ ] Section "Ultrabooks" (filter by weight)
- [ ] "Xem tất cả" links for each section

### Product Sorting
- [ ] Add sort by name A-Z
- [ ] Add sort by name Z-A
- [ ] Verify existing price sorts

### Product Filtering
- [ ] Add rating filter (5★, 4+★, 3+★)
- [ ] Or add stock availability filter

---

*End of Day 2 Report - Coupon Validation Implementation*

---

## ✅ NGÀY 3 - PRODUCT IMAGES & DESCRIPTION (HOÀN THÀNH)

**Cập nhật:** 30/10/2025

### 🎯 Mục tiêu
- Mỗi product có 3+ images với gallery UI
- Description tối thiểu 200 ký tự
- Validation backend cho images và description

### ✅ Đã hoàn thành

#### 1. Backend - Product Model Update ✅
**File:** `backend/src/models/product.model.js`

**Changes:**
- ✅ Added `images` field: Array of Strings, required, min 3 images
- ✅ Updated `description` field: required, minlength 200 characters
- ✅ Kept `image` field as deprecated for backward compatibility
- ✅ Pre-validation hook for images length and description length
- ✅ Custom validators with clear error messages

```javascript
images: {
  type: [String],
  required: [true, 'Product images are required'],
  validate: {
    validator: function(v) {
      return Array.isArray(v) && v.length >= 3;
    },
    message: 'Product must have at least 3 images'
  }
},
description: {
  type: String,
  required: [true, 'Product description is required'],
  minlength: [200, 'Description must be at least 200 characters (~5 lines)'],
  trim: true
}
```

#### 2. Backend - Controller Validation ✅
**File:** `backend/src/controllers/admin/product.controller.js`

**Create Function:**
- ✅ Validate images is array and length >= 3
- ✅ Validate description length >= 200
- ✅ Return 400 with clear error messages
- ✅ Pre-flight validation before database call

**Update Function:**
- ✅ Validate images if provided
- ✅ Validate description if provided
- ✅ Run validators on update with `runValidators: true`

**Error Messages:**
```json
{
  "error": "Product must have at least 3 images"
}
{
  "error": "Description must be at least 200 characters (~5 lines)"
}
{
  "error": "images field is required and must be an array"
}
```

#### 3. Frontend - Product Gallery UI ✅
**File:** `frontend/src/screens/ProductDetail.jsx`

**Changes:**
- ✅ Added `currentImageIndex` state for gallery navigation
- ✅ Images handling logic (fallback if missing)
- ✅ Main image display with aspect ratio
- ✅ Thumbnails grid (4 columns) with active state
- ✅ Warning banner if images < 3: "⚠️ Thiếu ảnh sản phẩm"
- ✅ Placeholder image when no images available
- ✅ Description section with whitespace-pre-line formatting
- ✅ Clean, modern UI with Tailwind CSS

**UI Features:**
- Main image: aspect-[4/3], object-contain
- Thumbnails: 4-column grid, clickable, border highlights active
- Description: Formatted section with proper spacing
- Warning: Yellow banner for missing images

#### 4. Seed Data Script ✅
**File:** `backend/database/seed-products-images.js` (NEW)

**Features:**
- ✅ Connects to MongoDB and finds all existing products
- ✅ Generates 3-5 images per product from curated Unsplash pool (15 laptop images)
- ✅ Categorizes products: apple, gaming, business, ultrabook, budget
- ✅ Generates extended descriptions (200+ chars) based on category
- ✅ Description templates include specs, use cases, and features
- ✅ Skips products that already have 3+ images
- ✅ Detailed progress logging with emoji indicators
- ✅ Summary report: updated, skipped, errors

**Usage:**
```bash
docker exec ecomnodejs-api-1 node database/seed-products-images.js
```

**Output:**
```
✓ Updated:  14 products
⊘ Skipped:  0 products (already have images)
✗ Errors:   0 products
📝 Total:    14 products processed
```

#### 5. Documentation Update ✅
**File:** `README.md`

**Changes:**
- ✅ Updated seed instructions with step-by-step guide
- ✅ Added `seed:images` command to workflow
- ✅ Updated Frontend features list:
  - Product Images Gallery (3+ images với thumbnails)
  - Extended Description (200+ ký tự)
- ✅ Updated Backend features list:
  - Product Images Validation (Minimum 3 images required)
  - Description Validation (Minimum 200 characters)

---

## 📊 THỐNG KÊ NGÀY 3

| Task | Status | File | Changes |
|------|--------|------|---------|
| Product Model | ✅ | product.model.js | +30 lines |
| Admin Controller | ✅ | product.controller.js | +50 lines |
| Frontend Gallery | ✅ | ProductDetail.jsx | +70 lines |
| Seed Images Script | ✅ | seed-products-images.js | NEW (210 lines) |
| README Update | ✅ | README.md | Modified |

**Tổng cộng:** 4 files modified, 1 file created

---

## 🔍 CHI TIẾT KỸ THUẬT

### Validation Rules
```javascript
// Images Array
images.length >= 3 // At least 3 images required
Array.isArray(images) // Must be array

// Description
description.length >= 200 // At least 200 characters
description.trim() // Trimmed whitespace
```

### Image Gallery Features
- **Main Display**: Large image with aspect-[4/3] ratio
- **Thumbnails**: 4-column grid, click to change main image
- **Navigation**: State-based, instant switching
- **Warning**: Yellow banner if images < 3
- **Placeholder**: Camera icon when no images

### Seed Data Details
- **Image Sources**: Unsplash curated laptop images (15 URLs)
- **Images per Product**: 3-5 randomly assigned
- **Description Templates**: 5 categories (apple, gaming, business, ultrabook, budget)
- **Description Length**: 200-700 characters
- **Products Updated**: 14/14 successfully

---

## 🧪 TEST RESULTS

### Backend Validation
✅ Create product with 3 images → Success
❌ Create product with 2 images → 400 Error
❌ Create product with no images → 400 Error
✅ Create product with description 200+ chars → Success
❌ Create product with description <200 chars → 400 Error

### Frontend Gallery
✅ Display main image correctly
✅ Thumbnails highlight active image
✅ Click thumbnail switches main image
✅ Warning shown for products with <3 images
✅ Placeholder shown for products with no images
✅ Description section displays properly

### Seed Script
✅ All 14 products updated successfully
✅ Each product has 3-5 images
✅ Each product has description 200+ chars
✅ No errors during seeding
✅ Skips products that already have images

---

## 📸 SAMPLE OUTPUT

### Product with Images
```json
{
  "_id": "...",
  "name": "MacBook Air M2 13-inch",
  "images": [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"
  ],
  "description": "Ultra-thin laptop with M2 chip, perfect for students and professionals\n\nThis Apple laptop features the cutting-edge Apple M2 chip, delivering exceptional performance for both professional and creative workloads. With 8GB of unified memory and 256GB of ultra-fast NVMe storage, multitasking is seamless. The stunning 13.6-inch Liquid Retina display with 2560x1664 resolution brings your content to life. Weighing just 1.24kg, it's incredibly portable. Battery life is exceptional with 52.6Wh capacity, perfect for all-day productivity. Includes USB-C, MagSafe 3, Headphone Jack ports for connectivity."
}
```

---

## ✨ ACHIEVEMENTS

- 🎉 Product gallery với 3+ images
- 🎉 Beautiful thumbnail navigation UI
- 🎉 Extended descriptions (200+ characters)
- 🎉 Robust validation on backend
- 🎉 Clear error messages
- 🎉 Automated seed script for images
- 🎉 14/14 products successfully updated
- 🎉 Warning system for missing images
- 🎉 Responsive gallery design

**Status:** ✅ NGÀY 3 HOÀN THÀNH!

---

## 🎯 TIẾP THEO - NGÀY 4 (DỰ KIẾN)

### Landing Page - Categories
- [ ] Section "New Products" (sort=-createdAt, limit=8)
- [ ] Section "Best Sellers" (sort by sales/rating)
- [ ] Section "Gaming Laptops" (filter brands)
- [ ] Section "Business Laptops" (filter brands)
- [ ] Section "Ultrabooks" (filter by weight)
- [ ] "Xem tất cả" links for each section

### Product Sorting
- [ ] Add sort by name A-Z
- [ ] Add sort by name Z-A
- [ ] Verify existing price sorts

### Product Filtering
- [ ] Add rating filter (5★, 4+★, 3+★)
- [ ] Or add stock availability filter

---

*End of Day 3 Report - Product Images & Description Implementation*

---

## ✅ NGÀY 4 - LANDING PAGE SECTIONS + SORT NAME + RATING FILTER (HOÀN THÀNH)

**Cập nhật:** 30/10/2025

### 🎯 Mục tiêu
- Homepage có sections: New Products, Best Sellers, 3 categories
- Thêm sort theo tên (A-Z, Z-A)
- Thêm filter theo rating (≥3, ≥4, =5)

### ✅ Đã hoàn thành

#### 1. Backend - Sort & Filter Enhancement ✅
**File:** `backend/src/controllers/product.controller.js`

**Changes:**
- ✅ Added `ratingGte` query parameter for rating filter
- ✅ Rating filter: `?ratingGte=3`, `?ratingGte=4`, `?ratingGte=5`
- ✅ Sort by name already supported via MongoDB: `?sort=name` (A→Z), `?sort=-name` (Z→A)
- ✅ Parse and validate rating value (parseFloat)

```javascript
// Rating filter (>=3, >=4, or =5)
if (ratingGte !== undefined) {
  const rating = parseFloat(ratingGte);
  if (!isNaN(rating)) {
    filter.rating = { $gte: rating };
  }
}
```

**Available Sort Options:**
- `sort=-createdAt` - Mới nhất (default)
- `sort=-price` - Giá giảm dần
- `sort=price` - Giá tăng dần
- `sort=name` - Tên A → Z (NEW)
- `sort=-name` - Tên Z → A (NEW)
- `sort=-rating` - Đánh giá cao nhất

#### 2. Frontend - Filters Component Update ✅
**File:** `frontend/src/components/Filters.jsx`

**Changes:**
- ✅ Added `ratingGte` state and dropdown
- ✅ Rating options: "Tất cả đánh giá", "⭐ 5 sao", "⭐ 4 sao trở lên", "⭐ 3 sao trở lên"
- ✅ Added sort options: "Tên A → Z", "Tên Z → A", "Đánh giá cao nhất"
- ✅ Updated grid layout from 5 to 6 columns
- ✅ Updated "Xoá lọc" button to reset all filters including rating
- ✅ Better UI with hover transitions

**New Filter Options:**
```jsx
{/* Rating Filter */}
<select value={ratingGte}>
  <option value="">Tất cả đánh giá</option>
  <option value="5">⭐ 5 sao</option>
  <option value="4">⭐ 4 sao trở lên</option>
  <option value="3">⭐ 3 sao trở lên</option>
</select>

{/* Sort with Name */}
<select value={sort}>
  <option value="-createdAt">Mới nhất</option>
  <option value="-price">Giá giảm dần</option>
  <option value="price">Giá tăng dần</option>
  <option value="name">Tên A → Z</option>
  <option value="-name">Tên Z → A</option>
  <option value="-rating">Đánh giá cao nhất</option>
</select>
```

#### 3. Frontend - SectionGrid Component ✅
**File:** `frontend/src/components/SectionGrid.jsx` (NEW)

**Features:**
- ✅ Reusable component for product sections
- ✅ Accepts props: `{ title, query, linkTo }`
- ✅ Fetches products based on query params
- ✅ Displays 4-column grid (responsive)
- ✅ "Xem tất cả" button with arrow animation
- ✅ Loading and error states
- ✅ Auto-hides if no products found
- ✅ Uses ProductCard component for consistency

**Usage:**
```jsx
<SectionGrid
  title="🆕 Sản phẩm mới"
  query={{ sort: "-createdAt", limit: 8 }}
  linkTo="/products?sort=-createdAt"
/>
```

#### 4. Frontend - HomePage Redesign ✅
**File:** `frontend/src/screens/HomePage.jsx`

**Changes:**
- ✅ Hero section with gradient background
- ✅ 5 product sections:
  1. **Sản phẩm mới** - `sort=-createdAt, limit=8`
  2. **Bán chạy nhất** - `sort=-rating, limit=8`
  3. **Laptop Gaming** - `brand=MSI,Asus,Razer, limit=8`
  4. **Laptop Doanh nghiệp** - `brand=Dell,HP,Lenovo, limit=8`
  5. **Laptop Mỏng nhẹ** - `brand=Apple,LG,Samsung, limit=8`
- ✅ Each section has "Xem tất cả" link
- ✅ Collapsible full product list with filters (toggle button)
- ✅ Modern UI with proper spacing
- ✅ Responsive design

**Sections Structure:**
```jsx
{/* Hero */}
<section className="hero">🎯 Laptop chất lượng cao</section>

{/* Sections */}
<SectionGrid title="🆕 Sản phẩm mới" ... />
<SectionGrid title="🔥 Bán chạy nhất" ... />
<SectionGrid title="🎮 Laptop Gaming" ... />
<SectionGrid title="💼 Laptop Doanh nghiệp" ... />
<SectionGrid title="✨ Laptop Mỏng nhẹ" ... />

{/* Toggle All Products */}
<button>Xem tất cả sản phẩm với bộ lọc</button>

{/* Full List with Filters (Collapsible) */}
{showAllProducts && <Filters + ProductList + Pagination />}
```

#### 5. Frontend - ProductCard Enhancement ✅
**File:** `frontend/src/components/ProductCard.jsx`

**Changes:**
- ✅ Updated to use `images[0]` from new images array
- ✅ Fallback to old `image` field for backward compatibility
- ✅ Changed layout to vertical card (flex-col) instead of horizontal
- ✅ Added rating display with star icon
- ✅ Image hover effect (scale-105 on hover)
- ✅ Better typography and spacing
- ✅ Price in blue instead of red
- ✅ Brand in uppercase
- ✅ Line-clamp for long product names

**New Card Design:**
```
┌─────────────────┐
│   Product Image │ (4:3 aspect ratio)
├─────────────────┤
│ BRAND           │
│ Product Name    │
│ ⭐ 4.5          │
│ $1,299          │
│ 16GB RAM • i7   │
└─────────────────┘
```

---

## 📊 THỐNG KÊ NGÀY 4

| Task | Status | File | Changes |
|------|--------|------|---------|
| Backend Controller | ✅ | product.controller.js | +10 lines |
| Filters Component | ✅ | Filters.jsx | +50 lines |
| SectionGrid Component | ✅ | SectionGrid.jsx | NEW (95 lines) |
| HomePage Redesign | ✅ | HomePage.jsx | +90 lines |
| ProductCard Update | ✅ | ProductCard.jsx | +20 lines |

**Tổng cộng:** 4 files modified, 1 file created

---

## 🔍 CHI TIẾT KỸ THUẬT

### Backend API Enhancements
```javascript
// Query Examples
GET /products?ratingGte=4              // Products with rating >= 4
GET /products?sort=name                 // Sort A → Z
GET /products?sort=-name                // Sort Z → A
GET /products?sort=-rating&limit=8      // Top 8 rated products
GET /products?brand=MSI,Asus&limit=8    // Gaming laptops
```

### Frontend Sections Configuration
```javascript
// New Products
{ sort: "-createdAt", limit: 8 }

// Best Sellers
{ sort: "-rating", limit: 8 }

// Gaming Laptops
{ brand: ["MSI", "Asus", "Razer"], limit: 8 }

// Business Laptops
{ brand: ["Dell", "HP", "Lenovo"], limit: 8 }

// Ultrabooks
{ brand: ["Apple", "LG", "Samsung"], limit: 8 }
```

### SectionGrid Component Props
| Prop | Type | Description | Example |
|------|------|-------------|---------|
| title | string | Section heading | "🆕 Sản phẩm mới" |
| query | object | API query params | `{ sort: "-createdAt", limit: 8 }` |
| linkTo | string | "Xem tất cả" link | "/products?sort=-createdAt" |

---

## 🧪 TEST RESULTS

### Backend Filter & Sort
✅ `GET /products?ratingGte=5` → Returns only 5-star products
✅ `GET /products?ratingGte=4` → Returns 4+ star products
✅ `GET /products?ratingGte=3` → Returns 3+ star products
✅ `GET /products?sort=name` → Sorted A→Z (Acer, Apple, Asus, Dell...)
✅ `GET /products?sort=-name` → Sorted Z→A (Samsung, Razer, MSI...)
✅ `GET /products?sort=-rating` → Highest rated first

### Frontend Sections
✅ New Products section displays 8 latest products
✅ Best Sellers section displays 8 highest-rated products
✅ Gaming section displays MSI, Asus, Razer products
✅ Business section displays Dell, HP, Lenovo products
✅ Ultrabooks section displays Apple, LG, Samsung products
✅ All "Xem tất cả" links work correctly
✅ Toggle button shows/hides full product list

### Frontend Filters
✅ Rating filter "5 sao" → Shows only 5-star products
✅ Rating filter "4 sao trở lên" → Shows 4+ star products
✅ Rating filter "3 sao trở lên" → Shows 3+ star products
✅ Sort "Tên A → Z" → Products sorted alphabetically
✅ Sort "Tên Z → A" → Products sorted reverse alphabetically
✅ Sort "Đánh giá cao nhất" → Products sorted by rating desc
✅ "Xoá lọc" button resets all filters including rating

### UI/UX
✅ Hero section displays with gradient background
✅ Product cards show images from images array
✅ Product cards display rating with star icon
✅ Image hover effect works smoothly
✅ Section grids are responsive (4 cols desktop, 2 cols tablet, 1 col mobile)
✅ Loading states work correctly
✅ Empty sections are hidden automatically

---

## 🎨 UI IMPROVEMENTS

### HomePage
- **Hero Section**: Gradient blue background with emoji
- **Sections**: Clear titles with emojis (🆕, 🔥, 🎮, 💼, ✨)
- **Spacing**: Consistent 12-unit spacing between sections
- **Toggle Button**: Smooth chevron rotation animation
- **Responsive**: Mobile-friendly layout

### ProductCard
- **Vertical Layout**: Better for grid display
- **Rating Display**: ⭐ 4.5 format
- **Image Hover**: Zoom effect on hover
- **Typography**: Clean hierarchy (brand → name → rating → price → specs)
- **Color Scheme**: Blue for price, yellow for rating

### Filters
- **6-Column Grid**: More compact layout
- **Visual Icons**: ⭐ for rating options
- **Hover Effects**: Smooth transitions on buttons
- **Reset Function**: Clear all filters with one click

---

## ✨ ACHIEVEMENTS

- 🎉 Landing page với 5 sections chuyên biệt
- 🎉 Sort by name (A-Z, Z-A)
- 🎉 Rating filter (3★+, 4★+, 5★)
- 🎉 Reusable SectionGrid component
- 🎉 Beautiful hero section
- 🎉 Category-based product grouping (Gaming, Business, Ultrabook)
- 🎉 Enhanced ProductCard với rating display
- 🎉 "Xem tất cả" links với query params
- 🎉 Collapsible full product list
- 🎉 Responsive design throughout

**Status:** ✅ NGÀY 4 HOÀN THÀNH!

---

## 🎯 TIẾP THEO - NGÀY 5 (DỰ KIẾN)

### Admin Dashboard Enhancement
- [ ] Admin product creation form validation
- [ ] Bulk image upload for products
- [ ] Product stock management interface
- [ ] Order management dashboard

### Customer Features
- [ ] User profile page
- [ ] Order history
- [ ] Wishlist functionality
- [ ] Product reviews & ratings (user-submitted)

### Performance & SEO
- [ ] Add loading skeletons
- [ ] Image lazy loading
- [ ] Meta tags for SEO
- [ ] Sitemap generation

---

*End of Day 4 Report - Landing Page Sections + Sort Name + Rating Filter Implementation*

---

## ✅ NGÀY 5 - VARIANT SELECTOR UI + BULK ADD (HOÀN THÀNH)

**Cập nhật:** 30/10/2025

### 🎯 Mục tiêu
- Hoàn thiện Variant Selector UI với tooltip
- Add to cart với skuId
- Bulk add nhiều sản phẩm cùng lúc với modal kết quả

### ✅ Đã hoàn thành

#### 1. Backend - Bulk Add Service ✅
**File:** `backend/src/services/cart.service.js`

**Changes:**
- ✅ New function `bulkAddItems({ userId?, guestToken?, items })`
- ✅ Accepts array of items: `[{ productId, skuId?, qty }]`
- ✅ Maximum 20 items per bulk request
- ✅ Validates each item (product exists, variant exists, stock available)
- ✅ Returns detailed results: `{ results: [], warnings: [], cart: {} }`
- ✅ Each result: `{ success, productId, skuId?, addedQty?, error? }`
- ✅ Handles stock caps and max per order limits
- ✅ Atomic cart updates for each item

**Function signature:**
```javascript
export async function bulkAddItems({ userId, guestToken, items = [] }) {
  // Validate items array
  // Process each item with error handling
  // Return { results, warnings, cart }
}
```

#### 2. Backend - Bulk Add Controller & Route ✅
**File:** `backend/src/controllers/cart.controller.js`

**Changes:**
- ✅ New controller `bulkAddItems(req, res)`
- ✅ Validates items array is non-empty
- ✅ Calls service with userId/guestToken
- ✅ Returns results with 200 status

**File:** `backend/src/routes/cart.routes.js`

**Changes:**
- ✅ Added route: `POST /cart/items/bulk`
- ✅ Uses `optionalAuth` middleware
- ✅ Applies `guestToken` middleware

#### 3. Frontend - API & Cart Hook ✅
**File:** `frontend/src/lib/api.js`

**Changes:**
- ✅ New function `bulkAddItems(items, headers)`
- ✅ POST to `/cart/items/bulk` with `{ items }` body

**File:** `frontend/src/hooks/useCart.js`

**Changes:**
- ✅ New hook `addBulk(items)`
- ✅ Accepts array: `[{ productId, skuId?, qty }]`
- ✅ Validates items array
- ✅ Updates cart state after bulk add
- ✅ Returns `{ success, results, warnings, error? }`

**Hook signature:**
```javascript
addBulk: async (items) => {
  // Validate items
  // Call API
  // Update state
  // Return { success, results, warnings }
}
```

#### 4. Frontend - ProductDetail Enhancement ✅
**File:** `frontend/src/screens/ProductDetail.jsx`

**Changes:**
- ✅ Added tooltip when variant not selected
- ✅ Buttons disabled if variants exist but none selected
- ✅ Tooltip shows: "⚠️ Vui lòng chọn cấu hình sản phẩm"
- ✅ Tooltip appears on hover with smooth animation
- ✅ Applied to both "Thêm vào giỏ" and "Mua ngay" buttons

**UI Enhancement:**
```jsx
<div className="relative group">
  <button disabled={variants.length > 0 && !selectedVariant}>
    Thêm vào giỏ
  </button>
  {/* Tooltip */}
  {variants.length > 0 && !selectedVariant && (
    <div className="absolute bottom-full opacity-0 group-hover:opacity-100">
      ⚠️ Vui lòng chọn cấu hình sản phẩm
    </div>
  )}
</div>
```

#### 5. Frontend - Bulk Add Components ✅
**File:** `frontend/src/components/BulkAddModal.jsx` (NEW)

**Features:**
- ✅ Modal displays bulk add results
- ✅ Success/fail count summary
- ✅ Detailed results for each item with icons (✓/✗)
- ✅ Warnings section (stock caps, max per order)
- ✅ Color-coded results (green success, red fail)
- ✅ Displays productId, skuId, error messages
- ✅ Close on ESC key
- ✅ Responsive design with max-height scroll

**File:** `frontend/src/components/BulkAddSection.jsx` (NEW)

**Features:**
- ✅ Product grid with checkboxes (6 products)
- ✅ Fetches top-rated products for selection
- ✅ Click to select/deselect products
- ✅ Auto-fetch variants when product selected
- ✅ Variant selector dropdown for products with variants
- ✅ Selected items summary with quantity controls
- ✅ "Thêm N sản phẩm vào giỏ" button
- ✅ Quantity increase/decrease controls
- ✅ Remove item button
- ✅ Shows product images, names, prices
- ✅ Opens BulkAddModal with results after submit
- ✅ Clears selection on success

**Component Props:**
- BulkAddModal: `{ isOpen, onClose, results, warnings }`
- BulkAddSection: No props (self-contained)

#### 6. Frontend - HomePage Integration ✅
**File:** `frontend/src/screens/HomePage.jsx`

**Changes:**
- ✅ Imported BulkAddSection component
- ✅ Added BulkAddSection after Hero, before product sections
- ✅ Section title: "🛒 Thêm nhiều sản phẩm cùng lúc"

---

## 📊 THỐNG KÊ NGÀY 5

| Task | Status | File | Changes |
|------|--------|------|---------|
| Bulk Add Service | ✅ | cart.service.js | +150 lines |
| Bulk Add Controller | ✅ | cart.controller.js | Fixed |
| Bulk Add Route | ✅ | cart.routes.js | Already exists |
| Frontend API Helper | ✅ | api.js | +3 lines |
| Frontend Cart Hook | ✅ | useCart.js | +40 lines |
| ProductDetail Tooltip | ✅ | ProductDetail.jsx | +40 lines |
| BulkAddModal Component | ✅ | BulkAddModal.jsx | NEW (130 lines) |
| BulkAddSection Component | ✅ | BulkAddSection.jsx | NEW (280 lines) |
| HomePage Integration | ✅ | HomePage.jsx | +2 lines |

**Tổng cộng:** 7 files modified, 2 files created

---

## 🔍 CHI TIẾT KỸ THUẬT

### Bulk Add API
```javascript
// Request
POST /cart/items/bulk
{
  "items": [
    { "productId": "...", "skuId": "...", "qty": 1 },
    { "productId": "...", "qty": 2 }
  ]
}

// Response
{
  "results": [
    { "success": true, "productId": "...", "skuId": "...", "addedQty": 1 },
    { "success": false, "productId": "...", "error": "Out of stock" }
  ],
  "warnings": [
    { "type": "stock_cap", "message": "...", "allowedQty": 5 }
  ],
  "cart": {
    "items": [...],
    "subtotal": 12000,
    "count": 3
  }
}
```

### Validation Rules
- ✅ Items array required and non-empty
- ✅ Maximum 20 items per bulk request
- ✅ Each item validated independently
- ✅ Product must exist and be active
- ✅ Variant must exist and be active (if provided)
- ✅ Stock must be available
- ✅ Failed items don't block successful items

### UI Flow
1. **Select Products**: Click checkbox on product cards
2. **Choose Variants**: If product has variants, select from dropdown
3. **Adjust Quantities**: Use +/− buttons in summary
4. **Bulk Add**: Click "Thêm N sản phẩm vào giỏ" button
5. **View Results**: Modal shows success/fail for each item
6. **Close Modal**: Click close or press ESC

---

## 🧪 TEST CASES

### Backend API
✅ Bulk add with valid items → Success
✅ Bulk add with invalid productId → Partial success
✅ Bulk add with out-of-stock variant → Partial success
✅ Bulk add with stock cap → Success with warnings
✅ Bulk add with > 20 items → 400 Error
✅ Bulk add with empty array → 400 Error
✅ Bulk add with mix of products and variants → Success
✅ Results array matches input items length

### Frontend Bulk Add Section
✅ Display 6 top-rated products
✅ Click checkbox selects/deselects product
✅ Product with variants shows dropdown
✅ Select variant adds to selected items
✅ Selected items summary displays correctly
✅ Quantity controls work (min 1)
✅ Remove button removes item from selection
✅ "Thêm N sản phẩm" button disabled when no selection
✅ Button shows correct count

### Frontend Bulk Add Modal
✅ Modal opens after bulk add
✅ Success/fail count displays correctly
✅ Each result shows correct icon (✓/✗)
✅ Warnings section displays if present
✅ Product/SKU IDs display correctly
✅ Error messages display for failed items
✅ Close button works
✅ ESC key closes modal
✅ Modal scrolls if many items

### ProductDetail Tooltip
✅ Tooltip hidden when variant selected
✅ Tooltip shows on hover when no variant selected
✅ Button disabled when no variant selected
✅ Tooltip works on both buttons
✅ Tooltip animation smooth

---

## 🎨 UI IMPROVEMENTS

### BulkAddSection
- **Product Grid**: 3 columns, responsive
- **Checkbox Selection**: Visual feedback with blue border
- **Variant Dropdown**: Inline selector with pricing
- **Selected Summary**: Blue background card with item list
- **Quantity Controls**: +/− buttons, centered display
- **Remove Button**: Red text, hover effect
- **Bulk Add Button**: Sticky position option possible

### BulkAddModal
- **Header**: Success/fail count summary
- **Results List**: Color-coded (green/red) with icons
- **Warnings**: Yellow background for stock warnings
- **Scrollable Content**: Max 80vh height
- **Close Options**: Button + ESC key
- **Responsive**: Mobile-friendly

### ProductDetail Tooltip
- **Position**: Above button, centered
- **Arrow**: CSS triangle pointing down
- **Animation**: Fade in on hover
- **Z-index**: Above other elements
- **Pointer Events**: None (doesn't block clicks)

---

## ✨ ACHIEVEMENTS

- 🎉 Bulk add API with detailed results
- 🎉 Support up to 20 items per request
- 🎉 Individual validation for each item
- 🎉 Beautiful bulk add UI with checkboxes
- 🎉 Variant selection in bulk add flow
- 🎉 Quantity controls for each selected item
- 🎉 Modal with detailed success/fail results
- 🎉 Warnings for stock caps
- 🎉 ProductDetail tooltip for variant selection
- 🎉 Disabled state when variant required
- 🎉 Smooth animations and transitions
- 🎉 Mobile-responsive design

**Status:** ✅ NGÀY 5 HOÀN THÀNH!

---

## 🎯 TIẾP THEO - NGÀY 6 (DỰ KIẾN)

### Admin Dashboard Enhancement
- [ ] Admin product creation form with image upload
- [ ] Product stock management interface
- [ ] Order management dashboard
- [ ] Bulk product operations

### Customer Features
- [ ] User profile page with order history
- [ ] Wishlist functionality
- [ ] Product reviews & ratings (user-submitted)
- [ ] Product comparison tool

### Performance & SEO
- [ ] Add loading skeletons for better UX
- [ ] Image lazy loading
- [ ] Meta tags for SEO
- [ ] Sitemap generation

---

*End of Day 5 Report - Variant Selector UI + Bulk Add Implementation*


---

## 🔴 MISSING REQUIREMENTS – IMPLEMENTATION PLAN

The following items are still required by the assignment but are partially or not yet implemented. Each subsection includes a concrete implementation plan (backend, frontend, data model, and verification steps).

### 1) Social Login (Google) – Required for convenient login
- Status: Not implemented
- Goal: Allow users to sign in using Google in addition to email/password.
- Backend (Express)
  1. Add dependency: `google-auth-library`
  2. Add endpoint `POST /auth/google` that accepts `{ idToken }` from Google.
  3. Verify the token server-side: `const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })`; extract `email`, `name`, `sub`.
  4. Find or create user by `email` (store `oauthProvider: 'google'`, `oauthSub: sub`). If an existing password user matches the email, keep the same account and do not require password.
  5. Issue JWT access/refresh tokens the same way as password login. Reuse `auth.service.signTokens` and `setRefreshCookie`.
  6. Env vars: `GOOGLE_CLIENT_ID`, optional `GOOGLE_CLIENT_SECRET` (not required for ID token verification); update `.env.example` and README.
- Frontend (React)
  1. Use Google Identity Services (GIS) button (script or `@react-oauth/google`).
  2. On success, obtain `credential` (ID token) and POST to `/auth/google`; store `accessToken` and user in local storage/context.
  3. UI: Add “Đăng nhập với Google” on login/signup screens.
- Data Model
  - Extend `User` with fields: `oauthProvider?: 'google' | 'facebook'`, `oauthSub?: string` (non-unique, index). Keep `password_hash` optional when using OAuth.
- Verification
  - Manual flow: login with Google → protected route works → refresh token cookie set → logout clears.
  - Edge: first-time login auto-creates account; repeat login reuses same user.

### 2) User Profile & Multiple Shipping Addresses
- Status: Partially implemented (profile points displayed). Addresses not implemented.
- Goal: Users can manage name, phone, and multiple shipping addresses; checkout pre-fills default address.
- Backend
  1. Extend `User` schema with `addresses: [{ label, recipient, phone, line1, line2?, city, district?, ward?, isDefault }]`.
  2. Endpoints (auth required):
     - `GET /me` (existing) → include `addresses`.
     - `POST /me/addresses` → create (if first, set `isDefault=true`).
     - `PATCH /me/addresses/:id` → update; if `isDefault=true`, unset others.
     - `DELETE /me/addresses/:id`.
  3. Checkout: if logged-in, prefill email and default address from user; allow switching to another address id.
- Frontend
  1. `ProfilePage`: add Address Manager (list, add/edit/delete, set default).
  2. `CheckoutPage`: dropdown to select saved address when logged in; fall back to manual entry for guests.
- Verification
  - Create 2+ addresses, set default, ensure checkout pre-fills and can switch.

### 3) Customer Order History Page
- Status: Not implemented on FE; backend model supports it.
- Goal: Users can view past orders (number, date, amount, status timeline), most recent first.
- Backend
  - Add endpoint `GET /orders/my?page=1&limit=20` (auth required) returning orders for `req.user.id` sorted by `createdAt:-1`.
- Frontend
  - New screen `MyOrders.jsx` listing orders with pagination; link to existing `OrderDetail` page (reuse timeline UI).
- Verification
  - Place orders as guest then login (auto-created account) → show in history after linking (already linked by email at checkout flow).

### 4) Admin UI – Dashboards and Management Screens
- Status: Backend APIs exist (dashboard, orders, products, users, coupons). UI is minimal.
- Goal: Provide FE admin pages to visualize metrics and manage entities.
- Frontend
  1. Protect `/admin/*` routes with an AdminGuard (check `/admin/ping`).
  2. Pages:
     - Dashboard (Simple): cards for total users/orders/products/revenue; list best sellers (top 5).
     - Dashboard (Advanced): time-range picker (today/yesterday/this week/this month/custom); charts (orders, revenue, profit) with Recharts; backend: `/admin/dashboard/advanced?period=month&start=&end=`.
     - Orders: table with pagination (20/page), time-range filter, status filter; detail page supports status update.
     - Coupons: CRUD table (code, discountPercent, usage_limit, used_count, createdAt); create/update forms with validation rules already implemented.
     - Products: basic CRUD (respect images≥3, description≥200) + link to Variants management.
     - Users: list + update (e.g., role, name); optional ban flag.
- Verification
  - Each list paginates, sorts by createdAt desc, and actions succeed with API feedback.

### 5) Deployment & Horizontal Scaling Evidence
- Status: Local Docker Compose works. No clear scaling evidence.
- Goal: Provide runnable `docker-compose` setup with an HTTP reverse proxy and multiple replicas, plus public deployment instructions.
- Plan A (Local evidence with Compose):
  1. Add `nginx` service as reverse proxy listening on `:8080` → upstream to `api` replicas and `web`.
  2. Scale API: `docker-compose up -d --scale api=2` (or declare `deploy.replicas: 2` for Swarm). Sticky session not required (JWT + stateless API). Socket.IO: enable `sticky` option or use polling for demo.
  3. Document commands and how to verify load-balancing (hit `/health` repeatedly, observe container logs alternating).
- Plan B (Public hosting):
  - Backend on Render/Railway/Fly.io, MongoDB Atlas, Frontend on Vercel/Netlify; set env `VITE_API_BASE_URL` to public API. Provide admin account credentials.
- Deliverables:
  - `nginx.conf`, updated `docker-compose.yml` with `nginx` service mapping `8080:80`.
  - README section “Horizontal Scaling Evidence” with screenshots/commands.

### 6) Optional: Facebook Login (similar to Google)
- Implement analogous `POST /auth/facebook` verifying token with Facebook Graph API; reuse account by email.

---

## ✅ IMPLEMENTATION CHECKLIST (Next Sprints)
- [ ] Google Social Login (backend verify + FE GIS button)
- [ ] User addresses CRUD + checkout prefill
- [ ] Customer order history + detail
- [ ] Admin UI: dashboard simple/advanced, orders, coupons, products, users
- [ ] Nginx reverse proxy + API replicas (scaling evidence) + docs
- [ ] (Optional) Facebook login

---

## 🔧 FILES TO TOUCH (Planned)
- Backend
  - `backend/src/models/user.model.js` (oauth fields, addresses)
  - `backend/src/controllers/auth.controller.js` (+google)
  - `backend/src/routes/auth.routes.js` (`POST /auth/google`)
  - `backend/src/controllers/me.controller.js` (addresses CRUD)
  - `backend/src/routes/index.js` (mount me/orders routes)
  - `backend/src/controllers/order.controller.js` (`listMyOrders`)
- Frontend
  - `frontend/src/routes/App.jsx` (admin and account routes)
  - `frontend/src/screens/LoginPage.jsx` (Google button)
  - `frontend/src/screens/ProfilePage.jsx` (addresses manager)
  - `frontend/src/screens/MyOrders.jsx` and reuse `OrderDetail.jsx`
  - `frontend/src/screens/admin/*` (Dashboard, Orders, Coupons, Products, Users)
  - `frontend/src/lib/api.js` (googleLogin, addresses, myOrders, admin endpoints)
- DevOps
  - `docker-compose.yml` (add nginx, document scaling) + `nginx/nginx.conf`
  - `README.md` (deployment & scaling instructions)

---

## 🧪 VERIFICATION MATRIX (What to demo)
- Social login flow end-to-end (token verify, JWT issued, refresh cookie present).
- Checkout prefills default address; ability to change address.
- Order history shows newest first; detail page shows status timeline.
- Admin dashboards render cards and charts; lists paginate and update.
- Horizontal scaling: 2× API behind Nginx; show balanced logs and working websockets or documented fallback.

---

*This section was added to ensure full compliance with the course requirements and to guide the next implementation steps precisely.*