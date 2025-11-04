import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  // Get clientId from import.meta.env (set by Vite)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Debug: Check if clientId is loaded
  console.log('[LoginPage] import.meta.env.VITE_GOOGLE_CLIENT_ID:', clientId ? clientId.substring(0, 20) + '...' : 'EMPTY');
  console.log('[LoginPage] Full import.meta.env:', import.meta.env);
  
  if (!clientId) {
    console.error('VITE_GOOGLE_CLIENT_ID is missing!');
  } else {
    console.log('✅ Google Client ID loaded:', clientId.substring(0, 20) + '...');
  }

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) return;
      const { user, accessToken } = await googleLogin(idToken);
      // Persist auth (simple demo):
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white border rounded-lg space-y-6">
      <h1 className="text-2xl font-bold text-center">Đăng nhập</h1>
      <p className="text-sm text-slate-600 text-center">Sử dụng tài khoản Google để đăng nhập nhanh</p>
      <div className="flex flex-col items-center gap-4">
        {!clientId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            ⚠️ Google Client ID chưa được cấu hình. Vui lòng kiểm tra docker-compose.yml và restart container.
          </div>
        )}
        {clientId && (
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin 
              onSuccess={onGoogleSuccess} 
              onError={(error) => {
                console.error('Google Login Error:', error);
                alert('Lỗi đăng nhập Google: ' + (error.error || 'Vui lòng kiểm tra cấu hình OAuth trong Google Cloud Console'));
              }}
            />
          </GoogleOAuthProvider>
        )}
      </div>
    </div>
  );
}


