import { useState, useEffect } from "react";

const BRANDS = ["Apple","Dell","Asus","HP","Lenovo","MSI","Acer"];

export default function Filters({ params, onChange }){
  const [brand, setBrand] = useState(params.brand || "");
  const [q, setQ] = useState(params.q || "");
  const [minPrice, setMinPrice] = useState(params.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(params.maxPrice || "");
  const [sort, setSort] = useState(params.sort || "-createdAt");

  useEffect(()=>{ setBrand(params.brand||""); setQ(params.q||""); setMinPrice(params.minPrice||""); setMaxPrice(params.maxPrice||""); setSort(params.sort||"-createdAt"); },[params]);

  return (
    <div className="grid md:grid-cols-5 gap-3">
      <input className="border rounded-lg px-3 py-2" placeholder="Tìm kiếm (vd: MacBook)" value={q} onChange={e=>setQ(e.target.value)}/>
      <select className="border rounded-lg px-3 py-2" value={brand} onChange={e=>setBrand(e.target.value)}>
        <option value="">Tất cả hãng</option>
        {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
      </select>
      <input className="border rounded-lg px-3 py-2" type="number" placeholder="Giá từ" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
      <input className="border rounded-lg px-3 py-2" type="number" placeholder="Giá đến" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
      <select className="border rounded-lg px-3 py-2" value={sort} onChange={e=>setSort(e.target.value)}>
        <option value="-createdAt">Mới nhất</option>
        <option value="-price">Giá giảm dần</option>
        <option value="price">Giá tăng dần</option>
      </select>
      <div className="md:col-span-5 flex gap-2">
        <button className="px-3 py-2 rounded-lg bg-slate-900 text-white" onClick={()=>onChange({ q: q || undefined, brand: brand || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, sort })}>Áp dụng</button>
        <button className="px-3 py-2 rounded-lg border" onClick={()=>onChange({ q: undefined, brand: undefined, minPrice: undefined, maxPrice: undefined, sort: "-createdAt" })}>Xoá lọc</button>
      </div>
    </div>
  );
}

