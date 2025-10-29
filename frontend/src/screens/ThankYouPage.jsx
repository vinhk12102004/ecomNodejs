import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * ThankYouPage Component
 * Displays order confirmation after successful checkout
 */
export default function ThankYouPage() {
  const location = useLocation();
  const { orderId, email } = location.state || {};

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[600px] px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Đặt hàng thành công!
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Cảm ơn bạn đã mua hàng. Chúng tôi đã nhận được đơn hàng của bạn.
        </p>

        {/* Order Details */}
        {orderId && (
          <div className="bg-slate-50 border rounded-lg p-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Mã đơn hàng:</span>
                <span className="font-mono font-semibold text-slate-900">
                  #{orderId.slice(-8).toUpperCase()}
                </span>
              </div>
              {email && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Email xác nhận:</span>
                  <span className="font-medium text-slate-900">{email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div className="text-left">
              <h3 className="font-semibold text-blue-900 mb-1">
                Kiểm tra email của bạn
              </h3>
              <p className="text-sm text-blue-700">
                Chúng tôi đã gửi email xác nhận đơn hàng. Vui lòng kiểm tra hộp thư đến
                {email && ` (${email})`}.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            to="/"
            className="px-8 py-3 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg transition"
          >
            Về trang chủ
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="font-semibold text-slate-900 mb-4">
            Bước tiếp theo?
          </h3>
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📦</span>
              </div>
              <p className="font-medium text-slate-900 mb-1">Xác nhận đơn hàng</p>
              <p className="text-slate-600">Chúng tôi sẽ xử lý đơn trong 24h</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚚</span>
              </div>
              <p className="font-medium text-slate-900 mb-1">Đang giao hàng</p>
              <p className="text-slate-600">Thời gian giao: 2-5 ngày</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <p className="font-medium text-slate-900 mb-1">Nhận hàng</p>
              <p className="text-slate-600">Kiểm tra và xác nhận</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

