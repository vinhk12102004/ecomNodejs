/**
 * Format price to VNĐ (Vietnamese Dong)
 * @param {number} price - Price in VND
 * @returns {string} Formatted price string
 * 
 * Example:
 * formatPrice(25000000) => "25.000.000 ₫"
 * formatPrice(1000000) => "1.000.000 ₫"
 */
export function formatPrice(price) {
  if (!price && price !== 0) return '0 ₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Format price without currency symbol (just numbers with dots)
 * @param {number} price - Price in VND
 * @returns {string} Formatted price string
 * 
 * Example:
 * formatPriceNumber(25000000) => "25.000.000"
 */
export function formatPriceNumber(price) {
  if (!price && price !== 0) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(price);
}

