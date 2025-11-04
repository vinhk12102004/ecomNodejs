import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";

/**
 * Calculate cart totals and count
 * @param {Array} items - Cart items
 * @returns {Object} { subtotal, count }
 */
function calculateTotals(items) {
  let subtotal = 0;
  let count = 0;
  
  for (const item of items) {
    const lineTotal = item.priceAtAdd * item.qty;
    subtotal += lineTotal;
    count += item.qty;
  }
  
  return { subtotal, count };
}

/**
 * Format cart response with calculated fields
 * @param {Object} cart - Mongoose cart document
 * @param {Array} warnings - Optional warnings
 * @returns {Object} Formatted cart response
 */
function formatCartResponse(cart, warnings = []) {
  const items = cart ? cart.items : [];
  const { subtotal, count } = calculateTotals(items);
  
  return {
    items: items.map(item => ({
      product: item.product,
      skuId: item.skuId,
      qty: item.qty,
      priceAtAdd: item.priceAtAdd,
      nameSnapshot: item.nameSnapshot,
      imageSnapshot: item.imageSnapshot,
      lineTotal: item.priceAtAdd * item.qty
    })),
    subtotal,
    count,
    ...(warnings.length > 0 && { warnings })
  };
}

/**
 * Get cart for user or guest
 * @param {Object} params - { userId?, guestToken? }
 * @returns {Object} Cart data
 */
export async function getCart({ userId, guestToken }) {
  const query = userId ? { userId } : { guestToken };
  
  const cart = await Cart.findOne(query).populate('items.product');
  
  if (!cart) {
    return {
      items: [],
      subtotal: 0,
      count: 0
    };
  }

  return formatCartResponse(cart);
}

/**
 * Get cart item count only (for badge)
 * @param {Object} params - { userId?, guestToken? }
 * @returns {Object} { count }
 */
export async function getCartCount({ userId, guestToken }) {
  const query = userId ? { userId } : { guestToken };
  
  const cart = await Cart.findOne(query).lean();
  
  if (!cart) {
    return { count: 0 };
  }

  const count = cart.items.reduce((sum, item) => sum + item.qty, 0);
  
  return { count };
}

/**
 * Add item to cart with MERGE logic
 * @param {Object} params - { userId?, guestToken?, productId, skuId?, qty }
 * @returns {Object} Cart data with warnings
 */
export async function addItem({ userId, guestToken, productId, skuId = null, qty = 1 }) {
  const warnings = [];
  
  // Validate product exists and is active
  const product = await Product.findById(productId);
  
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (!product.isActive) {
    const error = new Error('Product is not available');
    error.statusCode = 400;
    throw error;
  }

  // If skuId is provided, validate and use variant
  let variant = null;
  let itemPrice = product.price;
  let itemStock = product.stock;
  let itemName = product.name;
  
  if (skuId) {
    variant = await ProductVariant.findOne({ 
      sku: skuId.toUpperCase(),
      product: productId,
      isActive: true
    });
    
    if (!variant) {
      const error = new Error('Variant not found or not available');
      error.statusCode = 404;
      throw error;
    }
    
    // Use variant's price and stock
    itemPrice = variant.price;
    itemStock = variant.stock;
    itemName = `${product.name} - ${variant.name}`;
  }

  // Check if stock is available
  if (itemStock < 1) {
    const error = new Error('Product is out of stock');
    error.statusCode = 400;
    throw error;
  }

  // Find or create cart
  const query = userId ? { userId } : { guestToken };
  let cart = await Cart.findOne(query);

  if (!cart) {
    cart = new Cart({
      ...(userId ? { userId } : { guestToken }),
      items: []
    });
  }

  // Find matching item (by productId + skuId)
  const itemKey = skuId ? skuId.toUpperCase() : productId.toString();
  const existingItemIndex = cart.items.findIndex(item => {
    if (skuId) {
      return item.skuId && item.skuId.toUpperCase() === itemKey;
    }
    return !item.skuId && item.product.toString() === itemKey;
  });

  let targetQty = qty;

  if (existingItemIndex > -1) {
    // Item exists - merge quantity
    const currentQty = cart.items[existingItemIndex].qty;
    targetQty = currentQty + qty;
  }

  // Apply stock cap
  if (targetQty > itemStock) {
    targetQty = itemStock;
    warnings.push({
      type: 'stock_cap',
      productId: productId.toString(),
      skuId: skuId || null,
      message: `Only ${itemStock} available in stock`,
      allowedQty: itemStock
    });
  }

  // Apply maxPerOrder cap (from product level)
  if (product.maxPerOrder && targetQty > product.maxPerOrder) {
    targetQty = product.maxPerOrder;
    warnings.push({
      type: 'max_per_order',
      productId: productId.toString(),
      skuId: skuId || null,
      message: `Maximum ${product.maxPerOrder} per order`,
      allowedQty: product.maxPerOrder
    });
  }

  // Ensure at least qty 1
  if (targetQty < 1) {
    const error = new Error('Product is out of stock');
    error.statusCode = 400;
    throw error;
  }

  if (existingItemIndex > -1) {
    // Update existing item
    cart.items[existingItemIndex].qty = targetQty;
  } else {
    // Add new item with snapshots
    cart.items.push({
      product: productId,
      skuId: skuId ? skuId.toUpperCase() : null,
      qty: targetQty,
      priceAtAdd: itemPrice,
      nameSnapshot: itemName,
      imageSnapshot: product.image
    });
  }

  await cart.save();
  await cart.populate('items.product');

  return formatCartResponse(cart, warnings);
}

