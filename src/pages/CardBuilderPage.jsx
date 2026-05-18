import React, { useRef, useEffect, useState, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import * as fabric from "fabric";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import {
  FaDownload,
  FaImage,
  FaMinus,
  FaRegSquare,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

const RTL_FONTS = ["Cairo", "Amiri", "Tajawal", "Scheherazade New"];

const TPLS = {
  blank: {
    bg: "#ffffff",
    tc: "#1a1a1a",
    ac: "#d7d7d7",
    font: "Lora",
    title: "",
    msg: "",
    sig: "",
    layout: "blank",
  },
  simple: {
    bg: "#fffdf8",
    tc: "#1f1f1f",
    ac: "#b58b62",
    font: "Playfair Display",
    title: "Your Title",
    msg: "Write your message here",
    sig: "Your Name",
    layout: "message",
  },
  graduation: {
    bg: "#faf7ee",
    tc: "#152033",
    ac: "#c99a3d",
    font: "Playfair Display",
    title: "Class of 2026",
    msg: "Congratulations on your graduation. Your next chapter starts beautifully.",
    sig: "So proud of you",
    layout: "graduation",
  },
  wedding: {
    bg: "#fff8f5",
    tc: "#39251f",
    ac: "#c89475",
    font: "Cormorant Garamond",
    title: "Forever Begins",
    msg: "Wishing you a lifetime of joy, tenderness, and blooming love.",
    sig: "With warm wishes",
    layout: "wedding",
  },
  love: {
    bg: "#fff5f7",
    tc: "#3c2029",
    ac: "#b23a5b",
    font: "Dancing Script",
    title: "For You",
    msg: "A little reminder that you are loved today, tomorrow, and always.",
    sig: "With all my love",
    layout: "love",
  },
  photo: {
    bg: "#f7f7f7",
    tc: "#222222",
    ac: "#9f9f9f",
    font: "Lora",
    title: "Photo Card",
    msg: "Add a photo and short note",
    sig: "",
    layout: "photo",
  },
  dark: {
    bg: "#171717",
    tc: "#f7f0e7",
    ac: "#777777",
    font: "Cinzel",
    title: "Simple Card",
    msg: "A clean message",
    sig: "With Love",
    layout: "message",
  },
};

const V = {
  bg: "#0d0a08",
  surface: "#1a120b",
  surface2: "#231810",
  surface3: "#2d1f14",
  border: "#3d2b1f",
  accent: "#c8956c",
  accent2: "#8b6914",
  text: "#f0e6d3",
  textMuted: "#9a7d6a",
  danger: "#e57373",
};

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const TEMPLATE_ORDER = ["graduation", "wedding", "love", "photo", "simple", "blank"];
const TEMPLATE_LABELS = {
  en: {
    graduation: ["Graduation", "Classy gold details"],
    wedding: ["Wedding", "Soft rings and florals"],
    love: ["Love", "Romantic blush card"],
    simple: ["Simple", "Title and message"],
    photo: ["Photo", "Image and note"],
    dark: ["Dark", "Simple dark"],
    blank: ["Blank", "Plain landscape"],
  },
  ar: {
    graduation: ["\u062a\u062e\u0631\u062c", "\u062a\u0641\u0627\u0635\u064a\u0644 \u0630\u0647\u0628\u064a\u0629 \u0623\u0646\u064a\u0642\u0629"],
    wedding: ["\u0632\u0641\u0627\u0641", "\u062e\u0648\u0627\u062a\u0645 \u0648\u0648\u0631\u0648\u062f \u0646\u0627\u0639\u0645\u0629"],
    love: ["\u062d\u0628", "\u0628\u0637\u0627\u0642\u0629 \u0631\u0648\u0645\u0627\u0646\u0633\u064a\u0629"],
    simple: ["بسيطة", "عنوان ورسالة"],
    photo: ["صورة", "صورة وملاحظة"],
    dark: ["داكنة", "تصميم داكن بسيط"],
    blank: ["فارغة", "بطاقة أفقية فارغة"],
  },
};
const TEMPLATE_THUMBS = {
  graduation: {
    bg: "linear-gradient(135deg,#faf7ee 0%,#faf7ee 55%,#152033 55%,#152033 100%)",
    color: "#152033",
    accent: "#c99a3d",
    mark: "\u25c6",
  },
  wedding: {
    bg: "radial-gradient(circle at 25% 32%,rgba(200,148,117,.24) 0 22%,transparent 23%),linear-gradient(135deg,#fff8f5,#f6dfd7)",
    color: "#39251f",
    accent: "#c89475",
    mark: "\u25cb",
  },
  love: {
    bg: "linear-gradient(135deg,#fff5f7,#f0c8d2)",
    color: "#3c2029",
    accent: "#b23a5b",
    mark: "\u2665",
  },
  photo: {
    bg: "linear-gradient(90deg,#ececec 0 43%,#f7f7f7 43% 100%)",
    color: "#222",
    accent: "#9f9f9f",
    mark: "\u25a3",
  },
  simple: {
    bg: "linear-gradient(135deg,#fffdf8,#f2e5d7)",
    color: "#222",
    accent: "#b58b62",
    mark: "\u2014",
  },
  dark: {
    bg: "linear-gradient(135deg,#171717,#303030)",
    color: "#eee",
    accent: "#777",
    mark: "\u2014",
  },
  blank: {
    bg: "#fff",
    color: "#222",
    accent: "#d7d7d7",
    mark: "",
  },
};
const CARD_COPY = {
  en: {
    content: "Content",
    addText: "Add Text",
    uploadImage: "Upload Image",
    messageTemplates: "Message Templates",
    qrPlaceholder: "URL to QR Code",
    line: "Line",
    rectangle: "Rectangle",
    front: "Front",
    back: "Back",
    delete: "Del",
    textStyle: "Text Style",
    textShapeColor: "Text and shape color",
    canvas: "Canvas",
    background: "Background",
    clearAll: "Clear All",
    addCard: "Add Card to Cart",
    preview: "Landscape Card Preview",
    templates: "Templates",
    download: "Download PNG",
    added: "Added",
    templatesList: [
      "Happy birthday, wishing you a beautiful year ahead.",
      "Congratulations, so proud of you.",
      "With love, today and always.",
      "Get well soon, sending you flowers and warm wishes.",
      "Thank you for everything.",
      "Sorry, please accept this small gift.",
    ],
  },
  ar: {
    content: "المحتوى",
    addText: "إضافة نص",
    uploadImage: "رفع صورة",
    messageTemplates: "قوالب الرسائل",
    qrPlaceholder: "رابط رمز QR",
    line: "خط",
    rectangle: "مستطيل",
    front: "للأمام",
    back: "للخلف",
    delete: "حذف",
    textStyle: "تنسيق النص",
    textShapeColor: "لون النص والشكل",
    canvas: "البطاقة",
    background: "الخلفية",
    clearAll: "مسح الكل",
    addCard: "أضف البطاقة للسلة",
    preview: "معاينة البطاقة الأفقية",
    templates: "القوالب",
    download: "تحميل PNG",
    added: "تمت الإضافة",
    templatesList: [
      "عيد ميلاد سعيد، أتمنى لك عاماً جميلاً.",
      "مبارك، فخور بك جداً.",
      "مع الحب، اليوم ودائماً.",
      "سلامتك، أرسل لك الورود وأطيب الأمنيات.",
      "شكراً لك على كل شيء.",
      "آسف، أرجو أن تقبل هذه الهدية الصغيرة.",
    ],
  },
};

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function isTextObject(obj) {
  return ["textbox", "Textbox", "text", "Text"].includes(obj?.type);
}

function getTemplateText(type, lang, fallback) {
  if (lang !== "ar") return fallback;

  const arText = {
    simple: {
      title: "عنوانك",
      msg: "اكتب رسالتك هنا",
      sig: "اسمك",
    },
    graduation: {
      title: "\u062e\u0631\u064a\u062c 2026",
      msg: "\u0645\u0628\u0631\u0648\u0643 \u0627\u0644\u062a\u062e\u0631\u062c\u060c \u0628\u062f\u0627\u064a\u0629 \u062c\u0645\u064a\u0644\u0629 \u0644\u0641\u0635\u0644 \u062c\u062f\u064a\u062f.",
      sig: "\u0641\u062e\u0648\u0631\u0648\u0646 \u0628\u0643",
    },
    wedding: {
      title: "\u0628\u062f\u0627\u064a\u0629 \u0627\u0644\u0623\u0628\u062f",
      msg: "\u0623\u0645\u0646\u064a\u0627\u062a\u0646\u0627 \u0644\u0643\u0645\u0627 \u0628\u0639\u0645\u0631 \u0645\u0644\u064a\u0621 \u0628\u0627\u0644\u0641\u0631\u062d \u0648\u0627\u0644\u0645\u0648\u062f\u0629.",
      sig: "\u0645\u0639 \u0623\u0637\u064a\u0628 \u0627\u0644\u062a\u0645\u0646\u064a\u0627\u062a",
    },
    love: {
      title: "\u0644\u0623\u062c\u0644\u0643",
      msg: "\u062a\u0630\u0643\u064a\u0631 \u0635\u063a\u064a\u0631 \u0623\u0646\u0643 \u0645\u062d\u0628\u0648\u0628 \u0627\u0644\u064a\u0648\u0645 \u0648\u062f\u0627\u0626\u0645\u0627\u064b.",
      sig: "\u0628\u0643\u0644 \u0627\u0644\u062d\u0628",
    },
    photo: {
      title: "بطاقة مع صورة",
      msg: "أضف صورة وملاحظة قصيرة",
      sig: "",
    },
    dark: {
      title: "بطاقة بسيطة",
      msg: "رسالة أنيقة",
      sig: "مع الحب",
    },
    blank: {
      title: "",
      msg: "",
      sig: "",
    },
  };

  return arText[type] || fallback;
}

function CardBuilderPage() {
  const { tr, isMobile, addToCart, lang } = useApp();
  const copy = CARD_COPY[lang] || CARD_COPY.en;
  const templateLabels = TEMPLATE_LABELS[lang] || TEMPLATE_LABELS.en;
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [activeFont, setActiveFont] = useState("Playfair Display");
  const [textColor, setTextColor] = useState("#1a1a1a");
  const [bgColor, setBgColor] = useState("#fffdf8");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [activeTpl, setActiveTpl] = useState("graduation");
  const [previewScale, setPreviewScale] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const syncControls = useCallback((obj) => {
    if (!obj) return;

    if (isTextObject(obj)) {
      if (obj.fontFamily) setActiveFont(obj.fontFamily);
      if (obj.fontSize) setFontSize(Math.round(obj.fontSize));
      if (obj.fill && typeof obj.fill === "string") setTextColor(obj.fill);
      setIsBold(obj.fontWeight === "bold" || obj.fontWeight === "700");
      setIsItalic(obj.fontStyle === "italic");
      setIsUnderline(!!obj.underline);
      return;
    }

    if (obj.stroke && typeof obj.stroke === "string") {
      setTextColor(obj.stroke);
    }
  }, []);

  const addRect = useCallback((left, top, width, height, fill, stroke, strokeWidth, dash, selectable, extra = {}) => {
    const canvas = fabricRef.current;
    if (!canvas) return null;

    const rect = new fabric.Rect({
      left,
      top,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      strokeDashArray: dash,
      rx: 3,
      ry: 3,
      selectable,
      evented: selectable,
      strokeUniform: true,
      ...extra,
    });

    canvas.add(rect);
    return rect;
  }, []);

  const addLine = useCallback((x1, y1, x2, y2, stroke, strokeWidth, selectable) => {
    const canvas = fabricRef.current;
    if (!canvas) return null;

    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke,
      strokeWidth,
      selectable,
      evented: selectable,
    });

    canvas.add(line);
    return line;
  }, []);

  const applyTpl = useCallback((type) => {
    const canvas = fabricRef.current;
    const t = TPLS[type];
    if (!canvas || !t) return;
    const text = getTemplateText(type, lang, t);

    canvas.clear();
    canvas.discardActiveObject();
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.backgroundColor = t.bg;
    setBgColor(t.bg);
    setActiveTpl(type);
    setTextColor(t.tc);
    setActiveFont(t.font);

    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;
    const rtl = lang === "ar";
    const direction = rtl ? "rtl" : "ltr";
    const textAlign = rtl ? "right" : "left";
    const centeredText = rtl ? "center" : "center";
    const deco = { selectable: true, evented: true };

    const addBox = (value, opts) => {
      const box = new fabric.Textbox(value, {
        fontFamily: t.font,
        fill: t.tc,
        direction,
        editable: true,
        splitByGrapheme: rtl,
        ...opts,
      });
      canvas.add(box);
      return box;
    };

    const addCircle = (left, top, radius, fill, stroke, strokeWidth = 1.5) => {
      const circle = new fabric.Circle({
        left,
        top,
        radius,
        fill,
        stroke,
        strokeWidth,
        ...deco,
      });
      canvas.add(circle);
      return circle;
    };

    const addMark = (value, left, top, size, fill, angle = 0) => {
      const mark = new fabric.Text(value, {
        left,
        top,
        fontSize: size,
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fill,
        angle,
        ...deco,
      });
      canvas.add(mark);
      return mark;
    };
    const addCenteredRect = (inset, fill, stroke, strokeWidth, dash = null) =>
      addRect(w / 2, h / 2, w - inset * 2, h - inset * 2, fill, stroke, strokeWidth, dash, true, {
        originX: "center",
        originY: "center",
      });

    if (t.layout === "blank") {
      addCenteredRect(26, "transparent", t.ac, 1.2);
      canvas.requestRenderAll();
      return;
    }

    addCenteredRect(24, "transparent", t.ac, 1.5);

    if (t.layout === "photo") {
      addRect(48, 52, 236, h - 104, hexAlpha(t.ac, 0.12), t.ac, 1.2, [8, 6], false);
      canvas.add(new fabric.Text("Upload Image", {
        left: 166,
        top: h / 2,
        fontSize: 14,
        fontFamily: "sans-serif",
        fill: t.ac,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      }));
      addBox(text.title, {
        left: 328,
        top: 78,
        width: 220,
        fontSize: 30,
        fontWeight: "700",
        textAlign,
      });
      addLine(328, 142, 510, 142, t.ac, 1.4, true);
      addBox(text.msg, {
        left: 328,
        top: 172,
        width: 220,
        fontSize: 18,
        lineHeight: 1.35,
        textAlign,
      });
    } else if (t.layout === "graduation") {
      addRect(44, 44, 132, h - 88, "#162036", t.ac, 1.5, null, true);
      addLine(204, 96, 526, 96, t.ac, 1.5, true);
      addLine(204, 276, 526, 276, t.ac, 1.2, true);
      addMark("\u25c6", 82, 86, 34, t.ac, 45);
      addMark("\u2726", 110, 172, 28, "#f2dfb6", -12);
      addMark("\u25cf", 82, 272, 18, "#f2dfb6", 0);
      addMark("\u25cf", 132, 304, 12, t.ac, 0);
      addBox(text.title, {
        left: 218,
        top: 118,
        width: 310,
        fontSize: 42,
        fontWeight: "700",
        textAlign,
      });
      addBox(text.msg, {
        left: 218,
        top: 190,
        width: 306,
        fontSize: 20,
        lineHeight: 1.35,
        textAlign,
      });
      addBox(text.sig, {
        left: 218,
        top: 302,
        width: 306,
        fontSize: 17,
        fill: t.ac,
        fontStyle: "italic",
        textAlign,
      });
    } else if (t.layout === "wedding") {
      addCenteredRect(48, "rgba(255,255,255,.42)", t.ac, 1);
      addCircle(88, 74, 46, "rgba(255,255,255,.1)", hexAlpha(t.ac, 0.55), 1.4);
      addCircle(122, 74, 46, "rgba(255,255,255,.1)", hexAlpha(t.ac, 0.55), 1.4);
      addLine(188, 140, 412, 140, t.ac, 1.2, true);
      addMark("\u273d", 464, 54, 42, hexAlpha(t.ac, 0.55), -16);
      addMark("\u273d", 64, 292, 34, hexAlpha(t.ac, 0.4), 12);
      addBox(text.title, {
        left: w / 2,
        top: 158,
        width: w - 150,
        fontSize: 44,
        fontWeight: "700",
        textAlign: "center",
        originX: "center",
      });
      addBox(text.msg, {
        left: w / 2,
        top: 226,
        width: w - 180,
        fontSize: 21,
        lineHeight: 1.35,
        textAlign: "center",
        originX: "center",
      });
      addBox(text.sig, {
        left: w / 2,
        top: 318,
        width: w - 180,
        fontSize: 17,
        fill: t.ac,
        textAlign: "center",
        fontStyle: "italic",
        originX: "center",
      });
    } else if (t.layout === "love") {
      addCenteredRect(36, "rgba(255,255,255,.36)", t.ac, 1.2);
      addCircle(62, 58, 58, hexAlpha(t.ac, 0.08), hexAlpha(t.ac, 0.25), 1);
      addCircle(474, 244, 66, hexAlpha(t.ac, 0.1), hexAlpha(t.ac, 0.28), 1);
      addMark("\u2665", 92, 86, 62, hexAlpha(t.ac, 0.7), -10);
      addMark("\u2665", 458, 82, 30, hexAlpha(t.ac, 0.48), 12);
      addLine(214, 154, 386, 154, t.ac, 1.3, true);
      addBox(text.title, {
        left: w / 2,
        top: 92,
        width: w - 180,
        fontSize: 52,
        fontWeight: "700",
        textAlign: "center",
        originX: "center",
      });
      addBox(text.msg, {
        left: w / 2,
        top: 184,
        width: w - 170,
        fontSize: 23,
        fontFamily: "Cormorant Garamond",
        lineHeight: 1.32,
        textAlign: "center",
        originX: "center",
      });
      addBox(text.sig, {
        left: w / 2,
        top: 304,
        width: w - 180,
        fontSize: 25,
        fill: t.ac,
        textAlign: "center",
        originX: "center",
      });
    } else {
      addLine(210, 150, 390, 150, t.ac, 1.2, true);
      addBox(text.title, {
        left: w / 2,
        top: 82,
        width: w - 140,
        fontSize: 36,
        fontWeight: "700",
        textAlign: centeredText,
        originX: "center",
      });
      addBox(text.msg, {
        left: w / 2,
        top: 182,
        width: w - 160,
        fontSize: 22,
        textAlign: centeredText,
        lineHeight: 1.35,
        originX: "center",
      });
      addBox(text.sig, {
        left: w / 2,
        top: 294,
        width: w - 160,
        fontSize: 17,
        fill: t.ac,
        textAlign: centeredText,
        fontStyle: "italic",
        originX: "center",
      });
    }

    canvas.calcOffset();
    canvas.requestRenderAll();
  }, [addLine, addRect, lang]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return undefined;

    if (fabricRef.current) {
      fabricRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasEl, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "#fffdf8",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    const onSelect = (e) => syncControls(e.selected?.[0] ?? null);
    canvas.on("selection:created", onSelect);
    canvas.on("selection:updated", onSelect);
    canvas.on("selection:cleared", () => syncControls(null));

    const onKey = (e) => {
      const activeTag = document.activeElement?.tagName;
      if ((e.key === "Delete" || e.key === "Backspace") && !["INPUT", "TEXTAREA"].includes(activeTag)) {
        const obj = canvas.getActiveObject();
        if (obj) {
          canvas.remove(obj);
          canvas.renderAll();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const timer = setTimeout(() => applyTpl("graduation"), 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [applyTpl, syncControls]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return undefined;

    const resize = () => {
      const padding = isMobile ? 16 : 28;
      const available = el.clientWidth - padding;
      const next = Math.min(1, Math.max(0.42, available / CANVAS_WIDTH));
      setPreviewScale(Number(next.toFixed(3)));
    };

    resize();

    if (!window.ResizeObserver) {
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(el);
    window.addEventListener("resize", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [isMobile]);

  const addText = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const rtl = RTL_FONTS.includes(activeFont);
    const text = new fabric.Textbox(lang === "ar" ? "نصك هنا" : "Your Text", {
      left: 50,
      top: 80,
      width: canvas.width - 100,
      fontSize,
      fontFamily: activeFont,
      fill: textColor,
      textAlign: rtl ? "right" : "center",
      direction: rtl ? "rtl" : "ltr",
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [activeFont, fontSize, lang, textColor]);

  const insertMessageTemplate = useCallback((message) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    setSelectedMessage(message);
    const active = canvas.getActiveObject();
    if (isTextObject(active)) {
      active.set("text", message);
      canvas.requestRenderAll();
      return;
    }

    const text = new fabric.Textbox(message, {
      left: 80,
      top: 180,
      width: canvas.width - 160,
      fontSize: 22,
      fontFamily: activeFont,
      fill: textColor,
      textAlign: lang === "ar" ? "right" : "center",
      direction: lang === "ar" ? "rtl" : "ltr",
      lineHeight: 1.35,
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [activeFont, lang, textColor]);

  const addCardToCart = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const message =
      selectedMessage ||
      canvas
        .getObjects()
        .filter(isTextObject)
        .map((obj) => obj.text)
        .filter(Boolean)
        .join(" ")
        .slice(0, 180);

    addToCart(
      {
        id: `card-${Date.now()}`,
        name: { en: "Custom Gift Card", ar: "بطاقة هدية مخصصة" },
        price: 15000,
        icon: "💌",
        category: "card",
        type: "card",
        cardDesign: activeTpl,
        cardMessage: message,
        cardFont: activeFont,
        description: {
          en: "Custom card design with a gift message.",
          ar: "تصميم بطاقة مخصص مع رسالة هدية.",
        },
      },
      1
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  }, [activeFont, activeTpl, addToCart, selectedMessage]);

  const handleImg = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const imgData = ev.target.result;
      const imgEl = new Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.onload = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const mw = canvas.width * 0.6;
        const mh = canvas.height * 0.6;
        const scale = Math.min(mw / imgEl.width, mh / imgEl.height, 1);

        const fabImg = new fabric.Image(imgEl, {
          left: (canvas.width - imgEl.width * scale) / 2,
          top: (canvas.height - imgEl.height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
        });

        canvas.add(fabImg);
        canvas.setActiveObject(fabImg);
        canvas.renderAll();
      };
      imgEl.src = imgData;
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const addUserRect = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: canvas.width / 2 - 90,
      top: canvas.height / 2 - 45,
      width: 180,
      height: 90,
      fill: "rgba(255,255,255,0.35)",
      stroke: textColor,
      strokeWidth: 3,
      rx: 2,
      ry: 2,
      selectable: true,
      evented: true,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }, [textColor]);

  const addUserLine = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const line = new fabric.Line(
      [canvas.width / 2 - 110, canvas.height / 2, canvas.width / 2 + 110, canvas.height / 2],
      {
        stroke: textColor,
        strokeWidth: 4,
        selectable: true,
        evented: true,
      }
    );

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  }, [textColor]);

  const genQR = useCallback(() => {
    const url = youtubeUrl.trim();
    const canvas = fabricRef.current;
    if (!url || !canvas) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=4`;

    fetch(qrUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgData = e.target.result;
          const imgEl = new Image();
          imgEl.crossOrigin = "anonymous";
          imgEl.onload = () => {
            const fabImg = new fabric.Image(imgEl, {
              left: canvas.width - 150,
              top: canvas.height - 150,
              scaleX: 100 / imgEl.width,
              scaleY: 100 / imgEl.width,
            });
            canvas.add(fabImg);
            canvas.setActiveObject(fabImg);
            canvas.renderAll();
          };
          imgEl.src = imgData;
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        console.error("QR generation failed:", err);
        alert("Failed to generate QR code. Please check the URL and try again.");
      });
  }, [youtubeUrl]);

  const changeFont = useCallback((fam) => {
    setActiveFont(fam);
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (isTextObject(obj)) {
      const rtl = RTL_FONTS.includes(fam);
      obj.set({ fontFamily: fam, direction: rtl ? "rtl" : "ltr" });
      if (rtl) obj.set({ textAlign: "right" });
      canvas.requestRenderAll();
    }
  }, []);

  const chgSize = useCallback((v) => {
    const val = Number(v);
    setFontSize(val);
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (isTextObject(obj)) {
      obj.set("fontSize", val);
      canvas.requestRenderAll();
    }
  }, []);

  const tglBold = useCallback(() => {
    const next = !isBold;
    setIsBold(next);
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (isTextObject(obj)) {
      obj.set("fontWeight", next ? "bold" : "normal");
      canvas.requestRenderAll();
    }
  }, [isBold]);

  const tglItalic = useCallback(() => {
    const next = !isItalic;
    setIsItalic(next);
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (isTextObject(obj)) {
      obj.set("fontStyle", next ? "italic" : "normal");
      canvas.requestRenderAll();
    }
  }, [isItalic]);

  const tglUnder = useCallback(() => {
    const next = !isUnderline;
    setIsUnderline(next);
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (isTextObject(obj)) {
      obj.set("underline", next);
      canvas.requestRenderAll();
    }
  }, [isUnderline]);

  const setAlign = useCallback((align) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (isTextObject(obj)) {
      obj.set("textAlign", align);
      canvas.requestRenderAll();
    }
  }, []);

  const chgTxtColor = useCallback((color) => {
    setTextColor(color);
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;

    if (isTextObject(obj)) {
      obj.set("fill", color);
    } else if (obj.type === "line" || obj.type === "Line") {
      obj.set("stroke", color);
    } else if (obj.type === "rect" || obj.type === "Rect") {
      obj.set("stroke", color);
    } else {
      obj.set("fill", color);
    }

    canvas.requestRenderAll();
  }, []);

  const chgBg = useCallback((color) => {
    setBgColor(color);
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.requestRenderAll();
  }, []);

  const bringFwd = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) {
      canvas.bringForward(obj);
      canvas.renderAll();
    }
  }, []);

  const sendBck = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) {
      canvas.sendBackwards(obj);
      canvas.renderAll();
    }
  }, []);

  const delObj = useCallback(() => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
    }
  }, []);

  const clearAll = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = bgColor;
    canvas.renderAll();
  }, [bgColor]);

  const dlCard = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
    const a = document.createElement("a");
    a.href = url;
    a.download = "bloom-grace-card.png";
    a.click();
  }, []);

  const sidebar = {
    background: V.surface,
    borderRight: `1px solid ${V.border}`,
    overflowY: "auto",
    overflowX: "hidden",
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 5,
    scrollbarWidth: "thin",
  };
  const sidebarRight = { ...sidebar, borderRight: "none", borderLeft: `1px solid ${V.border}` };
  const lbl = {
    fontSize: 9,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: V.accent,
    fontFamily: "'Cinzel', serif",
    padding: "8px 0 3px",
    borderBottom: `1px solid ${V.border}`,
    marginBottom: 2,
  };
  const btn = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    padding: "8px 10px",
    border: "none",
    borderRadius: 6,
    background: V.accent,
    color: "#150e08",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Cinzel', serif",
  };
  const btnO = { ...btn, background: "transparent", color: V.accent, border: `1px solid ${V.border}` };
  const btnD = { ...btn, background: "transparent", color: V.danger, border: "1px solid #5d2e2e" };
  const inp = {
    width: "100%",
    padding: "7px 9px",
    background: V.surface2,
    border: `1px solid ${V.border}`,
    borderRadius: 6,
    color: V.text,
    fontSize: 11,
    outline: "none",
    fontFamily: "inherit",
  };
  const sbtn = (on) => ({
    flex: 1,
    padding: "6px 4px",
    background: V.surface2,
    border: `1px solid ${on ? V.accent : V.border}`,
    borderRadius: 6,
    color: on ? V.accent : V.textMuted,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    lineHeight: 1,
    backgroundColor: on ? "rgba(200,149,108,.15)" : V.surface2,
  });
  const aln = {
    flex: 1,
    padding: 6,
    background: V.surface2,
    border: `1px solid ${V.border}`,
    borderRadius: 5,
    color: V.textMuted,
    fontSize: 13,
    cursor: "pointer",
  };
  const toolGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 5 };

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: V.bg, direction: "ltr", fontFamily: "'Cairo', sans-serif", fontSize: 12, color: V.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700;800&family=Cinzel:wght@500;700&family=Dancing+Script:wght@500;700&family=Lora:wght@400;700&family=Playfair+Display:wght@500;700&family=Tajawal:wght@400;700&display=swap');`}</style>
      <Section style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 1400 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Tag>{tr.cardBuilder || "Custom Card Builder"}</Tag>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "300px minmax(0, 1fr) 240px",
          gap: isMobile ? 16 : 12,
          height: isMobile ? "auto" : "calc(100vh - 180px)",
          minHeight: isMobile ? "auto" : 600,
        }}>
          <div style={isMobile ? { ...sidebar, borderRight: "none", borderBottom: `1px solid ${V.border}` } : sidebar}>
            <div style={lbl}>{copy.content}</div>
            <button style={{ ...btn, marginBottom: 5 }} onClick={addText}>{copy.addText}</button>
            <button style={{ ...btnO, marginBottom: 5 }} onClick={() => fileInputRef.current?.click()}><FaUpload /> {copy.uploadImage}</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />

            <div style={{ height: 1, background: V.border, margin: "2px 0" }} />
            <div style={lbl}>{copy.messageTemplates}</div>
            {copy.templatesList.map((message) => (
              <button
                key={message}
                style={{
                  ...btnO,
                  justifyContent: "flex-start",
                  textAlign: lang === "ar" ? "right" : "left",
                  lineHeight: 1.35,
                  textTransform: "none",
                  letterSpacing: ".3px",
                  fontFamily: "'Cairo', sans-serif",
                  marginBottom: 5,
                }}
                onClick={() => insertMessageTemplate(message)}
              >
                {message}
              </button>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <input style={{ ...inp, flex: 1 }} placeholder={copy.qrPlaceholder} value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
              <button style={{ ...btnO, width: "auto", padding: "7px 10px", fontSize: 9, whiteSpace: "nowrap" }} onClick={genQR}>QR</button>
            </div>

            <div style={toolGrid}>
              <button style={btnO} onClick={addUserLine}><FaMinus /> {copy.line}</button>
              <button style={btnO} onClick={addUserRect}><FaRegSquare /> {copy.rectangle}</button>
            </div>

            <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
              <button style={btnO} onClick={bringFwd}>{copy.front}</button>
              <button style={btnO} onClick={sendBck}>{copy.back}</button>
              <button style={btnD} onClick={delObj}>{copy.delete}</button>
            </div>

            <div style={{ height: 1, background: V.border, margin: "2px 0" }} />
            <div style={lbl}>{copy.textStyle}</div>

            <select style={{ ...inp, marginBottom: 5 }} value={activeFont} onChange={(e) => changeFont(e.target.value)}>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Cinzel">Cinzel Classic</option>
              <option value="Lora">Lora Serif</option>
              <option value="Dancing Script">Dancing Script</option>
              <option value="Sacramento">Sacramento</option>
              <option value="Pacifico">Pacifico</option>
              <option value="Cairo">Cairo Arabic</option>
              <option value="Amiri">Amiri Arabic Classic</option>
              <option value="Tajawal">Tajawal Arabic Modern</option>
              <option value="Scheherazade New">Scheherazade</option>
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <input type="range" min={10} max={100} value={fontSize} onChange={(e) => chgSize(e.target.value)} style={{ flex: 1, accentColor: V.accent }} />
              <span style={{ fontSize: 10, color: V.accent, minWidth: 24, textAlign: "right" }}>{fontSize}</span>
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
              <button style={sbtn(isBold)} onClick={tglBold}><b>B</b></button>
              <button style={sbtn(isItalic)} onClick={tglItalic}><i>I</i></button>
              <button style={sbtn(isUnderline)} onClick={tglUnder}><u>U</u></button>
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
              <button style={aln} onClick={() => setAlign("left")} title="Align Left">L</button>
              <button style={aln} onClick={() => setAlign("center")} title="Align Center">C</button>
              <button style={aln} onClick={() => setAlign("right")} title="Align Right">R</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <input type="color" value={textColor} onChange={(e) => chgTxtColor(e.target.value)} style={{ width: 34, height: 26, border: `1px solid ${V.border}`, borderRadius: 5, padding: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: V.textMuted, flex: 1 }}>{copy.textShapeColor}</span>
            </div>

            <div style={{ height: 1, background: V.border, margin: "2px 0" }} />
            <div style={lbl}>{copy.canvas}</div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <input type="color" value={bgColor} onChange={(e) => chgBg(e.target.value)} style={{ width: 34, height: 26, border: `1px solid ${V.border}`, borderRadius: 5, padding: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: V.textMuted, flex: 1 }}>{copy.background}</span>
            </div>

            <button style={{ ...btnD, marginBottom: 5 }} onClick={clearAll}><FaTrash /> {copy.clearAll}</button>

            <div style={{ flex: 1 }} />
            <button style={{ ...btnO, padding: 11, fontSize: 11, marginTop: 10 }} onClick={addCardToCart}>
              {addedToCart ? copy.added : copy.addCard}
            </button>
            <button style={{ ...btn, background: "linear-gradient(135deg, #c8956c, #8b6914)", color: "#fff", padding: 11, fontSize: 11, marginTop: 10 }} onClick={dlCard}>
              <FaDownload /> {copy.download}
            </button>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#080604",
            overflow: "hidden",
            padding: isMobile ? "14px 8px" : "20px 16px",
            gap: 14,
            minHeight: isMobile ? 280 : 0,
          }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 4, color: V.textMuted, textTransform: "uppercase", flexShrink: 0 }}>
              {copy.preview}
            </div>
            <div style={{
              background: "linear-gradient(45deg, #161616 25%, transparent 25%), linear-gradient(-45deg,#161616 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #161616 75%), linear-gradient(-45deg, transparent 75%, #161616 75%)",
              backgroundSize: "18px 18px",
              backgroundPosition: "0 0, 0 9px, 9px -9px, -9px 0",
              backgroundColor: "#1f1f1f",
              borderRadius: 8,
              padding: isMobile ? 8 : 14,
              boxShadow: `0 24px 64px rgba(0,0,0,.7), 0 0 0 1px ${V.border}`,
              flexShrink: 0,
              maxWidth: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div ref={previewRef} style={{ width: "100%", maxWidth: CANVAS_WIDTH, display: "flex", justifyContent: "center" }}>
                <div style={{ width: CANVAS_WIDTH * previewScale, height: CANVAS_HEIGHT * previewScale, flexShrink: 0, position: "relative" }}>
                  <div style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
                    <canvas
                      ref={canvasRef}
                      style={{
                        borderRadius: 4,
                        display: "block",
                        width: CANVAS_WIDTH,
                        height: CANVAS_HEIGHT,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={isMobile ? { ...sidebarRight, borderLeft: "none", borderTop: `1px solid ${V.border}` } : sidebarRight}>
            <div style={lbl}>{copy.templates}</div>
            {TEMPLATE_ORDER.map((templateKey) => {
              const thumb = TEMPLATE_THUMBS[templateKey] || TEMPLATE_THUMBS.simple;
              const tpl = {
                key: templateKey,
                name: templateLabels[templateKey][0],
                sub: templateLabels[templateKey][1],
                style: thumb,
              };

              return (
              <div key={tpl.key} onClick={() => applyTpl(tpl.key)} style={{
                width: "100%",
                minHeight: 104,
                borderRadius: 8,
                border: `2px solid ${activeTpl === tpl.key ? V.accent : V.border}`,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "space-between",
                gap: 8,
                transition: "all .2s",
                position: "relative",
                overflow: "hidden",
                marginBottom: 8,
                padding: 10,
                background: tpl.style.bg,
                color: tpl.style.color,
                boxShadow: activeTpl === tpl.key ? `0 0 0 1px ${V.accent}` : "none",
              }}>
                <div style={{
                  height: 42,
                  border: `1px solid ${hexAlpha(tpl.style.accent, 0.65)}`,
                  borderRadius: 6,
                  position: "relative",
                  background: "rgba(255,255,255,.22)",
                  overflow: "hidden",
                }}>
                  <span style={{
                    position: "absolute",
                    left: 14,
                    top: 7,
                    fontSize: 21,
                    color: tpl.style.accent,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    lineHeight: 1,
                  }}>
                    {tpl.style.mark}
                  </span>
                  <span style={{
                    position: "absolute",
                    right: 14,
                    bottom: 10,
                    width: 78,
                    height: 2,
                    borderRadius: 99,
                    background: tpl.style.accent,
                    opacity: 0.7,
                  }} />
                </div>
                <div style={{ zIndex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Cinzel', serif", letterSpacing: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tpl.name}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: .6, opacity: 0.78, marginTop: 3, lineHeight: 1.25 }}>{tpl.sub}</div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}

export default React.memo(CardBuilderPage);
