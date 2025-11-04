import { useEffect, useState } from 'react';
import { getDashboardSimple } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function DashboardSimple() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDashboardSimple()
      .then((d) => {
        if (mounted) setData(d);
      })
      .catch((e) => {
        if (mounted) setError(e.response?.data?.message || 'Không thể tải dữ liệu');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

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
          <p className="mt-4 text-slate-600">Đang tải dữ liệu...</p>
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

  if (!data) return null;

  // Calculate new users in last 7 days (mock for now, backend doesn't provide this)
  const newUsers7d = 0; // Would need backend to calculate

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <Link
          to="/admin/dashboard/advanced"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Xem báo cáo nâng cao
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Tổng người dùng</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.totalUsers || 0}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Người dùng mới (7 ngày)</h3>
            <span className="text-2xl">🆕</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{newUsers7d}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Tổng đơn hàng</h3>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{data.totalOrders || 0}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Tổng doanh thu</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatPrice(data.totalRevenue || 0)}
          </p>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Sản phẩm bán chạy (Top 5)</h2>
        {data.bestSellers && data.bestSellers.length > 0 ? (
          <div className="space-y-3">
            {data.bestSellers.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-400 w-8">#{idx + 1}</span>
                  <div>
                    <p className="font-medium">Product ID: {item._id?.toString().slice(-8)}</p>
                    <p className="text-sm text-slate-600">Đã bán: {item.sold} sản phẩm</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Chưa có dữ liệu</p>
        )}
      </div>
    </div>
  );
}

