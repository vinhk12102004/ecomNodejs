import { create } from 'zustand';
import * as api from '../lib/api.js';

/**
 * Guest Token Management
 * Lưu và đọc x-guest-token từ localStorage
 */
const getGuestToken = () => {
  return localStorage.getItem('x-guest-token');
};

const saveGuestToken = (response) => {
  const token = response.headers['x-guest-token'];
  if (token) {
    localStorage.setItem('x-guest-token', token);
  }
};

const getHeaders = () => {
  const token = getGuestToken();
  return token ? { 'x-guest-token': token } : {};
};

/**
 * Zustand Cart Store
 * State: items, subtotal, count, loading, error
 * Actions: fetch, add, updateQty, remove, clear
 */
const useCart = create((set, get) => ({
  // State
  items: [],
  subtotal: 0,
  count: 0,
  loading: false,
  error: null,

  /**
   * Fetch cart from backend
   */
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.getCart(getHeaders());
      saveGuestToken(response);
      
      const { items = [], subtotal = 0, count = 0 } = response.data;
      set({ items, subtotal, count, loading: false });
    } catch (err) {
      set({ 
        error: err.response?.data?.error || 'Failed to fetch cart',
        loading: false 
      });
      console.error('Fetch cart error:', err);
    }
  },

  /**
   * Add item to cart
   * @param {String} productId 
   * @param {Number} qty 
   * @param {String} skuId - Optional variant SKU
   */
  add: async (productId, qty = 1, skuId = null) => {
    set({ loading: true, error: null });
    try {
      const response = await api.addItem(productId, qty, skuId, getHeaders());
      saveGuestToken(response);
      
      const { items = [], subtotal = 0, count = 0 } = response.data;
      set({ items, subtotal, count, loading: false });
      
      return { success: true, data: response.data };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to add item';
      set({ error, loading: false });
      console.error('Add to cart error:', err);
      
      return { success: false, error };
    }
  },

  /**
   * Update item quantity
   * @param {String} productId 
   * @param {Number} qty 
   */
  updateQty: async (productId, qty) => {
    if (qty < 1) {
      return get().remove(productId);
    }
    
    set({ loading: true, error: null });
    try {
      const response = await api.updateItem(productId, qty, getHeaders());
      saveGuestToken(response);
      
      const { items = [], subtotal = 0, count = 0 } = response.data;
      set({ items, subtotal, count, loading: false });
      
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to update quantity';
      set({ error, loading: false });
      console.error('Update qty error:', err);
      
      // Refresh cart on error
      get().fetch();
      
      return { success: false, error };
    }
  },

  /**
   * Remove item from cart
   * @param {String} productId 
   */
  remove: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.removeItem(productId, getHeaders());
      saveGuestToken(response);
      
      const { items = [], subtotal = 0, count = 0 } = response.data;
      set({ items, subtotal, count, loading: false });
      
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to remove item';
      set({ error, loading: false });
      console.error('Remove item error:', err);
      
      return { success: false, error };
    }
  },

  /**
   * Clear entire cart
   */
  clear: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.clearCart(getHeaders());
      saveGuestToken(response);
      
      set({ items: [], subtotal: 0, count: 0, loading: false });
      
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to clear cart';
      set({ error, loading: false });
      console.error('Clear cart error:', err);
      
      return { success: false, error };
    }
  },

  /**
   * Get cart count (for badge)
   */
  fetchCount: async () => {
    try {
      const response = await api.getCartCount(getHeaders());
      saveGuestToken(response);
      
      const { count = 0 } = response.data;
      set({ count });
    } catch (err) {
      console.error('Fetch count error:', err);
    }
  },

  /**
   * Bulk add multiple items to cart
   * @param {Array} items - [{ productId, skuId?, qty }]
   * @returns {Object} { success, results, cart, warnings }
   */
  addBulk: async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return { 
        success: false, 
        error: 'Items array is required and cannot be empty' 
      };
    }

    set({ loading: true, error: null });
    
    try {
      const response = await api.bulkAddItems(items, getHeaders());
      saveGuestToken(response);
      
      const { results, cart, warnings } = response.data;
      
      // Update cart state
      if (cart) {
        const { items: cartItems = [], subtotal = 0, count = 0 } = cart;
        set({ items: cartItems, subtotal, count, loading: false });
      }
      
      return { 
        success: true, 
        results, 
        warnings 
      };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to add items';
      set({ error, loading: false });
      console.error('Bulk add error:', err);
      
      return { 
        success: false, 
        error 
      };
    }
  }
}));

export default useCart;
