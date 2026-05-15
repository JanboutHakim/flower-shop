import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { C, FB } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import ProductCard from "../components/product/ProductCard";

function ShopPage() {
  const { tr, products, categories, shopCategory, setShopCategory } = useApp();
  const [cat, setCat] = useState(shopCategory || "all");

  const filtered = cat === "all" ? products : products.filter((p) => p.category === cat);

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg }}>
      <Section style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div style={{ marginBottom: 36 }}>
          <Tag>{tr.shop}</Tag>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCat(c.id); setShopCategory(c.id); }}
                style={{
                  background: cat === c.id ? "rgba(201,149,108,.15)" : "transparent",
                  border: `1px solid ${cat === c.id ? C.accent : C.border}`,
                  color: cat === c.id ? C.accent : C.creamD,
                  padding: "7px 18px",
                  cursor: "pointer",
                  fontSize: ".8rem",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  fontFamily: FB,
                  borderRadius: 1,
                  transition: "all .2s",
                }}
              >
                {c.icon} {c.id === "all" ? tr.allCategories : tr[c.id]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: C.creamD, textAlign: "center", padding: "60px 0" }}>
            {tr.noProducts}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 20,
            }}
          >
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i % 4} categories={categories} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

export default React.memo(ShopPage);
