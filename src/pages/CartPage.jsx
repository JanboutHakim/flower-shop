import React from "react";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";

function CartPage() {
  const { tr, navigate, cart, removeFromCart, cartTotal, lang, isMobile } = useApp();

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
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.ribbon || ""}`}
                  style={{
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 2,
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <span style={{ fontSize: "2.8rem" }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FS, fontSize: "1.1rem", color: C.cream }}>
                      {item.name[lang]}
                    </div>
                    <div style={{ color: C.creamD, fontSize: ".8rem", marginTop: 4 }}>
                      {item.ribbon && `🎀 ${tr[item.ribbon]}`}
                      {item.wrap && ` · ${tr[item.wrap]}`}
                    </div>
                    {item.cardText && (
                      <div style={{ 
                        marginTop: 6, 
                        padding: "4px 8px", 
                        background: "rgba(201,149,108,.1)", 
                        border: `1px solid ${C.border}`,
                        borderRadius: 1,
                        color: C.accent,
                        fontSize: ".75rem",
                        fontStyle: "italic",
                      }}>
                        💌 "{item.cardText}"
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: FS, fontSize: "1.2rem", color: C.accent }}>
                      ${item.price * item.qty}
                    </div>
                    <div style={{ color: C.creamD, fontSize: ".78rem" }}>×{item.qty}</div>
                  </div>
                  <button className="btn-danger" onClick={() => removeFromCart(item.id)}>
                    {tr.removeItem}
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 2,
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
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    color: C.creamD,
                    fontSize: ".85rem",
                  }}
                >
                  <span>
                    {item.name[lang]} ×{item.qty}
                  </span>
                  <span>${item.price * item.qty}</span>
                </div>
              ))}
              <div style={{ height: 1, background: C.border, margin: "20px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <span style={{ color: C.cream, fontWeight: 600 }}>{tr.total}</span>
                <span
                  style={{ fontFamily: FS, fontSize: "1.5rem", color: C.accent }}
                >
                  ${cartTotal}
                </span>
              </div>
              <button
                className="btn-p"
                onClick={() => navigate("checkout")}
                style={{ width: "100%", padding: "13px" }}
              >
                {tr.checkout}
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

export default React.memo(CartPage);
