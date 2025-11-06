import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice.js";

export default function ProductCard({ item }){
  // Use new images array (first image) or fallback to old image field
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : item.image;
  
  return (
    <Link to={`/product/${item._id}`} className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-atlas-blue hover:shadow-xl transition-all duration-300 p-4 flex flex-col gap-3 shadow-md">
      {/* Product Image */}
      <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
        {imageUrl
          ? <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
          : <div className="text-gray-400 text-sm">📷 No Image</div>}
      </div>
      
      {/* In Stock Badge */}
      {item.stock > 0 && (
        <div className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full inline-block">✓ Còn hàng</div>
      )}
      
      {/* Product Info */}
      <div className="flex-1 space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{item.brand}</div>
        <div className="font-semibold text-gray-900 group-hover:text-atlas-blue transition line-clamp-2 text-sm leading-tight">{item.name}</div>
        
        {/* Rating */}
        {item.rating && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold">{item.rating.toFixed(1)}</span>
            <span className="text-gray-500">({item.rating || 0} đánh giá)</span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2">
          {item.price && (
            <>
              <span className="text-gray-400 line-through text-xs">{formatPrice(item.price * 1.1)}</span>
              <span className="font-bold text-lg bg-gradient-to-r from-atlas-blue to-atlas-green bg-clip-text text-transparent">{formatPrice(item.price ?? 0)}</span>
            </>
          )}
        </div>
        
        {/* Specs */}
        <div className="text-xs text-gray-500 line-clamp-1">
          {item?.specs?.ramGB ?? "-"}GB RAM • {item?.specs?.cpu?.model ?? "-"}
        </div>
      </div>
    </Link>
  );
}
