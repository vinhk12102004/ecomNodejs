import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../lib/api";
import useCart from "../hooks/useCart.js";

export default function ProductDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [item,setItem] = useState(null);
  const [error,setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  
  const { add: addToCart } = useCart();

  useEffect(()=>{
    let m=true;
    getProduct(id).then(r=> m && setItem(r.data)).catch(e=> m && setError(e?.response?.data || { error: e.message }) );
    return ()=>{ m=false; };
  },[id]);

  const handleAddToCart = async () => {
    if (adding) return; // Prevent double-click
    
    setAdding(true);
    setAddError('');
    setAddSuccess(false);
    
    const result = await addToCart(id, qty);
    
    if (result.success) {
      setAddSuccess('✓ Đã thêm vào giỏ hàng!');
      setTimeout(() => setAddSuccess(false), 3000);
    } else {
      setAddError(result.error || 'Không thể thêm vào giỏ hàng');
    }
    
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (adding) return;
    
    setAdding(true);
    setAddError('');
    
    const result = await addToCart(id, qty);
    
    if (result.success) {
      navigate('/cart');
    } else {
      setAddError(result.error || 'Không thể thêm vào giỏ hàng');
      setAdding(false);
    }
  };

  if(error) return <div className="text-rose-600">Lỗi: {error?.error}</div>;
  if(!item) return <div className="text-slate-500">Đang tải...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="rounded-xl bg-white border p-3">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-auto"/> : <div className="h-64 bg-slate-100 rounded-lg"/>}
      </div>
      <div className="space-y-4">
        <Link to="/" className="text-sm text-slate-500 hover:underline">← Quay lại danh sách</Link>
        <h1 className="text-2xl font-semibold">{item.name}</h1>
        <div className="text-slate-500">{item.brand}</div>
        <div className="text-blue-600 text-3xl font-bold">${item.price.toLocaleString()}</div>
        
        {/* Stock Info */}
        <div className="flex items-center gap-2">
          {item.stock > 0 ? (
            <>
              <span className="text-green-600">✓ Còn hàng</span>
              <span className="text-gray-500">({item.stock} sản phẩm)</span>
            </>
          ) : (
            <span className="text-red-600">✗ Hết hàng</span>
          )}
        </div>

        {/* Quantity Selector */}
        {item.stock > 0 && (
          <div className="flex items-center gap-4">
            <label className="font-medium">Số lượng:</label>
            <div className="flex items-center border rounded">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                −
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQty(Math.min(item.stock, Math.max(1, val)));
                }}
                min="1"
                max={item.stock}
                className="w-20 text-center border-x py-2 focus:outline-none"
              />
              <button
                onClick={() => setQty(Math.min(item.stock, qty + 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Add to Cart Buttons */}
        {item.stock > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 transition"
            >
              {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={adding}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Mua ngay
            </button>
          </div>
        )}

        {/* Messages */}
        {addSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            ✓ Đã thêm vào giỏ hàng!
          </div>
        )}
        {addError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {addError}
          </div>
        )}

        {/* Specs */}
        <div className="rounded-xl bg-white border p-4 mt-6">
          <div className="font-medium mb-3 text-lg">Thông số kỹ thuật</div>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">CPU:</span>
              <span className="font-medium">{item?.specs?.cpu?.model ?? "-"}</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">RAM:</span>
              <span className="font-medium">{item?.specs?.ramGB ?? "-"} GB</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">GPU:</span>
              <span className="font-medium">{item?.specs?.gpu?.model ?? "-"}</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Màn hình:</span>
              <span className="font-medium">{item?.specs?.screen?.sizeInch ?? "-"}" • {item?.specs?.screen?.resolution ?? "-"}</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Lưu trữ:</span>
              <span className="font-medium">{item?.specs?.storage?.sizeGB ?? "-"} GB {item?.specs?.storage?.type ?? ""}</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Trọng lượng:</span>
              <span className="font-medium">{item?.specs?.weightKg ?? "-"} kg</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Pin:</span>
              <span className="font-medium">{item?.specs?.batteryWh ?? "-"} Wh</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">HĐH:</span>
              <span className="font-medium">{item?.specs?.os ?? "-"}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

