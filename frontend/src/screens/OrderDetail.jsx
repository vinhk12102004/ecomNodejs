import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyOrderDetail } from '../lib/api';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');

  // Fetch order if ID is provided and order not in state
  useEffect(() => {
    if (id && !order) {
      let mounted = true;
      setLoading(true);
      getMyOrderDetail(id)
        .then((r) => {
          if (mounted) setOrder(r.data);
        })
        .catch((e) => {
          if (mounted) {
            setError(e.response?.data?.error || 'Không thể tải đơn hàng');
            if (e.response?.status === 401) {
              navigate('/login');
            }
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => { mounted = false; };
    }
  }, [id, order, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Chi tiết đơn hàng</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Không tìm thấy dữ liệu đơn hàng.'}</p>
        </div>
      </div>
    );
  }

  const history = [...(order.statusHistory || [])].sort((a, b) => new Date(b.at) - new Date(a.at));

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipping: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng #{String(order._id).slice(-8).toUpperCase()}</h1>
          <p className="text-slate-600">Tạo lúc {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{item.name || 'Sản phẩm'}</p>
                  <p className="text-sm text-slate-600">
                    Số lượng: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      {order.pricing && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tổng kết</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tạm tính:</span>
              <span>{formatPrice(order.pricing.subtotal || 0)}</span>
            </div>
            {order.pricing.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Thuế:</span>
                <span>{formatPrice(order.pricing.tax)}</span>
              </div>
            )}
            {order.pricing.shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Phí vận chuyển:</span>
                <span>{formatPrice(order.pricing.shipping)}</span>
              </div>
            )}
            {order.pricing.discountValue > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatPrice(order.pricing.discountValue)}</span>
              </div>
            )}
            {order.pricing.pointsRedeemed > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Điểm đã dùng:</span>
                <span>-{formatPrice(order.pricing.pointsRedeemed)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{formatPrice(order.totalAmount || order.pricing.total || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Lịch sử trạng thái</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-3">Thời gian</th>
              <th className="py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((s, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-3">{new Date(s.at).toLocaleString('vi-VN')}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(s.status)}`}>
                      {getStatusText(s.status)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-4 text-center text-slate-500">
                  Chưa có lịch sử trạng thái
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/account/orders')}
          className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition"
        >
          ← Quay lại danh sách đơn hàng
        </button>
      </div>
    </div>
  );
}


