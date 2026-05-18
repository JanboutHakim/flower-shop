import React, { useMemo, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { C, FB } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import ProductCard from "../components/product/ProductCard";
import { FILTER_OPTIONS, getProductMeta, optionLabel } from "../lib/product";

function ShopPage() {
  const { tr, products, categories, shopCategory, setShopCategory, lang } = useApp();
  const [cat, setCat] = useState(shopCategory || "all");
  const [filters, setFilters] = useState({
    occasion: "all",
    colors: "all",
    budgetTier: "all",
    type: "all",
  });

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const meta = getProductMeta(product);
        const categoryMatch = cat === "all" || product.category === cat;
        const occasionMatch =
          filters.occasion === "all" || meta.occasion.includes(filters.occasion);
        const colorMatch = filters.colors === "all" || meta.colors.includes(filters.colors);
        const budgetMatch =
          filters.budgetTier === "all" || meta.budgetTier === filters.budgetTier;
        const typeMatch = filters.type === "all" || meta.type === filters.type;

        return categoryMatch && occasionMatch && colorMatch && budgetMatch && typeMatch;
      }),
    [cat, filters, products]
  );

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg }}>
      <Section style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div style={{ marginBottom: 28 }}>
          <Tag>{tr.shop}</Tag>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCat(c.id);
                  setShopCategory(c.id);
                }}
                style={chipStyle(cat === c.id)}
              >
                {c.icon} {c.id === "all" ? tr.allCategories : tr[c.id]}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,.025)",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 14,
            }}
          >
            <FilterSelect
              label={optionLabel("occasion", lang)}
              value={filters.occasion}
              options={FILTER_OPTIONS.occasion}
              lang={lang}
              onChange={(value) => updateFilter("occasion", value)}
            />
            <FilterSelect
              label={optionLabel("colors", lang)}
              value={filters.colors}
              options={FILTER_OPTIONS.colors}
              lang={lang}
              onChange={(value) => updateFilter("colors", value)}
            />
            <FilterSelect
              label={optionLabel("budgetTier", lang)}
              value={filters.budgetTier}
              options={FILTER_OPTIONS.budgetTier}
              lang={lang}
              onChange={(value) => updateFilter("budgetTier", value)}
            />
            <FilterSelect
              label={optionLabel("type", lang)}
              value={filters.type}
              options={FILTER_OPTIONS.type}
              lang={lang}
              onChange={(value) => updateFilter("type", value)}
            />
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

function FilterSelect({ label, value, options, lang, onChange }) {
  return (
    <label style={{ marginBottom: 0 }}>
      <span style={{ display: "block", marginBottom: 8 }}>{label}</span>
      <select className="inp" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">{optionLabel("all", lang)}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel(option, lang)}
          </option>
        ))}
      </select>
    </label>
  );
}

function chipStyle(active) {
  return {
    background: active ? "rgba(201,149,108,.15)" : "transparent",
    border: `1px solid ${active ? C.accent : C.border}`,
    color: active ? C.accent : C.creamD,
    padding: "7px 18px",
    cursor: "pointer",
    fontSize: ".8rem",
    letterSpacing: ".08em",
    textTransform: "uppercase",
    fontFamily: FB,
    borderRadius: 1,
    transition: "all .2s",
  };
}

export default React.memo(ShopPage);
