import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart.js';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';

/**
 * CartPage Component
 * Displays cart items with quantity controls and cart summary
 */
export default function CartPage() {
  const { items, subtotal, count, loading, error, fetch } = useCart();

  // Fetch cart on mount
  useEffect(() => {
    fetch();
  }, []);

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-lg"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Giỏ hàng của bạn
        </h1>
        <p className="text-gray-600 mt-2 font-medium">
          {count} sản phẩm
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Cart Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items (Left Column) */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        {/* Cart Summary (Right Column) */}
        <div className="lg:col-span-1">
          <CartSummary 
            subtotal={subtotal}
            total={subtotal}
            showCheckoutButton={true}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-xl">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">Đang cập nhật...</p>
          </div>
        </div>
      )}
    </div>
  );
}
