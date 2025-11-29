import { useState, useEffect } from "react";

const BRANDS = ["Apple","Dell","Asus","HP","Lenovo","MSI","Acer","Razer","LG","Samsung"];
const CATEGORIES = ["Gaming", "Business", "Ultrabook", "Workstation", "2-in-1", "Chromebook", "Other"];
const COMMON_TAGS = ["gaming", "office", "student", "creative", "portable", "powerful", "budget", "premium", "lightweight", "battery-life"];

export default function Filters({ params, onChange }){
  const [brand, setBrand] = useState(params.brand || "");
  const [category, setCategory] = useState(params.category || "");
  const [tags, setTags] = useState(params.tags ? (Array.isArray(params.tags) ? params.tags : [params.tags]) : []);
  const [q, setQ] = useState(params.q || "");
  const [minPrice, setMinPrice] = useState(params.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(params.maxPrice || "");
  const [ratingGte, setRatingGte] = useState(params.ratingGte || "");
  const [sort, setSort] = useState(params.sort || "-createdAt");

  useEffect(()=>{ 
    setBrand(params.brand||""); 
    setCategory(params.category||"");
    setTags(params.tags ? (Array.isArray(params.tags) ? params.tags : [params.tags]) : []);
    setQ(params.q||""); 
    setMinPrice(params.minPrice||""); 
    setMaxPrice(params.maxPrice||""); 
    setRatingGte(params.ratingGte||"");
    setSort(params.sort||"-createdAt"); 
  },[params]);

  const toggleTag = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const activeFiltersCount = [brand, category, tags.length > 0 ? tags.join(',') : '', q, minPrice, maxPrice, ratingGte].filter(Boolean).length;

  return (
    <div className="bg-gradient-to-br from-atlas-dark to-atlas-gray-dark rounded-2xl p-6 space-y-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Bộ lọc</h2>
        {activeFiltersCount > 0 && (
          <button 
            onClick={() => {
              setQ("");
              setBrand("");
              setCategory("");
              setTags([]);
              setMinPrice("");
              setMaxPrice("");
              setRatingGte("");
              setSort("-createdAt");
              onChange({ 
                q: undefined, 
                brand: undefined,
                category: undefined,
                tags: undefined,
                minPrice: undefined, 
                maxPrice: undefined,
                ratingGte: undefined,
                sort: "-createdAt" 
              });
            }}
            className="px-4 py-2 text-sm bg-atlas-lime text-atlas-dark rounded-xl hover:bg-atlas-green transition-all font-semibold shadow-md"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">Tìm kiếm</label>
        <input 
          className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/30 shadow-sm" 
          placeholder="Tìm kiếm..." 
          value={q} 
          onChange={e=>setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange({ 
                q: q || undefined, 
                brand: brand || undefined,
                category: category || undefined,
                tags: tags.length > 0 ? tags : undefined,
                minPrice: minPrice || undefined, 
                maxPrice: maxPrice || undefined,
                ratingGte: ratingGte || undefined,
                sort 
              });
            }
          }}
        />
      </div>

      {/* Brand Filter */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">Thương hiệu</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {BRANDS.map(b => (
            <label key={b} className="flex items-center text-white text-sm cursor-pointer hover:bg-white/20 rounded-xl px-3 py-2 transition">
              <input
                type="checkbox"
                checked={brand === b}
                onChange={(e) => setBrand(e.target.checked ? b : "")}
                className="mr-3 w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium">{b}</span>
            </label>
          ))}
        </div>
        <button 
          onClick={() => setBrand("")}
          className="mt-2 text-white text-xs underline hover:no-underline font-medium"
        >
          Tất cả thương hiệu
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">Danh mục</label>
        <select 
          className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white focus:outline-none focus:border-white focus:bg-white/30 shadow-sm" 
          value={category} 
          onChange={e=>setCategory(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat} className="bg-atlas-dark">{cat}</option>
          ))}
        </select>
      </div>

      {/* Tags Filter */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {COMMON_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                tags.includes(tag)
                  ? 'bg-atlas-lime text-atlas-dark shadow-md'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {tags.length > 0 && (
          <button 
            onClick={() => setTags([])}
            className="mt-2 text-white text-xs underline hover:no-underline font-medium"
          >
            Xóa tất cả tags
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">Giá (VNĐ)</label>
        <div className="space-y-2">
          <input 
            className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/30 shadow-sm" 
            type="number" 
            placeholder="Giá tối thiểu" 
            value={minPrice} 
            onChange={e=>setMinPrice(e.target.value)} 
          />
          <input 
            className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/30 shadow-sm" 
            type="number" 
            placeholder="Giá tối đa" 
            value={maxPrice} 
            onChange={e=>setMaxPrice(e.target.value)} 
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-white text-sm font-semibold mb-2">Đánh giá</label>
        <select 
          className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white focus:outline-none focus:border-white focus:bg-white/30 shadow-sm" 
          value={ratingGte} 
          onChange={e=>setRatingGte(e.target.value)}
        >
          <option value="">Tất cả đánh giá</option>
          <option value="5">⭐ 5 Sao</option>
          <option value="4">⭐ 4+ Sao</option>
          <option value="3">⭐ 3+ Sao</option>
        </select>
      </div>

      {/* Apply Button */}
      <button 
        className="w-full px-4 py-3 bg-atlas-lime hover:bg-atlas-green text-atlas-dark font-bold rounded-2xl transition-all shadow-lg" 
        onClick={()=>onChange({ 
          q: q || undefined, 
          brand: brand || undefined,
          category: category || undefined,
          tags: tags.length > 0 ? tags : undefined,
          minPrice: minPrice || undefined, 
          maxPrice: maxPrice || undefined,
          ratingGte: ratingGte || undefined,
          sort 
        })}
      >
        Áp dụng bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </button>

      {/* Compare Products */}
      <div className="pt-4 border-t-2 border-white/30">
        <h3 className="text-white text-sm font-semibold mb-2">So sánh sản phẩm</h3>
        <p className="text-white/80 text-xs">Chưa có sản phẩm để so sánh.</p>
      </div>

      {/* Wish List */}
      <div className="pt-4 border-t-2 border-white/30">
        <h3 className="text-white text-sm font-semibold mb-2">Danh sách yêu thích</h3>
        <p className="text-white/80 text-xs">Chưa có sản phẩm trong danh sách yêu thích.</p>
      </div>
    </div>
  );
}
