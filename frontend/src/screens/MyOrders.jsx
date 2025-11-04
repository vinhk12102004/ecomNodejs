import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../lib/api';
import Pagination from '../components/Pagination';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    
    async function loadOrders(page) {
      setLoading(true);
      setError('');
      try {
        const result = await getMyOrders({ page, limit: 20 });
        if (mounted) {
          setOrders(result.data || []);
          setMeta({
            page: result.page || 1,
            limit: result.limit || 20,
            total: result.total || 0,
            totalPages: result.totalPages || 0
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.error || 'Không thể tải đơn hàng');
          if (err.response?.status === 401) {
            // Redirect to login if unauthorized
            navigate('/login');
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOrders(currentPage);
    return () => { mounted = false; };
  }, [currentPage, navigate]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

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

  if (loading && orders.length === 0) {
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
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
        <p className="text-slate-600 mt-1">
          {meta.total} đơn hàng
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <svg
            className="w-24 h-24 mx-auto text-slate-300 mb-4"
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-slate-600 mb-6">
            Bạn chưa đặt đơn hàng nào. Hãy bắt đầu mua sắm!
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Khám phá sản phẩm
          </a>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      Ngày đặt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-blue-600">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {order.itemsCount || order.items?.length || 0} sản phẩm
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/account/orders/${order._id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={meta.total}
                page={currentPage}
                limit={meta.limit}
                onPage={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

