import { Link, useLocation } from 'react-router-dom';

/**
 * AdminLayout - Sidebar + Header layout for admin pages
 */
export default function AdminLayout({ children }) {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Tổng quan', icon: '📊' },
    { path: '/admin/dashboard/advanced', label: 'Báo cáo nâng cao', icon: '📈' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '💻' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥' },
    { path: '/admin/coupons', label: 'Mã giảm giá', icon: '🎟️' },
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r fixed h-screen overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <p className="text-xs text-slate-500">Ecom Laptop</p>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t mt-auto">
          <Link
            to="/"
            className="text-sm text-slate-600 hover:text-blue-600"
          >
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {menuItems.find(item => isActive(item.path))?.label || 'Quản trị'}
            </h2>
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                Hồ sơ
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

