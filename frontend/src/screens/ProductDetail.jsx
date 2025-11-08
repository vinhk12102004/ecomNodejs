import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct, getVariants } from "../lib/api";
import useCart from "../hooks/useCart.js";
import { formatPrice } from "../utils/formatPrice.js";
import ProductReviews from "../components/ProductReviews.jsx";

export default function ProductDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [item,setItem] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState([]); // For bulk add: [{ sku, qty }]
  const [error,setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { add: addToCart, addBulk } = useCart();

  // Fetch product
  useEffect(()=>{
    let m=true;
    getProduct(id).then(r=> m && setItem(r.data)).catch(e=> m && setError(e?.response?.data || { error: e.message }) );
    return ()=>{ m=false; };
  },[id]);

  // Fetch variants
  useEffect(()=>{
    let m=true;
    if (id) {
      getVariants(id)
        .then(r=> {
          if (m && r.data && r.data.length > 0) {
            setVariants(r.data);
            setSelectedVariant(r.data[0]); // Auto-select first variant
          }
        })
        .catch(e=> console.error('Load variants error:', e));
    }
    return ()=>{ m=false; };
  },[id]);

  const handleAddToCart = async () => {
    if (adding) return; // Prevent double-click
    
    // Validate variant selection if variants exist
    if (variants.length > 0 && !selectedVariant) {
      setAddError('Vui lòng chọn phiên bản sản phẩm');
      return;
    }
    
    setAdding(true);
    setAddError('');
    setAddSuccess(false);
    
    // If variant exists, pass skuId; otherwise use productId only
    const result = selectedVariant 
      ? await addToCart(id, qty, selectedVariant.sku)
      : await addToCart(id, qty);
    
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
    
    // Validate variant selection if variants exist
    if (variants.length > 0 && !selectedVariant) {
      setAddError('Vui lòng chọn phiên bản sản phẩm');
      return;
    }
    
    setAdding(true);
    setAddError('');
    
    const result = selectedVariant 
      ? await addToCart(id, qty, selectedVariant.sku)
      : await addToCart(id, qty);
    
    if (result.success) {
      navigate('/cart');
    } else {
      setAddError(result.error || 'Không thể thêm vào giỏ hàng');
      setAdding(false);
    }
  };

  if(error) return <div className="container mx-auto px-4 py-8 text-red-400">Lỗi: {error?.error}</div>;
  if(!item) return <div className="container mx-auto px-4 py-8 text-gray-400">Đang tải...</div>;

  // Use variant price/stock if selected, otherwise use product defaults
  const displayPrice = selectedVariant ? selectedVariant.price : item.price;
  const displayStock = selectedVariant ? selectedVariant.stock : item.stock;

  // Images handling
  const images = item.images && Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : [];
  const hasValidImages = images.length >= 3;

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <div className="rounded-2xl bg-white border-2 border-gray-200 shadow-lg p-4 space-y-4">
        {/* Warning if missing images */}
        {!hasValidImages && (
          <div className="bg-yellow-50 border-2 border-yellow-400 text-yellow-800 p-3 rounded-xl text-sm">
            ⚠️ Thiếu ảnh sản phẩm (yêu cầu tối thiểu 3 ảnh)
          </div>
        )}
        
        {/* Main Image */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-md">
          {images.length > 0 ? (
            <img 
              src={images[currentImageIndex]} 
              alt={`${item.name} - Image ${currentImageIndex + 1}`} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <div>Không có ảnh</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`
                  aspect-square border-2 rounded-xl overflow-hidden transition-all shadow-sm
                  ${currentImageIndex === idx 
                    ? 'border-blue-500 ring-2 ring-blue-300 scale-105' 
                    : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                  }
                `}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

        <div className="space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 hover:underline transition">
            ← Quay lại danh sách
          </Link>
          <div>
            <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">{item.brand}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{item.name}</h1>

            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {formatPrice(displayPrice)}
            </div>
          </div>
        
        {/* Variant Selector */}
        {variants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-900">Chọn cấu hình:</label>
              {variants.length > 1 && (
                <label className="text-sm flex items-center gap-2 cursor-pointer text-gray-600 hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedVariants.length === variants.filter(v => v.stock > 0).length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVariants(variants.filter(v => v.stock > 0).map(v => ({ sku: v.sku, qty: 1 })));
                      } else {
                        setSelectedVariants([]);
                        setSelectedVariant(null);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Chọn tất cả ({variants.filter(v => v.stock > 0).length})</span>
                </label>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {variants.map((v) => {
                const isSelected = selectedVariants.some(sv => sv.sku === v.sku);
                const isSingleSelected = selectedVariant?.sku === v.sku && selectedVariants.length === 0;
                
                return (
                  <div
                    key={v.sku}
                    className={`
                      p-4 border-2 rounded-2xl transition-all bg-white shadow-sm
                      ${isSingleSelected || isSelected
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                      }
                      ${v.stock < 1 ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {variants.length > 1 && v.stock > 0 && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVariants([...selectedVariants, { sku: v.sku, qty: 1 }]);
                              setSelectedVariant(null);
                            } else {
                              setSelectedVariants(selectedVariants.filter(sv => sv.sku !== v.sku));
                            }
                          }}
                          className="mt-1 w-5 h-5 cursor-pointer text-blue-600 rounded"
                        />
                      )}
                      <button
                        onClick={() => {
                          setSelectedVariant(v);
                          setSelectedVariants([]);
                          setQty(1);
                        }}
                        className="flex-1 text-left"
                        disabled={v.stock < 1}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-900">{v.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {v.attributes.ramGB}GB RAM • {v.attributes.storageGB}GB • {v.attributes.color}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-bold text-blue-600 text-lg">{formatPrice(v.price)}</div>
                            {v.stock < 1 ? (
                              <div className="text-xs text-red-500 font-medium">Hết hàng</div>
                            ) : (
                              <div className="text-xs text-green-600 font-medium">Còn {v.stock}</div>
                            )}
                          </div>
                        </div>
                      </button>
                      {isSelected && (
                        <input
                          type="number"
                          min="1"
                          max={v.stock}
                          value={selectedVariants.find(sv => sv.sku === v.sku)?.qty || 1}
                          onChange={(e) => {
                            const newQty = Math.min(v.stock, Math.max(1, parseInt(e.target.value) || 1));
                            setSelectedVariants(selectedVariants.map(sv => 
                              sv.sku === v.sku ? { ...sv, qty: newQty } : sv
                            ));
                          }}
                          className="w-20 px-2 py-1 border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedVariants.length > 0 && (
              <button
                onClick={async () => {
                  setAdding(true);
                  setAddError('');
                  const items = selectedVariants.map(sv => ({
                    productId: id,
                    skuId: sv.sku,
                    qty: sv.qty
                  }));
                  const result = await addBulk(items);
                  if (result.success) {
                    setAddSuccess(`✓ Đã thêm ${selectedVariants.length} cấu hình vào giỏ hàng!`);
                    setSelectedVariants([]);
                    setTimeout(() => setAddSuccess(false), 3000);
                  } else {
                    setAddError(result.error || 'Không thể thêm vào giỏ hàng');
                  }
                  setAdding(false);
                }}
                disabled={adding || selectedVariants.length === 0}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {adding ? 'Đang thêm...' : `Thêm ${selectedVariants.length} cấu hình vào giỏ`}
              </button>
            )}
          </div>
        )}

          {/* Stock Info - Chỉ hiển thị khi không có variants hoặc đã chọn variant */}
          {variants.length === 0 && (
            <div className="flex items-center gap-2">
              {displayStock > 0 ? (
                <>
                  <span className="text-green-600 font-medium">✓ Còn hàng</span>
                  <span className="text-gray-600">({displayStock} sản phẩm)</span>
                </>
              ) : (
                <span className="text-red-500 font-medium">✗ Hết hàng</span>
              )}
            </div>
          )}

          {/* Quantity Selector - Chỉ hiển thị khi không có variants hoặc đã chọn single variant */}
          {displayStock > 0 && (variants.length === 0 || (selectedVariant && selectedVariants.length === 0)) && (
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-900">Số lượng:</label>
              <div className="flex items-center border-2 border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 hover:bg-gray-100 text-gray-700 transition font-semibold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQty(Math.min(displayStock, Math.max(1, val)));
                  }}
                  min="1"
                  max={displayStock}
                  className="w-20 text-center border-x-2 border-gray-300 py-2 bg-white text-gray-900 focus:outline-none font-semibold"
                />
                <button
                  onClick={() => setQty(Math.min(displayStock, qty + 1))}
                  className="px-4 py-2 hover:bg-gray-100 text-gray-700 transition font-semibold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Buttons */}
          {displayStock > 0 && (variants.length === 0 || (selectedVariant && selectedVariants.length === 0)) && (
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || (variants.length > 0 && !selectedVariant)}
                  className="w-full bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-blue-500 text-blue-600 py-3 rounded-2xl font-semibold hover:from-blue-50 hover:to-indigo-50 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
                </button>
                {/* Tooltip khi chưa chọn variant */}
                {variants.length > 0 && !selectedVariant && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    ⚠️ Vui lòng chọn cấu hình sản phẩm
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 relative group">
                <button
                  onClick={handleBuyNow}
                  disabled={adding || (variants.length > 0 && !selectedVariant)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Mua ngay
                </button>
                {/* Tooltip khi chưa chọn variant */}
                {variants.length > 0 && !selectedVariant && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    ⚠️ Vui lòng chọn cấu hình sản phẩm
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          {addSuccess && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-green-700 rounded-2xl shadow-sm">
              ✓ {addSuccess}
            </div>
          )}
          {addError && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 text-red-700 rounded-2xl shadow-sm">
              {addError}
            </div>
          )}

          {/* 🏷️ Danh mục */}
          <div className="text-sm text-gray-700 mb-3">
            <span className="font-semibold">Danh mục:</span>{" "}
            <span className="inline-block bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
              {item.category || "Không có danh mục"}
            </span>
          </div>

          {/* 🏷️ Thẻ */}
          {item.tags && item.tags.length > 0 && (
            <div className="text-sm text-gray-700 mb-3">
              <span className="font-semibold">Thẻ:</span>{" "}
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 mr-2 mt-1"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-md p-6 mt-6">
              <div className="font-semibold mb-4 text-xl text-gray-900">Mô tả sản phẩm</div>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {item.description}
              </div>
            </div>
          )}

          {/* Specs */}
          <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-md p-6 mt-6">
            <div className="font-semibold mb-4 text-xl text-gray-900">Thông số kỹ thuật</div>
            <ul className="text-sm space-y-3">
              <li className="flex justify-between border-b-2 border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">CPU:</span>
                <span className="font-semibold text-gray-900">{item?.specs?.cpu?.model ?? "-"}</span>
              </li>
              <li className="flex justify-between border-b-2 border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">RAM:</span>
                <span className="font-semibold text-gray-900">{item?.specs?.ramGB ?? "-"} GB</span>
              </li>
              <li className="flex justify-between border-b-2 border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">GPU:</span>
                <span className="font-semibold text-gray-900">{item?.specs?.gpu?.model ?? "-"}</span>
              </li>
              <li className="flex justify-between border-b-2 border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">Màn hình:</span>
                <span className="font-semibold text-gray-900">{item?.specs?.screen?.sizeInch ?? "-"}" • {item?.specs?.screen?.resolution ?? "-"}</span>
              </li>
              <li className="flex justify-between border-b-2 border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">Lưu trữ:</span>
                <span className="font-semibold text-gray-900">{item?.specs?.storage?.sizeGB ?? "-"} GB {item?.specs?.storage?.type ?? ""}</span>
              </li>
              <li className="flex justify-between border-b-2 border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">Trọng lượng:</span>
                <span className="font-semibold text-gray-900">{item?.specs?.weightKg ?? "-"} kg</span>
              </li>
              <li className="flex justify-between border-b-2 border-gray-200 pb-3">
                <span className="text-gray-600 font-medium">Pin:</span>
                <span className="font-semibold text-gray-900">{item?.specs?.batteryWh ?? "-"} Wh</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 font-medium">HĐH:</span>
                <span className="font-semibold text-gray-900">{item?.specs?.os ?? "-"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto">
        <ProductReviews productId={id} />
      </div>
    </div>
  );
}

