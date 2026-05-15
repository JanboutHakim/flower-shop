import React, { useState, useCallback, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { useApp } from "../contexts/AppContext";
import { C } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import { useOrder } from "../hooks/useDatabase";
import { updateOrder } from "../lib/supabase";
import { sendOrderToWhatsApp } from "../lib/whatsapp";
import { uploadToCloudinary } from "../lib/cloudinary";
import {
  DELIVERY_FEE,
  SHAM_CASH_ACCOUNT_NUMBER,
  SHAM_CASH_QR_TEXT,
  formatCurrency,
} from "../constants/options";
import { FaWhatsapp } from "react-icons/fa";

const PAYMENT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PAYMENT_IMAGE_MAX_SIZE = 8 * 1024 * 1024;

const COPY = {
  en: {
    requiredError: "Please fill in all required fields.",
    deliveryAddressError: "Please add an address for delivery.",
    paymentImageRequired: "Please attach the Sham Cash payment image.",
    paymentImageType: "Please attach a JPG, PNG, or WebP payment image.",
    paymentImageSize: "Payment image must be smaller than 8 MB.",
    uploadQrError: "Failed to generate Sham Cash QR:",
    successTitle: "Order Received!",
    successText: "Your order has been saved and sent to WhatsApp.",
    orderId: "Order ID",
    orderDetails: "Order Details",
    fullName: "Full Name",
    phone: "Phone Number",
    city: "City",
    address: "Delivery Address",
    deliveryDate: "Delivery Date",
    deliveryTime: "Delivery Time",
    notes: "Additional Notes",
    addDelivery: "Add delivery",
    deliveryFee: "Delivery fee",
    paymentMethod: "Payment Method",
    cash: "Cash on delivery",
    shamCash: "Sham Cash",
    downloadQr: "Download QR",
    account: "Account",
    shamCashHelp:
      "Pay with Sham Cash, then attach a screenshot of the payment. The image will upload to Cloudinary and save on the order.",
    attached: "Attached",
    saving: "Saving...",
    send: "Send Order via WhatsApp",
    summary: "Order Summary",
    subtotal: "Subtotal",
    delivery: "Delivery",
    total: "Total:",
    none: "-",
  },
  ar: {
    requiredError: "يرجى تعبئة جميع الحقول المطلوبة.",
    deliveryAddressError: "يرجى إضافة العنوان للتوصيل.",
    paymentImageRequired: "يرجى إرفاق صورة دفع شام كاش.",
    paymentImageType: "يرجى إرفاق صورة بصيغة JPG أو PNG أو WebP.",
    paymentImageSize: "يجب أن تكون صورة الدفع أصغر من 8 ميغابايت.",
    uploadQrError: "فشل إنشاء رمز شام كاش:",
    successTitle: "تم استلام الطلب!",
    successText: "تم حفظ طلبك وإرساله إلى واتساب.",
    orderId: "رقم الطلب",
    orderDetails: "تفاصيل الطلب",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    city: "المدينة",
    address: "عنوان التوصيل",
    deliveryDate: "تاريخ التوصيل",
    deliveryTime: "وقت التوصيل",
    notes: "ملاحظات إضافية",
    addDelivery: "إضافة توصيل",
    deliveryFee: "رسوم التوصيل",
    paymentMethod: "طريقة الدفع",
    cash: "الدفع عند الاستلام",
    shamCash: "شام كاش",
    downloadQr: "تحميل الرمز",
    account: "الحساب",
    shamCashHelp:
      "ادفع عبر شام كاش، ثم أرفق لقطة شاشة لعملية الدفع. سيتم رفع الصورة إلى Cloudinary وحفظها مع الطلب.",
    attached: "تم إرفاق",
    saving: "جار الحفظ...",
    send: "إرسال الطلب عبر واتساب",
    summary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    total: "المجموع:",
    none: "-",
  },
};

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
    cart,
    cartTotal,
    lang,
    isMobile,
  } = useApp();
  const copy = COPY[lang] || COPY.en;

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
    deliveryRequested: false,
    paymentMethod: "cash",
  });

  const [submitted, setSubmitted] =
    useState(false);
  const [savedOrderId, setSavedOrderId] = useState(null);

  const [error, setError] = useState(null);
  const [paymentImage, setPaymentImage] = useState(null);
  const [paymentImageError, setPaymentImageError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  const finalTotal = useMemo(
    () => cartTotal + (form.deliveryRequested ? DELIVERY_FEE : 0),
    [cartTotal, form.deliveryRequested]
  );

  useEffect(() => {
    QRCode.toDataURL(SHAM_CASH_QR_TEXT, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0a0806",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error(copy.uploadQrError, err));
  }, [copy.uploadQrError]);

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
          copy.requiredError
        );
        return;
      }

      if (form.deliveryRequested && !form.address) {
        setError(copy.deliveryAddressError);
        return;
      }

      if (form.paymentMethod === "sham_cash" && !paymentImage) {
        setError(copy.paymentImageRequired);
        return;
      }

      if (form.paymentMethod === "sham_cash" && paymentImageError) {
        setError(paymentImageError);
        return;
      }

      const paymentReceiptUrl =
        form.paymentMethod === "sham_cash" && paymentImage
          ? await uploadToCloudinary(paymentImage)
          : null;

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

        subtotal: cartTotal,
        delivery_requested: form.deliveryRequested,
        delivery_fee: form.deliveryRequested ? DELIVERY_FEE : 0,
        payment_method: form.paymentMethod,
        payment_receipt_url: paymentReceiptUrl,
        total: finalTotal,

        status: "pending",

        whatsapp_sent: false,
      };

      const savedOrder = await createOrder(
        orderData
      );
      setSavedOrderId(savedOrder.id);

      await updateOrder(savedOrder.id, {
        whatsapp_sent: true,
      });

      sendOrderToWhatsApp(
        cart,
        finalTotal,
        {
          ...form,
          subtotal: cartTotal,
          deliveryFee: form.deliveryRequested ? DELIVERY_FEE : 0,
          paymentReceiptUrl,
          orderId: savedOrder.id,
        }
      );

      setSubmitted(true);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to submit order."
      );
    }
  }, [
    form,
    cart,
    cartTotal,
    finalTotal,
    paymentImage,
    paymentImageError,
    copy,
    createOrder,
  ]);

  const downloadQr = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "sham-cash-qr.png";
    a.click();
  }, [qrDataUrl]);

  const handlePaymentImageChange = useCallback((file) => {
    setPaymentImageError("");

    if (!file) {
      setPaymentImage(null);
      return;
    }

    if (!PAYMENT_IMAGE_TYPES.includes(file.type)) {
      setPaymentImage(null);
      setPaymentImageError(copy.paymentImageType);
      return;
    }

    if (file.size > PAYMENT_IMAGE_MAX_SIZE) {
      setPaymentImage(null);
      setPaymentImageError(copy.paymentImageSize);
      return;
    }

    setPaymentImage(file);
  }, [copy.paymentImageSize, copy.paymentImageType]);

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
              {copy.successTitle}
            </h2>

            <p
              style={{
                fontSize: 16,

                marginBottom: 20,

                color: C.cream,
              }}
            >
              {copy.successText}
            </p>

            <p
              style={{
                fontSize: 14,
                color: C.secondary,
              }}
            >
              {copy.orderId}:{" "}
              <strong
                style={{
                  color: C.accent,
                }}
              >
                #{savedOrderId}
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
          {copy.orderDetails}
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
                  copy.fullName
                }
                required
                value={form.name}
                onChange={(e) =>
                  set("name", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={copy.phone}
                type="tel"
                required
                value={form.phone}
                onChange={(e) =>
                  set("phone", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={copy.city}
                required
                value={form.city}
                onChange={(e) =>
                  set("city", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={copy.address}
                value={form.address}
                onChange={(e) =>
                  set("address", e.target.value)
                }
                disabled={orderLoading}
              />

              <Inp
                label={
                  copy.deliveryDate
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
                  copy.deliveryTime
                }
                type="time"
                value={form.time}
                onChange={(e) =>
                  set("time", e.target.value)
                }
                disabled={orderLoading}
              />
            </div>

            {/* DELIVERY */}
            <div
              style={{
                background: "rgba(201,149,108,.06)",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 18,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: C.cream,
                  marginBottom: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.deliveryRequested}
                  onChange={(e) =>
                    set("deliveryRequested", e.target.checked)
                  }
                  disabled={orderLoading}
                />
                {copy.addDelivery}
              </label>
              <div style={{ color: C.secondary, fontSize: 13 }}>
                {copy.deliveryFee}: {formatCurrency(DELIVERY_FEE)}
              </div>
            </div>

            {/* PAYMENT */}
            <div
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 18,
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: C.cream,
                }}
              >
                {copy.paymentMethod}
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 10,
                  marginBottom: form.paymentMethod === "sham_cash" ? 16 : 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => set("paymentMethod", "cash")}
                  disabled={orderLoading}
                  style={{
                    padding: "11px",
                    background:
                      form.paymentMethod === "cash"
                        ? "rgba(201,149,108,.18)"
                        : "transparent",
                    border: `1px solid ${
                      form.paymentMethod === "cash" ? C.accent : C.border
                    }`,
                    color:
                      form.paymentMethod === "cash" ? C.accent : C.creamD,
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  {copy.cash}
                </button>

                <button
                  type="button"
                  onClick={() => set("paymentMethod", "sham_cash")}
                  disabled={orderLoading}
                  style={{
                    padding: "11px",
                    background:
                      form.paymentMethod === "sham_cash"
                        ? "rgba(201,149,108,.18)"
                        : "transparent",
                    border: `1px solid ${
                      form.paymentMethod === "sham_cash"
                        ? C.accent
                        : C.border
                    }`,
                    color:
                      form.paymentMethod === "sham_cash"
                        ? C.accent
                        : C.creamD,
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  {copy.shamCash}
                </button>
              </div>

              {form.paymentMethod === "sham_cash" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "170px 1fr",
                    gap: 16,
                    alignItems: "start",
                  }}
                >
                  <div>
                    {qrDataUrl && (
                      <img
                        src={qrDataUrl}
                        alt="Sham Cash QR"
                        style={{
                          width: "100%",
                          maxWidth: 170,
                          background: "#fff",
                          padding: 8,
                          borderRadius: 6,
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={downloadQr}
                      className="btn-s"
                      style={{
                        marginTop: 8,
                        padding: "8px 10px",
                        width: "100%",
                        fontSize: ".72rem",
                      }}
                    >
                      {copy.downloadQr}
                    </button>
                  </div>

                  <div>
                    <div
                      style={{
                        color: C.cream,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {copy.account}: {SHAM_CASH_ACCOUNT_NUMBER}
                    </div>
                    <p
                      style={{
                        color: C.secondary,
                        fontSize: 13,
                        lineHeight: 1.6,
                        marginBottom: 12,
                      }}
                    >
                      {copy.shamCashHelp}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handlePaymentImageChange(e.target.files?.[0] || null)
                      }
                      disabled={orderLoading}
                      style={{
                        width: "100%",
                        color: C.cream,
                        border: `1px solid ${C.border}`,
                        padding: 10,
                        borderRadius: 4,
                        background: "rgba(255,255,255,.04)",
                      }}
                    />
                    {paymentImageError && (
                      <div
                        style={{
                          color: "#ff8a8a",
                          fontSize: 12,
                          marginTop: 8,
                        }}
                      >
                        {paymentImageError}
                      </div>
                    )}
                    {paymentImage && !paymentImageError && (
                      <div
                        style={{
                          color: C.secondary,
                          fontSize: 12,
                          marginTop: 8,
                        }}
                      >
                        {copy.attached}: {paymentImage.name}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                {copy.notes}
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
                ? copy.saving
                : copy.send}
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
              {copy.summary}
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
                      {formatCurrency(item.price * item.qty)}
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                color: C.creamD,
                fontSize: 14,
              }}
            >
              <span>{copy.subtotal}</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                color: C.creamD,
                fontSize: 14,
              }}
            >
              <span>{copy.delivery}</span>
              <span>
                {form.deliveryRequested ? formatCurrency(DELIVERY_FEE) : copy.none}
              </span>
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
              <span>{copy.total}</span>

              <span
                style={{
                  color: C.accent,
                }}
              >
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default CheckoutPage;
