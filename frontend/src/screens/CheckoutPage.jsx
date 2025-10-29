import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart.js';
import { checkoutPreview, checkoutConfirm } from '../lib/api';
import CartSummary from '../components/CartSummary';
import ApplyCoupon from '../components/ApplyCoupon';

/**
 * CheckoutPage Component
 * Handles checkout flow: form input, coupon, preview, and confirmation
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, fetch, clear } = useCart();

  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Preview state
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState('');

  // Checkout state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch cart on mount
  useEffect(() => {
    fetch();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      const timer = setTimeout(() => {
        navigate('/cart');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [items, navigate]);

  // Get headers with guest token
  const getHeaders = () => {
    const token = localStorage.getItem('x-guest-token');
    return token ? { 'x-guest-token': token } : {};
  };

  /**
   * Apply coupon
   */
  const handleApplyCoupon = async (code) => {
    setCouponError('');
    setPreviewing(true);

    try {
      const data = await checkoutPreview({ couponCode: code }, getHeaders());
      
      if (data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponCode(code);
        setPreview(data);
      } else {
        setCouponError('Mã giảm giá không hợp lệ');
      }
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Mã giảm giá không hợp lệ');
    } finally {
      setPreviewing(false);
    }
  };

  /**
   * Remove coupon
   */
  const handleRemoveCoupon = async () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setPreview(null);
    setCouponError('');
  };

  /**
   * Preview checkout (without coupon)
   */
  const loadPreview = async () => {
    setPreviewError('');
    setPreviewing(true);

    try {
      const data = await checkoutPreview({}, getHeaders());
      setPreview(data);
    } catch (err) {
      setPreviewError(err.response?.data?.error || 'Không thể tải preview');
    } finally {
      setPreviewing(false);
    }
  };

  // Load preview on mount
  useEffect(() => {
    if (items.length > 0) {
      loadPreview();
    }
  }, [items.length]);

  /**
   * Submit checkout
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validation
    if (!email || !fullName || !phone || !address || !city) {
      setSubmitError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);

    try {
      const result = await checkoutConfirm({
        email,
        address: {
          fullName,
          phone,
          address,
          city
        }
      }, getHeaders());

      // Clear cart
      await clear();

      // Navigate to thank you page with order ID
      navigate('/thank-you', { 
        state: { 
          orderId: result.order._id,
          email: result.order.email 
        } 
      });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Đặt hàng thất bại');
      setSubmitting(false);
    }
  };

  // Empty cart message
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Giỏ hàng trống, đang chuyển hướng...</p>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Thanh toán</h1>
        <p className="text-slate-600 mt-2">Vui lòng điền thông tin để hoàn tất đơn hàng</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Thông tin liên hệ
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Thông tin giao hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Số nhà, tên đường"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thành phố *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Hà Nội, Hồ Chí Minh, ..."
                  />
                </div>
              </div>
            </div>

            {/* Coupon */}
            <ApplyCoupon
              onApply={handleApplyCoupon}
              onRemove={handleRemoveCoupon}
              currentCoupon={appliedCoupon}
            />

            {couponError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {couponError}
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{submitError}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6 space-y-4 sticky top-20">
              <h2 className="text-xl font-semibold text-slate-900">
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              {/* Items Preview */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-2 text-sm">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-slate-900">{item.product.name}</p>
                      <p className="text-slate-500">
                        {item.qty} × ${item.priceAtAdd}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              {preview && (
                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>${preview.subtotal.toLocaleString()}</span>
                  </div>
                  {preview.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>−${preview.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-blue-600 border-t pt-2">
                    <span>Tổng cộng</span>
                    <span>${preview.total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || previewing}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