/**
 * Update item quantity
 * @param {Object} params - { userId?, guestToken?, productId, skuId?, qty }
 * @returns {Object} Cart data
 */
export async function updateItemQty({ userId, guestToken, productId, skuId = null, qty }) {
  if (qty < 1) {
    const error = new Error('Quantity must be at least 1');
    error.statusCode = 400;
    throw error;
  }

  const query = userId ? { userId } : { guestToken };
  const cart = await Cart.findOne(query);

  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  // Find item
  const itemKey = skuId ? skuId.toUpperCase() : productId;
  const itemIndex = cart.items.findIndex(item => {
    if (skuId) {
      return item.skuId && item.skuId.toUpperCase() === itemKey;
    }
    return !item.skuId && item.product.toString() === itemKey;
  });

  if (itemIndex === -1) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  // Validate stock - check variant if skuId exists
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  let itemStock = product.stock;
  
  if (skuId) {
    const variant = await ProductVariant.findOne({ 
      sku: skuId.toUpperCase(),
      product: productId,
      isActive: true
    });
    
    if (!variant) {
      const error = new Error('Variant not found');
      error.statusCode = 404;
      throw error;
    }
    
    itemStock = variant.stock;
  }

  const warnings = [];
  let targetQty = qty;

  // Apply caps
  if (targetQty > itemStock) {
    targetQty = itemStock;
    warnings.push({
      type: 'stock_cap',
      productId: productId.toString(),
      skuId: skuId || null,
      message: `Only ${itemStock} available in stock`,
      allowedQty: itemStock
    });
  }

  if (product.maxPerOrder && targetQty > product.maxPerOrder) {
    targetQty = product.maxPerOrder;
    warnings.push({
      type: 'max_per_order',
      productId: productId.toString(),
      skuId: skuId || null,
      message: `Maximum ${product.maxPerOrder} per order`,
      allowedQty: product.maxPerOrder
    });
  }

  cart.items[itemIndex].qty = targetQty;

  await cart.save();
  await cart.populate('items.product');

  return formatCartResponse(cart, warnings);
}

/**
 * Remove item from cart
 * @param {Object} params - { userId?, guestToken?, productId, skuId? }
 * @returns {Object} Cart data
 */
export async function removeItem({ userId, guestToken, productId, skuId = null }) {
  const query = userId ? { userId } : { guestToken };
  const cart = await Cart.findOne(query);

  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  const itemKey = skuId ? skuId.toUpperCase() : productId;
  cart.items = cart.items.filter(item => {
    if (skuId) {
      return !(item.skuId && item.skuId.toUpperCase() === itemKey);
    }
    return !((!item.skuId) && item.product.toString() === itemKey);
  });

  await cart.save();
  await cart.populate('items.product');

  return formatCartResponse(cart);
}

/**
 * Clear entire cart
 * @param {Object} params - { userId?, guestToken? }
 * @returns {Boolean} Success status
 */
export async function clearCart({ userId, guestToken }) {
  const query = userId ? { userId } : { guestToken };
  
  const result = await Cart.deleteOne(query);
  
  return result.deletedCount > 0;
}

/**
 * Merge guest cart to user cart (when guest logs in)
 * Applies stock and maxPerOrder caps
 * @param {Object} params - { userId, guestToken }
 * @returns {Object} Merged cart data
 */
