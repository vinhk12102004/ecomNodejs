import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";

export default function HomePage(){
  const { data, meta, loading, error, params, setQuery, setPage } = useProducts();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Laptop nổi bật</h1>

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
  );
}

