import { useEffect, useMemo, useState } from 'react';
import { adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../../lib/api';
import Pagination from '../../components/Pagination';
import VariantsModal from '../../components/VariantsModal';

const brandOptions = [
  "Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI",
  "Razer", "LG", "Microsoft", "Gigabyte", "Samsung", "Other"
];

const categoryOptions = [
  "Laptop", "Desktop", "Monitor", "Accessory", "Tablet",
  "Smartphone", "Peripheral", "Gaming", "Office", "Other"
];

const initialSpecs = {
  cpuModel: '',
  cpuCores: '',
  cpuThreads: '',
  cpuBaseGHz: '',
  cpuBoostGHz: '',
  ramGB: '',
  storageType: 'NVMe',
  storageSizeGB: '',
  gpuModel: '',
  gpuVramGB: '',
  screenSizeInch: '',
  screenResolution: '',
  screenPanel: '',
  screenRefreshHz: '',
  weightKg: '',
  batteryWh: '',
  os: '',
  ports: '',
  wifi: '',
  bluetooth: ''
};

const initialFormState = {
  name: '',
  price: '',
  brand: brandOptions[0],
  category: categoryOptions[0],
  tags: '',
  images: '',
  description: '',
  ...initialSpecs
};

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [variantsModal, setVariantsModal] = useState(null);

  const requiredSpecKeys = useMemo(() => Object.keys(initialSpecs), []);

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
    setFormData(initialFormState);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      brand: product.brand || brandOptions[0],
      category: product.category || categoryOptions[0],
      tags: (product.tags || []).join(', '),
      images: (product.images || []).join('\n'),
      description: product.description || '',
      cpuModel: product.specs?.cpu?.model || '',
      cpuCores: product.specs?.cpu?.cores ?? '',
      cpuThreads: product.specs?.cpu?.threads ?? '',
      cpuBaseGHz: product.specs?.cpu?.baseGHz ?? '',
      cpuBoostGHz: product.specs?.cpu?.boostGHz ?? '',
      ramGB: product.specs?.ramGB ?? '',
      storageType: product.specs?.storage?.type || 'NVMe',
      storageSizeGB: product.specs?.storage?.sizeGB ?? '',
      gpuModel: product.specs?.gpu?.model || '',
      gpuVramGB: product.specs?.gpu?.vramGB ?? '',
      screenSizeInch: product.specs?.screen?.sizeInch ?? '',
      screenResolution: product.specs?.screen?.resolution || '',
      screenPanel: product.specs?.screen?.panel || '',
      screenRefreshHz: product.specs?.screen?.refreshHz ?? '',
      weightKg: product.specs?.weightKg ?? '',
      batteryWh: product.specs?.batteryWh ?? '',
      os: product.specs?.os || '',
      ports: (product.specs?.ports || []).join(', '),
      wifi: product.specs?.wifi || '',
      bluetooth: product.specs?.bluetooth || ''
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

      const missingSpecs = requiredSpecKeys.filter((key) => !`${formData[key]}`.trim());
      if (missingSpecs.length > 0) {
        alert('Vui lòng nhập đầy đủ thông số kỹ thuật');
        setSubmitting(false);
        return;
      }

      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        brand: formData.brand,
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        images: imageArray,
        description: formData.description,
        specs: {
          cpu: {
            model: formData.cpuModel,
            cores: Number(formData.cpuCores),
            threads: Number(formData.cpuThreads),
            baseGHz: Number(formData.cpuBaseGHz),
            boostGHz: Number(formData.cpuBoostGHz)
          },
          ramGB: Number(formData.ramGB),
          storage: {
            type: formData.storageType,
            sizeGB: Number(formData.storageSizeGB)
          },
          gpu: {
            model: formData.gpuModel,
            vramGB: Number(formData.gpuVramGB)
          },
          screen: {
            sizeInch: Number(formData.screenSizeInch),
            resolution: formData.screenResolution,
            panel: formData.screenPanel,
            refreshHz: Number(formData.screenRefreshHz)
          },
          weightKg: Number(formData.weightKg),
          batteryWh: Number(formData.batteryWh),
          os: formData.os,
          ports: formData.ports.split(',').map((port) => port.trim()).filter(Boolean),
          wifi: formData.wifi,
          bluetooth: formData.bluetooth
        }
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
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Thương hiệu *</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Danh mục *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (phân tách bằng dấu phẩy)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="gaming, lightweight, office"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-semibold mb-3">Thông số kỹ thuật *</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">CPU - Model *</label>
                  <input
                    type="text"
                    value={formData.cpuModel}
                    onChange={(e) => setFormData({ ...formData, cpuModel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cores *</label>
                    <input
                      type="number"
                      value={formData.cpuCores}
                      onChange={(e) => setFormData({ ...formData, cpuCores: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Threads *</label>
                    <input
                      type="number"
                      value={formData.cpuThreads}
                      onChange={(e) => setFormData({ ...formData, cpuThreads: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Base (GHz) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.cpuBaseGHz}
                      onChange={(e) => setFormData({ ...formData, cpuBaseGHz: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Boost (GHz) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.cpuBoostGHz}
                    onChange={(e) => setFormData({ ...formData, cpuBoostGHz: e.target.value })}
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Storage Type *</label>
                    <select
                      value={formData.storageType}
                      onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="NVMe">NVMe</option>
                      <option value="SSD">SSD</option>
                      <option value="HDD">HDD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Storage (GB) *</label>
                    <input
                      type="number"
                      value={formData.storageSizeGB}
                      onChange={(e) => setFormData({ ...formData, storageSizeGB: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GPU - Model *</label>
                  <input
                    type="text"
                    value={formData.gpuModel}
                    onChange={(e) => setFormData({ ...formData, gpuModel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GPU VRAM (GB) *</label>
                  <input
                    type="number"
                    value={formData.gpuVramGB}
                    onChange={(e) => setFormData({ ...formData, gpuVramGB: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Màn hình - Kích thước (inch) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.screenSizeInch}
                    onChange={(e) => setFormData({ ...formData, screenSizeInch: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Màn hình - Độ phân giải *</label>
                  <input
                    type="text"
                    value={formData.screenResolution}
                    onChange={(e) => setFormData({ ...formData, screenResolution: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="2560 x 1600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Màn hình - Tấm nền *</label>
                  <input
                    type="text"
                    value={formData.screenPanel}
                    onChange={(e) => setFormData({ ...formData, screenPanel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="IPS / OLED..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Màn hình - Tần số (Hz) *</label>
                  <input
                    type="number"
                    value={formData.screenRefreshHz}
                    onChange={(e) => setFormData({ ...formData, screenRefreshHz: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trọng lượng (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pin (Wh) *</label>
                  <input
                    type="number"
                    value={formData.batteryWh}
                    onChange={(e) => setFormData({ ...formData, batteryWh: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hệ điều hành *</label>
                  <input
                    type="text"
                    value={formData.os}
                    onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cổng kết nối (cách nhau dấu phẩy) *</label>
                  <input
                    type="text"
                    value={formData.ports}
                    onChange={(e) => setFormData({ ...formData, ports: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="USB-C, Thunderbolt 4..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Wi-Fi *</label>
                  <input
                    type="text"
                    value={formData.wifi}
                    onChange={(e) => setFormData({ ...formData, wifi: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="802.11ax (WiFi 6E)..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bluetooth *</label>
                  <input
                    type="text"
                    value={formData.bluetooth}
                    onChange={(e) => setFormData({ ...formData, bluetooth: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Bluetooth 5.3..."
                    required
                  />
                </div>
              </div>
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
                            onClick={() => setVariantsModal({ productId: product._id, productName: product.name })}
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

      {/* Variants Modal */}
      {variantsModal && (
        <VariantsModal
          productId={variantsModal.productId}
          productName={variantsModal.productName}
          onClose={() => setVariantsModal(null)}
        />
      )}
    </div>
  );
}

