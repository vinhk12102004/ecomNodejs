import { Link } from 'react-router-dom';

/**
 * CartSummary Component
 * Displays cart summary with subtotal, discount, total, and checkout button
 */
export default function CartSummary({ subtotal, discount = 0, total, showCheckoutButton = true }) {
  return (
    <div className="bg-white border rounded-lg p-6 space-y-4 sticky top-20">
      <h2 className="text-xl font-semibold text-slate-900">
        Tổng đơn hàng
      </h2>

      <div className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="text-slate-600">Tạm tính</span>
          <span className="font-medium text-slate-900">
            ${subtotal.toLocaleString()}
          </span>
        </div>

        {/* Discount (if any) */}
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá</span>
            <span className="font-medium">
              −${discount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-semibold text-slate-900">Tổng cộng</span>
            <span className="text-2xl font-bold text-blue-600">
              ${(total || subtotal - discount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Link
          to="/checkout"
          className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition"
        >
          Thanh toán
        </Link>
      )}

      {/* Continue Shopping */}
      <Link
        to="/"
        className="block w-full py-2 text-center text-sm text-slate-600 hover:text-slate-900 hover:underline"
      >
        ← Tiếp tục mua sắm
      </Link>
    </div>
  );
}

