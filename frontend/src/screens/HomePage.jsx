import { useState } from "react";
import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import SectionGrid from "../components/SectionGrid";

export default function HomePage(){
  const { data, meta, loading, error, params, setQuery, setPage } = useProducts();
  const [showAllProducts, setShowAllProducts] = useState(true);

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Banner Section */}
      <section className="bg-gradient-to-r from-atlas-blue to-atlas-green mb-8 rounded-2xl overflow-hidden shadow-xl">
        <div className="relative h-64 md:h-96 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-atlas-blue/90 to-atlas-green/90"></div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">ASUS TUF GAMING</h1>
            <p className="text-xl md:text-2xl mb-6 drop-shadow-md">HIGH PERFORMANCE AT AN AFFORDABLE PRICE</p>
            <button className="px-8 py-3 bg-atlas-lime text-atlas-dark font-bold rounded-2xl hover:bg-atlas-green transition-all shadow-lg hover:shadow-xl">
              SHOP NOW
            </button>
          </div>
        </div>
      </section>

      {/* Products Section with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <Filters params={params} onChange={setQuery} />
        </aside>

        {/* Main Products Area */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="text-sm text-gray-700 font-semibold">
              Sản phẩm {((meta.page - 1) * meta.limit) + 1}-{Math.min(meta.page * meta.limit, meta.total)} trong tổng số {meta.total}
            </div>
            <div className="flex items-center gap-4">
              <select 
                className="bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-atlas-blue shadow-sm"
                value={params.sort || "-createdAt"}
                onChange={(e) => setQuery({ sort: e.target.value })}
              >
                <option value="-createdAt">Mới nhất</option>
                <option value="-price">Giá: Cao đến thấp</option>
                <option value="price">Giá: Thấp đến cao</option>
                <option value="-rating">Đánh giá</option>
              </select>
              <select 
                className="bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-atlas-blue shadow-sm"
                value={meta.limit}
                onChange={(e) => setQuery({ limit: parseInt(e.target.value) })}
              >
                <option value="20">Hiển thị: 20</option>
                <option value="40">Hiển thị: 40</option>
                <option value="60">Hiển thị: 60</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 text-gray-600">
              <div className="inline-block w-12 h-12 border-4 border-atlas-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 font-medium">Đang tải...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-2xl p-4 text-red-700 shadow-sm">
              Lỗi: {error?.error || "unknown"}
            </div>
          )}

          {/* Empty State */}
          {!loading && data?.length === 0 && (
            <div className="text-center py-12 text-gray-600 font-medium">
              Không có sản phẩm phù hợp.
            </div>
          )}

          {/* Products Grid */}
          {!loading && data && data.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {data.map(p => <ProductCard key={p._id} item={p} />)}
              </div>

              {/* Pagination */}
              {meta.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination total={meta.total} page={meta.page} limit={meta.limit} onPage={setPage}/>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
