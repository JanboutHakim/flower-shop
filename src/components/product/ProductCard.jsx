import React, { useState, useCallback } from "react";
import { useApp } from "../../contexts/AppContext";
import { C, FS } from "../../constants/theme";
import { formatCurrency } from "../../constants/options";
import {
  getProductDescription,
  getProductImage,
  getProductMeta,
  getProductName,
  optionLabel,
} from "../../lib/product";

function ProductCard({ product, delay = 0, categories }) {
  const { tr, lang, addToCart, navigate, setSelectedProduct } = useApp();
  const [added, setAdded] = useState(false);

  const meta = getProductMeta(product);
  const productName = getProductName(product, lang);
  const description = getProductDescription(product, lang);
  const productImage = getProductImage(product);
  const primaryOccasion = meta.occasion[0];
  const primaryColor = meta.colors[0];

  const handleAdd = useCallback(
    (e) => {
      e.stopPropagation();
      addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    },
    [addToCart, product]
  );

  const handleView = useCallback(() => {
    setSelectedProduct(product);
    navigate("product", { product });
  }, [product, setSelectedProduct, navigate]);

  return (
    <div
      className={`card-hover fadeUp d${(delay % 4) + 1}`}
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={handleView}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${C.bgEl}, ${C.bgCard})`,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "4.5rem",
          borderBottom: `1px solid ${C.border}`,
          position: "relative",
        }}
      >
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span>{product.icon}</span>
        )}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: lang === "ar" ? "auto" : 10,
            left: lang === "ar" ? 10 : "auto",
            background: "rgba(201,149,108,.1)",
            border: `1px solid ${C.border}`,
            color: C.accent,
            fontSize: ".7rem",
            padding: "3px 10px",
            letterSpacing: ".08em",
            textTransform: "uppercase",
          }}
        >
          {categories.find((c) => c.id === product.category)?.icon}{" "}
          {tr[product.category] || product.category}
        </span>
      </div>
      <div style={{ padding: 20 }}>
        <h3
          style={{
            fontFamily: FS,
            fontSize: "1.2rem",
            color: C.cream,
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {productName}
        </h3>
        <p
          style={{
            color: C.creamD,
            fontSize: ".82rem",
            lineHeight: 1.6,
            marginBottom: 14,
            minHeight: 40,
          }}
        >
          {description ? `${description.substring(0, 74)}...` : ""}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {primaryOccasion && (
            <Badge
              label={`${lang === "ar" ? "مناسبة لـ" : "Best for"}: ${optionLabel(
                primaryOccasion,
                lang
              )}`}
            />
          )}
          {primaryColor && (
            <Badge
              label={`${lang === "ar" ? "اللون" : "Color"}: ${optionLabel(primaryColor, lang)}`}
            />
          )}
          <Badge label={`${tr.availability || "Availability"}: ${optionLabel("dailyFlowers", lang)}`} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: FS,
              fontSize: "1.3rem",
              color: C.accent,
              fontWeight: 600,
            }}
          >
            {formatCurrency(product.price)}
          </span>
          <button
            className="btn-p"
            onClick={handleAdd}
            style={{
              padding: "8px 16px",
              fontSize: ".75rem",
              background: added ? "linear-gradient(135deg,#2a6a3a,#1a4a2a)" : undefined,
            }}
          >
            {added ? tr.successAdd : tr.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ label }) {
  return (
    <span
      style={{
        border: `1px solid ${C.border}`,
        background: "rgba(201,149,108,.07)",
        color: C.creamD,
        fontSize: ".68rem",
        padding: "4px 7px",
        borderRadius: 999,
        lineHeight: 1.2,
      }}
    >
      {label}
    </span>
  );
}

export default React.memo(ProductCard);
