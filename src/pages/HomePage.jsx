import React from "react";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import ProductCard from "../components/product/ProductCard";

function HomePage() {
  const { tr, navigate, products, setShopCategory, lang, categories } = useApp();
  const isRTL = lang === "ar";
  const featured = products.slice(0, 4);

  return (
    <div style={{ paddingTop: 68 }}>
      {/* Hero */}
      <div
        style={{
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          background: `radial-gradient(ellipse at 20% 50%, rgba(160,48,88,.12) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(201,149,108,.08) 0%, transparent 50%),
                      ${C.bg}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: isRTL ? "auto" : "5%",
            left: isRTL ? "5%" : "auto",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "22rem",
            opacity: 0.04,
            pointerEvents: "none",
            filter: "blur(2px)",
          }}
        >
          🌹
        </div>

        <div
          style={{
            position: "absolute",
            left: isRTL ? "auto" : "5%",
            right: isRTL ? "5%" : "auto",
            bottom: "10%",
            fontSize: "8rem",
            opacity: 0.03,
            pointerEvents: "none",
          }}
        >
          🌸
        </div>

        <Section>
          <div style={{ maxWidth: 600 }} className="fadeUp">
            <Tag>{tr.heroTag}</Tag>

            <h1
              style={{
                fontFamily: FS,
                fontSize: "clamp(3rem,6vw,5.5rem)",
                fontWeight: 300,
                lineHeight: 1.05,
                color: C.cream,
                marginBottom: 20,
                fontStyle: "italic",
              }}
            >
              {tr.heroTitle}
            </h1>

            <p
              style={{
                color: C.creamD,
                fontSize: "1.05rem",
                lineHeight: 1.8,
                marginBottom: 38,
                maxWidth: 460,
              }}
            >
              {tr.heroSub}
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button
                className="btn-p"
                onClick={() => navigate("shop")}
                style={{ fontSize: ".9rem", padding: "13px 32px" }}
              >
                {tr.shopNow}
              </button>

              <button
                className="btn-s"
                onClick={() => navigate("ai-builder")}
                style={{ fontSize: ".9rem", padding: "13px 32px" }}
              >
                {tr.buildOwn}
              </button>

              <button
                className="btn-s"
                onClick={() => navigate("card-builder")}
                style={{ fontSize: ".9rem", padding: "13px 32px" }}
              >
                {tr.cardBuilder}
              </button>
            </div>
          </div>
        </Section>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`,
          }}
        />
      </div>

      {/* Categories */}
      <div
        style={{
          padding: "90px 0",
          background: `linear-gradient(180deg, ${C.bg} 0%, #1b1013 45%, ${C.bg} 100%)`,
        }}
      >
        <Section>
          <div className="fadeUp" style={{ textAlign: "center", marginBottom: 48 }}>
            <Tag>{tr.collections}</Tag>
          </div>

          <div
            style={{
              display: "flex",
              gap: 22,
              overflowX: "auto",
              paddingBottom: 10,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categories
              .filter((c) => c.id !== "all")
              .map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setShopCategory(cat.id);
                    navigate("shop");
                  }}
                  className={`card-hover fadeUp d${(i % 4) + 1}`}
                  style={{
                    border: `1px solid rgba(255,255,255,.12)`,
                    borderRadius: 18,
                    padding: 10,
                    cursor: "pointer",
                    textAlign: "center",
                    overflow: "hidden",
                    position: "relative",
                    height: 250,
                    minWidth: 220,
                    flex: "0 0 220px",
                    background:
                      cat.grad ||
                      "linear-gradient(135deg, rgba(92,26,42,.55), rgba(201,149,108,.18))",
                    boxShadow: "0 18px 45px rgba(0,0,0,.35)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 14,
                      overflow: "hidden",
                      position: "relative",
                      background: "#2a171b",
                    }}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name?.en || cat.id}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : null}

                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: "55px 16px 18px",
                        background:
                          "linear-gradient(to top, rgba(20,8,10,.9), rgba(20,8,10,.45), transparent)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FS,
                          fontSize: "1.25rem",
                          color: C.cream,
                          fontWeight: 400,
                          letterSpacing: ".04em",
                          textShadow: "0 2px 12px rgba(0,0,0,.65)",
                        }}
                      >
                        {tr[cat.id]}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </Section>
      </div>

      {/* Featured */}
      <div
        style={{
          padding: "80px 0",
          background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bgCard} 100%)`,
        }}
      >
        <Section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 40,
            }}
          >
            <div className="fadeUp">
              <Tag>{tr.featuredTitle}</Tag>
            </div>

            <button
              className="btn-s"
              onClick={() => {
                setShopCategory("all");
                navigate("shop");
              }}
              style={{ fontSize: ".78rem", padding: "7px 18px" }}
            >
              {tr.viewAll}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: 20,
            }}
          >
            {featured.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                delay={i}
                categories={categories}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* Luxury Banner */}
      <div
        style={{
          padding: "60px 0",
          background: C.bgEl,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Section>
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: FS,
                fontSize: "clamp(1.8rem,3.5vw,3rem)",
                fontWeight: 300,
                color: C.cream,
                fontStyle: "italic",
                marginBottom: 12,
              }}
            >
              "Every petal tells a story."
            </h2>

            <p style={{ color: C.creamD, fontSize: ".9rem", letterSpacing: ".1em" }}>
              — Bloom & Grace, Est. 2020
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default React.memo(HomePage);