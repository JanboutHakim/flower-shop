import { formatCurrency } from "../constants/options";

const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER;

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
      if (item.msg) line += `\n  Message: ${item.msg}`;
      if (item.cardText) line += `\n  Card: "${item.cardText}"`;
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
Name: ${formData.name}
Phone: ${formData.phone}
City: ${formData.city}
Address: ${formData.address || "-"}
Delivery Date: ${formData.date || "-"}
Delivery Time: ${formData.time || "-"}
Notes: ${formData.notes || "-"}`;
}

export function createWhatsAppLink(message) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
