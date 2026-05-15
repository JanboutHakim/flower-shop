import React, { useState, useCallback } from "react";
import { useApp } from "../../contexts/AppContext";
import { C, FS } from "../../constants/theme";

function ProductCard({ product, delay = 0, categories }) {
  const { tr, lang, addToCart, navigate, setSelectedProduct } = useApp();
  const [added, setAdded] = useState(false);
  // State to hold the number of flowers (quantity) selected by the user
  const [flowerCount, setFlowerCount] = useState(1);

  const handleAdd = useCallback(
    (e) => {
      e.stopPropagation();
      addToCart({ ...product, flowerCount }, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    },
    [addToCart, product, flowerCount]
  );

  const handleView = useCallback(() => {
    setSelectedProduct(product);
    navigate("product");
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
        <img
          src={product.image_url}
          alt={product.name[lang]}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
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
          {tr[product.category]}
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
          {product.name[lang]}
        </h3>
        <p
          style={{
            color: C.creamD,
            fontSize: ".82rem",
            lineHeight: 1.6,
            marginBottom: 16,
            minHeight: 40,
          }}
        >
          {product.description[lang].substring(0, 70)}…
        </p>
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
            ${Math.round((product.price / product.count) * flowerCount * 100) / 100}
          </span>
          {/* Input for selecting number of flowers */}
          <input
            type="number"
            min="1"
            value={flowerCount}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setFlowerCount(val > 0 ? val : 1);
            }}
            style={{
              width: "60px",
              padding: "4px",
              fontSize: "1rem",
              borderRadius: "4px",
              border: `1px solid ${C.border}`,
            }}
          />
          <button
            className="btn-p"
            onClick={handleAdd}
            style={{
              padding: "8px 16px",
              fontSize: ".75rem",
              background: added
                ? "linear-gradient(135deg,#2a6a3a,#1a4a2a)"
                : undefined,
            }}
          >
            {added ? tr.successAdd : tr.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductCard);