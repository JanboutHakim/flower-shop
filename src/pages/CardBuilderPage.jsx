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

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function isTextObject(obj) {
  return ["textbox", "Textbox", "text", "Text"].includes(obj?.type);
}

function CardBuilderPage() {
  const { tr, isMobile } = useApp();
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
  const [activeTpl, setActiveTpl] = useState("simple");
  const [previewScale, setPreviewScale] = useState(1);

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

  const addRect = useCallback((left, top, width, height, fill, stroke, strokeWidth, dash, selectable) => {
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

    canvas.clear();
    canvas.backgroundColor = t.bg;
    setBgColor(t.bg);
    setActiveTpl(type);
    setTextColor(t.tc);
    setActiveFont(t.font);

    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;

    if (t.layout === "blank") {
      addRect(24, 24, w - 48, h - 48, "transparent", t.ac, 1, [0, 0], false);
      canvas.requestRenderAll();
      return;
    }

    addRect(24, 24, w - 48, h - 48, "transparent", t.ac, 1.5, [0, 0], false);

    if (t.layout === "photo") {
      addRect(44, 44, 250, h - 88, hexAlpha(t.ac, 0.12), t.ac, 1.2, [7, 5], false);
      canvas.add(new fabric.Text("Upload Image", {
        left: 169,
        top: h / 2,
        fontSize: 14,
        fontFamily: "sans-serif",
        fill: t.ac,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      }));
      canvas.add(new fabric.Textbox(t.title, {
        left: 330,
        top: 92,
        width: 210,
        fontSize: 30,
        fontFamily: t.font,
        fill: t.tc,
        fontWeight: "700",
        textAlign: "left",
      }));
      canvas.add(new fabric.Textbox(t.msg, {
        left: 330,
        top: 165,
        width: 210,
        fontSize: 18,
        fontFamily: t.font,
        fill: t.tc,
        lineHeight: 1.35,
        textAlign: "left",
      }));
      addLine(330, 246, 500, 246, t.ac, 1.2, false);
    } else {
      canvas.add(new fabric.Textbox(t.title, {
        left: 58,
        top: 84,
        width: w - 116,
        fontSize: 34,
        fontFamily: t.font,
        fill: t.tc,
        fontWeight: "700",
        textAlign: "center",
      }));
      addLine(200, 150, 400, 150, t.ac, 1.2, false);
      canvas.add(new fabric.Textbox(t.msg, {
        left: 80,
        top: 180,
        width: w - 160,
        fontSize: 22,
        fontFamily: t.font,
        fill: t.tc,
        textAlign: "center",
        lineHeight: 1.35,
      }));
      canvas.add(new fabric.Textbox(t.sig, {
        left: 80,
        top: 292,
        width: w - 160,
        fontSize: 16,
        fontFamily: t.font,
        fill: t.ac,
        textAlign: "center",
        fontStyle: "italic",
      }));
    }

    canvas.requestRenderAll();
  }, [addLine, addRect]);

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
    const timer = setTimeout(() => applyTpl("simple"), 100);

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
    const text = new fabric.Textbox("Your Text", {
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
  }, [activeFont, fontSize, textColor]);

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
            <div style={lbl}>Content</div>
            <button style={{ ...btn, marginBottom: 5 }} onClick={addText}>Add Text</button>
            <button style={{ ...btnO, marginBottom: 5 }} onClick={() => fileInputRef.current?.click()}><FaUpload /> Upload Image</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />

            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="URL to QR Code" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
              <button style={{ ...btnO, width: "auto", padding: "7px 10px", fontSize: 9, whiteSpace: "nowrap" }} onClick={genQR}>QR</button>
            </div>

            <div style={toolGrid}>
              <button style={btnO} onClick={addUserLine}><FaMinus /> Line</button>
              <button style={btnO} onClick={addUserRect}><FaRegSquare /> Rectangle</button>
            </div>

            <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
              <button style={btnO} onClick={bringFwd}>Front</button>
              <button style={btnO} onClick={sendBck}>Back</button>
              <button style={btnD} onClick={delObj}>Del</button>
            </div>

            <div style={{ height: 1, background: V.border, margin: "2px 0" }} />
            <div style={lbl}>Text Style</div>

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
              <span style={{ fontSize: 10, color: V.textMuted, flex: 1 }}>Text and shape color</span>
            </div>

            <div style={{ height: 1, background: V.border, margin: "2px 0" }} />
            <div style={lbl}>Canvas</div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <input type="color" value={bgColor} onChange={(e) => chgBg(e.target.value)} style={{ width: 34, height: 26, border: `1px solid ${V.border}`, borderRadius: 5, padding: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: V.textMuted, flex: 1 }}>Background</span>
            </div>

            <button style={{ ...btnD, marginBottom: 5 }} onClick={clearAll}><FaTrash /> Clear All</button>

            <div style={{ flex: 1 }} />
            <button style={{ ...btn, background: "linear-gradient(135deg, #c8956c, #8b6914)", color: "#fff", padding: 11, fontSize: 11, marginTop: 10 }} onClick={dlCard}>
              <FaDownload /> Download PNG
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
              Landscape Card Preview
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
            <div style={lbl}>Templates</div>
            {[
              { key: "blank", name: "Blank", sub: "Plain landscape", style: { background: "#fff", color: "#222" } },
              { key: "simple", name: "Simple", sub: "Title and message", style: { background: "#fffdf8", color: "#222" } },
              { key: "photo", name: "Photo", sub: "Image and note", style: { background: "#f7f7f7", color: "#222" } },
              { key: "dark", name: "Dark", sub: "Simple dark", style: { background: "#171717", color: "#eee", borderColor: "#333" } },
            ].map((tpl) => (
              <div key={tpl.key} onClick={() => applyTpl(tpl.key)} style={{
                width: "100%",
                height: 90,
                borderRadius: 8,
                border: `2px solid ${activeTpl === tpl.key ? V.accent : (tpl.style.borderColor || V.border)}`,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                transition: "all .2s",
                position: "relative",
                overflow: "hidden",
                marginBottom: 8,
                ...tpl.style,
                boxShadow: activeTpl === tpl.key ? `0 0 0 1px ${V.accent}` : "none",
              }}>
                <FaImage style={{ fontSize: 14, opacity: 0.75 }} />
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Cinzel', serif", letterSpacing: 2, zIndex: 1 }}>
                  {tpl.name}
                </div>
                <div style={{ fontSize: 9, letterSpacing: 1, zIndex: 1, opacity: 0.75 }}>{tpl.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

export default React.memo(CardBuilderPage);
