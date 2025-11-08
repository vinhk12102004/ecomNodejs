import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import HomePage from "../screens/HomePage.jsx";
import ProductDetail from "../screens/ProductDetail.jsx";
import CartPage from "../screens/CartPage.jsx";
import CheckoutPage from "../screens/CheckoutPage.jsx";
import ThankYouPage from "../screens/ThankYouPage.jsx";
import ProfilePage from "../screens/ProfilePage.jsx";
import OrderDetail from "../screens/OrderDetail.jsx";
import MyOrders from "../screens/MyOrders.jsx";
import AdminOrderDetail from "../screens/admin/AdminOrderDetail.jsx";
import VnpayReturnPage from "../screens/VnpayReturnPage.jsx";
import LoginPage from "../screens/LoginPage.jsx";
import SignupPage from "../screens/SignupPage.jsx";
import ForgotPasswordPage from "../screens/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../screens/ResetPasswordPage.jsx";
import AdminLayout from "../components/AdminLayout.jsx";
import AdminGuard from "../components/AdminGuard.jsx";
import DashboardSimple from "../screens/admin/DashboardSimple.jsx";
import DashboardAdvanced from "../screens/admin/DashboardAdvanced.jsx";
import OrdersList from "../screens/admin/OrdersList.jsx";
import CouponsList from "../screens/admin/CouponsList.jsx";
import ProductsList from "../screens/admin/ProductsList.jsx";
import UsersList from "../screens/admin/UsersList.jsx";
import useCart from "../hooks/useCart.js";

