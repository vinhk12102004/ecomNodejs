import { useState } from 'react';
import useCart from '../hooks/useCart.js';

/**
 * BulkAddToCart - Component for adding multiple products at once
 * Usage: Pass an array of products with selection state
 */
export default function BulkAddToCart({ products, onSuccess }) {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [adding, setAdding] = useState(false);
  const [results, setResults] = useState(null);
  const { bulkAddToCart } = useCart();

  const handleToggle = (productId) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleBulkAdd = async () => {
    if (selectedItems.size === 0) return;
    
    setAdding(true);
    setResults(null);

    const items = Array.from(selectedItems).map(productId => ({
      productId,
      qty: 1
    }));

    const result = await bulkAddToCart(items);
    
    if (result.ok) {
      setResults(result.results);
      setSelectedItems(new Set()); // Clear selection
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Auto-hide results after 3s
      setTimeout(() => setResults(null), 3000);
    }
    
    setAdding(false);
  };

  if (!products || products.length === 0) {
    return null;
  }

  const selectedCount = selectedItems.size;
  const okCount = results?.filter(r => r.ok).length || 0;
  const failCount = results?.filter(r => !r.ok).length || 0;

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Thêm nhiều sản phẩm</h3>
        {selectedCount > 0 && (
          <span className="text-sm text-blue-600 font-medium">
            {selectedCount} đã chọn
          </span>
        )}
      </div>

      {/* Product List with Checkboxes */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {products.map(product => (
          <label 
            key={product._id} 
            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedItems.has(product._id)}
              onChange={() => handleToggle(product._id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <img 
              src={product.image} 
              alt={product.name}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{product.name}</div>
              <div className="text-xs text-slate-500">${product.price}</div>
            </div>
            {product.stock < 1 && (
              <span className="text-xs text-red-500">Hết hàng</span>
            )}
          </label>
        ))}
      </div>

      {/* Bulk Add Button */}
      {selectedCount > 0 && (
        <button
          onClick={handleBulkAdd}
          disabled={adding}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? 'Đang thêm...' : `Thêm ${selectedCount} sản phẩm vào giỏ`}
        </button>
      )}

      {/* Results Display */}
      {results && (
        <div className="text-sm space-y-1">
          {okCount > 0 && (
            <div className="text-green-600 font-medium">
              ✓ Đã thêm {okCount} sản phẩm
            </div>
          )}
          {failCount > 0 && (
            <div className="text-red-600">
              ✗ {failCount} sản phẩm thất bại:
              <ul className="ml-4 mt-1 text-xs">
                {results.filter(r => !r.ok).map(r => (
                  <li key={r.productId}>• {r.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

