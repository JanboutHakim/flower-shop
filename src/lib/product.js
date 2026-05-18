export const AVAILABILITY_NOTE = {
  en: "Because our bouquets are prepared with fresh flowers from a real local shop, some flowers or wrapping may vary slightly depending on daily availability. We always keep the same color theme, size, and overall style.",
  ar: "لأن باقاتنا تُحضّر من زهور طازجة متوفرة في محل ورد حقيقي، قد تختلف بعض الزهور أو التغليف قليلاً حسب توفر اليوم. نحافظ دائماً على نفس ألوان الباقة وحجمها وطابعها العام.",
};

export const FILTER_OPTIONS = {
  occasion: ["birthday", "love", "graduation", "newBaby", "apology", "congratulations"],
  colors: ["red", "white", "pink", "purple", "yellow", "mixed"],
  budgetTier: ["low", "medium", "premium"],
  type: ["bouquet", "box", "custom", "card"],
};

export const OPTION_LABELS = {
  en: {
    all: "All",
    occasion: "Occasion",
    colors: "Color",
    budgetTier: "Budget",
    type: "Type",
    birthday: "Birthday",
    love: "Love",
    graduation: "Graduation",
    newBaby: "New Baby",
    apology: "Apology",
    congratulations: "Congratulations",
    red: "Red",
    white: "White",
    pink: "Pink",
    purple: "Purple",
    yellow: "Yellow",
    mixed: "Mixed",
    low: "Low",
    medium: "Medium",
    premium: "Premium",
    bouquet: "Bouquet",
    box: "Box",
    custom: "Custom",
    card: "Card",
    dailyFlowers: "Daily flowers",
  },
  ar: {
    all: "الكل",
    occasion: "المناسبة",
    colors: "اللون",
    budgetTier: "الميزانية",
    type: "النوع",
    birthday: "عيد ميلاد",
    love: "حب",
    graduation: "تخرج",
    newBaby: "مولود جديد",
    apology: "اعتذار",
    congratulations: "تهنئة",
    red: "أحمر",
    white: "أبيض",
    pink: "وردي",
    purple: "بنفسجي",
    yellow: "أصفر",
    mixed: "مشكل",
    low: "اقتصادي",
    medium: "متوسط",
    premium: "فاخر",
    bouquet: "باقة",
    box: "بوكس",
    custom: "مخصص",
    card: "بطاقة",
    dailyFlowers: "زهور يومية",
  },
};

const CATEGORY_META = {
  romantic: { occasion: ["love"], colors: ["red", "pink"], budgetTier: "medium", type: "bouquet" },
  graduation: { occasion: ["graduation", "congratulations"], colors: ["yellow", "white"], budgetTier: "premium", type: "bouquet" },
  getWell: { occasion: ["congratulations"], colors: ["pink", "white"], budgetTier: "low", type: "bouquet" },
  birthday: { occasion: ["birthday"], colors: ["mixed", "pink"], budgetTier: "medium", type: "bouquet" },
  wedding: { occasion: ["love", "congratulations"], colors: ["white"], budgetTier: "premium", type: "bouquet" },
  sympathy: { occasion: ["apology"], colors: ["white"], budgetTier: "medium", type: "bouquet" },
};

export function getProductName(product, lang = "en") {
  if (!product) return "";
  if (typeof product.name === "string") return product.name;
  return product.name?.[lang] || product.name?.en || product.nameAr || "";
}

export function getProductDescription(product, lang = "en") {
  if (!product) return "";
  if (typeof product.description === "string") return product.description;
  return product.description?.[lang] || product.description?.en || "";
}

export function getProductImage(product) {
  return product?.image_url || product?.image || product?.images?.[0] || "";
}

export function getProductMeta(product) {
  const fallback = CATEGORY_META[product?.category] || {};
  return {
    type: product?.type || fallback.type || "bouquet",
    colors: product?.colors?.length ? product.colors : fallback.colors || ["mixed"],
    occasion: product?.occasion?.length ? product.occasion : fallback.occasion || [],
    budgetTier: product?.budgetTier || fallback.budgetTier || "medium",
    size: product?.size || (product?.count ? `${product.count} flowers` : "Standard"),
    wrappingStyle: product?.wrappingStyle || "Premium wrapping",
    includes: product?.includes?.length
      ? product.includes
      : ["Fresh seasonal flowers", "Premium wrapping", "Optional message card"],
    availabilityNote: product?.availabilityNote || AVAILABILITY_NOTE,
  };
}

export function optionLabel(key, lang = "en") {
  return OPTION_LABELS[lang]?.[key] || OPTION_LABELS.en[key] || key;
}

export function getCartItemKey(item) {
  return item.cartKey || `${item.id}-${item.ribbon || ""}-${item.wrap || ""}-${item.cardText || ""}-${item.msg || ""}`;
}
