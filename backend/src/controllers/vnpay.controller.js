import { createPaymentUrl, validateSecureHash, removeDiacritics } from "../services/vnpay.service.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import * as emailService from "../services/email.service.js";

/**
 * Helper function to update order after successful payment
 * Stock tracking logic (NO SCHEMA CHANGE NEEDED):
 * - paymentStatus='pending' + paymentMethod='vnpay' = Stock already deducted, waiting for payment
 * - paymentStatus='paid' = Payment confirmed, stock stays deducted
 * - paymentStatus='failed' = Payment failed, need to restore stock
 */
async function updateOrderAfterPayment(order, vnp_Params) {
  const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
  const vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];
  const vnp_BankCode = vnp_Params['vnp_BankCode'];
  const vnp_CardType = vnp_Params['vnp_CardType'];
  const vnp_PayDate = vnp_Params['vnp_PayDate'];
  const vnp_TxnRef = vnp_Params['vnp_TxnRef'];
  const vnp_TransactionStatus = vnp_Params['vnp_TransactionStatus'];

  // Only update if payment is successful and order is not already paid
  const isSuccess = vnp_ResponseCode === '00' && 
    (vnp_TransactionStatus === undefined || vnp_TransactionStatus === '00');
  
  console.log('=== Update Order After Payment ===');
  console.log('ResponseCode:', vnp_ResponseCode);
  console.log('TransactionStatus:', vnp_TransactionStatus);
  console.log('isSuccess:', isSuccess);
  console.log('Current paymentStatus:', order.paymentStatus);
  console.log('Payment method:', order.paymentMethod);
  
  if (isSuccess && order.paymentStatus !== 'paid') {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.paymentInfo = {
      vnpTransactionNo: vnp_TransactionNo,
      vnpBankCode: vnp_BankCode,
      vnpCardType: vnp_CardType,
      vnpPayDate: vnp_PayDate,
      vnpResponseCode: vnp_ResponseCode,
      vnpTxnRef: vnp_TxnRef
    };

    // Add status history
    order.statusHistory.push({
      status: 'confirmed',
      at: new Date()
    });

    // DO NOT deduct stock here - already deducted during checkout!
    console.log('✅ Payment successful. Stock was already deducted during checkout.');

    await order.save();

    // Send confirmation email
    const emailTo = order.guestEmail || (await User.findById(order.user))?.email;
    if (emailTo) {
      try {
        await emailService.sendOrderConfirmation(emailTo, order);
        console.log('✅ Confirmation email sent to:', emailTo);
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }
    }

    return true;
  } else if (vnp_ResponseCode !== '00' && order.paymentStatus === 'pending') {
    // Payment failed - RESTORE STOCK (only if still pending = stock was deducted)
    console.log('❌ Payment failed. Restoring stock...');
    
    order.paymentStatus = 'failed';
    order.status = 'cancelled';
    order.paymentInfo = {
      vnpTransactionNo: vnp_TransactionNo || null,
      vnpBankCode: vnp_BankCode || null,
      vnpCardType: vnp_CardType || null,
      vnpPayDate: vnp_PayDate || null,
      vnpResponseCode: vnp_ResponseCode,
      vnpTxnRef: vnp_TxnRef
    };

    // Add cancelled status to history
    order.statusHistory.push({
      status: 'cancelled',
      at: new Date()
    });

    // RESTORE STOCK: Add back the deducted quantity
    // Only restore if paymentMethod is vnpay and payment was pending
    if (order.paymentMethod === 'vnpay') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } } // Add back stock
        );
        console.log(`✅ Restored ${item.quantity} units of product ${item.product}`);
      }
    }

    await order.save();
    console.log('✅ Order cancelled and stock restored');
    return false;
  }

  return order.paymentStatus === 'paid';
}

/**
 * POST /api/payment/vnpay/create
 * Create VNPAY payment URL
 * Body: { orderId, amount, orderInfo, orderType, bankCode?, locale? }
 */
export async function createPayment(req, res, next) {
  try {
    const { orderId, amount, orderInfo, orderType, bankCode, locale } = req.body;

    // Validation
    if (!orderId || !amount || !orderInfo || !orderType) {
      return res.status(400).json({ 
        error: "Missing required fields: orderId, amount, orderInfo, orderType" 
      });
    }

    // Get customer IP address
    const ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      '127.0.0.1';

    // Remove diacritics from orderInfo (VNPAY requirement)
    const cleanOrderInfo = removeDiacritics(orderInfo);

    // Generate payment URL
    const paymentUrl = createPaymentUrl({
      amount: Number(amount),
      orderId: String(orderId),
      orderInfo: cleanOrderInfo,
      orderType: orderType || 'other',
      ipAddr,
      bankCode: bankCode || null,
      locale: locale || 'vn'
    });

    res.json({
      paymentUrl,
      orderId
    });
  } catch (error) {
    console.error('VNPAY create payment error:', error);
    next(error);
  }
}

/**
 * GET /api/payment/vnpay/return
 * Handle return from VNPAY after payment
 * Query params: vnp_Amount, vnp_BankCode, vnp_ResponseCode, vnp_TxnRef, etc.
 */
