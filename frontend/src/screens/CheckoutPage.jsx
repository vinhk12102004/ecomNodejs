import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart.js';
import { checkoutPreview, checkoutConfirm, getAddresses, getMe } from '../lib/api';
import CartSummary from '../components/CartSummary';
import ApplyCoupon from '../components/ApplyCoupon';
import { formatPrice } from '../utils/formatPrice.js';

/**
 * CheckoutPage Component
 * Handles checkout flow: form input, coupon, preview, and confirmation
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, loading: cartLoading, error: cartError, fetch, clear } = useCart();

  // User & Address state
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);

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

  // Loyalty points state
  const [usePoints, setUsePoints] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(0);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'vnpay'

  // Checkout state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch cart and user data on mount
  useEffect(() => {
    fetch();
    
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      Promise.all([
        getMe().then(u => {
          setUser(u);
          setEmail(u.email || '');
        }),
        getAddresses().then(r => {
          const addrs = r.addresses || [];
          setAddresses(addrs);
          // Prefill with default address
          const defaultAddr = addrs.find(a => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setFullName(defaultAddr.recipient);
            setPhone(defaultAddr.phone);
            setAddress(defaultAddr.line1 + (defaultAddr.line2 ? `, ${defaultAddr.line2}` : ''));
            setCity(defaultAddr.city);
          }
        })
      ]).catch(err => console.error('Failed to load user data:', err));
    }
  }, []);

  // Redirect if cart is empty (only after loading is complete)
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      const timer = setTimeout(() => {
        navigate('/cart');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [items, cartLoading, navigate]);

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
      const data = await checkoutPreview({ couponCode: code, redeemPoints: usePoints ? redeemPoints : 0 }, getHeaders());
      
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
      const data = await checkoutPreview({ redeemPoints: usePoints ? redeemPoints : 0 }, getHeaders());
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

  // Recalculate preview when points usage changes
  useEffect(() => {
    if (items.length > 0) {
      loadPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePoints, redeemPoints]);

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
      // If user is logged in and using saved address, send addressId
      // Otherwise, send address object
      const confirmData = {
        email: user ? user.email : email,
        couponCode: couponCode || undefined,
        redeemPoints: usePoints ? redeemPoints : 0,
        paymentMethod: paymentMethod || 'cod'
      };

      if (user && selectedAddressId && !useNewAddress) {
        confirmData.addressId = selectedAddressId;
      } else {
        confirmData.address = {
          label: useNewAddress ? 'Địa chỉ mới' : addresses.find(a => a._id === selectedAddressId)?.label || 'Địa chỉ giao hàng',
          recipient: fullName,
          phone,
          line1: address,
          line2: '',
          city,
          district: '',
          ward: ''
        };
      }

      const result = await checkoutConfirm(confirmData, getHeaders());

      // If VNPAY payment, redirect to payment URL
      if (result.paymentUrl) {
        // Clear cart before redirecting
        await clear();
        // Redirect to VNPAY payment page
        window.location.href = result.paymentUrl;
        return;
      }

      // Clear cart
      await clear();

      // Navigate to thank you page with order ID (for COD)
      navigate('/thank-you', { 
        state: { 
          orderId: result.order._id,
          email: result.order.email,
          order: result.order
        } 
      });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Đặt hàng thất bại');
      setSubmitting(false);
    }
  };

  // Loading state - show spinner while cart is loading
  if (cartLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart message (only show after loading is complete)
  if (!cartLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold text-lg mb-2">Cart is empty</p>
            <p className="text-gray-400 mb-4">Giỏ hàng trống, đang chuyển hướng...</p>
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        <p className="text-gray-600 mt-2 font-medium">Vui lòng điền thông tin để hoàn tất đơn hàng</p>
      </div>

      {/* Cart Error Message */}
      {cartError && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Lỗi giỏ hàng: {cartError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông tin liên hệ
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông tin giao hàng
              </h2>
              
              {/* Address Selector (if logged in) */}
              {user && addresses.length > 0 && (
                <div className="mb-4 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chọn địa chỉ đã lưu
                  </label>
                  <select
                    value={useNewAddress ? 'new' : selectedAddressId}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setUseNewAddress(true);
                        setSelectedAddressId('');
                        setFullName('');
                        setPhone('');
                        setAddress('');
                        setCity('');
                      } else {
                        setUseNewAddress(false);
                        setSelectedAddressId(e.target.value);
                        const selectedAddr = addresses.find(a => a._id === e.target.value);
                        if (selectedAddr) {
                          setFullName(selectedAddr.recipient);
                          setPhone(selectedAddr.phone);
                          setAddress(selectedAddr.line1 + (selectedAddr.line2 ? `, ${selectedAddr.line2}` : ''));
                          setCity(selectedAddr.city);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    {addresses.map(addr => (
                      <option key={addr._id} value={addr._id}>
                        {addr.label} {addr.isDefault && '(Mặc định)'} - {addr.line1}, {addr.city}
                      </option>
                    ))}
                    <option value="new">+ Thêm địa chỉ mới</option>
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Số nhà, tên đường"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thành phố *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Hà Nội, Hồ Chí Minh, ..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {/* COD Option */}
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50"
                  style={{ 
                    borderColor: paymentMethod === 'cod' ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: paymentMethod === 'cod' ? '#eff6ff' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận được hàng</div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </label>

                {/* VNPAY Option */}
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50"
                  style={{ 
                    borderColor: paymentMethod === 'vnpay' ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: paymentMethod === 'vnpay' ? '#eff6ff' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Thanh toán online (VNPAY)</div>
                    <div className="text-sm text-gray-600">Thanh toán qua thẻ ATM, thẻ quốc tế, hoặc ví điện tử</div>
                  </div>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </label>
              </div>
            </div>

            {/* Coupon */}
            <ApplyCoupon
              onApply={handleApplyCoupon}
              onRemove={handleRemoveCoupon}
              currentCoupon={appliedCoupon}
            />

            {couponError && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-2xl text-red-700 text-sm shadow-sm">
                {couponError}
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 text-red-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">{submitError}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 space-y-4 sticky top-20 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900">
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              {/* Items Preview */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-3 text-sm p-2 bg-white rounded-xl border border-gray-200">
                    <img
                      src={item.imageSnapshot || item.product?.images?.[0] || item.product?.image}
                      alt={item.nameSnapshot || item.product?.name}
                      className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-gray-900 font-medium">{item.nameSnapshot || item.product?.name}</p>
                      <p className="text-gray-600 font-semibold">
                        {item.qty} × {formatPrice(item.priceAtAdd)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              {preview && (
                <div className="space-y-2 text-sm border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between text-gray-700 font-medium">
                    <span>Tạm tính</span>
                    <span>{formatPrice(preview.subtotal)}</span>
                  </div>
                  {/* Tax */}
                  <div className="flex justify-between text-gray-700 font-medium">
                    <span>Thuế (10%)</span>
                    <span>{formatPrice(preview.tax || 0)}</span>
                  </div>
                  {/* Shipping */}
                  <div className="flex justify-between text-gray-700 font-medium">
                    <span>Vận chuyển</span>
                    <span>{(preview.shipping || 0) === 0 ? 'Miễn phí' : formatPrice(preview.shipping)}</span>
                  </div>
                  {preview.discount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Giảm giá</span>
                      <span>−{formatPrice(preview.discount)}</span>
                    </div>
                  )}
                  {preview.loyalty && preview.loyalty.applied > 0 && (
                    <div className="flex justify-between text-purple-600 font-semibold">
                      <span>Dùng điểm</span>
                      <span>−{formatPrice(preview.loyalty.applied)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t-2 border-gray-300 pt-2">
                    <span className="text-gray-900">Tổng cộng</span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{formatPrice(preview.total)}</span>
                  </div>
                </div>
              )}

              {/* Loyalty points input */}
              <div className="border-t-2 border-gray-300 pt-4 space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span>Dùng điểm tích lũy</span>
                </label>

                {usePoints && (
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={redeemPoints}
                        onChange={(e) => setRedeemPoints(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                        className="w-32 px-3 py-2 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        placeholder="Số điểm"
                      />
                      {preview?.loyalty && (
                        <span className="text-xs text-gray-600 font-medium">
                          Tối đa: {preview.loyalty.maxAllowed} — Điểm còn lại: {preview.loyalty.remainingPoints}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || previewing}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>

              <p className="text-xs text-gray-500 text-center font-medium">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
