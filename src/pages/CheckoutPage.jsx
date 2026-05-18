import React, { useCallback, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import AvailabilityNote from "../components/ui/AvailabilityNote";
import { useOrder } from "../hooks/useDatabase";
import { sendOrderToWhatsApp } from "../lib/whatsapp";
import { formatCurrency } from "../constants/options";
import { getCartItemKey, getProductName } from "../lib/product";

const initialForm = {
  name: "",
  phone: "",
  recipientName: "",
  recipientPhone: "",
  address: "",
  date: "",
  time: "",
  senderName: "",
  giftMessage: "",
  notes: "",
};

function CheckoutPage() {
  const { tr, cart, cartTotal, lang, isMobile } = useApp();
  const { createOrder, loading: orderLoading } = useOrder();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const set = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmitOrder = useCallback(async () => {
    setError(null);

    if (!form.name || !form.phone || !form.recipientName || !form.address || !form.date) {
      setError(lang === "ar" ? "يرجى تعبئة الحقول المطلوبة." : "Please fill in the required fields.");
      return;
    }

    const orderItems = cart.map((item) => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      ribbon: item.ribbon || null,
      wrap: item.wrap || null,
      custom_summary: item.customSummary || null,
      card_message: item.cardText || item.cardMessage || item.msg || null,
      subtotal: item.price * item.qty,
    }));

    const orderData = {
      customer_name: form.name,
      customer_phone: form.phone,
      recipient_name: form.recipientName,
      recipient_phone: form.recipientPhone,
      customer_address: form.address,
      delivery_date: form.date,
      delivery_time: form.time,
      sender_name: form.senderName,
      gift_message: form.giftMessage,
      notes: form.notes || null,
      items: orderItems,
      total: cartTotal,
      status: "pending_whatsapp_confirmation",
      whatsapp_sent: true,
    };

    try {
      await createOrder(orderData);
    } catch (err) {
      console.warn("Order database save failed; continuing with WhatsApp confirmation.", err);
    }

    sendOrderToWhatsApp(cart, cartTotal, form);
    setSubmitted(true);
  }, [cart, cartTotal, createOrder, form, lang]);

  if (submitted) {
    return (
      <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center" }}>
        <Section>
          <div style={{ textAlign: "center", padding: 40 }}>
            <h2 style={{ fontFamily: FS, fontSize: 32, marginBottom: 16, color: C.accent }}>
              {lang === "ar" ? "تم استلام الطلب" : "Order Received"}
            </h2>
            <p style={{ fontSize: 16, color: C.cream, lineHeight: 1.7 }}>
              {lang === "ar"
                ? "سيتم تأكيد طلبك عبر واتساب قبل تحضير الباقة."
                : "Your order will be confirmed through WhatsApp before preparation."}
            </p>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg, overflowX: "hidden" }}>
      <Section
        style={{
          paddingTop: isMobile ? 24 : 40,
          paddingBottom: isMobile ? 40 : 80,
          paddingLeft: isMobile ? 14 : undefined,
          paddingRight: isMobile ? 14 : undefined,
        }}
      >
        <Tag>{tr.orderDetails || "Delivery Details"}</Tag>
        <p style={{ color: C.creamD, marginTop: 12, lineHeight: 1.7 }}>
          {lang === "ar"
            ? "الدفع الإلكتروني غير مفعل حالياً. سيتم تأكيد الطلب والتفاصيل عبر واتساب قبل التحضير."
            : "Payment is not implemented yet. Your order will be confirmed through WhatsApp before preparation."}
        </p>

        {error && (
          <div
            style={{
              background: "#ff6b6b20",
              border: "1px solid #ff6b6b",
              borderRadius: 6,
              padding: 16,
              marginTop: 24,
              color: "#ffb0b0",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 380px",
            gap: isMobile ? 24 : 40,
            marginTop: 32,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: isMobile ? 18 : 32,
              minWidth: 0,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 20px" }}>
              <Inp label={lang === "ar" ? "اسم العميل" : "Customer name"} required value={form.name} onChange={(e) => set("name", e.target.value)} disabled={orderLoading} />
              <Inp label={lang === "ar" ? "هاتف العميل" : "Customer phone"} type="tel" required value={form.phone} onChange={(e) => set("phone", e.target.value)} disabled={orderLoading} />
              <Inp label={lang === "ar" ? "اسم المستلم" : "Recipient name"} required value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} disabled={orderLoading} />
              <Inp label={lang === "ar" ? "هاتف المستلم" : "Recipient phone"} type="tel" value={form.recipientPhone} onChange={(e) => set("recipientPhone", e.target.value)} disabled={orderLoading} />
              <Inp label={tr.delivDate || "Delivery date"} type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} disabled={orderLoading} />
              <Inp label={lang === "ar" ? "وقت التوصيل المفضل" : "Preferred delivery time"} type="time" value={form.time} onChange={(e) => set("time", e.target.value)} disabled={orderLoading} />
              <Inp label={lang === "ar" ? "اسم المرسل" : "Sender name"} value={form.senderName} onChange={(e) => set("senderName", e.target.value)} disabled={orderLoading} />
            </div>

            <TextArea label={tr.address || "Delivery address"} required value={form.address} onChange={(e) => set("address", e.target.value)} disabled={orderLoading} />
            <TextArea label={lang === "ar" ? "رسالة الهدية" : "Gift message"} value={form.giftMessage} onChange={(e) => set("giftMessage", e.target.value)} disabled={orderLoading} />
            <TextArea label={lang === "ar" ? "ملاحظات خاصة" : "Special notes"} value={form.notes} onChange={(e) => set("notes", e.target.value)} disabled={orderLoading} />

            <AvailabilityNote style={{ margin: "10px 0 18px" }} />

            <button
              className="btn-p"
              onClick={handleSubmitOrder}
              disabled={orderLoading || cart.length === 0}
              style={{
                width: "100%",
                padding: "14px",
                opacity: orderLoading || cart.length === 0 ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <FaWhatsapp size={18} />
              {orderLoading
                ? lang === "ar" ? "جارٍ التأكيد..." : "Confirming..."
                : lang === "ar" ? "تأكيد الطلب عبر واتساب" : "Confirm via WhatsApp"}
            </button>
          </div>

          <OrderSummary cart={cart} cartTotal={cartTotal} form={form} lang={lang} tr={tr} />
        </div>
      </Section>
    </div>
  );
}

function Inp({ label, type = "text", required = false, value, onChange, disabled }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label>
        {label}
        {required && <span style={{ color: "#ff8f8f" }}> *</span>}
      </label>
      <input className="inp" type={type} value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function TextArea({ label, required = false, value, onChange, disabled }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label>
        {label}
        {required && <span style={{ color: "#ff8f8f" }}> *</span>}
      </label>
      <textarea className="inp" rows={3} value={value} onChange={onChange} disabled={disabled} style={{ resize: "vertical" }} />
    </div>
  );
}

function OrderSummary({ cart, cartTotal, form, lang, tr }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: 24,
        height: "fit-content",
        minWidth: 0,
      }}
    >
      <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700, color: C.cream }}>
        {tr.orderSummary || "Order Summary"}
      </h3>
      <div style={{ maxHeight: 320, overflowY: "auto", marginBottom: 20 }}>
        {cart.map((item) => (
          <div key={getCartItemKey(item)} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.cream }}>
                {getProductName(item, lang)} x{item.qty}
              </span>
              <span style={{ fontSize: 14, color: C.accent, whiteSpace: "nowrap" }}>
                {formatCurrency(item.price * item.qty)}
              </span>
            </div>
            {item.customSummary && <SmallLine label="Custom" value={Object.values(item.customSummary).join(" / ")} />}
            {(item.cardText || item.cardMessage || item.msg) && (
              <SmallLine label={lang === "ar" ? "رسالة البطاقة" : "Card message"} value={item.cardText || item.cardMessage || item.msg} />
            )}
          </div>
        ))}
      </div>
      <SmallLine label={tr.delivDate || "Delivery date"} value={form.date || "-"} />
      <SmallLine label={tr.delivTime || "Delivery time"} value={form.time || "-"} />
      <div style={{ paddingTop: 16, borderTop: `2px solid ${C.accent}`, display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: C.cream }}>
        <span>{tr.total || "Total"}:</span>
        <span style={{ color: C.accent }}>{formatCurrency(cartTotal)}</span>
      </div>
    </div>
  );
}

function SmallLine({ label, value }) {
  return (
    <div style={{ fontSize: 12, color: C.creamD, lineHeight: 1.6 }}>
      <strong style={{ color: C.cream }}>{label}:</strong> {value}
    </div>
  );
}

export default CheckoutPage;
