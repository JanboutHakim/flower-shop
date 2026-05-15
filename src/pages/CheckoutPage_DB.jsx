import React, { useState, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import { useOrder } from "../hooks/useDatabase";
import { buildOrderMessage, sendOrderToWhatsApp } from "../lib/whatsapp";
import { FaWhatsapp } from "react-icons/fa";

function CheckoutPage() {
  const { tr, cart, cartTotal, lang, isMobile } = useApp();
  const { createOrder, loading: orderLoading } = useOrder();
  const [form, setForm] = useState({ name: "", phone: "", city: "", address: "", date: "", time: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  const set = useCallback((k, v) => setForm((prev) => ({ ...prev, [k]: v })), []);

  const handleSubmitOrder = useCallback(async () => {
    try {
      setError(null);

      // Validate form
      if (!form.name || !form.phone || !form.city) {
        setError("Please fill in all required fields");
        return;
      }

      // Format cart items for storage
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        ribbon: item.ribbon || null,
        wrap: item.wrap || null,
        card_message: item.cardText || null,
        subtotal: item.price * item.qty,
      }));

      // Create order in database
      const orderData = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_city: form.city,
        customer_address: form.address,
        delivery_date: form.date,
        delivery_time: form.time,
        notes: form.notes || null,
        items: orderItems, // Store as JSONB
        total: cartTotal,
        status: "pending",
        whatsapp_sent: false,
      };

      const savedOrder = await createOrder(orderData);

      // Mark WhatsApp as sent after database save
      await updateOrder(savedOrder.id, { whatsapp_sent: true });

      // Send to WhatsApp
      sendOrderToWhatsApp(cart, cartTotal, form);

      setSubmitted(true);
      // Optionally clear cart here
      setTimeout(() => {
        // navigate to home or show confirmation
      }, 2000);

    } catch (err) {
      console.error("Order submission error:", err);
      setError(err.message || "Failed to submit order. Please try again.");
    }
  }, [form, cart, cartTotal, createOrder]);

  const Inp = ({ label, k, type = "text", placeholder = "", required = false }) => (
    <div style={{ marginBottom: 18 }}>
      <label>
        {label}
        {required && <span style={{ color: "#ff6b6b" }}>*</span>}
      </label>
      <input
        className="inp"
        type={type}
        placeholder={placeholder}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        disabled={orderLoading}
      />
    </div>
  );

  if (submitted) {
    return (
      <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Section>
          <div style={{ textAlign: "center", padding: 40 }}>
            <h2 style={{ fontSize: 28, marginBottom: 20, color: C.accent }}>✅ Order Received!</h2>
            <p style={{ fontSize: 16, marginBottom: 20, color: C.cream }}>
              Your order has been saved and sent to WhatsApp.
            </p>
            <p style={{ fontSize: 14, color: C.secondary }}>
              Order ID: <strong style={{ color: C.accent }}>{form.phone}</strong>
            </p>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg }}>
      <Section style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Tag>{tr.orderDetails || "Order Details"}</Tag>
        
        {error && (
          <div
            style={{
              background: "#ff6b6b20",
              border: `1px solid #ff6b6b`,
              borderRadius: 2,
              padding: 16,
              marginBottom: 24,
              color: "#ff6b6b",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
            gap: 40,
            marginTop: 32,
          }}
        >
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              padding: 32,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "0 20px",
              }}
            >
              <Inp label={tr.fullName || "Full Name"} k="name" required />
              <Inp label={tr.phone || "Phone"} k="phone" type="tel" required />
              <Inp label={tr.city || "City"} k="city" required />
              <Inp label={tr.address || "Address"} k="address" />
              <Inp label={tr.delivDate || "Delivery Date"} k="date" type="date" />
              <Inp label={tr.delivTime || "Delivery Time"} k="time" type="time" />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label>{tr.notes || "Additional Notes"}</label>
              <textarea
                className="inp"
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                style={{ resize: "vertical" }}
                disabled={orderLoading}
              />
            </div>
            <button
              className="btn-p"
              onClick={handleSubmitOrder}
              disabled={!form.name || !form.phone || !form.city || orderLoading}
              style={{
                width: "100%",
                padding: "14px",
                opacity: !form.name || !form.phone || !form.city || orderLoading ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: orderLoading ? "wait" : "pointer",
              }}
            >
              <FaWhatsapp size={18} />
              {orderLoading ? "Saving..." : `Send Order via WhatsApp`}
            </button>
          </div>

          {/* Order Summary */}
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              padding: 24,
              height: "fit-content",
            }}
          >
            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Order Summary</h3>
            <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 20 }}>
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    paddingBottom: 16,
                    marginBottom: 16,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {item.name?.en || item.name} ×{item.qty}
                    </span>
                    <span style={{ fontSize: 14, color: C.accent }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                  {item.ribbon && <div style={{ fontSize: 12, color: C.secondary }}>🎀 {item.ribbon}</div>}
                  {item.wrap && <div style={{ fontSize: 12, color: C.secondary }}>📦 {item.wrap}</div>}
                  {item.cardText && <div style={{ fontSize: 12, color: C.secondary }}>💌 {item.cardText}</div>}
                </div>
              ))}
            </div>
            <div
              style={{
                paddingTop: 16,
                borderTop: `2px solid ${C.accent}`,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              <span>Total:</span>
              <span style={{ color: C.accent }}>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default CheckoutPage;
