import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice.js';

/**
 * CartSummary Component
 * Displays cart summary with subtotal, discount, total, and checkout button
 */
export default function CartSummary({ subtotal, discount = 0, total, showCheckoutButton = true }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 space-y-4 sticky top-20 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900">
        Tổng đơn hàng
      </h2>

      <div className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Tạm tính</span>
          <span className="font-semibold text-gray-900">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Discount (if any) */}
        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Giảm giá</span>
            <span className="font-bold">
              −{formatPrice(discount)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t-2 border-gray-300 pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {formatPrice(total || subtotal - discount)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Link
          to="/checkout"
          className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl text-center transition-all shadow-lg"
        >
          Thanh toán
        </Link>
      )}

      {/* Continue Shopping */}
      <Link
        to="/"
        className="block w-full py-2 text-center text-sm text-gray-600 hover:text-blue-600 hover:underline font-medium transition"
      >
        ← Tiếp tục mua sắm
      </Link>
    </div>
  );
}
