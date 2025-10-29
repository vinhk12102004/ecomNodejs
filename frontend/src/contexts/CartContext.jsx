import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';

const CartContext = createContext(null);

/**
 * CartProvider - Global cart state management with optimistic updates
 * Provides cart data and operations to all components
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  
  // Prevent duplicate requests
  const pendingRequestRef = useRef(null);
  const lastAddTimeRef = useRef(0);

  // Get or create guest token
  const getGuestToken = () => {
    let token = localStorage.getItem('guestToken');
    return token || null;
  };

  // Save guest token from response
  const saveGuestToken = (response) => {
    const token = response.headers['x-guest-token'];
    if (token) {
      localStorage.setItem('guestToken', token);
    }
  };

  // Build request headers with guest token
  const getHeaders = () => {
    const token = getGuestToken();
    return token ? { 'x-guest-token': token } : {};
  };

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart', { headers: getHeaders() });
      saveGuestToken(response);
      setCart(response.data);
      setWarnings(response.data.warnings || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch cart');
      console.error('Fetch cart error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch count only (for badge sync)
  const fetchCount = useCallback(async () => {
    try {
      const response = await api.get('/cart/count', { headers: getHeaders() });
      saveGuestToken(response);
      // Only update count, not full cart
      setCart(prev => ({ ...prev, count: response.data.count }));
    } catch (err) {
      console.error('Fetch count error:', err);
    }
  }, []);

  // Add item to cart with optimistic update
  const addToCart = useCallback(async (productId, qty = 1, skuId = null) => {
    // Prevent spam clicks (300ms debounce)
    const now = Date.now();
    if (now - lastAddTimeRef.current < 300) {
      return { ok: false, reason: 'Too fast, please wait' };
    }
    lastAddTimeRef.current = now;

    // Cancel pending request if exists
    if (pendingRequestRef.current) {
      pendingRequestRef.current.cancel?.();
    }

    setLoading(true);
    setError(null);
    setWarnings([]);

    // Optimistic update: assume success
    const optimisticCart = { ...cart };
    const itemKey = skuId || productId;
    const existingItemIndex = optimisticCart.items.findIndex(item => {
      const currentKey = item.skuId || item.product?._id || item.product;
      return currentKey === itemKey;
    });

    if (existingItemIndex > -1) {
      optimisticCart.items[existingItemIndex].qty += qty;
    }
    optimisticCart.count = (optimisticCart.count || 0) + qty;
    
    setCart(optimisticCart); // Optimistic UI

    try {
      const controller = new AbortController();
      pendingRequestRef.current = controller;

      const response = await api.post('/cart/items', 
        { productId, qty, skuId },
        { 
          headers: getHeaders(),
          signal: controller.signal
        }
      );
      
      saveGuestToken(response);
      setCart(response.data); // Real data from server
      setWarnings(response.data.warnings || []);
      pendingRequestRef.current = null;
      
      return { ok: true, data: response.data };
    } catch (err) {
      if (err.name === 'CanceledError') {
        return { ok: false, reason: 'Cancelled' };
      }
      
      // Rollback optimistic update on error
      await fetchCart();
      
      const errorMsg = err.response?.data?.error || 'Failed to add to cart';
      setError(errorMsg);
      console.error('Add to cart error:', err);
      
      return { ok: false, reason: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [cart, fetchCart]);

  // Bulk add items
  const bulkAddToCart = useCallback(async (items) => {
    setLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const response = await api.post('/cart/items/bulk',
        { items },
        { headers: getHeaders() }
      );
      
      saveGuestToken(response);
      
      const { results, cart: cartData } = response.data;
      setCart(cartData);
      setWarnings(cartData.warnings || []);
      
      return { ok: true, results, cart: cartData };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to bulk add';
      setError(errorMsg);
      console.error('Bulk add error:', err);
      
      return { ok: false, reason: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(async (productId, qty, skuId = null) => {
    if (qty < 1) return { ok: false, reason: 'Qty must be at least 1' };
    
    setLoading(true);
    setError(null);
    setWarnings([]);
    
    try {
      const response = await api.patch(`/cart/items/${productId}`,
        { qty, skuId },
        { headers: getHeaders() }
      );
      
      saveGuestToken(response);
      setCart(response.data);
      setWarnings(response.data.warnings || []);
      
      return { ok: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update quantity');
      console.error('Update quantity error:', err);
      // Refresh cart on error
      fetchCart();
      
      return { ok: false, reason: err.response?.data?.error };
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId, skuId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = skuId ? { skuId } : {};
      const response = await api.delete(`/cart/items/${productId}`, { 
        headers: getHeaders(),
        params
      });
      
      saveGuestToken(response);
      setCart(response.data);
      
      return { ok: true };
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove item');
      console.error('Remove from cart error:', err);
      
      return { ok: false, reason: err.response?.data?.error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete('/cart', { headers: getHeaders() });
      setCart({ items: [], subtotal: 0, count: 0 });
      
      return { ok: true };
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clear cart');
      console.error('Clear cart error:', err);
      
      return { ok: false, reason: err.response?.data?.error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Multi-tab sync: listen for focus and storage events
  useEffect(() => {
    const handleFocus = () => {
      fetchCount(); // Quick count sync on tab focus
    };

    const handleStorage = (e) => {
      if (e.key === 'guestToken') {
        fetchCart(); // Full cart refresh if token changes
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchCount, fetchCart]);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart,
    loading,
    error,
    warnings,
    addToCart,
    bulkAddToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    fetchCount,
    cartCount: cart.count || 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * useCart hook - Access cart context
 * Must be used within CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
