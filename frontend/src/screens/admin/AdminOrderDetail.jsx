import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminGetOrderDetail, adminUpdateOrderStatus } from '../../lib/api';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(''); // Reset error
    
    adminGetOrderDetail(id)
      .then((response) => {
        if (mounted) {
          console.log('Order data:', response); // Debug log
          // Backend trả về { data: order }, nên cần lấy data
          const orderData = response.data || response;
          setOrder(orderData);
          setNewStatus(orderData?.status || 'pending');
        }
      })
      .catch((e) => {
        console.error('Error loading order:', e); // Debug log
        if (mounted) {
          const errorMsg = e.response?.data?.message || e.response?.data?.error || 'Không thể tải đơn hàng';
          setError(errorMsg);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order?.status) return;
    
    if (!window.confirm(`Xác nhận đổi trạng thái sang "${newStatus}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      await adminUpdateOrderStatus(id, newStatus);
      // Reload order
      const updated = await adminGetOrderDetail(id);
      const orderData = updated.data || updated;
      setOrder(orderData);
      alert('✅ Cập nhật trạng thái thành công');
    } catch (e) {
      console.error('Update error:', e);
      alert(e.response?.data?.message || e.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatPrice = (price) => {
    if (price == null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
      shipping: 'bg-purple-100 text-purple-700 border-purple-300',
      delivered: 'bg-green-100 text-green-700 border-green-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Lỗi tải đơn hàng</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-700">Không tìm thấy đơn hàng</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const history = [...(order.statusHistory || [])].sort((a, b) => new Date(b.at) - new Date(a.at));
  const userEmail = order.user?.email || order.guestEmail || 'Khách vãng lai';
  const userName = order.user?.name || order.shippingAddress?.fullName || 'N/A';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Đơn hàng #{String(order._id).slice(-8).toUpperCase()}
            </h1>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>👤 <span className="font-medium">{userName}</span></p>
              <p>📧 {userEmail}</p>
              <p>📅 Ngày đặt: {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-lg font-semibold border ${getStatusBadge(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <button
              onClick={() => navigate('/admin/orders')}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-slate-700 font-medium"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Địa chỉ giao hàng
          </h2>
          <div className="space-y-1 text-slate-700">
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            {order.shippingAddress.city && <p>{order.shippingAddress.city}</p>}
          </div>
        </div>
      )}

      {/* Update Status */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Cập nhật trạng thái
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={updating}
          >
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={updating || newStatus === order.status}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {updating ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Sản phẩm ({order.items.length})
          </h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.name || 'Sản phẩm'}</p>
                  {item.sku && (
                    <p className="text-xs text-slate-500 mt-0.5">SKU: {item.sku}</p>
                  )}
                  <p className="text-sm text-slate-600 mt-1">
                    Số lượng: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-blue-600 ml-4">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      {order.pricing && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Tổng kết đơn hàng
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-700">
              <span>Tạm tính:</span>
              <span className="font-medium">{formatPrice(order.pricing.subtotal || 0)}</span>
            </div>
            {order.pricing.tax > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Thuế VAT:</span>
                <span className="font-medium">{formatPrice(order.pricing.tax)}</span>
              </div>
            )}
            {order.pricing.shipping > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Phí vận chuyển:</span>
                <span className="font-medium">{formatPrice(order.pricing.shipping)}</span>
              </div>
            )}
            {order.pricing.discountValue > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span className="font-medium">-{formatPrice(order.pricing.discountValue)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Info */}
      {order.paymentMethod && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Thanh toán
          </h2>
          <p className="text-slate-700">
            Phương thức: <span className="font-medium uppercase">{order.paymentMethod}</span>
          </p>
          {order.paymentStatus && (
            <p className="text-slate-700 mt-1">
              Trạng thái: <span className="font-medium">{order.paymentStatus}</span>
            </p>
          )}
        </div>
      )}

      {/* Status History */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Lịch sử trạng thái
        </h2>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-3 font-medium">Thời gian</th>
                  <th className="py-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-3 text-slate-700">{formatDate(s.at)}</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(s.status)}`}>
                        {getStatusLabel(s.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Chưa có lịch sử thay đổi</p>
        )}
      </div>
    </div>
  );
}