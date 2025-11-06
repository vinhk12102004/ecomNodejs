import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../lib/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { user, accessToken, message } = await signup(formData);
      
      // Auto-login: Save token and user
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setSuccess(true);
      
      // Redirect to home immediately after successful signup
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký</h1>
          <p className="text-slate-600">Tạo tài khoản mới để bắt đầu mua sắm</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-green-800 font-medium">Đăng ký thành công!</p>
                <p className="text-green-700 text-sm mt-1">
                  Bạn đã được đăng nhập tự động. Vui lòng kiểm tra email để đặt mật khẩu.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
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
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Tên (tùy chọn)
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tên của bạn"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Lưu ý:</strong> Sau khi đăng ký, bạn sẽ nhận được email với link đặt mật khẩu. 
                  Link này sẽ hết hạn sau 24 giờ.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-slate-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng nhập
            </Link>
          </p>
          <p className="text-sm text-slate-600">
            Hoặc{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

