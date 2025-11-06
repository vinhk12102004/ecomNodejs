import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ. Vui lòng yêu cầu link đặt lại mật khẩu mới.');
    }
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordError(validatePassword(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    // Validate
    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!token) {
      setError('Token không hợp lệ');
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(token, formData.password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Yêu cầu link đặt lại mật khẩu mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-slate-600">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-green-800 font-medium">Đặt lại mật khẩu thành công!</p>
                <p className="text-green-700 text-sm mt-1">
                  Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây...
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Mật khẩu mới *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordError ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
                {passwordError && (
                  <p className="text-red-600 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Xác nhận mật khẩu *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Lưu ý:</strong> Mật khẩu phải có ít nhất 6 ký tự. 
                  Link này chỉ sử dụng được một lần.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !!passwordError}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

