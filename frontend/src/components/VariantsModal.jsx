import { useEffect, useState } from 'react';
import { getVariants, adminCreateVariant, adminUpdateVariant, adminDeleteVariant } from '../lib/api';

/**
 * VariantsModal - Modal để quản lý variants của một product
 */
export default function VariantsModal({ productId, productName, onClose }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSku, setEditingSku] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    ramGB: '',
    storageGB: '',
    color: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    let mounted = true;
    setLoading(true);
    setError('');
    try {
      const result = await getVariants(productId, { page: 1, limit: 100 });
      if (mounted) {
        setVariants(result.data || []);
      }
    } catch (e) {
      if (mounted) setError(e.response?.data?.error || 'Không thể tải variants');
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSku(null);
    setFormData({
      sku: '',
      name: '',
      price: '',
      stock: '',
      ramGB: '',
      storageGB: '',
      color: ''
    });
  };

  const handleEdit = (variant) => {
    setEditingSku(variant.sku);
    setFormData({
      sku: variant.sku,
      name: variant.name || '',
      price: variant.price || '',
      stock: variant.stock || '',
      ramGB: variant.attributes?.ramGB || '',
      storageGB: variant.attributes?.storageGB || '',
      color: variant.attributes?.color || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        sku: formData.sku.toUpperCase().trim(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        attributes: {
          ramGB: parseInt(formData.ramGB),
          storageGB: parseInt(formData.storageGB),
          color: formData.color.trim()
        }
      };

      if (editingSku) {
        await adminUpdateVariant(editingSku, data);
      } else {
        await adminCreateVariant(productId, data);
      }
      await loadVariants();
      resetForm();
      alert(editingSku ? 'Cập nhật thành công' : 'Tạo thành công');
    } catch (e) {
      alert(e.response?.data?.error || 'Thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sku) => {
    if (!confirm('Xóa variant này?')) return;
    try {
      await adminDeleteVariant(sku);
      await loadVariants();
      alert('Xóa thành công');
    } catch (e) {
      alert(e.response?.data?.error || 'Xóa thất bại');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Quản lý Variants</h2>
            <p className="text-sm text-slate-600">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Form */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Hủy' : '+ Thêm variant'}
            </button>

            {showForm && (
              <div className="mt-4 bg-slate-50 border rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  {editingSku ? 'Sửa variant' : 'Thêm variant mới'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU *</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                        disabled={!!editingSku}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tên *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Giá *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="0"
                        step="1000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tồn kho *</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">RAM (GB) *</label>
                      <input
                        type="number"
                        value={formData.ramGB}
                        onChange={(e) => setFormData({ ...formData, ramGB: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Storage (GB) *</label>
                      <input
                        type="number"
                        value={formData.storageGB}
                        onChange={(e) => setFormData({ ...formData, storageGB: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Màu sắc *</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Đang lưu...' : (editingSku ? 'Cập nhật' : 'Tạo')}
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
          </div>

          {/* Variants List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-slate-600">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Chưa có variant nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">SKU</th>
                    <th className="px-3 py-2 text-left font-semibold">Tên</th>
                    <th className="px-3 py-2 text-left font-semibold">Giá</th>
                    <th className="px-3 py-2 text-left font-semibold">Tồn kho</th>
                    <th className="px-3 py-2 text-left font-semibold">RAM</th>
                    <th className="px-3 py-2 text-left font-semibold">Storage</th>
                    <th className="px-3 py-2 text-left font-semibold">Màu</th>
                    <th className="px-3 py-2 text-left font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {variants.map((variant) => (
                    <tr key={variant.sku} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono">{variant.sku}</td>
                      <td className="px-3 py-2">{variant.name}</td>
                      <td className="px-3 py-2">{formatPrice(variant.price)}</td>
                      <td className="px-3 py-2">{variant.stock}</td>
                      <td className="px-3 py-2">{variant.attributes?.ramGB} GB</td>
                      <td className="px-3 py-2">{variant.attributes?.storageGB} GB</td>
                      <td className="px-3 py-2">{variant.attributes?.color}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(variant)}
                            className="px-2 py-1 text-xs border rounded hover:bg-slate-50"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(variant.sku)}
                            className="px-2 py-1 text-xs border rounded hover:bg-red-50 text-red-600"
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
          )}
        </div>
      </div>
    </div>
  );
}

