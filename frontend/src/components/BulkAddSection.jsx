import { useState, useEffect } from "react";
import { getProducts, getVariants } from "../lib/api";
import useCart from "../hooks/useCart";
import BulkAddModal from "./BulkAddModal";

/**
 * BulkAddSection - Select multiple products/variants and add to cart at once
 */
export default function BulkAddSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]); // [{ productId, skuId?, qty, name, variant? }]
  const [showVariants, setShowVariants] = useState({}); // { productId: [variants] }
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  
  const { addBulk } = useCart();

  // Fetch sample products for bulk add
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ limit: 6, sort: "-rating" });
        setProducts(response.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Toggle product selection
  const toggleProduct = async (product) => {
    const productId = product._id;
    
    // Check if product already selected
    const isSelected = selectedItems.some(item => item.productId === productId && !item.skuId);
    
    if (isSelected) {
      // Remove all items for this product
      setSelectedItems(prev => prev.filter(item => item.productId !== productId));
    } else {
      // Fetch variants to determine if we need to show variant selector
      try {
        const variantsResponse = await getVariants(productId);
        const variants = variantsResponse.data || [];
        
        if (variants.length > 0) {
          // Show variants for selection
          setShowVariants(prev => ({ ...prev, [productId]: variants }));
        } else {
          // No variants, add product directly
          setSelectedItems(prev => [
            ...prev,
            { 
              productId, 
              qty: 1, 
              name: product.name,
              price: product.price,
              image: product.images?.[0] || product.image
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch variants:', err);
        // Fallback: add product without variant
        setSelectedItems(prev => [
          ...prev,
          { 
            productId, 
            qty: 1, 
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.image
          }
        ]);
      }
    }
  };

  // Select a specific variant
  const selectVariant = (product, variant) => {
    setSelectedItems(prev => [
      ...prev.filter(item => item.productId !== product._id), // Remove existing product selections
      {
        productId: product._id,
        skuId: variant.sku,
        qty: 1,
        name: `${product.name} - ${variant.name}`,
        variant: variant.name,
        price: variant.price,
        image: product.images?.[0] || product.image
      }
    ]);
    
    // Close variant selector
    setShowVariants(prev => {
      const next = { ...prev };
      delete next[product._id];
      return next;
    });
  };

  // Update quantity
  const updateQty = (index, newQty) => {
    if (newQty < 1) return;
    setSelectedItems(prev => {
      const next = [...prev];
      next[index].qty = newQty;
      return next;
    });
  };

  // Remove item
  const removeItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Bulk add to cart
  const handleBulkAdd = async () => {
    if (selectedItems.length === 0) return;

    const items = selectedItems.map(item => ({
      productId: item.productId,
      skuId: item.skuId,
      qty: item.qty
    }));

    const result = await addBulk(items);
    
    setBulkResults(result);
    setModalOpen(true);
    
    if (result.success) {
      // Clear selection on success
      setSelectedItems([]);
    }
  };

  const isProductSelected = (productId) => {
    return selectedItems.some(item => item.productId === productId);
  };

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🛒 Thêm nhiều sản phẩm cùng lúc</h2>
        <div className="text-slate-500">Đang tải...</div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">🛒 Thêm nhiều sản phẩm cùng lúc</h2>
        {selectedItems.length > 0 && (
          <button
            onClick={handleBulkAdd}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>Thêm {selectedItems.length} sản phẩm vào giỏ</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {products.map((product) => (
          <div
            key={product._id}
            className={`
              border-2 rounded-lg p-4 transition cursor-pointer
              ${isProductSelected(product._id)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
              }
            `}
          >
            <div className="flex items-start gap-3" onClick={() => toggleProduct(product)}>
              <input
                type="checkbox"
                checked={isProductSelected(product._id)}
                onChange={() => {}}
                className="mt-1 w-5 h-5 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.name}
                  className="w-full aspect-[4/3] object-cover rounded-lg mb-2"
                />
                <div className="font-medium text-sm line-clamp-2">{product.name}</div>
                <div className="text-blue-600 font-bold mt-1">${product.price.toLocaleString()}</div>
              </div>
            </div>

            {/* Variant Selector */}
            {showVariants[product._id] && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="text-xs font-medium text-gray-600">Chọn cấu hình:</div>
                {showVariants[product._id].map(variant => (
                  <button
                    key={variant.sku}
                    onClick={() => selectVariant(product, variant)}
                    className="w-full text-left p-2 border rounded hover:bg-blue-50 hover:border-blue-300 transition text-xs"
                  >
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-gray-600">${variant.price.toLocaleString()} • Còn {variant.stock}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50">
          <div className="font-medium mb-3">Đã chọn {selectedItems.length} sản phẩm:</div>
          <div className="space-y-2">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-clamp-1">{item.name}</div>
                  {item.variant && (
                    <div className="text-xs text-gray-600">{item.variant}</div>
                  )}
                  <div className="text-xs text-blue-600 font-medium">${item.price.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(idx, item.qty - 1)}
                    className="w-8 h-8 border rounded hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{item.qty}</span>
                  <button
                    onClick={() => updateQty(idx, item.qty + 1)}
                    className="w-8 h-8 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(idx)}
                    className="ml-2 w-8 h-8 text-red-600 hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      <BulkAddModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        results={bulkResults?.results || []}
        warnings={bulkResults?.warnings || []}
      />
    </section>
  );
}

