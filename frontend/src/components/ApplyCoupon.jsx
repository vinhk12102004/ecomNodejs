import { useState } from 'react';

/**
 * ApplyCoupon Component
 * Input field for coupon code with apply/remove functionality
 */
export default function ApplyCoupon({ onApply, onRemove, currentCoupon = null }) {
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setApplying(true);
    await onApply(code.trim());
    setApplying(false);
  };

  const handleRemove = async () => {
    setApplying(true);
    await onRemove();
    setCode('');
    setApplying(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="bg-slate-50 border rounded-lg p-4">
      <h3 className="font-medium text-slate-900 mb-3">
        Mã giảm giá
      </h3>

      {currentCoupon ? (
        // Current coupon applied
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-mono font-semibold uppercase">
                {currentCoupon.code}
              </span>
            </div>
            <span className="text-sm text-slate-600">
              (−{currentCoupon.discountPercent}%)
            </span>
          </div>
          <button
            onClick={handleRemove}
            disabled={applying}
            className="text-sm text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
          >
            Xóa
          </button>
        </div>
      ) : (
        // Input for new coupon
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Nhập mã giảm giá"
            disabled={applying}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleApply}
            disabled={!code.trim() || applying}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying ? 'Đang áp dụng...' : 'Áp dụng'}
          </button>
        </div>
      )}
    </div>
  );
}

