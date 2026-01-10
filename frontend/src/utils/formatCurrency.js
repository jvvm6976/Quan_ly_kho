/**
 * Định dạng số thành tiền tệ Việt Nam đồng
 * @param {number|string} amount - Số tiền cần định dạng
 * @param {boolean} showSymbol - Có hiển thị ký hiệu tiền tệ hay không
 * @returns {string} Chuỗi đã định dạng
 */
export const formatCurrency = (amount, showSymbol = true) => {
  // Chuyển đổi từ USD sang VND (tỷ giá ước tính)
  // Trong thực tế, bạn nên lấy tỷ giá từ API hoặc cấu hình
  // const exchangeRate = 24000;

  // Chuyển đổi sang số
  let numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Kiểm tra nếu là số hợp lệ
  if (isNaN(numAmount)) {
    return 'N/A';
  }

  // Chuyển đổi sang VND
  // numAmount = numAmount;

  // Định dạng số với dấu phân cách hàng nghìn
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(numAmount);

  // Trả về chuỗi đã định dạng
  return showSymbol ? `${formattedAmount} ₫` : formattedAmount;
};

/**
 * Định dạng số thành tiền tệ theo định dạng gốc (USD)
 * @param {number|string} amount - Số tiền cần định dạng
 * @param {boolean} showSymbol - Có hiển thị ký hiệu tiền tệ hay không
 * @returns {string} Chuỗi đã định dạng
 */
export const formatOriginalCurrency = (amount, showSymbol = true) => {
  // Chuyển đổi sang số
  let numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Kiểm tra nếu là số hợp lệ
  if (isNaN(numAmount)) {
    return 'N/A';
  }

  // Định dạng số với 2 chữ số thập phân
  const formattedAmount = numAmount.toFixed(2);

  // Trả về chuỗi đã định dạng
  return showSymbol ? `$${formattedAmount}` : formattedAmount;
};

export default formatCurrency;
