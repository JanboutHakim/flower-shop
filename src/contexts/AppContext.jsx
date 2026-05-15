import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { T } from "../i18n/translations";
import { INIT_CATS, INIT_PRODUCTS } from "../constants/data";
import { getProducts } from "../lib/supabase"; // NEW: Import from Supabase
import { useMobile } from "../hooks/useMobile";

const AppContext = createContext(null);

const PAGE_PATHS = {
  home: "/",
  shop: "/shop",
  product: "/product",
  "ai-builder": "/ai-builder",
  "ai-image": "/ai-image",
  "card-builder": "/card-builder",
  cart: "/cart",
  checkout: "/checkout",
  dashboard: "/dashboard",
  "dashboard-login": "/dashboard",
};

const PATH_PAGES = {
  "/": "home",
  "/shop": "shop",
  "/product": "product",
  "/ai-builder": "ai-builder",
  "/ai-image": "ai-image",
  "/card-builder": "card-builder",
  "/cart": "cart",
  "/checkout": "checkout",
  "/dashboard": "dashboard",
};

function pageFromPath(pathname, isAuthed) {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  const pathPage = PATH_PAGES[cleanPath] || "home";
  return pathPage === "dashboard" && !isAuthed ? "dashboard-login" : pathPage;
}

function updateBrowserPath(nextPage) {
  const nextPath = PAGE_PATHS[nextPage] || "/";
  if (window.location.pathname !== nextPath) {
    window.history.pushState({ page: nextPage }, "", nextPath);
  }
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState("ar");
  const [auth, setAuth] = useState(false);
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname, false));
  const [cart, setCart] = useState([]);
  const [cartNotification, setCartNotification] = useState(null);
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true); // NEW
  const [categories, setCategories] = useState(INIT_CATS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shopCategory, setShopCategory] = useState("all");

  const isMobile = useMobile();
  const tr = T[lang];
  const isRTL = lang === "ar";

  useEffect(() => {
    const handlePopState = () => {
      setPage(pageFromPath(window.location.pathname, auth));
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [auth]);

  useEffect(() => {
    if (auth && window.location.pathname === "/dashboard" && page === "dashboard-login") {
      setPage("dashboard");
    }
  }, [auth, page]);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const dbProducts = await getProducts();
      
      if (dbProducts && dbProducts.length > 0) {
        // Transform database products to match your format
        const formattedProducts = dbProducts.map(p => ({
          id: p.id,
          name: { en: p.name_en, ar: p.name_ar },
          category: p.category,
          price: p.price,
          icon: p.icon,
          count: p.count,
          description: { en: p.description_en, ar: p.description_ar },
          image_url: p.image_url, // NEW: Add image URL from Cloudinary
        }));
        setProducts(formattedProducts);
      } else {
        // Fallback to initial products if database is empty
        setProducts(INIT_PRODUCTS);
      }
    } catch (error) {
      console.error("Error loading products from database:", error);
      // Keep initial products if database fails
      setProducts(INIT_PRODUCTS);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // NEW: Load products from Supabase on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const navigate = useCallback(
    (p, extra = {}) => {
      if (p === "dashboard" && !auth) {
        updateBrowserPath("dashboard-login");
        setPage("dashboard-login");
        window.scrollTo(0, 0);
        return;
      }
      if (extra.product) setSelectedProduct(extra.product);
      if (extra.category) setShopCategory(extra.category);
      setPage(p);
      updateBrowserPath(p);
      window.scrollTo(0, 0);
    },
    [auth]
  );

  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const key = `${product.id}-${product.ribbon || ""}-${product.wrap || ""}-${product.cardText || ""}`;
      const existing = prev.find(
        (i) => `${i.id}-${i.ribbon || ""}-${i.wrap || ""}-${i.cardText || ""}` === key
      );
      if (existing) {
        return prev.map((i) =>
          `${i.id}-${i.ribbon || ""}-${i.wrap || ""}-${i.cardText || ""}` === key
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, { ...product, qty }];
    });
    setCartNotification({
      id: Date.now(),
      productName: product.name,
      qty,
    });
  }, []);

  const dismissCartNotification = useCallback(() => {
    setCartNotification(null);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );
  const cartCount = useMemo(
    () => cart.reduce((s, i) => s + i.qty, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      page,
      navigate,
      auth,
      setAuth,
      cart,
      addToCart,
      removeFromCart,
      cartNotification,
      dismissCartNotification,
      cartTotal,
      cartCount,
      products,
      setProducts,
      productsLoading, // NEW: Export loading state
      refetchProducts: loadProducts, // NEW: Allow manual refresh
      categories,
      setCategories,
      selectedProduct,
      setSelectedProduct,
      shopCategory,
      setShopCategory,
      tr,
      isMobile,
      isRTL,
      loadOrders: () => Promise.resolve([]), // Placeholder for orders loading
    }),
    [
      lang,
      page,
      auth,
      cart,
      cartNotification,
      cartTotal,
      cartCount,
      products,
      productsLoading, // NEW
      categories,
      selectedProduct,
      shopCategory,
      tr,
      isMobile,
      isRTL,
      loadProducts,
      navigate,
      addToCart,
      dismissCartNotification,
      removeFromCart,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
