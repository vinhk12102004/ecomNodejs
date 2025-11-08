import { Link, useLocation } from "react-router-dom";
import useLogout from "../hooks/useLogout";

/**
 * AdminLayout - Sidebar + Header layout for admin pages
 */
export default function AdminLayout({ children }) {
  const location = useLocation();
  const logout = useLogout(); // ✅ hook logout

  const menuItems = [
    { path: "/admin/dashboard", label: "Tổng quan", icon: "📊" },
    { path: "/admin/dashboard/advanced", label: "Báo cáo nâng cao", icon: "📈" },
    { path: "/admin/orders", label: "Đơn hàng", icon: "📦" },
    { path: "/admin/products", label: "Sản phẩm", icon: "💻" },
    { path: "/admin/users", label: "Người dùng", icon: "👥" },
    { path: "/admin/coupons", label: "Mã giảm giá", icon: "🎟️" },
  ];

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r fixed h-screen overflow-y-auto flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <p className="text-xs text-slate-500">Ecom Laptop</p>
        </div>

        <nav className="p-2 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Sidebar */}
        {/* <div className="p-4 border-t mt-auto space-y-2">
          <Link
            to="/"
            className="block text-sm text-slate-600 hover:text-blue-600"
          >
            ← Về trang chủ
          </Link>
          <button
            onClick={logout}
            className="w-full text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition"
          >
            ⎋ Đăng xuất
          </button>
        </div> */}
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        {/* <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {menuItems.find((item) => isActive(item.path))?.label || "Quản trị"}
            </h2>
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="text-sm text-slate-600 hover:text-blue-600"
              >
                Hồ sơ
              </Link>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header> */}

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
