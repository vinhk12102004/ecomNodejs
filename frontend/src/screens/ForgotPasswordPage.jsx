import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Gửi email thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Quên mật khẩu</h1>
          <p className="text-slate-600">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-green-800 font-medium">Email đã được gửi!</p>
                <p className="text-green-700 text-sm mt-1">
                  Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
                  Link sẽ hết hạn sau 1 giờ.
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
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ được gửi đến email của bạn. 
                  Link này sẽ hết hạn sau 1 giờ và chỉ sử dụng được một lần.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-slate-600">
            Nhớ mật khẩu?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng nhập
            </Link>
          </p>
          <p className="text-sm text-slate-600">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

