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
import AdminOrderDetail from "../screens/AdminOrderDetail.jsx";
import LoginPage from "../screens/LoginPage.jsx";
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="font-semibold text-lg">Xparadise</Link>
          
          <div className="flex items-center gap-6">
            <nav className="text-sm text-slate-600 hidden sm:flex gap-4">
              <Link to="/profile" className="hover:text-blue-600">Hồ sơ</Link>
              <Link to="/account/orders" className="hover:text-blue-600">Đơn hàng</Link>
              <Link to="/login" className="hover:text-blue-600">Đăng nhập</Link>
              <span className="text-slate-400">Shopping Bag</span>
            </nav>
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative group">
              <svg 
                className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              
              {/* Cart Badge with animation */}
              {count > 0 && (
                <span 
                  key={count}
                  className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce"
                  style={{ animationIterationCount: 2, animationDuration: '0.5s' }}
                >
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/product/:id" element={<ProductDetail/>} />
          <Route path="/cart" element={<CartPage/>} />
          <Route path="/checkout" element={<CheckoutPage/>} />
          <Route path="/thank-you" element={<ThankYouPage/>} />
          <Route path="/order/:id" element={<OrderDetail/>} />
          <Route path="/account/orders" element={<MyOrders/>} />
          <Route path="/account/orders/:id" element={<OrderDetail/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/login" element={<LoginPage/>} />
          
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
      <footer className="border-t py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Ecom Laptop
      </footer>
    </div>
  );
}

