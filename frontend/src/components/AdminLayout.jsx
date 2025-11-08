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
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r fixed h-screen overflow-y-auto shadow-lg">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <p className="text-xs text-slate-500">Ecom Laptop</p>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md transform scale-[1.02]'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></span>
                    )}
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                    {active && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t mt-auto">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
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
                className={`text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/profile'
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
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

