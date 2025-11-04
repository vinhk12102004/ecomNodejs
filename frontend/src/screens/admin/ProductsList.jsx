import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, getVariants } from '../../lib/api';
import Pagination from '../../components/Pagination';

export default function ProductsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', images: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [meta.page]);

  const loadProducts = async () => {
    let mounted = true;
    setLoading(true);
    setError('');
    try {
      const result = await adminListProducts({ page: meta.page, limit: 20 });
      if (mounted) {
        setProducts(result.data || []);
        setMeta({
          page: result.page || 1,
          limit: result.limit || 20,
          total: result.total || 0,
          pages: result.pages || 0
        });
      }
    } catch (e) {
      if (mounted) setError(e.response?.data?.message || 'Không thể tải sản phẩm');
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', price: '', images: '', description: '' });
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      images: (product.images || []).join('\n'),
      description: product.description || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageArray = formData.images.split('\n').filter(url => url.trim());
      if (imageArray.length < 3) {
        alert('Cần ít nhất 3 hình ảnh');
        setSubmitting(false);
        return;
      }
      if (formData.description.trim().length < 200) {
        alert('Mô tả cần ít nhất 200 ký tự');
        setSubmitting(false);
        return;
      }

      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        images: imageArray,
        description: formData.description
      };

      if (editingId) {
        await adminUpdateProduct(editingId, data);
      } else {
        await adminCreateProduct(data);
      }
      await loadProducts();
      resetForm();
      alert(editingId ? 'Cập nhật thành công' : 'Tạo thành công');
    } catch (e) {
      alert(e.response?.data?.error || e.response?.data?.message || 'Thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await adminDeleteProduct(id);
      await loadProducts();
      alert('Xóa thành công');
    } catch (e) {
      alert(e.response?.data?.message || 'Xóa thất bại');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
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
            {editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
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
              <label className="block text-sm font-medium mb-1">Hình ảnh (mỗi URL một dòng, tối thiểu 3) *</label>
              <textarea
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows="4"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.images.split('\n').filter(u => u.trim()).length} hình ảnh
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả (tối thiểu 200 ký tự) *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows="6"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.description.length} / 200 ký tự
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
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
      ) : products.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-slate-500">Chưa có sản phẩm nào</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Tên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Giá</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Hình ảnh</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {(product.images || []).length} hình
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/products/${product._id}/variants`)}
                            className="px-3 py-1 text-xs border rounded hover:bg-blue-50 text-blue-600"
                          >
                            Variants
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 text-xs border rounded hover:bg-slate-50"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
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

