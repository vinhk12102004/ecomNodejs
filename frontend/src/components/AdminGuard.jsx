import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminPing, getMe } from '../lib/api';

/**
 * AdminGuard - Protect admin routes
 * Checks if user is authenticated and has admin role
 */
export default function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        // Option 1: Check /admin/ping
        await adminPing();
        if (mounted) {
          setAuthorized(true);
          setLoading(false);
        }
      } catch (err) {
        // If ping fails, try checking role from /auth/me
        try {
          const user = await getMe();
          if (mounted && user?.role === 'admin') {
            setAuthorized(true);
            setLoading(false);
          } else {
            if (mounted) {
              navigate('/login');
              setLoading(false);
            }
          }
        } catch (meErr) {
          if (mounted) {
            navigate('/login');
            setLoading(false);
          }
        }
      }
    }

    checkAdmin();
    return () => { mounted = false; };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return children;
}

