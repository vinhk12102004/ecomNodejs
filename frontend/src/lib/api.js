import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type":"application/json" }
});

// Helpers
export const getProducts = (params={}) => api.get("/products", { params }).then(r=>r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then(r=>r.data);

