import React from "react";
import { FaMinus, FaPlus, FaWhatsapp } from "react-icons/fa";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import AvailabilityNote from "../components/ui/AvailabilityNote";
import { formatCurrency } from "../constants/options";
import { createWhatsAppLink, buildCartWhatsAppMessage } from "../lib/whatsapp";
import { getCartItemKey, getProductImage, getProductName, optionLabel } from "../lib/product";

function CartPage() {
  const {
    tr,
    navigate,
    cart,
    removeFromCart,
    updateCartQty,
    cartTotal,
    lang,
    isMobile,
    setSelectedProduct,
  } = useApp();

  const whatsappUrl = createWhatsAppLink(buildCartWhatsAppMessage(cart, cartTotal));

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg }}>
      <Section style={{ paddingTop: 40, paddingBottom: 80 }}>
        <Tag>{tr.yourCart}</Tag>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16, opacity: 0.4 }}>🛒</div>
            <p style={{ color: C.creamD }}>{tr.emptyCart}</p>
            <button className="btn-p" onClick={() => navigate("shop")} style={{ marginTop: 24 }}>
              {tr.shop}
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 380px",
              gap: 40,
              marginTop: 28,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map((item) => {
                const key = getCartItemKey(item);
                return (
                  <CartItem
                    key={key}
                    item={item}
                    itemKey={key}
                    lang={lang}
                    tr={tr}
                    isMobile={isMobile}
                    onQty={updateCartQty}
                    onRemove={removeFromCart}
                    onEdit={() => {
                      if (String(item.id).startsWith("custom") || item.type === "card") {
                        navigate(item.type === "card" ? "card-builder" : "ai-builder");
                        return;
                      }
                      setSelectedProduct(item);
                      navigate("product", { product: item });
                    }}
                  />
                );
              })}
            </div>

            <div
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 28,
                height: "fit-content",
                position: isMobile ? "static" : "sticky",
                top: isMobile ? "auto" : 90,
              }}
            >
              <h3
                style={{
                  fontFamily: FS,
                  fontSize: "1.3rem",
                  color: C.cream,
                  marginBottom: 24,
                }}
              >
                {tr.orderSummary}
              </h3>
              {cart.map((item) => (
                <div
                  key={getCartItemKey(item)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    color: C.creamD,
                    fontSize: ".85rem",
                    gap: 12,
                  }}
                >
                  <span>
                    {getProductName(item, lang)} x{item.qty}
                  </span>
                  <span>{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
              <div style={{ height: 1, background: C.border, margin: "20px 0" }} />
              <AvailabilityNote compact style={{ marginBottom: 16 }} />
              <p style={{ color: C.creamD, fontSize: ".82rem", lineHeight: 1.6, marginBottom: 18 }}>
                {lang === "ar"
                  ? "يمكنك مراجعة تفاصيل الباقة النهائية عبر واتساب قبل التحضير."
                  : "You can review the final bouquet details on WhatsApp before preparation."}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ color: C.cream, fontWeight: 600 }}>{tr.total}</span>
                <span style={{ fontFamily: FS, fontSize: "1.5rem", color: C.accent }}>
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <button
                className="btn-p"
                onClick={() => navigate("checkout")}
                style={{ width: "100%", padding: "13px", marginBottom: 10 }}
              >
                {tr.checkout}
              </button>
              <a
                className="btn-s"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "100%",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <FaWhatsapp aria-hidden="true" />
                {lang === "ar" ? "تأكيد عبر واتساب" : "Confirm via WhatsApp"}
              </a>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function CartItem({ item, itemKey, lang, tr, isMobile, onQty, onRemove, onEdit }) {
  const image = getProductImage(item);
  const name = getProductName(item, lang);
  const details = buildDetails(item, lang);
  const cardPreview = item.cardText || item.cardMessage || item.msg;

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: isMobile ? 16 : "18px 20px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "84px 1fr auto",
        gap: 16,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: isMobile ? "100%" : 84,
          height: isMobile ? 160 : 84,
          borderRadius: 6,
          background: C.bgEl,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.4rem",
        }}
      >
        {image ? (
          <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          item.icon || "💐"
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: FS, fontSize: "1.1rem", color: C.cream }}>{name}</div>
        {details.length > 0 && (
          <div style={{ color: C.creamD, fontSize: ".8rem", marginTop: 6, lineHeight: 1.7 }}>
            {details.join(" · ")}
          </div>
        )}
        {item.deliveryDate && (
          <div style={{ color: C.creamD, fontSize: ".78rem", marginTop: 4 }}>
            {lang === "ar" ? "تاريخ التوصيل" : "Delivery date"}: {item.deliveryDate}
          </div>
        )}
        {cardPreview && (
          <div
            style={{
              marginTop: 8,
              padding: "7px 9px",
              background: "rgba(201,149,108,.1)",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: C.accent,
              fontSize: ".75rem",
              fontStyle: "italic",
            }}
          >
            "{String(cardPreview).slice(0, 90)}{String(cardPreview).length > 90 ? "..." : ""}"
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: isMobile ? "stretch" : "flex-end" }}>
        <div style={{ fontFamily: FS, fontSize: "1.2rem", color: C.accent }}>
          {formatCurrency(item.price * item.qty)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn-s" onClick={() => onQty(itemKey, item.qty - 1)} style={qtyBtn}>
            <FaMinus aria-hidden="true" />
          </button>
          <input
            className="inp"
            type="number"
            min="1"
            value={item.qty}
            onChange={(e) => onQty(itemKey, e.target.value)}
            style={{ width: 58, textAlign: "center", padding: "7px 8px" }}
          />
          <button className="btn-s" onClick={() => onQty(itemKey, item.qty + 1)} style={qtyBtn}>
            <FaPlus aria-hidden="true" />
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-s" onClick={onEdit} style={{ padding: "7px 12px", fontSize: ".72rem" }}>
            {tr.editBtn || "Edit"}
          </button>
          <button className="btn-danger" onClick={() => onRemove(itemKey)}>
            {tr.removeItem}
          </button>
        </div>
      </div>
    </div>
  );
}

const qtyBtn = {
  width: 34,
  height: 34,
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function buildDetails(item, lang) {
  const details = [];
  if (item.flowerCount) details.push(`${lang === "ar" ? "الحجم" : "Flowers"}: ${item.flowerCount}`);
  if (item.ribbon) details.push(`${lang === "ar" ? "الشريط" : "Ribbon"}: ${optionLabel(item.ribbon, lang)}`);
  if (item.wrap) details.push(`${lang === "ar" ? "التغليف" : "Wrapping"}: ${optionLabel(item.wrap, lang)}`);
  if (item.customSummary) {
    Object.entries(item.customSummary)
      .filter(([, value]) => value)
      .forEach(([key, value]) => details.push(`${key}: ${value}`));
  }
  if (item.cardDesign) details.push(`${lang === "ar" ? "تصميم البطاقة" : "Card design"}: ${item.cardDesign}`);
  details.push(`${lang === "ar" ? "التوفر" : "Availability"}: ${optionLabel("dailyFlowers", lang)}`);
  return details;
}

export default React.memo(CartPage);
