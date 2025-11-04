import { useState, useEffect } from "react";

const BRANDS = ["Apple","Dell","Asus","HP","Lenovo","MSI","Acer"];

export default function Filters({ params, onChange }){
  const [brand, setBrand] = useState(params.brand || "");
  const [q, setQ] = useState(params.q || "");
  const [minPrice, setMinPrice] = useState(params.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(params.maxPrice || "");
  const [ratingGte, setRatingGte] = useState(params.ratingGte || "");
  const [sort, setSort] = useState(params.sort || "-createdAt");

  useEffect(()=>{ 
    setBrand(params.brand||""); 
    setQ(params.q||""); 
    setMinPrice(params.minPrice||""); 
    setMaxPrice(params.maxPrice||""); 
    setRatingGte(params.ratingGte||"");
    setSort(params.sort||"-createdAt"); 
  },[params]);

  return (
    <div className="grid md:grid-cols-6 gap-3">
      {/* Search Input */}
      <input 
        className="border rounded-lg px-3 py-2" 
        placeholder="Tìm kiếm (vd: MacBook)" 
        value={q} 
        onChange={e=>setQ(e.target.value)}
      />
      
      {/* Brand Filter */}
      <select className="border rounded-lg px-3 py-2" value={brand} onChange={e=>setBrand(e.target.value)}>
        <option value="">Tất cả hãng</option>
        {BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
      </select>
      
      {/* Price Range */}
      <input 
        className="border rounded-lg px-3 py-2" 
        type="number" 
        placeholder="Giá từ" 
        value={minPrice} 
        onChange={e=>setMinPrice(e.target.value)} 
      />
      <input 
        className="border rounded-lg px-3 py-2" 
        type="number" 
        placeholder="Giá đến" 
        value={maxPrice} 
        onChange={e=>setMaxPrice(e.target.value)} 
      />
      
      {/* Rating Filter */}
      <select className="border rounded-lg px-3 py-2" value={ratingGte} onChange={e=>setRatingGte(e.target.value)}>
        <option value="">Tất cả đánh giá</option>
        <option value="5">⭐ 5 sao</option>
        <option value="4">⭐ 4 sao trở lên</option>
        <option value="3">⭐ 3 sao trở lên</option>
      </select>
      
      {/* Sort Options */}
      <select className="border rounded-lg px-3 py-2" value={sort} onChange={e=>setSort(e.target.value)}>
        <option value="-createdAt">Mới nhất</option>
        <option value="-price">Giá giảm dần</option>
        <option value="price">Giá tăng dần</option>
        <option value="name">Tên A → Z</option>
        <option value="-name">Tên Z → A</option>
        <option value="-rating">Đánh giá cao nhất</option>
      </select>
      
      {/* Action Buttons */}
      <div className="md:col-span-6 flex gap-2">
        <button 
          className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition" 
          onClick={()=>onChange({ 
            q: q || undefined, 
            brand: brand || undefined, 
            minPrice: minPrice || undefined, 
            maxPrice: maxPrice || undefined,
            ratingGte: ratingGte || undefined,
            sort 
          })}
        >
          Áp dụng
        </button>
        <button 
          className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition" 
          onClick={()=>{
            setQ("");
            setBrand("");
            setMinPrice("");
            setMaxPrice("");
            setRatingGte("");
            setSort("-createdAt");
            onChange({ 
              q: undefined, 
              brand: undefined, 
              minPrice: undefined, 
              maxPrice: undefined,
              ratingGte: undefined,
              sort: "-createdAt" 
            });
          }}
        >
          Xoá lọc
        </button>
      </div>
    </div>
  );
}

