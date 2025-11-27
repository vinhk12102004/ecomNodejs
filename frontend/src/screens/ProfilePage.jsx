import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, logout, changePassword } from '../lib/api';

function PasswordToggleButton({ isVisible, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
      aria-pressed={isVisible}
    >
      <span className="sr-only">{label}</span>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
        {!isVisible && <line x1="4" y1="4" x2="20" y2="20" />}
      </svg>
    </button>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'security'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Profile form state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: ''
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // State cho đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    setPasswordSubmitting(true);
    try {
      const updatedUser = await updateProfile({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      alert("Đổi mật khẩu thành công");
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi đổi mật khẩu");
    } finally {
      setPasswordSubmitting(false);
    }
  };



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

  // Security form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
      let mounted = true;

      // 🔐 Nếu chưa có token -> không cho vào trang profile, chuyển sang /login
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        navigate('/login');
        return () => { mounted = false; };
      }

      setLoading(true);

      Promise.all([
        getMe().then((u) => {
          if (mounted) {
            setUser(u);
            setProfileFormData({ name: u.name || '' });
          }
        }),
        getAddresses().then((r) => {
          if (mounted) setAddresses(r.addresses || []);
        })
      ])
        .catch((e) => {
          if (!mounted) return;

          // Nếu token không hợp lệ / hết hạn -> xóa token + chuyển login
          if (e.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }

          // Các lỗi khác (lỗi server, mạng, ...) mới hiển thị ra
          setError(e.response?.data?.error || 'Không thể tải dữ liệu');
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });

      return () => { mounted = false; };
    }, [navigate]);


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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Xác nhận mật khẩu không khớp');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await changePassword(passwordForm);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      resetPasswordForm();
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
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
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'security' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Bảo mật & Mật khẩu
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

            <div className="bg-gray-900 border border-gray-800 rounded p-6 mt-6">
              <h2 className="text-lg font-semibold text-white mb-4">Đổi mật khẩu</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Mật khẩu cũ</label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {passwordSubmitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
              </form>
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

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Đổi mật khẩu</h2>

            {passwordError && (
              <div className="mb-4 bg-red-900/30 border border-red-600 rounded p-3 text-sm text-red-200">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 bg-green-900/30 border border-green-600 rounded p-3 text-sm text-green-200">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Mật khẩu hiện tại *</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white pr-12"
                    required
                  />
                  <PasswordToggleButton
                    isVisible={passwordVisibility.current}
                    onClick={() => togglePasswordVisibility('current')}
                    label={passwordVisibility.current ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Mật khẩu mới *</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white pr-12"
                    placeholder="Tối thiểu 6 ký tự"
                    required
                  />
                  <PasswordToggleButton
                    isVisible={passwordVisibility.new}
                    onClick={() => togglePasswordVisibility('new')}
                    label={passwordVisibility.new ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Xác nhận mật khẩu mới *</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white pr-12"
                    required
                  />
                  <PasswordToggleButton
                    isVisible={passwordVisibility.confirm}
                    onClick={() => togglePasswordVisibility('confirm')}
                    label={passwordVisibility.confirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  />
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded p-3 text-xs text-blue-200">
                - Không chia sẻ mật khẩu với bất kỳ ai.<br />
                - Chọn mật khẩu đủ mạnh, kết hợp chữ hoa, chữ thường, số hoặc ký tự đặc biệt.
              </div>

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {passwordSubmitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}