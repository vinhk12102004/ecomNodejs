import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleLogin, getMe } from '../lib/api'; // ✅ thêm getMe

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get clientId from import.meta.env (set by Vite)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 🔹 Gọi API login
      const { user, accessToken } = await login(formData);

      // 🔹 Lưu token + user info
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // 🔹 Gọi getMe() để xác nhận role mới nhất
      const me = await getMe();

      // 🔹 Điều hướng theo role
      if (me.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) return;
      const { user, accessToken } = await googleLogin(idToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // 🔹 Kiểm tra role
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Đăng nhập Google thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập</h1>
          <p className="text-slate-600">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Email/Password Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Hoặc</span>
          </div>
        </div>

        {/* Google Login */}
        <div className="flex flex-col items-center gap-4">
          {!clientId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 w-full">
              ⚠️ Google Client ID chưa được cấu hình. Vui lòng kiểm tra docker-compose.yml và restart container.
            </div>
          )}
          {clientId && (
            <GoogleOAuthProvider clientId={clientId}>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={(error) => {
                  console.error('Google Login Error:', error);
                  setError('Lỗi đăng nhập Google: ' + (error.error || 'Vui lòng kiểm tra cấu hình OAuth'));
                }}
              />
            </GoogleOAuthProvider>
          )}
        </div>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
