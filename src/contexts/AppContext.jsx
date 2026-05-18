import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { T } from "../i18n/translations";
import { INIT_CATS, INIT_PRODUCTS } from "../constants/data";
import {
  getCurrentSession,
  getProducts,
  isDashboardUserAllowed,
  onAuthStateChange,
  signInToDashboard,
  signOutDashboard,
} from "../lib/supabase"; // NEW: Import from Supabase
import { useMobile } from "../hooks/useMobile";

const AppContext = createContext(null);
const CART_STORAGE_KEY = "flower_shop_cart";

const PAGE_PATHS = {
  home: "/",
  shop: "/shop",
  product: "/product",
  "ai-builder": "/ai-builder",
  "ai-image": "/ai-image",
  "card-builder": "/card-builder",
  cart: "/cart",
  checkout: "/checkout",
  contact: "/contact",
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
  "/contact": "contact",
  "/dashboard": "dashboard",
};

function pageFromPath(pathname, isAuthed) {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  if (cleanPath.startsWith("/product/")) return "product";
  const pathPage = PATH_PAGES[cleanPath] || "home";
  return pathPage === "dashboard" && !isAuthed ? "dashboard-login" : pathPage;
}

function updateBrowserPath(nextPage, extra = {}) {
  const productId = extra.product?.id || extra.productId;
  const nextPath =
    nextPage === "product" && productId
      ? `/product/${productId}`
      : PAGE_PATHS[nextPage] || "/";
  if (window.location.pathname !== nextPath) {
    window.history.pushState({ page: nextPage }, "", nextPath);
  }
}

function loadStoredCart() {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error("Error loading saved cart:", error);
    return [];
  }
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState("ar");
  const [auth, setAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname, false));
  const [cart, setCart] = useState(loadStoredCart);
  const [cartNotification, setCartNotification] = useState(null);
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true); // NEW
  const [categories, setCategories] = useState(INIT_CATS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shopCategory, setShopCategory] = useState("all");

  const isMobile = useMobile();
  const tr = T[lang];
  const isRTL = lang === "ar";

  const applySession = useCallback((session) => {
    const user = session?.user || null;
    const allowed = isDashboardUserAllowed(user);

    setAuth(Boolean(user && allowed));
    setAuthUser(user && allowed ? user : null);
    setPage((currentPage) => {
      if (!user || !allowed) {
        return currentPage === "dashboard"
          ? "dashboard-login"
          : pageFromPath(window.location.pathname, false);
      }

      return pageFromPath(window.location.pathname, true);
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    getCurrentSession()
      .then((session) => {
        if (!mounted) return;
        applySession(session);
      })
      .catch((error) => {
        console.error("Error checking dashboard session:", error);
        if (mounted) {
          setAuth(false);
          setAuthUser(null);
        }
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });

    const { data } = onAuthStateChange((session) => {
      if (!mounted) return;
      applySession(session);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, [applySession]);

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

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cart]);

  const loginDashboard = useCallback(async (email, password) => {
    const data = await signInToDashboard(email, password);
    setAuth(true);
    setAuthUser(data.user);
    setPage("dashboard");
    updateBrowserPath("dashboard");
    window.scrollTo(0, 0);
    return data;
  }, []);

  const logoutDashboard = useCallback(async () => {
    await signOutDashboard();
    setAuth(false);
    setAuthUser(null);
    setPage("dashboard-login");
    updateBrowserPath("dashboard-login");
    window.scrollTo(0, 0);
  }, []);

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
      updateBrowserPath(p, extra);
      window.scrollTo(0, 0);
    },
    [auth]
  );

  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const key =
        product.cartKey ||
        `${product.id}-${product.ribbon || ""}-${product.wrap || ""}-${product.cardText || ""}-${product.msg || ""}`;
      const existing = prev.find(
        (i) =>
          (i.cartKey ||
            `${i.id}-${i.ribbon || ""}-${i.wrap || ""}-${i.cardText || ""}-${i.msg || ""}`) === key
      );
      if (existing) {
        return prev.map((i) =>
          (i.cartKey ||
            `${i.id}-${i.ribbon || ""}-${i.wrap || ""}-${i.cardText || ""}-${i.msg || ""}`) === key
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, { ...product, cartKey: key, qty }];
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

  const removeFromCart = useCallback((keyOrId) => {
    setCart((prev) =>
      prev.filter(
        (i) =>
          (i.cartKey ||
            `${i.id}-${i.ribbon || ""}-${i.wrap || ""}-${i.cardText || ""}-${i.msg || ""}`) !== keyOrId &&
          i.id !== keyOrId
      )
    );
  }, []);

  const updateCartQty = useCallback((keyOrId, qty) => {
    const nextQty = Math.max(1, Number(qty) || 1);
    setCart((prev) =>
      prev.map((i) =>
        (i.cartKey ||
          `${i.id}-${i.ribbon || ""}-${i.wrap || ""}-${i.cardText || ""}-${i.msg || ""}`) === keyOrId ||
        i.id === keyOrId
          ? { ...i, qty: nextQty }
          : i
      )
    );
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
      authLoading,
      authUser,
      loginDashboard,
      logoutDashboard,
      cart,
      addToCart,
      removeFromCart,
      updateCartQty,
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
      authLoading,
      authUser,
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
      loginDashboard,
      logoutDashboard,
      navigate,
      addToCart,
      dismissCartNotification,
      removeFromCart,
      updateCartQty,
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
