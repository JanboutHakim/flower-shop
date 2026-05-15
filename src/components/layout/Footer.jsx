import React from "react";
import { useApp } from "../../contexts/AppContext";
import { C, FS, FB } from "../../constants/theme";
import Section from "../ui/Section";

function Footer() {
  const { tr, navigate, isMobile } = useApp();

  return (
    <footer
      style={{
        background: C.bgCard,
        borderTop: `1px solid ${C.border}`,

        padding: isMobile ? "36px 0 20px" : "48px 0 24px",

        overflowX: "hidden",
        width: "100%",
      }}
    >
      <Section
        style={{
          paddingLeft: isMobile ? 16 : undefined,
          paddingRight: isMobile ? 16 : undefined,
        }}
      >
        <div
          style={{
            display: "grid",

            gridTemplateColumns: isMobile
              ? "1fr"
              : "2fr 1fr 1fr",

            gap: isMobile ? 32 : 40,

            marginBottom: isMobile ? 32 : 40,

            width: "100%",
          }}
        >
          {/* LOGO + ABOUT */}
          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",

                alignItems: "center",

                justifyContent: isMobile
                  ? "center"
                  : "flex-start",

                marginBottom: 14,
              }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                style={{
                  height: isMobile ? 90 : 180,
                  width: isMobile ? 90 : 180,

                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            <p
              style={{
                color: C.creamD,

                fontSize: isMobile ? ".82rem" : ".85rem",

                lineHeight: 1.8,

                maxWidth: isMobile ? "100%" : 280,

                textAlign: isMobile ? "center" : "left",

                margin: isMobile ? "0 auto" : 0,
              }}
            >
              Luxury handcrafted bouquets for every precious
              moment.
            </p>
          </div>

          {/* NAVIGATION */}
          <div
            style={{
              minWidth: 0,

              textAlign: isMobile ? "center" : "left",
            }}
          >
            <div
              style={{
                fontSize: ".72rem",

                letterSpacing: ".15em",

                textTransform: "uppercase",

                color: C.accent,

                marginBottom: 16,
              }}
            >
              Navigation
            </div>

            {["home", "shop", "ai-builder", "cart"].map(
              (p) => (
                <button
                  key={p}
                  onClick={() => navigate(p)}
                  style={{
                    display: "block",

                    width: isMobile ? "100%" : "auto",

                    background: "none",

                    border: "none",

                    color: C.creamD,

                    cursor: "pointer",

                    fontSize: ".85rem",

                    marginBottom: 10,

                    fontFamily: FB,

                    padding: 0,

                    transition: "color .2s",

                    textAlign: isMobile
                      ? "center"
                      : "left",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = C.cream)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color =
                      C.creamD)
                  }
                >
                  {tr[p.replace("-", "")] || tr[p]}
                </button>
              )
            )}
          </div>

          {/* CONTACT */}
          <div
            style={{
              minWidth: 0,

              textAlign: isMobile ? "center" : "left",
            }}
          >
            <div
              style={{
                fontSize: ".72rem",

                letterSpacing: ".15em",

                textTransform: "uppercase",

                color: C.accent,

                marginBottom: 16,
              }}
            >
              Contact
            </div>

            <p
              style={{
                color: C.creamD,

                fontSize: ".85rem",

                lineHeight: 2,

                wordBreak: "break-word",
              }}
            >
              📱 WhatsApp: +963 965 578 857
              <br />
              📧 hello@bloomgrace.com
              <br />
              📍 Aleppo, Syria
            </p>
          </div>
        </div>

        {/* DIVIDER */}
        <div
          style={{
            height: 1,
            background: C.border,

            marginBottom: 20,

            width: "100%",
          }}
        />

        {/* COPYRIGHT */}
        <p
          style={{
            color: C.creamD,

            fontSize: ".78rem",

            textAlign: "center",

            opacity: 0.6,

            lineHeight: 1.6,

            padding: isMobile ? "0 8px" : 0,
          }}
        >
          {tr.by}
        </p>
      </Section>
    </footer>
  );
}

export default React.memo(Footer);