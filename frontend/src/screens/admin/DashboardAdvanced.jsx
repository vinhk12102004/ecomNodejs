import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardAdvanced } from '../../lib/api';

export default function DashboardAdvanced() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('thismonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, [timeRange, startDate, endDate]);

  const loadData = async () => {
    let mounted = true;
    setLoading(true);
    setError('');

    try {
      const params = { period: 'month' };
      
      if (timeRange === 'range' && startDate && endDate) {
        params.timeRange = 'range';
        params.start = startDate;
        params.end = endDate;
      } else {
        params.timeRange = timeRange;
      }

      const result = await getDashboardAdvanced(params);
      if (mounted) setData(result);
    } catch (e) {
      if (mounted) setError(e.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
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

  if (!data || !data.byTime || data.byTime.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">Chưa có dữ liệu cho khoảng thời gian này</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.byTime.map(item => ({
    time: item._id,
    orders: item.orders || 0,
    revenue: item.revenue || 0,
    profit: item.profit || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Báo cáo nâng cao</h1>
      </div>

      {/* Time Range Picker */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="font-medium">Khoảng thời gian:</label>
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value);
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
              <label className="text-sm">Từ:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <label className="text-sm">Đến:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
            </>
          )}
        </div>

        {data.range && (
          <p className="text-sm text-slate-600 mt-2">
            {formatDate(data.range.start)} - {formatDate(data.range.end)}
          </p>
        )}
      </div>

      {/* Orders Chart */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Đơn hàng theo thời gian</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Số đơn" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue & Profit Chart */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Doanh thu & Lợi nhuận</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
            <Tooltip formatter={(value) => formatPrice(value)} />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" />
            <Bar dataKey="profit" fill="#8b5cf6" name="Lợi nhuận" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Tóm tắt</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Thời gian</th>
                <th className="py-2 text-right">Đơn hàng</th>
                <th className="py-2 text-right">Doanh thu</th>
                <th className="py-2 text-right">Lợi nhuận</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{item.time}</td>
                  <td className="py-2 text-right">{item.orders}</td>
                  <td className="py-2 text-right font-medium text-green-600">
                    {formatPrice(item.revenue)}
                  </td>
                  <td className="py-2 text-right font-medium text-purple-600">
                    {formatPrice(item.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

