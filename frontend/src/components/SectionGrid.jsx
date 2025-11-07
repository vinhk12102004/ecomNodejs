import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../lib/api";
import ProductCard from "./ProductCard";

export default function SectionGrid({ title, query, linkTo }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts(query);
        if (mounted) {
          setProducts(response.data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [query]);

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="text-slate-500">Đang tải...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="text-red-500">Lỗi: {error}</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show empty sections
  }
    return (
    <section className="mb-12 overflow-hidden relative">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {linkTo && (
          <Link
            to={linkTo}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Auto-scroll Product Row */}
      <div className="relative overflow-hidden">
        <div
          className="flex gap-4 slide-left"
          style={{
            width: `${products.length * 320}px`,
            animationDuration: `${products.length * 3}s`,
          }}
        >
          {products.concat(products).map((product, i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <ProductCard item={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

