// frontend/src/screens/ProductsPage.jsx
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useProducts from "../hooks/useProducts";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

export default function ProductsPage({ preset }) {
  const [searchParams] = useSearchParams();

  // ✅ set filter mặc định theo preset + override bằng query trên URL
  const initialParams = useMemo(() => {
    const obj = {};

    // preset theo route
    if (preset === "new") obj.sort = "-createdAt";
    if (preset === "best") obj.sort = "-rating";
    if (preset === "laptop") obj.category = "laptop";

    // override bằng query (nếu có)
    const sort = searchParams.get("sort");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const limit = searchParams.get("limit");

    if (sort) obj.sort = sort;
    if (category) obj.category = category;
    if (brand) obj.brand = brand;
    if (limit) obj.limit = parseInt(limit);

    return obj;
  }, [searchParams, preset]);

  const { data, meta, loading, error, params, setQuery, setPage } =
    useProducts(initialParams);

  const [viewMode, setViewMode] = useState("grid");

  const pageTitle =
    preset === "new"
      ? "🆕 Sản phẩm mới"
      : preset === "best"
      ? "⭐ Bán chạy nhất"
      : preset === "laptop"
      ? "💻 Laptop nổi bật"
      : "Tất cả sản phẩm";

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Tiêu đề trang */}
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{pageTitle}</h1>
        <p className="text-gray-600">
          Khám phá các sản phẩm {pageTitle.replace(/^[^ ]+ /, "").toLowerCase()}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <details className="lg:hidden">
            <summary className="cursor-pointer bg-gradient-to-br from-atlas-dark to-atlas-gray-dark text-white rounded-2xl p-4 mb-4 shadow-lg font-semibold flex items-center justify-between list-none">
              <span>🔍 Bộ lọc</span>
              <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4">
              <Filters
                params={params}
                onChange={(filters) =>
                  setQuery({ ...filters, _refresh: Date.now() })
                }
              />
            </div>
          </details>

          <div className="hidden lg:block">
            <Filters
              params={params}
              onChange={(filters) =>
                setQuery({ ...filters, _refresh: Date.now() })
              }
            />
          </div>
        </aside>

        {/* Main products */}
        <div className="flex-1">
          {/* Top bar */}
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-3 md:4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 shadow-md">
            <div className="text-xs sm:text-sm text-gray-700 font-semibold">
              Sản phẩm{" "}
              {((meta.page - 1) * meta.limit) + 1}-
              {Math.min(meta.page * meta.limit, meta.total)} trong tổng số {meta.total}
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
              {/* View mode */}
              <div className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-atlas-blue text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
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
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Sort */}
              <select
                className="bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-3 md:px-4 py-2 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-atlas-blue shadow-sm flex-1 sm:flex-none min-w-0"
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

              {/* Limit */}
              <select
                className="bg-white border-2 border-gray-300 text-gray-900 rounded-xl px-3 md:px-4 py-2 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-atlas-blue shadow-sm flex-1 sm:flex-none min-w-0"
                value={meta.limit}
                onChange={(e) => setQuery({ limit: parseInt(e.target.value) })}
              >
                <option value="12">Hiển thị: 12</option>
                <option value="24">Hiển thị: 24</option>
                <option value="36">Hiển thị: 36</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12 text-gray-600">
              <div className="inline-block w-12 h-12 border-4 border-atlas-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 font-medium">Đang tải...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-2xl p-4 text-red-700 shadow-sm">
              Lỗi: {error?.error || "unknown"}
            </div>
          )}

          {/* Empty */}
          {!loading && data?.length === 0 && (
            <div className="text-center py-12 text-gray-600 font-medium">
              Không có sản phẩm phù hợp.
            </div>
          )}

          {/* List */}
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