export default function App(){
  const { count, fetchCount } = useCart();
  
  // Fetch cart count on mount and on focus
  useEffect(() => {
    fetchCount();
    
    const handleFocus = () => {
      fetchCount();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCount]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top Bar - Contact Information */}
      <div className="bg-atlas-dark text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mon-Thu: 9:00 AM - 5:30 PM
              </span>
              <span className="hidden md:flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Visit our showroom in 1234 Street Address City Address, 1234
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us: (00) 1234 5678
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Brand and Navigation */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-atlas-lime to-atlas-blue bg-clip-text text-transparent">
              Xparadise
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/profile" className="text-gray-700 hover:text-atlas-blue font-medium transition">Contact</Link>
              <Link to="/account/orders" className="text-gray-700 hover:text-atlas-blue font-medium transition">History</Link>
              <Link to="/login" className="text-gray-700 hover:text-atlas-blue font-medium transition">Log in</Link>
              <Link to="/cart" className="relative hover:text-atlas-blue transition text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              <Link to="/cart" className="relative hover:text-blue-600 transition text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-atlas-green to-atlas-lime text-atlas-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {count}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/product/:id" element={<ProductDetail/>} />
          <Route path="/cart" element={<CartPage/>} />
          <Route path="/checkout" element={<CheckoutPage/>} />
          <Route path="/thank-you" element={<ThankYouPage/>} />
          <Route path="/payment/vnpay/return" element={<VnpayReturnPage/>} />
          <Route path="/order/:id" element={<OrderDetail/>} />
          <Route path="/account/orders" element={<MyOrders/>} />
          <Route path="/account/orders/:id" element={<OrderDetail/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/signup" element={<SignupPage/>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
          <Route path="/reset-password" element={<ResetPasswordPage/>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminGuard>
              <AdminLayout>
                <DashboardSimple />
              </AdminLayout>
            </AdminGuard>
          } />
          <Route path="/admin/dashboard" element={
            <AdminGuard>
              <AdminLayout>
                <DashboardSimple />
              </AdminLayout>
            </AdminGuard>
          } />
          <Route path="/admin/dashboard/advanced" element={
            <AdminGuard>
              <AdminLayout>
                <DashboardAdvanced />
              </AdminLayout>
            </AdminGuard>
          } />
          <Route path="/admin/orders" element={
            <AdminGuard>
              <AdminLayout>
                <OrdersList />
              </AdminLayout>
            </AdminGuard>
          } />
          <Route path="/admin/orders/:id" element={
            <AdminGuard>
              <AdminLayout>
                <AdminOrderDetail />
              </AdminLayout>
            </AdminGuard>
          } />
          <Route path="/admin/products" element={
            <AdminGuard>
              <AdminLayout>
                <ProductsList />
              </AdminLayout>
            </AdminGuard>
          } />
          <Route path="/admin/users" element={
            <AdminGuard>
              <AdminLayout>
                <UsersList />
              </AdminLayout>
            </AdminGuard>
          } />
          <Route path="/admin/coupons" element={
            <AdminGuard>
              <AdminLayout>
                <CouponsList />
              </AdminLayout>
            </AdminGuard>
          } />
        </Routes>
      </main>
      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-atlas-dark to-atlas-gray-dark text-white py-12 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Đăng ký nhận thông tin khuyến mãi</h2>
          <p className="text-atlas-gray-light mb-6">Nhận thông tin về các ưu đãi mới nhất</p>
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 px-4 py-3 bg-white border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
            />
            <button className="px-6 py-3 bg-atlas-lime text-atlas-dark rounded-xl font-semibold hover:bg-atlas-green transition shadow-lg">
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-atlas-dark to-atlas-gray-dark text-atlas-gray-light border-t-2 border-atlas-gray-medium py-12 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Information */}
            <div>
              <h3 className="text-white font-bold mb-4">Thông tin</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-atlas-blue transition text-atlas-gray-light">Về chúng tôi</Link></li>
                <li><Link to="/privacy" className="hover:text-atlas-blue transition text-atlas-gray-light">Chính sách bảo mật</Link></li>
                <li><Link to="/terms" className="hover:text-atlas-blue transition text-atlas-gray-light">Điều khoản</Link></li>
                <li><Link to="/contact" className="hover:text-atlas-blue transition text-atlas-gray-light">Liên hệ</Link></li>
              </ul>
            </div>

            {/* PC Parts */}
            <div>
              <h3 className="text-white font-bold mb-4">Linh kiện PC</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products?category=CPUS" className="hover:text-atlas-blue transition text-atlas-gray-light">CPU</Link></li>
                <li><Link to="/products?category=RAM" className="hover:text-atlas-blue transition text-atlas-gray-light">RAM (Bộ nhớ)</Link></li>
                <li><Link to="/products?category=GPU" className="hover:text-atlas-blue transition text-atlas-gray-light">Card đồ họa</Link></li>
                <li><Link to="/products?category=Storage" className="hover:text-atlas-blue transition text-atlas-gray-light">Ổ cứng</Link></li>
              </ul>
            </div>

            {/* Desktop PCs */}
            <div>
              <h3 className="text-white font-bold mb-4">PC để bàn</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products?category=Custom" className="hover:text-atlas-blue transition text-atlas-gray-light">PC tùy chỉnh</Link></li>
                <li><Link to="/products?brand=MSI" className="hover:text-atlas-blue transition text-atlas-gray-light">MSI All-In-One</Link></li>
                <li><Link to="/products?brand=HP" className="hover:text-atlas-blue transition text-atlas-gray-light">HP/Compaq</Link></li>
                <li><Link to="/products?brand=Asus" className="hover:text-atlas-blue transition text-atlas-gray-light">ASUS</Link></li>
              </ul>
            </div>

            {/* Laptops */}
            <div>
              <h3 className="text-white font-bold mb-4">Laptop</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products?category=Gaming" className="hover:text-atlas-blue transition text-atlas-gray-light">Laptop Gaming</Link></li>
                <li><Link to="/products?brand=MSI" className="hover:text-atlas-blue transition text-atlas-gray-light">MSI Workstation</Link></li>
                <li><Link to="/products?brand=MSI" className="hover:text-atlas-blue transition text-atlas-gray-light">MSI Prestige</Link></li>
                <li><Link to="/products?category=Ultrabook" className="hover:text-atlas-blue transition text-atlas-gray-light">Laptop văn phòng</Link></li>
              </ul>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="border-t-2 border-atlas-gray-medium pt-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="text-white font-bold mb-3">Địa chỉ</h4>
                <p className="text-gray-300">1234 Street Address</p>
                <p className="text-gray-300">City Address, 1234</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3">Điện thoại</h4>
                <p className="text-gray-300">(00) 1234 5678</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3">Giờ làm việc</h4>
                <p className="text-gray-300">Mon-Thu: 9:00 AM - 5:30 PM</p>
                <p className="text-gray-300">Fri: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-300">Sat: 11:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t-2 border-atlas-gray-medium pt-6 flex flex-col md:flex-row items-center justify-between text-sm">
            <p className="text-gray-400">Copyright © {new Date().getFullYear()} Xparadise. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-gray-400">Phương thức thanh toán:</span>
              <span className="text-xs bg-white text-gray-900 px-3 py-1 rounded-lg font-semibold">VISA</span>
              <span className="text-xs bg-white text-gray-900 px-3 py-1 rounded-lg font-semibold">Mastercard</span>
              <span className="text-xs bg-white text-gray-900 px-3 py-1 rounded-lg font-semibold">PayPal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

