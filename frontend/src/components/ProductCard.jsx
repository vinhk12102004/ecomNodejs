import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice.js";

export default function ProductCard({ item, viewMode = "grid" }){
  // Use new images array (first image) or fallback to old image field
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : item.image;
  
  // List View Layout
  if (viewMode === "list") {
    return (
      <Link to={`/product/${item._id}`} className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-atlas-blue hover:shadow-xl transition-all duration-300 p-3 md:p-4 flex flex-col sm:flex-row gap-4 md:gap-6 shadow-md">
        {/* Product Image - Smaller in list view, responsive */}
        <div className="w-full sm:w-32 md:w-48 h-32 sm:h-32 md:h-48 flex-shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
          {imageUrl
            ? <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
            : <div className="text-gray-400 text-sm">📷 No Image</div>}
        </div>
        
        {/* Product Info - Horizontal Layout */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{item.brand}</div>
              {item.category && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{item.category}</span>
              )}
              {item.stock > 0 && (
                <div className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">✓ Còn hàng</div>
              )}
            </div>
            <div className="font-semibold text-base md:text-lg text-gray-900 group-hover:text-atlas-blue transition">{item.name}</div>
            
            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
            )}
            
            {/* Specs */}
            <div className="text-sm text-gray-500">
              {item?.specs?.ramGB ?? "-"}GB RAM • {item?.specs?.cpu?.model ?? "-"} • {item?.specs?.storage?.sizeGB ?? "-"}GB {item?.specs?.storage?.type ?? ""}
            </div>
            
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
          
          {/* Bottom Section - Rating and Price */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200">
            {/* Rating */}
            {item.rating && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-base md:text-lg">⭐</span>
                <span className="font-semibold text-gray-900 text-sm md:text-base">{item.rating.toFixed(1)}</span>
                <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">({item.rating || 0} đánh giá)</span>
              </div>
            )}
            
            {/* Price */}
            {item.price && (
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-gray-400 line-through text-xs md:text-sm">{formatPrice(item.price * 1.1)}</span>
                <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-atlas-blue to-atlas-green bg-clip-text text-transparent">{formatPrice(item.price ?? 0)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
  
  // Grid View Layout (Default)
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
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{item.brand}</div>
          {item.category && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{item.category}</span>
          )}
        </div>
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
        
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
