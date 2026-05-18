import { formatCurrency } from "../constants/options";
import { AVAILABILITY_NOTE, getProductName } from "./product";
import { WHATSAPP_NUMBER } from "./env";

/**
 * Send order details to WhatsApp.
 * WhatsApp web links can pre-fill text and links, but cannot auto-attach a file.
 */
export function sendOrderToWhatsApp(cartItems, total, formData) {
  const message = buildOrderMessage(cartItems, total, formData);
  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(waUrl, "_blank");
  return waUrl;
}

export function buildOrderMessage(cartItems, total, formData) {
  const itemsList = cartItems
    .map((item) => {
      let line = `- ${item.name?.en || item.name} x${item.qty} - ${formatCurrency(
        item.price * item.qty
      )}`;
      if (item.ribbon) line += `\n  Ribbon: ${item.ribbon}`;
      if (item.wrap) line += `\n  Wrap: ${item.wrap}`;
      if (item.flowerCount) line += `\n  Flowers/size: ${item.flowerCount}`;
      if (item.customSummary) line += `\n  Custom bouquet: ${formatSummary(item.customSummary)}`;
      if (item.msg) line += `\n  Message: ${item.msg}`;
      if (item.cardText) line += `\n  Card: "${item.cardText}"`;
      if (item.cardMessage) line += `\n  Card: "${item.cardMessage}"`;
      return line;
    })
    .join("\n\n");

  const deliveryLine = formData.deliveryRequested
    ? `Delivery: Yes (${formatCurrency(formData.deliveryFee || 0)})`
    : "Delivery: No";
  const paymentMethod =
    formData.paymentMethod === "sham_cash" ? "Sham Cash" : "Cash on delivery";
  const paymentReceiptLine = formData.paymentReceiptUrl
    ? `Payment receipt: ${formData.paymentReceiptUrl}`
    : "Payment receipt: Not attached";

  return `Hello! I'd like to place a flower order

*ORDER DETAILS*
Order ID: ${formData.orderId ? `#${formData.orderId}` : "-"}
${itemsList}

Subtotal: ${formatCurrency(formData.subtotal || total)}
${deliveryLine}
*Total: ${formatCurrency(total)}*

*PAYMENT*
Method: ${paymentMethod}
${paymentReceiptLine}

*DELIVERY INFO*
Customer: ${formData.name || formData.customerName || "-"}
Customer Phone: ${formData.phone || formData.customerPhone || "-"}
Recipient: ${formData.recipientName || "-"}
Recipient Phone: ${formData.recipientPhone || "-"}
City/Area: ${formData.city || formData.area || "-"}
Address: ${formData.address || "-"}
Delivery Date: ${formData.date || formData.deliveryDate || "-"}
Delivery Time: ${formData.time || formData.deliveryTime || "-"}
Sender Name: ${formData.senderName || "-"}
Gift Message: ${formData.giftMessage || "-"}
Notes: ${formData.notes || "-"}

${AVAILABILITY_NOTE.en}`;
}

export function createWhatsAppLink(message) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function buildProductWhatsAppMessage(product, options = {}) {
  return `Hello! I would like to order this bouquet.

Product: ${getProductName(product, "en")}
Quantity: ${options.qty || 1}
Price: ${formatCurrency(options.price || product?.price || 0)}
Flowers/size: ${options.flowerCount || product?.count || "-"}
Ribbon: ${options.ribbon || "-"}
Wrapping: ${options.wrap || "-"}
Gift/Card message: ${options.cardText || "-"}

Please confirm the final bouquet details before preparation.`;
}

export function buildCartWhatsAppMessage(cartItems, total, formData = {}) {
  return buildOrderMessage(cartItems, total, formData);
}

function formatSummary(summary) {
  if (!summary) return "-";
  if (typeof summary === "string") return summary;
  return Object.entries(summary)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}
