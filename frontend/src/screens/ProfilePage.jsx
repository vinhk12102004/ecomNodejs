import { useEffect, useState } from 'react';
import { getMe, getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../lib/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'addresses'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Address form state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    recipient: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    district: '',
    ward: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getMe().then((u) => { if (mounted) setUser(u); }),
      getAddresses().then((r) => { if (mounted) setAddresses(r.addresses || []); })
    ])
      .catch((e) => { if (mounted) setError(e.response?.data?.error || 'Không thể tải dữ liệu'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      label: '',
      recipient: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      district: '',
      ward: ''
    });
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setFormData({
      label: addr.label || '',
      recipient: addr.recipient || '',
      phone: addr.phone || '',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      district: addr.district || '',
      ward: addr.ward || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateAddress(editingId, formData);
      } else {
        await createAddress(formData);
      }
      const result = await getAddresses();
      setAddresses(result.addresses || []);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi lưu địa chỉ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addrId) => {
    if (!confirm('Xóa địa chỉ này?')) return;
    try {
      await deleteAddress(addrId);
      const result = await getAddresses();
      setAddresses(result.addresses || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa địa chỉ');
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      await setDefaultAddress(addrId);
      const result = await getAddresses();
      setAddresses(result.addresses || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi đặt mặc định');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hồ sơ</h1>
        <p className="text-slate-600">Xin chào, {user?.name || user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'
            }`}
          >
            Thông tin
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'addresses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'
            }`}
          >
            Địa chỉ ({addresses.length})
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border rounded p-6">
          <h2 className="text-lg font-semibold mb-2">Điểm thưởng</h2>
          <p className="text-3xl font-bold text-purple-700">{user?.totalPoints || 0}</p>
          <p className="text-xs text-slate-500 mt-1">1 điểm = 1₫, tối đa dùng 20% giá trị đơn hàng</p>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          {/* Address Form */}
          <div className="bg-white border rounded p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nhãn địa chỉ *</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="VD: Nhà riêng, Cơ quan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Người nhận *</label>
                  <input
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thành phố *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phường/Xã</label>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ dòng 1 *</label>
                <input
                  type="text"
                  value={formData.line1}
                  onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ dòng 2</label>
                <input
                  type="text"
                  value={formData.line2}
                  onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border rounded hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Address List */}
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="bg-white border rounded p-6 text-center text-slate-500">
                Chưa có địa chỉ nào. Hãy thêm địa chỉ mới.
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr._id} className="bg-white border rounded p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Mặc định</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{addr.recipient} • {addr.phone}</p>
                      <p className="text-sm mt-1">
                        {addr.line1}
                        {addr.line2 && `, ${addr.line2}`}
                        {addr.ward && `, ${addr.ward}`}
                        {addr.district && `, ${addr.district}`}
                        {addr.city && `, ${addr.city}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr._id)}
                          className="px-3 py-1 text-xs border rounded hover:bg-slate-50"
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(addr)}
                        className="px-3 py-1 text-xs border rounded hover:bg-slate-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(addr._id)}
                        className="px-3 py-1 text-xs border rounded hover:bg-red-50 text-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


