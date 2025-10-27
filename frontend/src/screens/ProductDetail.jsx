import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct } from "../lib/api";

export default function ProductDetail(){
  const { id } = useParams();
  const [item,setItem] = useState(null);
  const [error,setError] = useState(null);

  useEffect(()=>{
    let m=true;
    getProduct(id).then(r=> m && setItem(r.data)).catch(e=> m && setError(e?.response?.data || { error: e.message }) );
    return ()=>{ m=false; };
  },[id]);

  if(error) return <div className="text-rose-600">Lỗi: {error?.error}</div>;
  if(!item) return <div className="text-slate-500">Đang tải...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="rounded-xl bg-white border p-3">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-auto"/> : <div className="h-64 bg-slate-100 rounded-lg"/>}
      </div>
      <div className="space-y-3">
        <Link to="/" className="text-sm text-slate-500 hover:underline">← Quay lại danh sách</Link>
        <h1 className="text-2xl font-semibold">{item.name}</h1>
        <div className="text-slate-500">{item.brand}</div>
        <div className="text-rose-600 text-xl font-bold">{(item.price ?? 0).toLocaleString("vi-VN")} ₫</div>
        <div className="rounded-xl bg-white border p-3">
          <div className="font-medium mb-2">Thông số</div>
          <ul className="text-sm space-y-1">
            <li>CPU: {item?.specs?.cpu?.model ?? "-"}</li>
            <li>RAM: {item?.specs?.ramGB ?? "-"} GB</li>
            <li>GPU: {item?.specs?.gpu?.model ?? "-"}</li>
            <li>Màn hình: {item?.specs?.screen?.sizeInch ?? "-"}" • {item?.specs?.screen?.resolution ?? "-"}</li>
            <li>Lưu trữ: {item?.specs?.storage?.sizeGB ?? "-"} GB {item?.specs?.storage?.type ?? ""}</li>
            <li>Trọng lượng: {item?.specs?.weightKg ?? "-"} kg</li>
            <li>Pin: {item?.specs?.batteryWh ?? "-"} Wh</li>
            <li>HĐH: {item?.specs?.os ?? "-"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

