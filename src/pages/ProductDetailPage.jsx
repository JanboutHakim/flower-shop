import React, { useState, useCallback, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { C, FS, FB } from "../constants/theme";
import Section from "../components/ui/Section";
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../constants/options";
import AvailabilityNote from "../components/ui/AvailabilityNote";
import {
  getProductDescription,
  getProductImage,
  getProductMeta,
  getProductName,
  optionLabel,
} from "../lib/product";
import { buildProductWhatsAppMessage, createWhatsAppLink } from "../lib/whatsapp";
import { FaWhatsapp } from "react-icons/fa";

/* ============================================================
   Horizontal Picker
============================================================ */
const HorizontalPicker = ({
  options,
  value,
  onChange,
  label,
  lang,
  isMobile,
}) => (
  <div
    style={{
      marginBottom: 24,
      width: "100%",
      overflow: "hidden",
    }}
  >
    <label
      style={{
        display: "block",
        marginBottom: 12,
        color: C.cream,
        fontFamily: FS,
        fontSize: "1rem",
      }}
    >
      {label}
    </label>

    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        overflowX: "auto",
        overflowY: "hidden",
        gap: 12,

        width: "100%",
        maxWidth: "100%",

        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",

        touchAction: "pan-x",

        paddingBottom: 10,
        cursor: "grab",
      }}
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {options.map((opt) => {
        const active = value === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              flexShrink: 0,
              width: isMobile ? 100 : 120,
              minWidth: isMobile ? 100 : 120,

              background: C.bgCard,
              border: active
                ? `2px solid ${C.accent}`
                : `1px solid ${C.border}`,

              borderRadius: 8,
              overflow: "hidden",
              cursor: "pointer",
              padding: 0,

              transition: "all .2s ease",
              transform: active ? "scale(1.03)" : "scale(1)",

              boxShadow: active
                ? "0 0 20px rgba(201,149,108,.25)"
                : "none",
            }}
          >
            <img
              src={opt.image}
              alt={opt.label?.[lang] || opt.label}
              style={{
                width: "100%",
                height: isMobile ? 72 : 90,
                objectFit: "cover",
                display: "block",
              }}
            />

            <div
              style={{
                padding: "10px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {opt.color && (
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: opt.color,
                    border: "1px solid rgba(255,255,255,.2)",
                    flexShrink: 0,
                  }}
                />
              )}

              <span
                style={{
                  color: active ? C.accent : C.creamD,
                  fontSize: isMobile ? ".68rem" : ".78rem",
                  fontFamily: FB,
                  letterSpacing: ".04em",

                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {opt.label?.[lang] || opt.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

function ProductDetailPage() {
  const {
    tr,
    navigate,
    selectedProduct,
    addToCart,
    lang,
    categories,
    isMobile,
    products,
  } = useApp();

  const productIdFromPath = window.location.pathname.match(/^\/product\/([^/]+)/)?.[1];
  const product =
    selectedProduct ||
    products.find((item) => String(item.id) === String(productIdFromPath));
  const meta = getProductMeta(product);
  const productName = getProductName(product, lang);
  const productDescription = getProductDescription(product, lang);
  const productImage = getProductImage(product);

  const [ribbons, setRibbons] = useState([]);
  const [wraps, setWraps] = useState([]);
  const [cards, setCards] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  const [ribbon, setRibbon] = useState("");
  const [wrap, setWrap] = useState("");
  const [msg, setMsg] = useState("");
  const [qty, setQty] = useState(1);
  const [flowerCount, setFlowerCount] = useState(product?.count || 1);

  const [added, setAdded] = useState(false);

  const [showCardModal, setShowCardModal] = useState(false);
  const [cardChoice, setCardChoice] = useState(null);
  const [cardText, setCardText] = useState("");
  const customizedUnitPrice = product?.count
    ? Math.round((product.price / product.count) * flowerCount * 100) / 100
    : product?.price || 0;

  /* ============================================================
     Fetch data
  ============================================================ */
  useEffect(() => {
    async function fetchAll() {
      try {
        const [{ data: r }, { data: w }, { data: c }] =
          await Promise.all([
            supabase.from("ribbons").select("*").order("sort_order"),
            supabase.from("wraps").select("*").order("sort_order"),
            supabase.from("cards").select("*").order("sort_order"),
          ]);

        const ribbonsMapped = (r || []).map((item) => ({
          id: item.id,
          label: {
            en: item.label_en,
            ar: item.label_ar,
          },
          color: item.color,
          image: item.image_url,
        }));

        const wrapsMapped = (w || []).map((item) => ({
          id: item.id,
          label: {
            en: item.label_en,
            ar: item.label_ar,
          },
          image: item.image_url,
        }));

        const cardsMapped = (c || []).map((item) => ({
          id: item.id,
          label: {
            en: item.label_en,
            ar: item.label_ar,
          },
          image: item.image_url,
        }));

        setRibbons(ribbonsMapped);
        setWraps(wrapsMapped);
        setCards(cardsMapped);

        if (ribbonsMapped.length) setRibbon(ribbonsMapped[0].id);
        if (wrapsMapped.length) setWrap(wrapsMapped[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setDbLoading(false);
      }
    }

    fetchAll();
  }, []);

  useEffect(() => {
    setFlowerCount(product?.count || 1);
  }, [product]);

  const handleAdd = useCallback(() => {
    addToCart(
      {
        ...product,
        price: customizedUnitPrice,
        ribbon,
        wrap,
        msg,
        flowerCount,
        cardShape: cardChoice,
        cardText,
        selectedOptions: {
          ribbon,
          wrap,
          flowerCount,
          cardShape: cardChoice,
        },
      },
      qty
    );

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }, [
    addToCart,
    product,
    ribbon,
    wrap,
    msg,
    flowerCount,
    cardChoice,
    cardText,
    customizedUnitPrice,
    qty,
  ]);

  if (!product) {
    navigate("shop");
    return null;
  }

  if (dbLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          color: C.cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  const whatsappUrl = createWhatsAppLink(
    buildProductWhatsAppMessage(product, {
      qty,
      lang,
      price: customizedUnitPrice * qty,
      ribbon,
      wrap,
      flowerCount,
      cardText: cardText || msg,
    })
  );

  return (
    <div
      style={{
        paddingTop: 90,
        minHeight: "100vh",
        background: C.bg,

        overflowX: "hidden",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      <Section
        style={{
          paddingTop: isMobile ? 16 : 32,
          paddingBottom: isMobile ? 40 : 80,
          paddingLeft: isMobile ? 14 : undefined,
          paddingRight: isMobile ? 14 : undefined,
        }}
      >
        <button
          className="btn-s"
          onClick={() => navigate("shop")}
          style={{
            marginBottom: isMobile ? 20 : 32,
            fontSize: ".78rem",
          }}
        >
          {tr.back}
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "minmax(320px,1fr) minmax(320px,1fr)",

            gap: isMobile ? 24 : 48,

            alignItems: "start",

            width: "100%",
            overflow: "hidden",
          }}
        >
          {/* IMAGE */}
          <div
  style={{
    background: C.bgEl,
    borderRadius: 8,

    border: `1px solid ${C.border}`,

    overflow: "hidden",

    minWidth: 0,

    width: "100%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: isMobile ? 12 : 20,
  }}
>
  {productImage ? (
    <img
      src={productImage}
      alt={productName}
      style={{
        width: "100%",
        height: "auto",

        maxHeight: isMobile ? 320 : 600,

        objectFit: "contain",

        display: "block",
        borderRadius: 4,
      }}
    />
  ) : (
    <span
      style={{
        fontSize: isMobile ? "6rem" : "9rem",
      }}
    >
      {product?.icon}
    </span>
  )}
</div>

          {/* DETAILS */}
          <div
            style={{
              minWidth: 0,
              width: "100%",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: ".75rem",
                color: C.accent,
                letterSpacing: ".12em",
                textTransform: "uppercase",
              }}
            >
              {categories.find((c) => c.id === product.category)?.icon}{" "}
              {tr[product.category] || product.category}
            </span>

            <h1
              style={{
                fontFamily: FS,
                fontSize: isMobile ? "1.8rem" : "2.4rem",
                fontWeight: 300,
                color: C.cream,

                marginTop: 8,
                marginBottom: 12,

                fontStyle: "italic",
                lineHeight: 1.2,
              }}
            >
              {productName}
            </h1>

            <p
              style={{
                color: C.creamD,
                lineHeight: 1.8,
                marginBottom: 24,
                fontSize: isMobile ? ".9rem" : "1rem",
              }}
            >
              {productDescription}
            </p>

            <ProductInfoSections meta={meta} lang={lang} tr={tr} isMobile={isMobile} />

            {/* FLOWER COUNT */}
            <div style={{ marginBottom: 20 }}>
              <label>{tr.numberOfFlowers}</label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                <button
                  className="btn-s"
                  onClick={() =>
                    setFlowerCount((f) => Math.max(1, f - 1))
                  }
                  style={{
                    padding: "5px 14px",
                  }}
                >
                  −
                </button>

                <input
                  type="number"
                  value={flowerCount}
                  onChange={(e) =>
                    setFlowerCount(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  style={{
                    width: 80,
                    padding: "8px 12px",

                    background: "rgba(201,149,108,.08)",

                    border: `1px solid ${C.border}`,

                    color: C.cream,

                    textAlign: "center",

                    borderRadius: 4,

                    fontFamily: FS,
                    fontSize: "1.1rem",
                  }}
                />

                <button
                  className="btn-s"
                  onClick={() => setFlowerCount((f) => f + 1)}
                  style={{
                    padding: "5px 14px",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* PICKERS */}
            <HorizontalPicker
              label={`🎀 ${tr.ribbonColor}`}
              options={ribbons}
              value={ribbon}
              onChange={setRibbon}
              lang={lang}
              isMobile={isMobile}
            />

            <HorizontalPicker
              label={`🎁 ${tr.wrappingColor}`}
              options={wraps}
              value={wrap}
              onChange={setWrap}
              lang={lang}
              isMobile={isMobile}
            />

            <HorizontalPicker
              label={`💌 ${
                tr.selectCardShape || "Select Card Shape"
              }`}
              options={cards}
              value={cardChoice}
              onChange={setCardChoice}
              lang={lang}
              isMobile={isMobile}
            />

            {/* MESSAGE */}
            <div style={{ marginBottom: 20 }}>
              <label>{tr.cardMsg}</label>

              <textarea
                className="inp"
                rows={3}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                style={{
                  resize: "vertical",
                  width: "100%",
                }}
              />
            </div>

            {/* CARD OPTIONS */}
            <div style={{ marginBottom: 20 }}>
              <label>{tr.cardOption || "Card Option"}</label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "1fr 1fr",

                  gap: 8,
                  marginTop: 8,
                  width: "100%",
                }}
              >
                <button
                  onClick={() => {
                    setCardChoice("text");
                    setShowCardModal(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",

                    background:
                      cardChoice === "text"
                        ? "rgba(201,149,108,.18)"
                        : "transparent",

                    border: `1px solid ${
                      cardChoice === "text"
                        ? C.accent
                        : C.border
                    }`,

                    color:
                      cardChoice === "text"
                        ? C.accent
                        : C.creamD,

                    cursor: "pointer",

                    borderRadius: 4,

                    fontFamily: FB,
                    fontSize: ".85rem",
                  }}
                >
                  {tr.addQrUrl || "Add a QR URL"}
                </button>

                <button
                  onClick={() => {
                    setCardChoice("custom");
                    navigate("card-builder");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",

                    background:
                      cardChoice === "custom"
                        ? "rgba(201,149,108,.18)"
                        : "transparent",

                    border: `1px solid ${
                      cardChoice === "custom"
                        ? C.accent
                        : C.border
                    }`,

                    color:
                      cardChoice === "custom"
                        ? C.accent
                        : C.creamD,

                    cursor: "pointer",

                    borderRadius: 4,

                    fontFamily: FB,
                    fontSize: ".85rem",
                  }}
                >
                  🎨{" "}
                  {tr.buildCustomCard ||
                    "Build Custom Card"}
                </button>
              </div>
            </div>

            <AvailabilityNote style={{ marginBottom: 22 }} />

            {/* QTY + PRICE */}
            <div
              style={{
                display: "flex",

                flexDirection: isMobile ? "column" : "row",

                alignItems: isMobile
                  ? "flex-start"
                  : "center",

                gap: isMobile ? 16 : 0,

                justifyContent: "space-between",

                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <label>{tr.qty}</label>

                <button
                  className="btn-s"
                  onClick={() =>
                    setQty((q) => Math.max(1, q - 1))
                  }
                  style={{
                    padding: "5px 14px",
                  }}
                >
                  −
                </button>

                <span
                  style={{
                    fontFamily: FS,
                    fontSize: "1.2rem",
                    color: C.cream,
                  }}
                >
                  {qty}
                </span>

                <button
                  className="btn-s"
                  onClick={() => setQty((q) => q + 1)}
                  style={{
                    padding: "5px 14px",
                  }}
                >
                  +
                </button>
              </div>

              <span
                style={{
                  fontFamily: FS,
                  fontSize: isMobile ? "1.6rem" : "2rem",
                  color: C.accent,
                  fontWeight: 600,
                }}
              >
                {formatCurrency(customizedUnitPrice * qty)}
              </span>
            </div>

            {/* ADD BUTTON */}
            <button
              className="btn-p"
              onClick={handleAdd}
              style={{
                width: "100%",
                padding: "14px",

                background: added
                  ? "linear-gradient(135deg,#2a6a3a,#1a4a2a)"
                : undefined,
              }}
            >
              {added ? tr.successAdd : tr.addToCart}
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button className="btn-s" onClick={() => navigate("ai-builder")}>
                {lang === "ar" ? "خصص هذه الباقة" : "Customize this Bouquet"}
              </button>
              <a
                className="btn-s"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <FaWhatsapp aria-hidden="true" />
                {lang === "ar" ? "اطلب عبر واتساب" : "Order on WhatsApp"}
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* MODAL */}
      {showCardModal && (
        <div
          onClick={() => setShowCardModal(false)}
          style={{
            position: "fixed",
            inset: 0,

            background: "rgba(0,0,0,.8)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            zIndex: 9999,

            padding: isMobile ? 12 : 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.bgCard,

              border: `1px solid ${C.border}`,

              borderRadius: 8,

              padding: isMobile ? 20 : 32,

              maxWidth: 500,
              width: "100%",
            }}
          >
            <h3
              style={{
                fontFamily: FS,
                color: C.cream,

                marginBottom: 16,

                fontStyle: "italic",

                fontSize: isMobile ? "1.1rem" : "1.25rem",
              }}
            >
              ✍️{" "}
              {tr.writeCardMessage ||
                "Write Your Card Message"}
            </h3>

            <textarea
              className="inp"
              rows={5}
              value={cardText}
              onChange={(e) => setCardText(e.target.value)}
              style={{
                resize: "vertical",
                marginBottom: 16,
                width: "100%",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <button
                className="btn-p"
                onClick={() => setShowCardModal(false)}
                style={{ flex: 1 }}
              >
                {tr.save || "Save Message"}
              </button>

              <button
                className="btn-s"
                onClick={() => {
                  setCardText("");
                  setCardChoice(null);
                  setShowCardModal(false);
                }}
              >
                {tr.cancel || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductInfoSections({ meta, lang, tr, isMobile }) {
  const detailRows = [
    [lang === "ar" ? "الحجم" : "Size", meta.size],
    [lang === "ar" ? "الألوان الرئيسية" : "Main colors", meta.colors.map((c) => optionLabel(c, lang)).join(", ")],
    [lang === "ar" ? "التغليف" : "Wrapping style", meta.wrappingStyle],
    [tr.availability || "Availability", optionLabel("dailyFlowers", lang)],
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: 10,
        marginBottom: 24,
      }}
    >
      <InfoBox title={lang === "ar" ? "تتضمن" : "Includes"} items={meta.includes} />
      <InfoBox
        title={lang === "ar" ? "مناسبة لـ" : "Good for"}
        items={meta.occasion.length ? meta.occasion.map((item) => optionLabel(item, lang)) : ["-"]}
      />
      <div
        style={{
          border: `1px solid ${C.border}`,
          background: "rgba(255,255,255,.025)",
          borderRadius: 8,
          padding: 14,
        }}
      >
        <div style={{ color: C.accent, fontSize: ".75rem", marginBottom: 10 }}>
          {lang === "ar" ? "تفاصيل الباقة" : "Bouquet details"}
        </div>
        {detailRows.map(([label, value]) => (
          <div key={label} style={{ color: C.creamD, fontSize: ".78rem", lineHeight: 1.6 }}>
            <strong style={{ color: C.cream }}>{label}:</strong> {value}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBox({ title, items }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        background: "rgba(255,255,255,.025)",
        borderRadius: 8,
        padding: 14,
      }}
    >
      <div style={{ color: C.accent, fontSize: ".75rem", marginBottom: 10 }}>{title}</div>
      <ul style={{ color: C.creamD, fontSize: ".78rem", lineHeight: 1.7, paddingInlineStart: 18 }}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default React.memo(ProductDetailPage);
