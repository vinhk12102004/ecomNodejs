import { useState } from 'react';
import useCart from '../hooks/useCart.js';
import { formatPrice } from '../utils/formatPrice.js';

/**
 * CartItem Component
 * Displays a single cart item with image, name, price, quantity controls, and remove button
 */
export default function CartItem({ item }) {
  const { updateQty, remove } = useCart();
  const [updating, setUpdating] = useState(false);

  const { product, qty, priceAtAdd, nameSnapshot, imageSnapshot, skuId } = item;
  const lineTotal = priceAtAdd * qty;
  
  // Use snapshot if available, otherwise use product data
  const displayName = nameSnapshot || product?.name || 'Unknown Product';
  const displayImage = imageSnapshot || product?.images?.[0] || product?.image || null;
  const displayBrand = product?.brand || '';

  const productId = typeof product === 'object' && product?._id ? product._id : product;
  
  const handleDecrease = async () => {
    if (updating) return;
    setUpdating(true);
    await updateQty(productId, qty - 1, skuId);
    setUpdating(false);
  };

  const handleIncrease = async () => {
    if (updating) return;
    setUpdating(true);
    await updateQty(productId, qty + 1, skuId);
    setUpdating(false);
  };

  const handleRemove = async () => {
    if (updating) return;
    if (!confirm('Xóa sản phẩm này khỏi giỏ hàng?')) return;
    
    setUpdating(true);
    const result = await remove(productId, skuId);
    setUpdating(false);
    
    // If removal failed, show error
    if (!result.success) {
      alert(result.error || 'Không thể xóa sản phẩm');
    }
  };

  return (
    <div className={`flex gap-4 p-5 border-2 border-gray-200 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all ${updating ? 'opacity-50' : ''}`}>
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {displayName}
        </h3>
        {displayBrand && (
          <p className="text-sm text-gray-500 mt-1">
            {displayBrand}
          </p>
        )}
        <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
          {formatPrice(priceAtAdd)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2 border-2 border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
          <button
            onClick={handleDecrease}
            disabled={updating || qty <= 1}
            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 font-semibold"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-4 py-2 min-w-[3rem] text-center font-semibold text-gray-900 border-x-2 border-gray-300">
            {qty}
          </span>
          <button
            onClick={handleIncrease}
            disabled={updating || qty >= (product.stock || 99)}
            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 font-semibold"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right">
          <p className="text-sm text-gray-600 font-medium">Thành tiền</p>
          <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatPrice(lineTotal)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={updating}
          className="text-sm text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 font-medium"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
