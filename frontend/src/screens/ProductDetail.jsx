import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct, getVariants } from "../lib/api";
import useCart from "../hooks/useCart.js";

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

  if(error) return <div className="text-rose-600">Lỗi: {error?.error}</div>;
  if(!item) return <div className="text-slate-500">Đang tải...</div>;

  // Use variant price/stock if selected, otherwise use product defaults
  const displayPrice = selectedVariant ? selectedVariant.price : item.price;
  const displayStock = selectedVariant ? selectedVariant.stock : item.stock;

  // Images handling
  const images = item.images && Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : [];
  const hasValidImages = images.length >= 3;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Image Gallery */}
      <div className="rounded-xl bg-white border p-3 space-y-3">
        {/* Warning if missing images */}
        {!hasValidImages && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-lg text-sm">
            ⚠️ Thiếu ảnh sản phẩm (yêu cầu tối thiểu 3 ảnh)
          </div>
        )}
        
        {/* Main Image */}
        <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden">
          {images.length > 0 ? (
            <img 
              src={images[currentImageIndex]} 
              alt={`${item.name} - Image ${currentImageIndex + 1}`} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <div>Không có ảnh</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`
                  aspect-square border-2 rounded-lg overflow-hidden transition
                  ${currentImageIndex === idx 
                    ? 'border-blue-600' 
                    : 'border-gray-200 hover:border-blue-300'
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

      <div className="space-y-4">
        <Link to="/" className="text-sm text-slate-500 hover:underline">← Quay lại danh sách</Link>
        <h1 className="text-2xl font-semibold">{item.name}</h1>
        <div className="text-slate-500">{item.brand}</div>
        <div className="text-blue-600 text-3xl font-bold">${displayPrice.toLocaleString()}</div>
        
        {/* Variant Selector */}
        {variants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium">Chọn cấu hình:</label>
              {variants.length > 1 && (
                <label className="text-sm flex items-center gap-2 cursor-pointer">
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
                    className="w-4 h-4"
                  />
                  <span>Chọn tất cả ({variants.filter(v => v.stock > 0).length})</span>
                </label>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {variants.map((v) => {
                const isSelected = selectedVariants.some(sv => sv.sku === v.sku);
                const isSingleSelected = selectedVariant?.sku === v.sku && selectedVariants.length === 0;
                
                return (
                  <div
                    key={v.sku}
                    className={`
                      p-3 border-2 rounded-lg transition
                      ${isSingleSelected || isSelected
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
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
                              setSelectedVariant(null); // Clear single selection
                            } else {
                              setSelectedVariants(selectedVariants.filter(sv => sv.sku !== v.sku));
                            }
                          }}
                          className="mt-1 w-4 h-4 cursor-pointer"
                        />
                      )}
                      <button
                        onClick={() => {
                          setSelectedVariant(v);
                          setSelectedVariants([]); // Clear bulk selection
                        }}
                        className="flex-1 text-left"
                        disabled={v.stock < 1}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm">{v.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {v.attributes.ramGB}GB RAM • {v.attributes.storageGB}GB • {v.attributes.color}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-600">${v.price.toLocaleString()}</div>
                            {v.stock < 1 ? (
                              <div className="text-xs text-red-600">Hết hàng</div>
                            ) : (
                              <div className="text-xs text-green-600">Còn {v.stock}</div>
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
                          className="w-16 px-2 py-1 border rounded text-sm"
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
                className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {adding ? 'Đang thêm...' : `Thêm ${selectedVariants.length} cấu hình vào giỏ`}
              </button>
            )}
          </div>
        )}
        
        {/* Stock Info */}
        <div className="flex items-center gap-2">
          {displayStock > 0 ? (
            <>
              <span className="text-green-600">✓ Còn hàng</span>
              <span className="text-gray-500">({displayStock} sản phẩm)</span>
            </>
          ) : (
            <span className="text-red-600">✗ Hết hàng</span>
          )}
        </div>

        {/* Quantity Selector */}
        {displayStock > 0 && (
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
                  setQty(Math.min(displayStock, Math.max(1, val)));
                }}
                min="1"
                max={displayStock}
                className="w-20 text-center border-x py-2 focus:outline-none"
              />
              <button
                onClick={() => setQty(Math.min(displayStock, qty + 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Add to Cart Buttons */}
        {displayStock > 0 && (
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <button
                onClick={handleAddToCart}
                disabled={adding || (variants.length > 0 && !selectedVariant)}
                className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>
              {/* Tooltip khi chưa chọn variant */}
              {variants.length > 0 && !selectedVariant && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  ⚠️ Vui lòng chọn cấu hình sản phẩm
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
            <div className="flex-1 relative group">
              <button
                onClick={handleBuyNow}
                disabled={adding || (variants.length > 0 && !selectedVariant)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Mua ngay
              </button>
              {/* Tooltip khi chưa chọn variant */}
              {variants.length > 0 && !selectedVariant && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  ⚠️ Vui lòng chọn cấu hình sản phẩm
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
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

        {/* Description */}
        {item.description && (
          <div className="rounded-xl bg-white border p-4 mt-6">
            <div className="font-medium mb-3 text-lg">Mô tả sản phẩm</div>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {item.description}
            </div>
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

