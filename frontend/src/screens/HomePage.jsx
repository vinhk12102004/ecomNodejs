import { useState } from "react";
import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import SectionGrid from "../components/SectionGrid";

export default function HomePage(){
  const { data, meta, loading, error, params, setQuery, setPage } = useProducts();
  const [showAllProducts, setShowAllProducts] = useState(false);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 rounded-xl">
        <h1 className="text-4xl font-bold mb-2">🎯 Laptop chất lượng cao</h1>
        <p className="text-slate-600">Tìm laptop hoàn hảo cho công việc, học tập và giải trí</p>
      </section>

      {/* New Products Section */}
      <SectionGrid
        title="🆕 Sản phẩm mới"
        query={{ sort: "-createdAt", limit: 8 }}
        linkTo="/products?sort=-createdAt"
      />

      {/* Best Sellers Section */}
      <SectionGrid
        title="🔥 Bán chạy nhất"
        query={{ sort: "-rating", limit: 8 }}
        linkTo="/products?sort=-rating"
      />

      {/* Gaming Laptops Section */}
      <SectionGrid
        title="🎮 Laptop Gaming"
        query={{ brand: ["MSI", "Asus", "Razer"], limit: 8 }}
        linkTo="/products?brand=MSI,Asus,Razer"
      />

      {/* Business Laptops Section */}
      <SectionGrid
        title="💼 Laptop Doanh nghiệp"
        query={{ brand: ["Dell", "HP", "Lenovo"], limit: 8 }}
        linkTo="/products?brand=Dell,HP,Lenovo"
      />

      {/* Ultrabooks Section */}
      <SectionGrid
        title="✨ Laptop Mỏng nhẹ"
        query={{ brand: ["Apple", "LG", "Samsung"], limit: 8 }}
        linkTo="/products?brand=Apple,LG,Samsung"
      />

      {/* Divider */}
      <div className="border-t pt-12">
        <button
          onClick={() => setShowAllProducts(!showAllProducts)}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {showAllProducts ? "Ẩn danh sách đầy đủ" : "Xem tất cả sản phẩm với bộ lọc"}
          <svg 
            className={`w-5 h-5 transition-transform ${showAllProducts ? "rotate-180" : ""}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* All Products with Filters */}
      {showAllProducts && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Tất cả sản phẩm</h2>

          <Filters params={params} onChange={setQuery} />

          {loading && <div className="text-slate-500">Đang tải...</div>}
          {error && <div className="text-rose-600">Lỗi: {error?.error || "unknown"}</div>}

          {!loading && data?.length === 0 && (
            <div className="text-slate-500">Không có sản phẩm phù hợp.</div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.map(p => <ProductCard key={p._id} item={p} />)}
          </div>

          <div className="flex justify-center">
            <Pagination total={meta.total} page={meta.page} limit={meta.limit} onPage={setPage}/>
          </div>
        </section>
      )}
    </div>
  );
}

