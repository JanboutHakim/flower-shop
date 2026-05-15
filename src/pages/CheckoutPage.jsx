import React, { useState, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import { useOrder } from "../hooks/useDatabase";
import { updateOrder } from "../lib/supabase";
import { sendOrderToWhatsApp } from "../lib/whatsapp";
import { FaWhatsapp } from "react-icons/fa";

/* ============================================================
   INPUT COMPONENT
============================================================ */
const Inp = ({
  label,
  type = "text",
  placeholder = "",
  required = false,
  value,
  onChange,
  disabled,
}) => (
  <div style={{ marginBottom: 18 }}>
    <label
      style={{
        display: "block",
        marginBottom: 8,
        color: C.cream,
        fontSize: ".9rem",
      }}
    >
      {label}

      {required && (
        <span style={{ color: "#ff6b6b" }}> *</span>
      )}
    </label>

    <input
      className="inp"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: "100%",
      }}
    />
  </div>
);

function CheckoutPage() {
  const {
    tr,
    cart,
    cartTotal,
    lang,
    isMobile,
  } = useApp();

  const { createOrder, loading: orderLoading } =
    useOrder();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    date: "",
    time: "",
    notes: "",
  });

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] = useState(null);

  const set = useCallback((k, v) => {
    setForm((prev) => ({
      ...prev,
      [k]: v,
    }));
  }, []);

  /* ============================================================
     SUBMIT
  ============================================================ */
  const handleSubmitOrder = useCallback(async () => {
    try {
      setError(null);

      if (
        !form.name ||
        !form.phone ||
        !form.city
      ) {
        setError(
          "Please fill in all required fields"
        );
        return;
      }

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

      const orderData = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_city: form.city,
        customer_address: form.address,

        delivery_date: form.date,
        delivery_time: form.time,

        notes: form.notes || null,

        items: orderItems,

        total: cartTotal,

        status: "pending",

        whatsapp_sent: false,
      };

      const savedOrder = await createOrder(
        orderData
      );

      await updateOrder(savedOrder.id, {
        whatsapp_sent: true,
      });

      sendOrderToWhatsApp(
        cart,
        cartTotal,
        form
      );

      setSubmitted(true);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to submit order."
      );
    }
  }, [form, cart, cartTotal, createOrder]);

  /* ============================================================
     SUCCESS
  ============================================================ */
  if (submitted) {
    return (
      <div
        style={{
          paddingTop: 90,

          minHeight: "100vh",

          background: C.bg,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Section>
          <div
            style={{
              textAlign: "center",
              padding: 40,
            }}
          >
            <h2
              style={{
                fontSize: 28,

                marginBottom: 20,

                color: C.accent,
              }}
            >
              ✅ Order Received!
            </h2>

            <p
              style={{
                fontSize: 16,

                marginBottom: 20,

                color: C.cream,
              }}
            >
              Your order has been saved and sent to
              WhatsApp.
            </p>

            <p
              style={{
                fontSize: 14,
                color: C.secondary,
              }}
            >
              Order ID:{" "}
              <strong
                style={{
                  color: C.accent,
                }}
              >
                {form.phone}
              </strong>
            </p>
          </div>
        </Section>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */
  return (
    <div
      style={{
        paddingTop: 90,

        minHeight: "100vh",

        background: C.bg,

        overflowX: "hidden",
      }}
    >
      <Section
        style={{
          paddingTop: isMobile ? 24 : 40,

          paddingBottom: isMobile ? 40 : 80,

          paddingLeft: isMobile ? 14 : undefined,
          paddingRight: isMobile ? 14 : undefined,
        }}
      >
        <Tag>
          {tr.orderDetails || "Order Details"}
        </Tag>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: "#ff6b6b20",

              border: `1px solid #ff6b6b`,

              borderRadius: 6,

              padding: 16,

              marginBottom: 24,

              color: "#ff6b6b",
            }}
          >
            {error}
          </div>
        )}

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",

            gridTemplateColumns: isMobile
              ? "1fr"
              : "1fr 360px",

            gap: isMobile ? 24 : 40,

            marginTop: 32,

            alignItems: "start",
          }}
        >
          {/* FORM */}
          <div
            style={{
              background: C.bgCard,

              border: `1px solid ${C.border}`,

              borderRadius: 8,

              padding: isMobile ? 18 : 32,

              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "grid",

                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "1fr 1fr",

                gap: "0 20px",
              }}
            >
              <Inp
                label={
                  tr.fullName || "Full Name"
                }
                required
                value={form.name}
                onChange={(e) =>
                  set("name", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={tr.phone || "Phone"}
                type="tel"
                required
                value={form.phone}
                onChange={(e) =>
                  set("phone", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={tr.city || "City"}
                required
                value={form.city}
                onChange={(e) =>
                  set("city", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={tr.address || "Address"}
                value={form.address}
                onChange={(e) =>
                  set("address", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={
                  tr.delivDate ||
                  "Delivery Date"
                }
                type="date"
                value={form.date}
                onChange={(e) =>
                  set("date", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={
                  tr.delivTime ||
                  "Delivery Time"
                }
                type="time"
                value={form.time}
                onChange={(e) =>
                  set("time", e.target.value)
                }
                disabled={orderLoading}
              />
            </div>

            {/* NOTES */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",

                  marginBottom: 8,

                  color: C.cream,
                }}
              >
                {tr.notes ||
                  "Additional Notes"}
              </label>

              <textarea
                className="inp"
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  set("notes", e.target.value)
                }
                disabled={orderLoading}
                style={{
                  resize: "vertical",
                  width: "100%",
                }}
              />
            </div>

            {/* BUTTON */}
            <button
              className="btn-p"
              onClick={handleSubmitOrder}
              disabled={
                !form.name ||
                !form.phone ||
                !form.city ||
                orderLoading
              }
              style={{
                width: "100%",

                padding: "14px",

                opacity:
                  !form.name ||
                  !form.phone ||
                  !form.city ||
                  orderLoading
                    ? 0.5
                    : 1,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                gap: 10,

                cursor: orderLoading
                  ? "wait"
                  : "pointer",
              }}
            >
              <FaWhatsapp size={18} />

              {orderLoading
                ? "Saving..."
                : "Send Order via WhatsApp"}
            </button>
          </div>

          {/* SUMMARY */}
          <div
            style={{
              background: C.bgCard,

              border: `1px solid ${C.border}`,

              borderRadius: 8,

              padding: isMobile ? 18 : 24,

              height: "fit-content",

              minWidth: 0,
            }}
          >
            <h3
              style={{
                marginBottom: 20,

                fontSize: 16,

                fontWeight: 600,

                color: C.cream,
              }}
            >
              Order Summary
            </h3>

            <div
              style={{
                maxHeight: 300,

                overflowY: "auto",

                marginBottom: 20,
              }}
            >
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    paddingBottom: 16,

                    marginBottom: 16,

                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",

                      justifyContent:
                        "space-between",

                      gap: 12,

                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,

                        fontWeight: 500,

                        color: C.cream,
                      }}
                    >
                      {item.name?.[lang] ||
                        item.name}{" "}
                      ×{item.qty}
                    </span>

                    <span
                      style={{
                        fontSize: 14,

                        color: C.accent,

                        whiteSpace: "nowrap",
                      }}
                    >
                      $
                      {(
                        item.price * item.qty
                      ).toFixed(2)}
                    </span>
                  </div>

                  {item.ribbon && (
                    <div
                      style={{
                        fontSize: 12,
                        color: C.secondary,
                      }}
                    >
                      🎀 {item.ribbon}
                    </div>
                  )}

                  {item.wrap && (
                    <div
                      style={{
                        fontSize: 12,
                        color: C.secondary,
                      }}
                    >
                      📦 {item.wrap}
                    </div>
                  )}

                  {item.cardText && (
                    <div
                      style={{
                        fontSize: 12,
                        color: C.secondary,
                      }}
                    >
                      💌 {item.cardText}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div
              style={{
                paddingTop: 16,

                borderTop: `2px solid ${C.accent}`,

                display: "flex",

                justifyContent:
                  "space-between",

                fontSize: 18,

                fontWeight: 700,

                color: C.cream,
              }}
            >
              <span>Total:</span>

              <span
                style={{
                  color: C.accent,
                }}
              >
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default CheckoutPage;