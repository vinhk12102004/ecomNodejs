import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type":"application/json" }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMyRating = (productId) =>
  api.get(`/products/${productId}/ratings/me`).then(r => r.data);

export const addRating = (productId, stars) =>
  api.post(`/products/${productId}/ratings`, { stars }).then(r => r.data);


// Product Helpers
export const getProducts = (params={}) => api.get("/products", { params }).then(r=>r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(r=>r.data);
export const getVariants = (productId, params={}) => api.get(`/products/${productId}/variants`, { params }).then(r=>r.data);
export const getReviews = (productId, params={}) => api.get(`/products/${productId}/reviews`, { params }).then(r=>r.data);
export const createReview = (productId, data) => api.post(`/products/${productId}/reviews`, data).then(r=>r.data);

// Auth/User
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const updateProfile = (data) => api.patch('/me', data).then(r => r.data);
export const signup = (data) => api.post('/auth/signup', data).then(r => r.data);
export const login = (data) => api.post('/auth/login', data).then(r => r.data);
export const googleLogin = (idToken) => api.post('/auth/google', { idToken }).then(r => r.data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then(r => r.data);
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password }).then(r => r.data);
export const logout = () => api.post('/auth/logout').then(r => r.data);
export const refreshToken = () => api.post('/auth/refresh').then(r => r.data);

// Address Management
export const getAddresses = () => api.get('/me/addresses').then(r => r.data);
export const createAddress = (data) => api.post('/me/addresses', data).then(r => r.data);
export const updateAddress = (addrId, data) => api.patch(`/me/addresses/${addrId}`, data).then(r => r.data);
export const deleteAddress = (addrId) => api.delete(`/me/addresses/${addrId}`).then(r => r.data);
export const setDefaultAddress = (addrId) => api.patch(`/me/addresses/${addrId}/default`).then(r => r.data);

// Cart Helpers
export const getCart = (headers) => api.get("/cart", { headers }).then(r => r);
export const getCartCount = (headers) => api.get("/cart/count", { headers }).then(r => r);
export const addItem = (productId, qty, skuId = null, headers) => {
  const body = skuId ? { productId, qty, skuId } : { productId, qty };
  return api.post("/cart/items", body, { headers }).then(r => r);
};
export const bulkAddItems = (items, headers) => {
  return api.post("/cart/items/bulk", { items }, { headers }).then(r => r);
};
export const updateItem = (productId, qty, skuId = null, headers) => {
  const body = { qty };
  if (skuId) {
    body.skuId = skuId;
  }
  return api.patch(`/cart/items/${productId}`, body, { headers }).then(r => r);
};
export const removeItem = (productId, skuId = null, headers) => {
  const params = skuId ? { skuId } : {};
  return api.delete(`/cart/items/${productId}`, { params, headers }).then(r => r);
};
export const clearCart = (headers) => 
  api.delete("/cart", { headers }).then(r => r);

// Checkout Helpers
export const checkoutPreview = ({ couponCode, redeemPoints } = {}, headers) => 
  api.post("/checkout/preview", { couponCode, redeemPoints }, { headers }).then(r => r.data);
export const checkoutConfirm = ({ email, couponCode, redeemPoints, address, addressId, paymentMethod }, headers) => 
  api.post("/checkout/confirm", { email, couponCode, redeemPoints, address, addressId, paymentMethod }, { headers }).then(r => r.data);

// Order Helpers
export const getMyOrders = (params = {}) => 
  api.get("/orders/my", { params }).then(r => r.data);
export const getMyOrderDetail = (id) => 
  api.get(`/orders/${id}`).then(r => r.data);

// Admin API Helpers
export const adminPing = () => api.get("/admin/ping").then(r => r.data);

// Dashboard
export const getDashboardSimple = () => api.get("/admin/dashboard/simple").then(r => r.data);
export const getDashboardAdvanced = (params = {}) => 
  api.get("/admin/dashboard/advanced", { params }).then(r => r.data);

// Admin Orders
export const adminListOrders = (params = {}) => 
  api.get("/admin/orders", { params }).then(r => r.data);
export const adminGetOrderDetail = (id) => 
  api.get(`/admin/orders/${id}`).then(r => r.data);
export const adminUpdateOrderStatus = (id, status) => 
  api.patch(`/admin/orders/${id}/status`, { status }).then(r => r.data);

// Admin Products
export const adminListProducts = (params = {}) => 
  api.get("/admin/products", { params }).then(r => r.data);
export const adminCreateProduct = (data) => 
  api.post("/admin/products", data).then(r => r.data);
export const adminUpdateProduct = (id, data) => 
  api.patch(`/admin/products/${id}`, data).then(r => r.data);
export const adminDeleteProduct = (id) => 
  api.delete(`/admin/products/${id}`).then(r => r.data);

// Admin Users
export const adminListUsers = (params = {}) => 
  api.get("/admin/users", { params }).then(r => r.data);
export const adminUpdateUser = (id, data) => 
  api.patch(`/admin/users/${id}`, data).then(r => r.data);

// Admin Coupons
export const adminListCoupons = (params = {}) => 
  api.get("/admin/coupons", { params }).then(r => r.data);
export const adminCreateCoupon = (data) => 
  api.post("/admin/coupons", data).then(r => r.data);
export const adminUpdateCoupon = (id, data) => 
  api.patch(`/admin/coupons/${id}`, data).then(r => r.data);
export const adminDeleteCoupon = (id) => 
  api.delete(`/admin/coupons/${id}`).then(r => r.data);

// Admin Variants
export const adminCreateVariant = (productId, data) => 
  api.post(`/admin/products/${productId}/variants`, data).then(r => r.data);
export const adminUpdateVariant = (sku, data) => 
  api.patch(`/admin/variants/${sku}`, data).then(r => r.data);
export const adminDeleteVariant = (sku) => 
  api.delete(`/admin/variants/${sku}`).then(r => r.data);
export const changePassword = (currentPassword, newPassword) =>
  api.post("/auth/change-password", { currentPassword, newPassword }).then(r => r.data);