export async function handleReturn(req, res, next) {
  try {
    const vnp_Params = req.query;

    console.log('=== VNPAY Return Handler ===');
    console.log('VNPAY Params:', JSON.stringify(vnp_Params, null, 2));

    // Validate secure hash
    const isValid = validateSecureHash(vnp_Params);
    
    if (!isValid) {
      console.error('VNPAY Return: Invalid secure hash');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay/return?success=false&code=97&message=Invalid secure hash`);
    }

    console.log('✅ VNPAY Return: Hash validation passed');

    // Extract parameters
    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    const vnp_TxnRef = vnp_Params['vnp_TxnRef'];
    const vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];
    const vnp_Amount = vnp_Params['vnp_Amount'];

    console.log('VNPAY Response Code:', vnp_ResponseCode);
    console.log('VNPAY Transaction Ref:', vnp_TxnRef);

    // Response code mapping
    const responseCodeMessages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thử lại',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP)',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch cho phép',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Lỗi không xác định'
    };

    const responseMessage = responseCodeMessages[vnp_ResponseCode] || `Lỗi không xác định (Code: ${vnp_ResponseCode})`;

    // Find order
    const order = await Order.findById(vnp_TxnRef);

    if (!order) {
      console.error('❌ VNPAY Return: Order not found:', vnp_TxnRef);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay/return?success=false&code=01&message=Order not found`);
    }

    console.log('✅ VNPAY Return: Order found:', order._id);

    // Check amount
    if (vnp_Amount) {
      const amountFromVNPAY = Number(vnp_Amount) / 100;
      const orderAmount = order.totalAmount;
      
      console.log('VNPAY Amount:', amountFromVNPAY, 'Order Amount:', orderAmount);
      
      if (Math.abs(amountFromVNPAY - orderAmount) > 1) {
        console.error('❌ VNPAY Return: Amount mismatch');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay/return?success=false&orderId=${order._id}&code=04&message=Amount invalid`);
      }
    }

    // Update order
    const isSuccess = await updateOrderAfterPayment(order, vnp_Params);

    console.log('VNPAY Return: Payment success:', isSuccess);

    // Redirect based on result
    if (isSuccess) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay/return?success=true&orderId=${order._id}`);
    } else {
      const encodedMessage = encodeURIComponent(responseMessage);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay/return?success=false&orderId=${order._id}&code=${vnp_ResponseCode || 'unknown'}&message=${encodedMessage}`);
    }
  } catch (error) {
    console.error('❌ VNPAY return handler error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/vnpay/return?success=false&code=99&message=${encodeURIComponent(error.message)}`);
  }
}

/**
 * POST /api/payment/vnpay/ipn
 * Handle IPN (Instant Payment Notification) from VNPAY
 * This is called by VNPAY server to notify payment result
 */
export async function handleIPN(req, res, next) {
  try {
    const vnp_Params = req.body;

    console.log('=== VNPAY IPN Handler ===');
    console.log('IPN Params:', JSON.stringify(vnp_Params, null, 2));

    // Validate secure hash
    const isValid = validateSecureHash(vnp_Params);
    
    if (!isValid) {
      console.error('❌ IPN: Invalid secure hash');
      return res.status(200).json({ 
        RspCode: '97',
        Message: 'Invalid secure hash' 
      });
    }

    console.log('✅ IPN: Hash validation passed');

    // Extract parameters
    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    const vnp_TxnRef = vnp_Params['vnp_TxnRef'];
    const vnp_Amount = vnp_Params['vnp_Amount'];
    const vnp_TransactionStatus = vnp_Params['vnp_TransactionStatus'];

    // Find order
    const order = await Order.findById(vnp_TxnRef);

    if (!order) {
      console.error('❌ IPN: Order not found:', vnp_TxnRef);
      return res.status(200).json({ 
        RspCode: '01',
        Message: 'Order not found' 
      });
    }

    console.log('✅ IPN: Order found:', order._id);

    // Check amount
    const amountFromVNPAY = Number(vnp_Amount) / 100;
    const orderAmount = order.totalAmount;
    
    if (Math.abs(amountFromVNPAY - orderAmount) > 1) {
      console.error('❌ IPN: Amount mismatch');
      return res.status(200).json({ 
        RspCode: '04',
        Message: 'Amount invalid' 
      });
    }

    // Check if already processed (idempotency)
    if (order.paymentStatus === 'paid' && vnp_ResponseCode === '00') {
      console.log('⚠️ IPN: Order already paid, skipping');
      return res.status(200).json({ 
        RspCode: '02',
        Message: 'This order has been updated to the payment status' 
      });
    }

    // Update order
    const isSuccess = await updateOrderAfterPayment(order, {
      ...vnp_Params,
      vnp_TransactionStatus: vnp_TransactionStatus || vnp_ResponseCode
    });

    console.log('✅ IPN: Order updated successfully');

    return res.status(200).json({ 
      RspCode: '00',
      Message: isSuccess ? 'Success' : 'Order updated' 
    });
  } catch (error) {
    console.error('❌ VNPAY IPN handler error:', error);
    return res.status(200).json({ 
      RspCode: '99',
      Message: 'Internal error' 
    });
  }
}