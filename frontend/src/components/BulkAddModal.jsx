import { useEffect } from "react";

/**
 * BulkAddModal - Display bulk add results
 * @param {Object} props
 * @param {Boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {Array} props.results - Bulk add results
 * @param {Array} props.warnings - Warnings from bulk add
 */
export default function BulkAddModal({ isOpen, onClose, results = [], warnings = [] }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Kết quả thêm vào giỏ hàng</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="mt-2 flex gap-4 text-sm">
            <div className="text-green-600 font-medium">
              ✓ Thành công: {successCount}
            </div>
            {failCount > 0 && (
              <div className="text-red-600 font-medium">
                ✗ Thất bại: {failCount}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="font-medium text-yellow-800 mb-2">⚠️ Cảnh báo:</div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>{warning.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Results */}
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`
                p-4 rounded-lg border-2 flex items-start gap-3
                ${result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
                }
              `}
            >
              <div className={`
                text-2xl flex-shrink-0
                ${result.success ? 'text-green-600' : 'text-red-600'}
              `}>
                {result.success ? '✓' : '✗'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  Product ID: {result.productId}
                  {result.skuId && (
                    <span className="ml-2 text-gray-600">SKU: {result.skuId}</span>
                  )}
                </div>
                {result.success ? (
                  <div className="text-xs text-green-700 mt-1">
                    Đã thêm {result.addedQty} sản phẩm vào giỏ hàng
                  </div>
                ) : (
                  <div className="text-xs text-red-700 mt-1">
                    {result.error || 'Lỗi không xác định'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

