import { useState } from 'react';
import useCart from '../hooks/useCart.js';

/**
 * CartItem Component
 * Displays a single cart item with image, name, price, quantity controls, and remove button
 */
export default function CartItem({ item }) {
  const { updateQty, remove } = useCart();
  const [updating, setUpdating] = useState(false);

  const { product, qty, priceAtAdd } = item;
  const lineTotal = priceAtAdd * qty;

  const handleDecrease = async () => {
    if (updating) return;
    setUpdating(true);
    await updateQty(product._id, qty - 1);
    setUpdating(false);
  };

  const handleIncrease = async () => {
    if (updating) return;
    setUpdating(true);
    await updateQty(product._id, qty + 1);
    setUpdating(false);
  };

  const handleRemove = async () => {
    if (updating) return;
    if (!confirm('Xóa sản phẩm này khỏi giỏ hàng?')) return;
    
    setUpdating(true);
    await remove(product._id);
    setUpdating(false);
  };

  return (
    <div className={`flex gap-4 p-4 border rounded-lg bg-white ${updating ? 'opacity-50' : ''}`}>
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-slate-400">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-900 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {product.brand}
        </p>
        <p className="text-lg font-semibold text-blue-600 mt-2">
          ${priceAtAdd.toLocaleString()}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2 border rounded-lg">
          <button
            onClick={handleDecrease}
            disabled={updating || qty <= 1}
            className="px-3 py-1 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-3 py-1 min-w-[3rem] text-center font-medium">
            {qty}
          </span>
          <button
            onClick={handleIncrease}
            disabled={updating || qty >= (product.stock || 99)}
            className="px-3 py-1 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right">
          <p className="text-sm text-slate-500">Thành tiền</p>
          <p className="text-lg font-bold text-slate-900">
            ${lineTotal.toLocaleString()}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={updating}
          className="text-sm text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
