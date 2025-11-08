import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, logout } from '../lib/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'addresses'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Profile form state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: ''
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

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
      getMe().then((u) => { 
        if (mounted) {
          setUser(u);
          setProfileFormData({ name: u.name || '' });
        }
      }),
      getAddresses().then((r) => { if (mounted) setAddresses(r.addresses || []); })
    ])
      .catch((e) => { if (mounted) setError(e.response?.data?.error || 'Không thể tải dữ liệu'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const resetProfileForm = () => {
    setEditingProfile(false);
    setProfileFormData({ name: user?.name || '' });
  };

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    try {
      const updatedUser = await updateProfile(profileFormData);
      setUser(updatedUser);
      setEditingProfile(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật thông tin');
    } finally {
      setProfileSubmitting(false);
    }
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

  const handleLogout = async () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) return;
    
    try {
      await logout();
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Redirect to home page
      navigate('/');
    } catch (err) {
      // Even if logout API fails, clear local storage and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/');
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto p-4 bg-red-900/30 border border-red-600 rounded">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hồ sơ</h1>
            <p className="text-gray-400">Xin chào, {user?.name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'profile' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Thông tin
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'addresses' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Địa chỉ ({addresses.length})
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Information Form */}
            <div className="bg-gray-900 border border-gray-800 rounded p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Thông tin cá nhân</h2>
                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="px-4 py-2 text-sm border border-gray-700 rounded hover:bg-gray-800 text-gray-300"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
              
              {editingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Tên</label>
                    <input
                      type="text"
                      value={profileFormData.name}
                      onChange={(e) => setProfileFormData({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Nhập tên của bạn"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={profileSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {profileSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      type="button"
                      onClick={resetProfileForm}
                      className="px-4 py-2 border border-gray-700 rounded hover:bg-gray-800 text-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <p className="text-white">{user?.email || 'Chưa có'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Tên</label>
                    <p className="text-white">{user?.name || 'Chưa có'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Loyalty Points */}
            <div className="bg-gray-900 border border-gray-800 rounded p-6">
              <h2 className="text-lg font-semibold mb-2 text-white">Điểm thưởng</h2>
              <p className="text-3xl font-bold text-purple-400">{user?.totalPoints || 0}</p>
              <p className="text-xs text-gray-400 mt-1">1 điểm = 1₫, tối đa dùng 20% giá trị đơn hàng</p>
            </div>
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
    </div>
  );
}


