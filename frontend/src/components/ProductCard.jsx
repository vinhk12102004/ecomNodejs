import { Link } from "react-router-dom";

export default function ProductCard({ item }){
  return (
    <Link to={`/product/${item._id}`} className="group rounded-xl bg-white border hover:shadow-md transition p-3 flex gap-3">
      <div className="w-28 h-28 shrink-0 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
          : <div className="text-slate-400 text-sm">No Image</div>}
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-500">{item.brand}</div>
        <div className="font-medium group-hover:underline">{item.name}</div>
        <div className="mt-1 font-semibold text-rose-600">{(item.price ?? 0).toLocaleString("vi-VN")} ₫</div>
        <div className="mt-1 text-xs text-slate-500">RAM {item?.specs?.ramGB ?? "-"}GB • {item?.specs?.cpu?.model ?? "-"}</div>
      </div>
    </Link>
  );
}

