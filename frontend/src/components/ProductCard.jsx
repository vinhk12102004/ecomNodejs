import { Link } from "react-router-dom";

export default function ProductCard({ item }){
  // Use new images array (first image) or fallback to old image field
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : item.image;
  
  return (
    <Link to={`/product/${item._id}`} className="group rounded-xl bg-white border hover:shadow-md transition p-3 flex flex-col gap-3">
      {/* Product Image */}
      <div className="w-full aspect-[4/3] rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
        {imageUrl
          ? <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          : <div className="text-slate-400 text-sm">📷 No Image</div>}
      </div>
      
      {/* Product Info */}
      <div className="flex-1 space-y-1">
        <div className="text-xs text-slate-500 uppercase">{item.brand}</div>
        <div className="font-medium group-hover:text-blue-600 transition line-clamp-2">{item.name}</div>
        
        {/* Rating */}
        {item.rating && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-yellow-500">⭐</span>
            <span className="font-medium">{item.rating.toFixed(1)}</span>
          </div>
        )}
        
        {/* Price */}
        <div className="font-bold text-lg text-blue-600">${(item.price ?? 0).toLocaleString()}</div>
        
        {/* Specs */}
        <div className="text-xs text-slate-500 line-clamp-1">
          {item?.specs?.ramGB ?? "-"}GB RAM • {item?.specs?.cpu?.model ?? "-"}
        </div>
      </div>
    </Link>
  );
}

