import React, { useState, useCallback } from "react";
import { useApp } from "../../contexts/AppContext";
import { C, FB } from "../../constants/theme";

function Navbar() {
  const { tr, lang, setLang, navigate, cartCount, page, isMobile } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { key: "home", label: tr.home },
    { key: "shop", label: tr.shop },
    { key: "ai-builder", label: tr.aiBuilder },
  //  { key: "ai-image", label: tr.aiImage },
    { key: "card-builder", label: tr.cardBuilder },
    { key: "cart", label: tr.cart },
  ];

  const handleNav = useCallback((key) => {
    navigate(key);
    setMenuOpen(false);
  }, [navigate]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(10,8,6,.95)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 68,
          }}
        >
          {/* Logo */}
          <div
            onClick={() => navigate("home")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, zIndex: 1001 }}
          >
           <img src="/logo.png" alt="Logo" style={{ height: isMobile ? 60 : 128, width: isMobile ? 60 : 128, objectFit: "contain" }} />
         
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {links.map((l) => (
                <button
                  key={l.key}
                  onClick={() => navigate(l.key)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: page === l.key ? C.accent : C.creamD,
                    fontSize: ".85rem",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    fontFamily: FB,
                    transition: "color .2s",
                    position: "relative",
                    padding: "4px 0",
                  }}
                >
                  {l.label}
                  {l.key === "cart" && cartCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -10,
                        background: C.rose,
                        color: "#fff",
                        borderRadius: "50%",
                        width: 16,
                        height: 16,
                        fontSize: ".6rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Right side: Lang + Mobile Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1001 }}>
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              style={{
                background: "rgba(201,149,108,.1)",
                border: `1px solid ${C.border}`,
                color: C.accent,
                padding: "5px 14px",
                cursor: "pointer",
                fontSize: ".78rem",
                letterSpacing: ".1em",
                fontFamily: FB,
                borderRadius: 1,
                transition: "all .2s",
              }}
            >
              {lang === "en" ? "عربي" : "EN"}
            </button>
            {/* Mobile Hamburger */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: "none",
                  border: "none",
                  color: C.accent,
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "4px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <span style={{
                  display: "block",
                  width: 24,
                  height: 2,
                  background: C.accent,
                  transition: "all .3s",
                  transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                }} />
                <span style={{
                  display: "block",
                  width: 24,
                  height: 2,
                  background: C.accent,
                  transition: "all .3s",
                  opacity: menuOpen ? 0 : 1,
                }} />
                <span style={{
                  display: "block",
                  width: 24,
                  height: 2,
                  background: C.accent,
                  transition: "all .3s",
                  transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
                }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 68,
            left: 0,
            right: 0,
            background: "rgba(10,8,6,.98)",
            backdropFilter: "blur(20px)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 16,
            padding: "24px 24px",
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "calc(100vh - 68px)",
          }}
        >
          {links.map((l, idx) => (
            <button
              key={l.key}
              onClick={() => handleNav(l.key)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: page === l.key ? C.accent : C.cream,
                fontSize: "1.1rem",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                fontFamily: FB,
                transition: "color .2s",
                position: "relative",
                padding: "6px 12px",
                width: "100%",
                maxWidth: "280px",
                textAlign: "center",
                animation: `menuSlideIn .4s ease both`,
                animationDelay: `${idx * 0.08}s`,
              }}
            >
              {l.label}
              {l.key === "cart" && cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -8,
                    background: C.rose,
                    color: "#fff",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    fontSize: ".7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

export default React.memo(Navbar);
