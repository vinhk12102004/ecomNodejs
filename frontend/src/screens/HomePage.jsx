import { useState } from "react";
import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import SectionGrid from "../components/SectionGrid";

export default function HomePage() {
  const { data, meta, loading, error, params, setQuery, setPage } = useProducts();
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Banner Section */}
      <section className="bg-gradient-to-r from-atlas-blue to-atlas-green mb-8 rounded-2xl overflow-hidden shadow-xl">
        <div className="relative h-64 md:h-96 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-atlas-blue/90 to-atlas-green/90"></div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              ASUS TUF GAMING
            </h1>
            <p className="text-xl md:text-2xl mb-6 drop-shadow-md">
              HIGH PERFORMANCE AT AN AFFORDABLE PRICE
            </p>
            <button className="px-8 py-3 bg-atlas-lime text-atlas-dark font-bold rounded-2xl hover:bg-atlas-green transition-all shadow-lg hover:shadow-xl">
              SHOP NOW
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURED SECTIONS --- */}
      <div className="space-y-12 mb-12">
        {/* New Products */}
        <SectionGrid
          title="🆕 Sản phẩm mới"
          query={{ sort: "-createdAt", limit: 5 }}
          linkTo="/products?sort=-createdAt"
        />

        {/* Best Sellers */}
        <SectionGrid
          title="⭐ Bán chạy nhất"
          query={{ sort: "-rating", limit: 5 }}
          linkTo="/products?sort=-rating"
        />

        {/* Featured Category Example */}
        <SectionGrid
          title="💻 Laptop nổi bật"
          query={{ category: "laptop", limit: 5 }}
          linkTo="/products?category=laptop"
        />
      </div>

      {/* --- MAIN PRODUCT SECTION WITH FILTERS --- */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <Filters
            params={params}
            onChange={(filters) => {
              // ép React gọi lại useEffect trong useProducts.js
              setQuery({ ...filters, _refresh: Date.now() });
            }}
          />
        </aside>

        {/* Main Products Area */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="text-sm text-gray-700 font-semibold">
              Sản phẩm{" "}
              {((meta.page - 1) * meta.limit) + 1}-
              {Math.min(meta.page * meta.limit, meta.total)} trong tổng số {meta.total}
            </div>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-atlas-blue text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-atlas-blue text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="List View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <select
                className="bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-atlas-blue shadow-sm"
                value={params.sort || "-createdAt"}
                onChange={(e) => setQuery({ sort: e.target.value })}
              >
                <option value="-createdAt">Mới nhất</option>
                <option value="-price">Giá: Cao đến thấp</option>
                <option value="price">Giá: Thấp đến cao</option>
                <option value="-rating">Đánh giá</option>
                <option value="name">Tên: A-Z</option>
                <option value="-name">Tên: Z-A</option>
              </select>
              <select
                className="bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-atlas-blue shadow-sm"
                value={meta.limit}
                onChange={(e) => setQuery({ limit: parseInt(e.target.value) })}
              >
                <option value="12">Hiển thị: 12</option>
                <option value="24">Hiển thị: 24</option>
                <option value="36">Hiển thị: 36</option>
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

          {/* Products Grid/List */}
          {!loading && data && data.length > 0 && (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.map((p) => (
                    <ProductCard key={p._id} item={p} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {data.map((p) => (
                    <ProductCard key={p._id} item={p} viewMode="list" />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center mt-10 mb-16">
                <Pagination
                  total={meta?.total}
                  page={meta?.page}
                  limit={meta?.limit}
                  onPage={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