export async function mergeGuestCart({ userId, guestToken }) {
  const guestCart = await Cart.findOne({ guestToken });
  
  if (!guestCart || guestCart.items.length === 0) {
    return null;
  }

  let userCart = await Cart.findOne({ userId });

  if (!userCart) {
    // Simply transfer guest cart to user
    guestCart.userId = userId;
    guestCart.guestToken = undefined;
    await guestCart.save();
    await guestCart.populate('items.product');
    return formatCartResponse(guestCart);
  }

  const warnings = [];

  // Merge items with validation
  for (const guestItem of guestCart.items) {
    const product = await Product.findById(guestItem.product);
    
    if (!product || !product.isActive) {
      continue; // Skip inactive products
    }

    const itemKey = guestItem.skuId || guestItem.product.toString();
    const existingItemIndex = userCart.items.findIndex(item => {
      const currentKey = item.skuId || item.product.toString();
      return currentKey === itemKey;
    });

    let targetQty = guestItem.qty;

    if (existingItemIndex > -1) {
      targetQty = userCart.items[existingItemIndex].qty + guestItem.qty;
    }

    // Apply caps
    if (targetQty > product.stock) {
      targetQty = product.stock;
      warnings.push({
        type: 'stock_cap',
        productId: product._id.toString(),
        message: `${product.name}: Capped to available stock (${product.stock})`,
        allowedQty: product.stock
      });
    }

    if (product.maxPerOrder && targetQty > product.maxPerOrder) {
      targetQty = product.maxPerOrder;
      warnings.push({
        type: 'max_per_order',
        productId: product._id.toString(),
        message: `${product.name}: Capped to max per order (${product.maxPerOrder})`,
        allowedQty: product.maxPerOrder
      });
    }

    if (existingItemIndex > -1) {
      userCart.items[existingItemIndex].qty = targetQty;
    } else {
      userCart.items.push({
        ...guestItem.toObject(),
        product: guestItem.product
      });
    }
  }

  await userCart.save();
  await Cart.deleteOne({ guestToken }); // Delete guest cart
  await userCart.populate('items.product');

  return formatCartResponse(userCart, warnings);
}

/**
 * Bulk add multiple items to cart
 * @param {Object} params - { userId?, guestToken?, items: [{ productId, skuId?, qty }] }
 * @returns {Object} { results: [{ success, productId, skuId?, error? }], cart }
 */
export async function bulkAddItems({ userId, guestToken, items = [] }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items array is required and cannot be empty');
  }

  if (items.length > 20) {
    throw new Error('Cannot add more than 20 items at once');
  }

  const results = [];
  const warnings = [];

  // Process each item
  for (const item of items) {
    const { productId, skuId = null, qty = 1 } = item;

    try {
      // Validate product exists
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        results.push({
          success: false,
          productId,
          skuId,
          error: 'Product not found or inactive'
        });
        continue;
      }

      let priceAtAdd = product.price;
      let currentStock = product.stock;
      let variant = null;

      // If skuId provided, validate and use variant
      if (skuId) {
        variant = await ProductVariant.findOne({ sku: skuId, product: productId });
        
        if (!variant || !variant.isActive) {
          results.push({
            success: false,
            productId,
            skuId,
            error: 'Variant not found or inactive'
          });
          continue;
        }

        priceAtAdd = variant.price;
        currentStock = variant.stock;
      }

      // Check stock availability
      if (currentStock < 1) {
        results.push({
          success: false,
          productId,
          skuId,
          error: 'Out of stock'
        });
        continue;
      }

      // Add to cart (without returning full cart each time for performance)
      const query = userId ? { userId } : { guestToken };
      let cart = await Cart.findOne(query);

      if (!cart) {
        cart = new Cart(query);
      }

      const itemKey = skuId || productId.toString();
      const existingItemIndex = cart.items.findIndex(i => {
        const currentKey = i.skuId || i.product.toString();
        return currentKey === itemKey;
      });

      let targetQty = qty;

      if (existingItemIndex > -1) {
        targetQty = cart.items[existingItemIndex].qty + qty;
      }

      // Apply stock cap
      if (targetQty > currentStock) {
        targetQty = currentStock;
        warnings.push({
          type: 'stock_cap',
          productId: productId.toString(),
          skuId,
          message: `${product.name}: Capped to available stock (${currentStock})`,
          allowedQty: currentStock
        });
      }

      // Apply max per order
      if (product.maxPerOrder && targetQty > product.maxPerOrder) {
        targetQty = product.maxPerOrder;
        warnings.push({
          type: 'max_per_order',
          productId: productId.toString(),
          skuId,
          message: `${product.name}: Capped to max per order (${product.maxPerOrder})`,
          allowedQty: product.maxPerOrder
        });
      }

      // Update or add item
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].qty = targetQty;
      } else {
        cart.items.push({
          product: productId,
          skuId,
          qty: targetQty,
          priceAtAdd,
          nameSnapshot: variant ? `${product.name} - ${variant.name}` : product.name,
          imageSnapshot: product.images?.[0] || product.image || ''
        });
      }

      await cart.save();

      results.push({
        success: true,
        productId,
        skuId,
        addedQty: targetQty
      });

    } catch (error) {
      results.push({
        success: false,
        productId,
        skuId,
        error: error.message || 'Failed to add item'
      });
    }
  }

  // Fetch final cart state
  const query = userId ? { userId } : { guestToken };
  const finalCart = await Cart.findOne(query).populate('items.product');

  return {
    results,
    warnings,
    cart: formatCartResponse(finalCart, warnings)
  };
}
