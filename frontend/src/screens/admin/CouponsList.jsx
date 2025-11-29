import { useEffect, useState } from 'react';
import { adminListCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '../../lib/api';
import Pagination from '../../components/Pagination';

export default function CouponsList() {
  const [coupons, setCoupons] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: '', discountPercent: '', usage_limit: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, [meta.page]);

  const loadCoupons = async () => {
    let mounted = true;
    setLoading(true);
    setError('');
    try {
      const result = await adminListCoupons({ page: meta.page, limit: 20 });
      if (mounted) {
        setCoupons(result.data || []);
        setMeta({
          page: result.page || 1,
          limit: result.limit || 20,
          total: result.total || 0,
          pages: result.pages || 0
        });
      }
    } catch (e) {
      if (mounted) setError(e.response?.data?.error || 'Không thể tải mã giảm giá');
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ code: '', discountPercent: '', usage_limit: '' });
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code || '',
      discountPercent: coupon.discountPercent || '',
      usage_limit: coupon.usage_limit || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        code: formData.code.toUpperCase().trim(),
        discountPercent: parseInt(formData.discountPercent),
        usage_limit: parseInt(formData.usage_limit) || undefined
      };

      if (editingId) {
        await adminUpdateCoupon(editingId, data);
      } else {
        await adminCreateCoupon(data);
      }
      await loadCoupons();
      resetForm();
      alert(editingId ? 'Cập nhật thành công' : 'Tạo thành công');
    } catch (e) {
      alert(e.response?.data?.error || 'Thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa mã giảm giá này?')) return;
    try {
      await adminDeleteCoupon(id);
      await loadCoupons();
      alert('Xóa thành công');
    } catch (e) {
      alert(e.response?.data?.error || 'Xóa thất bại');
    }
  };

  // Validation
  const codeError = formData.code && !/^[A-Z0-9]{5}$/.test(formData.code.toUpperCase().trim())
    ? 'Mã phải có 5 ký tự A-Z, 0-9'
    : '';
  const discountError = formData.discountPercent && (isNaN(formData.discountPercent) || formData.discountPercent < 1 || formData.discountPercent > 100)
    ? 'Phần trăm từ 1-100'
    : '';
  const limitError = formData.usage_limit && (isNaN(formData.usage_limit) || formData.usage_limit < 1 || formData.usage_limit > 10)
    ? 'Giới hạn từ 1-10'
    : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mã giảm giá</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Hủy' : '+ Thêm mới'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mã *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="ABC12"
                maxLength={5}
                required
              />
              {codeError && <p className="text-red-600 text-xs mt-1">{codeError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phần trăm giảm *</label>
              <input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                max="100"
                required
              />
              {discountError && <p className="text-red-600 text-xs mt-1">{discountError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giới hạn sử dụng (1-10)</label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                max="10"
              />
              {limitError && <p className="text-red-600 text-xs mt-1">{limitError}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !!codeError || !!discountError || !!limitError}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded-lg hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

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
      ) : coupons.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-slate-500">Chưa có mã giảm giá nào</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Mã</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Giảm (%)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Đã dùng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Giới hạn</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                      <td className="px-4 py-3">{coupon.discountPercent}%</td>
                      <td className="px-4 py-3">{coupon.used_count || 0}</td>
                      <td className="px-4 py-3">{coupon.usage_limit || 10}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="px-3 py-1 text-xs border rounded hover:bg-slate-50"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="px-3 py-1 text-xs border rounded hover:bg-red-50 text-red-600"
                          >
                            Xóa
                          </button>
                        </div>
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

