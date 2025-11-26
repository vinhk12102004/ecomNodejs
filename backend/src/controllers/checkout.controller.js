import * as cartService from "../services/cart.service.js";
import * as emailService from "../services/email.service.js";
import { createPaymentUrl, removeDiacritics } from "../services/vnpay.service.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Coupon from "../models/coupon.model.js";
import User from "../models/user.model.js";
import PointsLedger from "../models/pointsLedger.model.js";
import * as authService from "../services/auth.service.js";

/**
 * POST /checkout/preview
 * Preview order with price breakdown
 * Body: { couponCode?, redeemPoints? }
 */
export async function preview(req, res) {
  try {
    const userId = req.user?.id;
    const guestToken = req.guestToken;
    const { couponCode, redeemPoints = 0 } = req.body;

    // Get cart
    const query = userId ? { userId } : { guestToken };
    const cart = await Cart.findOne(query).populate("items.product");

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

      // Validate stock: nếu có skuId thì check variant, nếu không thì check product
      if (item.skuId) {
        const variant = await ProductVariant.findOne({ sku: item.skuId });
        if (!variant || variant.stock < item.qty) {
          return res.status(400).json({
            error: `Biến thể sản phẩm "${item.product.name}" (SKU ${item.skuId}) chỉ còn ${variant ? variant.stock : 0
              } sản phẩm trong kho`,
          });
        }
      } else {
        if (item.product.stock < item.qty) {
          return res.status(400).json({
            error: `Sản phẩm "${item.product.name}" chỉ còn ${item.product.stock} sản phẩm trong kho`,
          });
        }
      }

      const itemTotal = item.priceAtAdd * item.qty;
      subtotal += itemTotal;

      items.push({
        product: item.product._id,
        sku: item.skuId || null,
        name: item.product.name,
        quantity: item.qty,
        price: item.priceAtAdd,
      });
    }

    // Validate and apply coupon if provided
    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
      });

      if (!coupon) {
        return res.status(400).json({ error: "Mã giảm giá không hợp lệ" });
      }

      if (coupon.used_count >= coupon.usage_limit) {
        return res.status(400).json({ error: "Mã giảm giá đã hết lượt sử dụng" });
      }

      // Calculate discount
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      couponId = coupon._id;
    }

    // Loyalty points redemption
    let user = null;
    let maxRedeemAllowed = 0;
    let redeemApplied = 0;

    if (userId) {
      user = await User.findById(userId);
      const userPoints = user?.totalPoints || 0;
      const capBySubtotal = Math.floor(subtotal * 0.2);
      maxRedeemAllowed = Math.max(0, Math.min(userPoints, capBySubtotal));
      const requested = Math.max(0, Math.floor(redeemPoints || 0));
      redeemApplied = Math.min(requested, maxRedeemAllowed);
    }

    // Tax and shipping
    const tax = Math.round(subtotal * 0.1);
    const shipping = subtotal > 1000000 ? 0 : 50000;

    const total = subtotal + tax + shipping - discount - redeemApplied;

    res.json({
      items,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      coupon: couponCode
        ? {
            code: couponCode.toUpperCase(),
            discountPercent:
              (await Coupon.findById(couponId))?.discountPercent || 0,
          }
        : null,
      loyalty: {
        requested: Math.max(0, Math.floor(redeemPoints || 0)),
        applied: redeemApplied,
        maxAllowed: maxRedeemAllowed,
        remainingPoints: user
          ? Math.max(0, (user.totalPoints || 0) - redeemApplied)
          : 0,
      },
    });
  } catch (err) {
    console.error("Checkout preview error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /checkout/confirm
 * Create order and complete checkout
 * Body: { email?, couponCode?, redeemPoints?, address?, addressId?, paymentMethod? }
 */
export async function confirm(req, res) {
  try {
    const userId = req.user?.id;
    const guestToken = req.guestToken;
    const {
      email,
      couponCode,
      redeemPoints = 0,
      address,
      addressId,
      paymentMethod = "cod",
    } = req.body;

    // Get cart
    const query = userId ? { userId } : { guestToken };
    const cart = await Cart.findOne(query).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Giỏ hàng trống" });
    }

    // For guest checkout, email is required
    if (!userId && !email) {
      return res
        .status(400)
        .json({ error: "Email là bắt buộc cho khách vãng lai" });
    }

    // Calculate pricing and validate stock
    let subtotal = 0;
    const orderItems = [];

    const productsToUpdate = []; // { productId, quantity }
    const variantsToUpdate = []; // { sku, quantity }

    for (const item of cart.items) {
      if (!item.product) {
        return res
          .status(400)
          .json({ error: "Sản phẩm không hợp lệ trong giỏ hàng" });
      }

      // Check & prepare stock update
      if (item.skuId) {
        // Variant-level stock
        const variant = await ProductVariant.findOne({ sku: item.skuId });
        if (!variant || variant.stock < item.qty) {
          return res.status(400).json({
            error: `Biến thể "${item.product.name}" (SKU ${item.skuId}) không đủ số lượng trong kho (yêu cầu: ${item.qty}, còn lại: ${variant ? variant.stock : 0
              })`,
          });
        }

        variantsToUpdate.push({
          sku: item.skuId,
          quantity: item.qty,
        });
      } else {
        // Product-level stock
        if (item.product.stock < item.qty) {
          return res.status(400).json({
            error: `Sản phẩm "${item.product.name}" không đủ số lượng trong kho (yêu cầu: ${item.qty}, còn lại: ${item.product.stock})`,
          });
        }

        productsToUpdate.push({
          productId: item.product._id,
          quantity: item.qty,
        });
      }

      const itemTotal = item.priceAtAdd * item.qty;
      subtotal += itemTotal;

      orderItems.push({
        product: item.product._id,
        sku: item.skuId || null,
        name: item.product.name,
        quantity: item.qty,
        price: item.priceAtAdd,
      });
    }

    // Apply coupon
    let discount = 0;
    let couponId = null;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
      });

      if (!coupon) {
        return res.status(400).json({ error: "Mã giảm giá không hợp lệ" });
      }

      if (coupon.used_count >= coupon.usage_limit) {
        return res
          .status(400)
          .json({ error: "Mã giảm giá đã hết lượt sử dụng" });
      }

      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      couponId = coupon._id;
    }

    // Loyalty points redemption
    let user = null;
    let maxRedeemAllowed = 0;
    let redeemApplied = 0;

    if (userId) {
      user = await User.findById(userId);
      const userPoints = user?.totalPoints || 0;
      const capBySubtotal = Math.floor(subtotal * 0.2);
      maxRedeemAllowed = Math.max(0, Math.min(userPoints, capBySubtotal));
      const requested = Math.max(0, Math.floor(redeemPoints || 0));
      redeemApplied = Math.min(requested, maxRedeemAllowed);
    }

    // Tax and shipping
    const tax = Math.round(subtotal * 0.1);
    const shipping = subtotal > 1000000 ? 0 : 50000;

    const total = subtotal + tax + shipping - discount - redeemApplied;

    // Handle shipping address
    let shippingAddress = address;

    if (userId && addressId) {
      const userDoc = await User.findById(userId);
      if (userDoc && userDoc.addresses) {
        const savedAddress = userDoc.addresses.id(addressId);
        if (savedAddress) {
          shippingAddress = {
            label: savedAddress.label,
            recipient: savedAddress.recipient,
            phone: savedAddress.phone,
            line1: savedAddress.line1,
            line2: savedAddress.line2 || "",
            city: savedAddress.city,
            district: savedAddress.district || "",
            ward: savedAddress.ward || "",
          };
        }
      }
    } else if (userId && !address && !addressId) {
      const userDoc = await User.findById(userId);
      if (userDoc && userDoc.addresses) {
        const defaultAddress = userDoc.addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          shippingAddress = {
            label: defaultAddress.label,
            recipient: defaultAddress.recipient,
            phone: defaultAddress.phone,
            line1: defaultAddress.line1,
            line2: defaultAddress.line2 || "",
            city: defaultAddress.city,
            district: defaultAddress.district || "",
            ward: defaultAddress.ward || "",
          };
        }
      }
    }

    // Create or find user for guest checkout
    let orderUserId = userId;
    let guestEmail = null;

    if (!userId && email) {
      let userDoc = await User.findOne({ email });

      // Chỉ khi email chưa có user thì mới tạo account + gửi mail đặt mật khẩu
      if (!userDoc) {
        try {
          // Tạo user mới với random password + reset token 24h
          const { user: newUser, resetToken } = await authService.signup({
            email,
            name: email.split("@")[0],
          });

          userDoc = newUser;

          // Gửi email chào mừng kèm link đặt mật khẩu (one-time, 24h)
          emailService
            .sendWelcomeEmail(userDoc.email, resetToken, userDoc.name)
            .catch((err) => {
              console.error(
                "Failed to send welcome email for guest checkout:",
                err
              );
            });

          console.log(`Auto-created account for guest via checkout: ${email}`);
        } catch (signupErr) {
          console.error("Auto-signup for guest failed:", signupErr);
          // Không chặn checkout, nhưng cũng không gắn order vào user nếu fail
        }
      }

      if (userDoc) {
        orderUserId = userDoc._id;
      }
      guestEmail = email;
    }

    // ====== CRITICAL: Update stock BEFORE creating order ======
    const updatedProducts = [];
    const updatedVariants = [];

    // 1) Trừ stock trên Product
    for (const item of productsToUpdate) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true }
      );

      if (!updated) {
        console.error(`❌ Failed to reserve stock for product ${item.productId}`);

        // Rollback những product đã update
        for (const prev of updatedProducts) {
          await Product.findByIdAndUpdate(prev.productId, {
            $inc: { stock: prev.quantity },
          });
        }

        return res.status(400).json({
          error: "Sản phẩm không đủ số lượng trong kho. Vui lòng thử lại.",
        });
      }

      updatedProducts.push(item);
      console.log(
        `✅ Product ${item.productId} stock updated ( -${item.quantity} )`
      );
    }

    // 2) Trừ stock trên Variant (SKU)
    for (const item of variantsToUpdate) {
      const updatedVariant = await ProductVariant.findOneAndUpdate(
        {
          sku: item.sku,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true }
      );

      if (!updatedVariant) {
        console.error(`❌ Failed to reserve stock for variant ${item.sku}`);

        // Rollback variant đã update
        for (const prev of updatedVariants) {
          await ProductVariant.findOneAndUpdate(
            { sku: prev.sku },
            { $inc: { stock: prev.quantity } }
          );
        }

        // Rollback products đã update
        for (const prev of updatedProducts) {
          await Product.findByIdAndUpdate(prev.productId, {
            $inc: { stock: prev.quantity },
          });
        }

        return res.status(400).json({
          error: "Biến thể sản phẩm không đủ số lượng trong kho. Vui lòng thử lại.",
        });
      }

      updatedVariants.push(item);
      console.log(
        `✅ Variant ${item.sku} stock updated ( -${item.quantity} )`
      );
    }

    console.log(
      `✅ Stock reserved for ${productsToUpdate.length} products + ${variantsToUpdate.length} variants`
    );
    // ====== END RESERVE STOCK ======

    // Create order
    const order = await Order.create({
      user: orderUserId,
      guestEmail,
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        tax,
        shipping,
        discountValue: discount,
        couponId,
        pointsRedeemed: redeemApplied,
        pointsEarned: 0,
        total,
      },
      totalAmount: total,
      status: "pending",
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "vnpay" ? "pending" : "pending",
      statusHistory: [
        {
          status: "pending",
          at: new Date(),
        },
      ],
    });

    // Update coupon usage
    if (coupon) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { used_count: 1 } });
    }

    // Loyalty: update user points and ledger
    if (orderUserId) {
      const pointsEarned = Math.floor(total / 10);

      if (redeemApplied > 0) {
        await PointsLedger.create({
          user: orderUserId,
          order: order._id,
          points: redeemApplied,
          type: "redeem",
          description: `Đổi ${redeemApplied} điểm cho đơn hàng ${order._id}`,
        });
      }

      if (pointsEarned > 0) {
        await PointsLedger.create({
          user: orderUserId,
          order: order._id,
          points: pointsEarned,
          type: "earn",
          description: `Nhận ${pointsEarned} điểm từ đơn hàng ${order._id}`,
        });
      }

      await User.findByIdAndUpdate(orderUserId, {
        $inc: { totalPoints: pointsEarned - redeemApplied },
      });

      await Order.findByIdAndUpdate(order._id, {
        $set: { "pricing.pointsEarned": pointsEarned },
      });
    }

    // Clear cart
    await cartService.clearCart({ userId, guestToken });

    console.log(
      `✅ Order ${order._id} created successfully. Stock deducted. Payment: ${paymentMethod}`
    );

    // AFTER order created, handle VNPAY
    if (paymentMethod === "vnpay") {
      try {
        const ipAddr =
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
          "127.0.0.1";

        const orderInfo = removeDiacritics(
          `Thanh toan don hang ${order._id
            .toString()
            .slice(-8)
            .toUpperCase()}`
        );

        const paymentUrl = createPaymentUrl({
          amount: total,
          orderId: order._id.toString(),
          orderInfo: orderInfo,
          orderType: "other",
          ipAddr,
          bankCode: null,
          locale: "vn",
        });

        order.paymentInfo = {
          vnpTxnRef: order._id.toString(),
        };
        await order.save();

        return res.status(201).json({
          order: {
            _id: order._id,
            orderNumber: order._id.toString().slice(-8).toUpperCase(),
            items: order.items,
            pricing: order.pricing,
            totalAmount: order.totalAmount,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            statusHistory: order.statusHistory,
          },
          paymentUrl,
          message: "Đơn hàng đã tạo. Đang chuyển đến trang thanh toán...",
        });
      } catch (vnpayErr) {
        console.error("VNPAY payment URL creation error:", vnpayErr);

        // Stock already deducted, mark payment as failed
        order.paymentStatus = "failed";
        await order.save();

        return res.status(500).json({
          error: vnpayErr.message || "Không thể tạo link thanh toán",
          details:
            "Vui lòng kiểm tra cấu hình VNPAY trong file backend/.env. Cần có: VNP_TMN_CODE, VNP_HASH_SECRET",
          order: {
            _id: order._id,
            orderNumber: order._id.toString().slice(-8).toUpperCase(),
            status: order.status,
            paymentStatus: order.paymentStatus,
          },
        });
      }
    }

    // Send confirmation email (COD only, VNPAY sends after payment)
    const emailTo = email || (await User.findById(orderUserId))?.email;

    if (emailTo && paymentMethod === "cod") {
      try {
        await emailService.sendOrderConfirmation(emailTo, order);
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
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
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        statusHistory: order.statusHistory,
      },
      message: "Đơn hàng đã được tạo thành công",
    });
  } catch (err) {
    console.error("Checkout confirm error:", err);
    res.status(500).json({ error: err.message });
  }
}
