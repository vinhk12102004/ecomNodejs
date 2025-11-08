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
    adminGetOrderDetail(id)
      .then((r) => {
        if (mounted) {
          setOrder(r.data);
          setNewStatus(r.data?.status || '');
        }
      })
      .catch((e) => {
        if (mounted) setError(e.response?.data?.message || 'Không thể tải đơn hàng');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order?.status) return;
    
    setUpdating(true);
    try {
      await adminUpdateOrderStatus(id, newStatus);
      // Reload order
      const updated = await adminGetOrderDetail(id);
      setOrder(updated.data);
      alert('Cập nhật trạng thái thành công');
    } catch (e) {
      alert(e.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!order) return null;

  const history = [...(order.statusHistory || [])].sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng #{String(order._id).slice(-8).toUpperCase()}</h1>
          <p className="text-slate-600">Khách: {order.user?.email || order.guestEmail}</p>
          <p className="text-slate-600">Ngày đặt: {formatDate(order.createdAt)}</p>
        </div>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 border rounded-lg hover:bg-slate-50"
        >
          ← Quay lại
        </button>
      </div>

      {/* Update Status */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Cập nhật trạng thái</h2>
        <div className="flex items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            disabled={updating}
          >
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="shipping">shipping</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={updating || newStatus === order.status}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{item.name || 'Sản phẩm'}</p>
                  <p className="text-sm text-slate-600">
                    SL: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-semibold text-blue-600">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      {order.pricing && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tổng kết</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatPrice(order.pricing.subtotal || 0)}</span>
            </div>
            {order.pricing.tax > 0 && (
              <div className="flex justify-between">
                <span>Thuế:</span>
                <span>{formatPrice(order.pricing.tax)}</span>
              </div>
            )}
            {order.pricing.shipping > 0 && (
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(order.pricing.shipping)}</span>
              </div>
            )}
            {order.pricing.discountValue > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatPrice(order.pricing.discountValue)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{formatPrice(order.totalAmount)}</span>
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
              <th className="py-2">Thời gian</th>
              <th className="py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {history.map((s, idx) => (
              <tr key={idx} className="border-b last:border-0">
                <td className="py-2">{formatDate(s.at)}</td>
                <td className="py-2 capitalize">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


