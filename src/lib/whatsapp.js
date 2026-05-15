const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER;

/**
 * Send order details to WhatsApp
 * @param {Array} cartItems - Array of cart items
 * @param {number} total - Cart total
 * @param {Object} formData - Customer form data
 * @returns {string} - WhatsApp message URL
 */
export function sendOrderToWhatsApp(cartItems, total, formData) {
  const message = buildOrderMessage(cartItems, total, formData);
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  window.open(waUrl, '_blank');
  return waUrl;
}

/**
 * Build formatted order message
 * @param {Array} cartItems - Array of cart items
 * @param {number} total - Cart total
 * @param {Object} formData - Customer form data
 * @returns {string} - Formatted message
 */
export function buildOrderMessage(cartItems, total, formData) {
  const itemsList = cartItems
    .map((item) => {
      let line = `• ${item.name?.en || item.name} ×${item.qty} — $${(item.price * item.qty).toFixed(2)}`;
      if (item.ribbon) line += `\n  🎀 Ribbon: ${item.ribbon}`;
      if (item.wrap) line += `\n  📦 Wrap: ${item.wrap}`;
      if (item.msg) line += `\n  💌 Message: ${item.msg}`;
      if (item.cardText) line += `\n  💌 Card: "${item.cardText}"`;
      return line;
    })
    .join('\n\n');

  return `Hello! I'd like to place a flower order 🌸

*ORDER DETAILS*
${itemsList}

*Total: $${total.toFixed(2)}*

*DELIVERY INFO*
Name: ${formData.name}
Phone: ${formData.phone}
City: ${formData.city}
Address: ${formData.address}
Delivery Date: ${formData.date}
Delivery Time: ${formData.time}
Notes: ${formData.notes || '—'}`;
}

/**
 * Create WhatsApp link with custom message
 * @param {string} message - Custom message
 * @returns {string} - WhatsApp link
 */
export function createWhatsAppLink(message) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
