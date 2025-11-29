import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getMyOrderDetail } from '../lib/api';
import { formatPrice } from '../utils/formatPrice.js';

/**
 * VNPAY Return Page
 * Display payment result after redirecting from VNPAY
 */
export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // Backend processes VNPAY return and redirects here with processed parameters
  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  useEffect(() => {
    if (orderId) {
      // Fetch order details
      getMyOrderDetail(orderId)
        .then(data => {
          // Handle both response formats: { data: order } or { order: ... } or direct order
          const orderData = data?.data || data?.order || data;
          if (orderData && orderData._id) {
            setOrder(orderData);
          } else {
            console.error('Invalid order data:', data);
            setError('Không thể tải thông tin đơn hàng');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch order:', err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xử lý...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Success State */}
        {success && (
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600">Đơn hàng của bạn đã được xác nhận</p>
            </div>

            {order && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-semibold text-gray-900">#{order._id?.toString().slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-bold text-blue-600">{formatPrice(order.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức thanh toán:</span>
                    <span className="font-semibold text-gray-900">VNPAY</span>
                  </div>
                  {order.paymentInfo?.vnpTransactionNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã giao dịch:</span>
                      <span className="font-semibold text-gray-900">{order.paymentInfo.vnpTransactionNo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {order.paymentStatus === 'paid' ? 'Đã thanh toán' : order.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/account/orders"
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-center shadow-md"
              >
                Xem đơn hàng
              </Link>
              <Link
                to="/"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all text-center"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}

        {/* Failure State */}
        {!success && (
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">Thanh toán thất bại</h1>
              <p className="text-gray-600 mb-2">Đơn hàng của bạn chưa được thanh toán</p>
              {message && (
                <p className="text-sm text-red-500 mb-2 font-medium">{message}</p>
              )}
              {code && (
                <p className="text-sm text-gray-500">Mã lỗi: {code}</p>
              )}
            </div>

            {order && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-semibold text-gray-900">#{order._id?.toString().slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-bold text-blue-600">{formatPrice(order.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      {order.paymentStatus === 'failed' ? 'Thanh toán thất bại' : 'Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Bạn có thể thử thanh toán lại hoặc chọn phương thức thanh toán khác
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {orderId && (
                  <button
                    onClick={() => navigate(`/checkout?orderId=${orderId}`)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md"
                  >
                    Thanh toán lại
                  </button>
                )}
                <Link
                  to="/account/orders"
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all text-center"
                >
                  Xem đơn hàng
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* No Order ID */}
        {!orderId && (
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-8 shadow-lg text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thông tin đơn hàng</h1>
            <p className="text-gray-600 mb-6">Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
            >
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

