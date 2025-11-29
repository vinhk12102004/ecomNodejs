import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminListOrders } from '../../lib/api';
import Pagination from '../../components/Pagination';

export default function OrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [timeRange, setTimeRange] = useState('thismonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, [meta.page, timeRange, startDate, endDate]);

  const loadOrders = async () => {
    let mounted = true;
    setLoading(true);
    setError('');

    try {
      const params = { page: meta.page, limit: 20 };
      
      if (timeRange === 'range' && startDate && endDate) {
        params.timeRange = 'range';
        params.start = startDate;
        params.end = endDate;
      } else {
        params.timeRange = timeRange;
      }

      const result = await adminListOrders(params);
      if (mounted) {
        setOrders(result.data || []);
        setMeta({
          page: result.page || 1,
          limit: result.limit || 20,
          total: result.total || 0,
          pages: result.pages || 0
        });
      }
    } catch (e) {
      if (mounted) setError(e.response?.data?.message || 'Không thể tải đơn hàng');
    } finally {
      if (mounted) setLoading(false);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đơn hàng</h1>

      {/* Filter */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="font-medium">Lọc theo:</label>
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value);
              setMeta(prev => ({ ...prev, page: 1 }));
              if (e.target.value !== 'range') {
                setStartDate('');
                setEndDate('');
              }
            }}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="thisweek">Tuần này</option>
            <option value="thismonth">Tháng này</option>
            <option value="range">Tùy chọn</option>
          </select>

          {timeRange === 'range' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600">Đang tải...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-slate-500">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Ngày đặt</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Tổng tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-sm">
                        {order.user?.email || order.guestEmail || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-medium text-blue-600">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.items?.length || 0} sản phẩm
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {meta.pages > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={meta.total}
                page={meta.page}
                limit={meta.limit}
                onPage={(page) => setMeta(prev => ({ ...prev, page }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

