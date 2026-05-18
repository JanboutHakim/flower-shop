import { AppProvider, useApp } from "./contexts/AppContext";
import { C, GS } from "./constants/theme";
import { createPortal } from "react-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { WHATSAPP_NUMBER } from "./lib/env";

import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AIBuilderPage from "./pages/AIBuilderPage";
import AIImagePage from "./pages/AIImagePage";
import CardBuilderPage from "./pages/CardBuilderPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import DashboardLoginPage from "./pages/DashboardLoginPage";
import DashboardPage from "./pages/DashboardPage";

import { FaShoppingCart, FaTimes, FaWhatsapp } from "react-icons/fa";

function Router() {
  const {
    authLoading,
    cartNotification,
    dismissCartNotification,
    isMobile,
    isRTL,
    lang,
    navigate,
    page,
  } = useApp();

  const whatsappNumber = WHATSAPP_NUMBER;
  const whatsappText = encodeURIComponent("Hello, I would like to order flowers from Soul Flower.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage />;
      case "shop":
        return <ShopPage />;
      case "product":
        return <ProductDetailPage />;
      case "ai-builder":
        return <AIBuilderPage />;
      case "ai-image":
        return <AIImagePage />;
      case "card-builder":
        return <CardBuilderPage />;
      case "cart":
        return <CartPage />;
      case "checkout":
        return <CheckoutPage />;
      case "contact":
        return <ContactPage />;
      case "dashboard-login":
        return authLoading ? <DashboardLoading /> : <DashboardLoginPage />;
      case "dashboard":
        return authLoading ? <DashboardLoading /> : <DashboardPage />;
      default:
        return <HomePage />;
    }
  };

  const hideAdminChrome = page === "dashboard-login" || page === "dashboard";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        background: C.bg,
        color: C.cream,
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <style>{GS}</style>
      {!hideAdminChrome && <Navbar />}
      {renderPage()}
      {!hideAdminChrome && <Footer />}
      {!hideAdminChrome && cartNotification && (
        <CartNotification
          notification={cartNotification}
          lang={lang}
          isRTL={isRTL}
          onClose={dismissCartNotification}
          onCart={() => {
            dismissCartNotification();
            navigate("cart");
          }}
        />
      )}
      {!hideAdminChrome && (
        <FloatingWhatsAppButton href={whatsappUrl} isMobile={isMobile} />
      )}
    </div>
  );
}

function FloatingWhatsAppButton({ href, isMobile }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order flowers on WhatsApp"
      style={{
        position: "fixed",
        right: isMobile ? 16 : 20,
        bottom: isMobile ? 18 : 20,
        left: "auto",
        top: "auto",
        width: isMobile ? 56 : 58,
        height: isMobile ? 56 : 58,
        borderRadius: "50%",
        background: "#25D366",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 14px 34px rgba(0,0,0,.35)",
        fontSize: isMobile ? 28 : 30,
        lineHeight: 1,
        zIndex: 2147483647,
        textDecoration: "none",
        pointerEvents: "auto",
        transform: "translateZ(0)",
      }}
    >
      <FaWhatsapp aria-hidden="true" />
    </a>,
    document.body
  );
}

function DashboardLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.creamD,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
      }}
    >
      Checking dashboard session...
    </div>
  );
}

function CartNotification({ notification, lang, isRTL, onCart, onClose }) {
  const productName =
    notification.productName?.[lang] ||
    notification.productName?.en ||
    notification.productName ||
    (lang === "ar" ? "المنتج" : "Product");

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        right: isRTL ? "auto" : 20,
        left: isRTL ? 20 : "auto",
        bottom: 92,
        width: "min(360px, calc(100vw - 32px))",
        background: C.bgCard,
        border: `1px solid ${C.borderH}`,
        borderRadius: 8,
        boxShadow: "0 18px 44px rgba(0,0,0,.45)",
        color: C.cream,
        padding: 16,
        zIndex: 70,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={lang === "ar" ? "إغلاق" : "Close"}
        style={{
          position: "absolute",
          top: 10,
          right: isRTL ? "auto" : 10,
          left: isRTL ? 10 : "auto",
          width: 28,
          height: 28,
          borderRadius: 4,
          border: `1px solid ${C.border}`,
          background: C.bg,
          color: C.creamD,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaTimes aria-hidden="true" />
      </button>

      <div style={{ display: "flex", gap: 12, paddingInlineEnd: 34 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(201,149,108,.15)",
            color: C.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FaShoppingCart aria-hidden="true" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>
            {lang === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart"}
          </div>
          <div style={{ color: C.creamD, fontSize: 14, lineHeight: 1.45 }}>
            {productName} x{notification.qty}
          </div>
          <button
            type="button"
            onClick={onCart}
            style={{
              marginTop: 12,
              background: "transparent",
              border: "none",
              color: C.accent,
              padding: 0,
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            {lang === "ar" ? "عرض السلة" : "View cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
