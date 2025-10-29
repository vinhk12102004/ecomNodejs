import * as cartService from "../services/cart.service.js";
import * as emailService from "../services/email.service.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import User from "../models/user.model.js";

/**
 * POST /checkout/preview
 * Preview order with price breakdown
 * Body: { couponCode? }
 */
export async function preview(req, res) {
  try {
    const userId = req.user?.id;
    const guestToken = req.guestToken;
    const { couponCode } = req.body;

    // Get cart
    const query = userId ? { userId } : { guestToken };
    const cart = await Cart.findOne(query).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate subtotal
    let subtotal = 0;
    const items = [];

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ error: "Invalid product in cart" });
      }

      // Validate stock
      if (item.product.stock < item.qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.product.name}` 
        });
      }

      const itemTotal = item.priceAtAdd * item.qty;
      subtotal += itemTotal;

      items.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.qty,
        price: item.priceAtAdd
      });
    }

    // Validate and apply coupon if provided
    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase() 
      });

      if (!coupon) {
        return res.status(400).json({ error: "Invalid coupon code" });
      }

      if (coupon.used_count >= coupon.usage_limit) {
        return res.status(400).json({ error: "Coupon usage limit exceeded" });
      }

      // Calculate discount
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      couponId = coupon._id;
    }

    const total = subtotal - discount;

    res.json({
      items,
      pricing: {
        subtotal,
        discount,
        total
      },
      coupon: couponCode ? {
        code: couponCode.toUpperCase(),
        discountPercent: (await Coupon.findById(couponId))?.discountPercent || 0
      } : null
    });

  } catch (err) {
    console.error('Checkout preview error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /checkout/confirm
 * Create order and complete checkout
 * Body: { email?, couponCode?, address? }
 */
export async function confirm(req, res) {
  try {
    const userId = req.user?.id;
    const guestToken = req.guestToken;
    const { email, couponCode, address } = req.body;

    // Get cart
    const query = userId ? { userId } : { guestToken };
    const cart = await Cart.findOne(query).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // For guest checkout, email is required
    if (!userId && !email) {
      return res.status(400).json({ error: "Email is required for guest checkout" });
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({ error: "Invalid product in cart" });
      }

      // Validate stock again
      if (item.product.stock < item.qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.product.name}` 
        });
      }

      const itemTotal = item.priceAtAdd * item.qty;
      subtotal += itemTotal;

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.qty,
        price: item.priceAtAdd
      });
    }

    // Apply coupon
    let discount = 0;
    let couponId = null;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase() 
      });

      if (!coupon) {
        return res.status(400).json({ error: "Invalid coupon code" });
      }

      if (coupon.used_count >= coupon.usage_limit) {
        return res.status(400).json({ error: "Coupon usage limit exceeded" });
      }

      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      couponId = coupon._id;
    }

    const total = subtotal - discount;

    // Create or find user for guest checkout
    let orderUserId = userId;
    let guestEmail = null;

    if (!userId && email) {
      // Check if user with this email exists
      let user = await User.findOne({ email });

      if (!user) {
        // Auto-create account for guest
        const randomPassword = Math.random().toString(36).slice(-8);
        const bcrypt = await import('bcrypt');
        const password_hash = await bcrypt.hash(randomPassword, 10);

        user = await User.create({
          email,
          password_hash,
          role: 'customer',
          name: email.split('@')[0]
        });

        console.log(`Auto-created account for guest: ${email}`);
      }

      orderUserId = user._id;
      guestEmail = email;
    }

    // Create order
    const order = await Order.create({
      user: orderUserId,
      guestEmail,
      items: orderItems,
      pricing: {
        subtotal,
        discountValue: discount,
        couponId,
        total
      },
      totalAmount: total,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        at: new Date()
      }]
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.qty } }
      );
    }

    // Update coupon usage
    if (coupon) {
      await Coupon.findByIdAndUpdate(
        coupon._id,
        { $inc: { used_count: 1 } }
      );
    }

    // Clear cart
    await cartService.clearCart({ userId, guestToken });

    // Send confirmation email
    const emailTo = email || (await User.findById(userId))?.email;
    
    if (emailTo) {
      try {
        await emailService.sendOrderConfirmation(emailTo, order);
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
        // Don't fail the order if email fails
      }
    }

    res.status(201).json({
      order: {
        _id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        items: order.items,
        pricing: order.pricing,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      },
      message: "Order created successfully"
    });

  } catch (err) {
    console.error('Checkout confirm error:', err);
    res.status(500).json({ error: err.message });
  }
}

