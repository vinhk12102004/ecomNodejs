import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type":"application/json" }
});

// Product Helpers
export const getProducts = (params={}) => api.get("/products", { params }).then(r=>r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(r=>r.data);

// Cart Helpers
export const getCart = (headers) => api.get("/cart", { headers }).then(r => r);
export const getCartCount = (headers) => api.get("/cart/count", { headers }).then(r => r);
export const addItem = (productId, qty, headers) => 
  api.post("/cart/items", { productId, qty }, { headers }).then(r => r);
export const updateItem = (productId, qty, headers) => 
  api.patch(`/cart/items/${productId}`, { qty }, { headers }).then(r => r);
export const removeItem = (productId, headers) => 
  api.delete(`/cart/items/${productId}`, { headers }).then(r => r);
export const clearCart = (headers) => 
  api.delete("/cart", { headers }).then(r => r);

// Checkout Helpers
export const checkoutPreview = ({ couponCode }, headers) => 
  api.post("/checkout/preview", { couponCode }, { headers }).then(r => r.data);
export const checkoutConfirm = ({ email, address }, headers) => 
  api.post("/checkout/confirm", { email, ...address }, { headers }).then(r => r.data);

