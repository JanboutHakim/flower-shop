import { AppProvider, useApp } from "./contexts/AppContext";
import { C, GS } from "./constants/theme";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AIBuilderPage from "./pages/AIBuilderPage";
import AIImagePage from "./pages/AIImagePage";
import CardBuilderPage from "./pages/CardBuilderPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import DashboardLoginPage from "./pages/DashboardLoginPage";
import DashboardPage from "./pages/DashboardPage";

import { FaWhatsapp } from "react-icons/fa";

function Router() {
  const { page, isRTL } = useApp();

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage />;
      case "shop": return <ShopPage />;
      case "product": return <ProductDetailPage />;
      case "ai-builder": return <AIBuilderPage />;
      case "ai-image": return <AIImagePage />;
      case "card-builder": return <CardBuilderPage />;
      case "cart": return <CartPage />;
      case "checkout": return <CheckoutPage />;
      case "dashboard-login": return <DashboardLoginPage />;
      case "dashboard": return <DashboardPage />;
      default: return <HomePage />;
    }
  };

  const hidNav = page === "dashboard-login" || page === "dashboard";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif", background: C.bg, color: C.cream, minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <style>{GS}</style>
      {!hidNav && <Navbar />}
      {renderPage()}
      {!hidNav && <Footer />}
      <a
        href="https://wa.me/963965578857?text=مرحبا هل استطيع طلب باقة زهور؟"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg text-3xl hover:scale-110 transition z-50"
      >
        <FaWhatsapp />
      </a>
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