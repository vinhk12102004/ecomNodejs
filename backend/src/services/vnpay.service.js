import crypto from "crypto";
import qs from "qs";

/**
 * VNPAY Service
 * Handles VNPAY payment URL generation and hash validation
 */

/**
 * Sort object by keys (alphabetically)
 * EXACT implementation from VNPAY demo code
 * This function encodes keys and values, then sorts by encoded keys
 */
function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  
  // Step 1: Collect all keys (encode them)
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  
  // Step 2: Sort encoded keys alphabetically
  str.sort();
  
  // Step 3: Build sorted object - EXACT match with VNPAY demo code line 315
  // Note: For VNPAY parameter keys (vnp_*), encodeURIComponent returns the same string
  // So obj[str[key]] works because str[key] equals the original key for vnp_* parameters
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  
  return sorted;
}

/**
 * Generate VNPAY payment URL
 * @param {Object} params - Payment parameters
 * @param {Number} params.amount - Amount in VND (will be multiplied by 100)
 * @param {String} params.orderId - Order ID/Transaction reference
 * @param {String} params.orderInfo - Order description (Vietnamese without diacritics)
 * @param {String} params.orderType - Order type code
 * @param {String} params.ipAddr - Customer IP address
 * @param {String} params.bankCode - Bank code (optional)
 * @param {String} params.locale - Language (vn/en), default: vn
 * @returns {String} VNPAY payment URL
 */
export function createPaymentUrl(params) {
  const {
    amount,
    orderId,
    orderInfo,
    orderType,
    ipAddr,
    bankCode = null,
    locale = 'vn'
  } = params;

  // VNPAY Configuration from environment
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:4000/api/payment/vnpay/return';

  if (!tmnCode || !secretKey) {
    throw new Error('VNPAY configuration missing: VNP_TMN_CODE and VNP_HASH_SECRET are required');
  }

  // Set timezone to Vietnam (GMT+7)
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  
  // Format date: yyyyMMddHHmmss (GMT+7)
  const date = new Date();
  const createDate = formatDate(date, 'yyyyMMddHHmmss');
  // Note: vnp_ExpireDate is optional, only include if needed

  // Build VNPAY parameters (exact order as demo code)
  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale || 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Amount: amount * 100, // Multiply by 100 to remove decimal
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate
  };

  // Add bank code if provided
  if (bankCode && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  // Sort parameters alphabetically
  const sortedParams = sortObject(vnp_Params);

  // Create query string
  const signData = qs.stringify(sortedParams, { encode: false });

  // Generate Secure Hash using HMAC SHA512
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  // Add secure hash to parameters (use encoded key to match sortObject format)
  // Note: 'vnp_SecureHash' encodes to 'vnp_SecureHash' (no special chars), so it's the same
  const encodedHashKey = encodeURIComponent('vnp_SecureHash');
  sortedParams[encodedHashKey] = signed;

  // Build final URL
  const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: false });

  return paymentUrl;
}

/**
 * Validate VNPAY Secure Hash
 * @param {Object} vnp_Params - Parameters from VNPAY
 * @returns {Boolean} True if hash is valid
 */
export function validateSecureHash(vnp_Params) {
  const secretKey = process.env.VNP_HASH_SECRET;
  
  if (!secretKey) {
    throw new Error('VNPAY_HASH_SECRET is not configured');
  }

  // Extract secure hash from params
  const secureHash = vnp_Params['vnp_SecureHash'];
  if (!secureHash) {
    return false;
  }

  // Remove secure hash and secure hash type from params for validation
  const paramsForValidation = { ...vnp_Params };
  delete paramsForValidation['vnp_SecureHash'];
  delete paramsForValidation['vnp_SecureHashType'];

  // Sort parameters alphabetically
  const sortedParams = sortObject(paramsForValidation);

  // Create query string
  const signData = qs.stringify(sortedParams, { encode: false });

  // Generate hash
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  // Compare hashes
  return secureHash === signed;
}

/**
 * Format date to VNPAY format (yyyyMMddHHmmss)
 * @param {Date} date - Date object
 * @param {String} format - Format string
 * @returns {String} Formatted date string
 */
function formatDate(date, format) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Remove Vietnamese diacritics
 * @param {String} str - Vietnamese string
 * @returns {String} String without diacritics
 */
export function removeDiacritics(str) {
  if (!str) return '';
  
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

