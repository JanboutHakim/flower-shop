import React, { useMemo, useState, useCallback } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useApp } from "../contexts/AppContext";
import { C, FB, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import AvailabilityNote from "../components/ui/AvailabilityNote";
import { formatCurrency } from "../constants/options";
import { FILTER_OPTIONS, optionLabel } from "../lib/product";
import { createWhatsAppLink } from "../lib/whatsapp";
import { AI_HORDE_KEY } from "../lib/env";

const CUSTOM_PRICE = {
  low: 45000,
  medium: 70000,
  premium: 110000,
};

const SIZE_OPTIONS = ["Small", "Standard", "Large", "Deluxe"];
const WRAP_OPTIONS = ["White", "Black", "Natural", "Luxury gold"];

function AIBuilderPage() {
  const { tr, addToCart, isMobile, lang } = useApp();
  const [form, setForm] = useState({
    occasion: "birthday",
    color: "pink",
    budget: "medium",
    size: "Standard",
    wrapping: "White",
    notes: "",
  });
  const [added, setAdded] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState("");

  const price = CUSTOM_PRICE[form.budget] || CUSTOM_PRICE.medium;
  const summary = useMemo(
    () => ({
      Occasion: optionLabel(form.occasion, lang),
      "Main color": optionLabel(form.color, lang),
      Budget: optionLabel(form.budget, lang),
      Size: form.size,
      Wrapping: form.wrapping,
      "Style notes": form.notes || (lang === "ar" ? "ناعم وأنيق" : "Soft and elegant"),
    }),
    [form, lang]
  );

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const generatePreview = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewUrl("");

    const prompt = `Luxury florist bouquet style preview.
Occasion: ${optionLabel(form.occasion, "en")}.
Main color palette: ${optionLabel(form.color, "en")}.
Budget style: ${optionLabel(form.budget, "en")}.
Bouquet size: ${form.size}.
Wrapping style: ${form.wrapping}.
Fresh local flower shop arrangement, premium dark luxury aesthetic, elegant bouquet photography, realistic floral textures, soft studio lighting.
This is a visual style reference only, not an exact final bouquet.`;

    try {
      const response = await fetch("https://aihorde.net/api/v2/generate/async", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: AI_HORDE_KEY,
        },
        body: JSON.stringify({
          prompt,
          params: {
            width: 768,
            height: 768,
            steps: 28,
            cfg_scale: 7,
            n: 1,
          },
        }),
      });

      const job = await response.json();
      if (!job.id) throw new Error("Failed to create preview job");

      while (true) {
        const checkRes = await fetch(`https://aihorde.net/api/v2/generate/check/${job.id}`);
        const check = await checkRes.json();
        if (check.done) break;
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }

      const statusRes = await fetch(`https://aihorde.net/api/v2/generate/status/${job.id}`);
      const status = await statusRes.json();
      const image = status.generations?.[0]?.img;
      if (!image) throw new Error("No preview image returned");
      setPreviewUrl(image);
    } catch (err) {
      console.error(err);
      setPreviewError(
        lang === "ar"
          ? "تعذر إنشاء المعاينة الآن. يمكنك متابعة الطلب بدون صورة."
          : "Could not create the preview now. You can continue without an image."
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [form, lang]);

  const handleAdd = useCallback(() => {
    addToCart(
      {
        id: `custom-${Date.now()}`,
        name: { en: "Custom Bouquet Style", ar: "نمط باقة مخصص" },
        price,
        icon: "💐",
        category: "custom",
        type: "custom",
        count: 1,
        description: {
          en: "Custom bouquet style prepared from fresh available flowers.",
          ar: "نمط باقة مخصص يُحضّر من الزهور الطازجة المتوفرة.",
        },
        image: previewUrl,
        customSummary: summary,
        colors: [form.color],
        occasion: [form.occasion],
        budgetTier: form.budget,
        wrappingStyle: form.wrapping,
        size: form.size,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [addToCart, form, price, previewUrl, summary]);

  const whatsappUrl = createWhatsAppLink(`Hello! I would like to order a custom bouquet style.

Occasion: ${summary.Occasion}
Main color: ${summary["Main color"]}
Budget: ${summary.Budget}
Size: ${summary.Size}
Wrapping: ${summary.Wrapping}
Style notes: ${summary["Style notes"]}
Estimated total: ${formatCurrency(price)}

Final flowers may vary depending on daily availability while keeping the same color theme and style.`);

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg }}>
      <Section style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 38 }}>
          <Tag>{lang === "ar" ? "ابنِ نمط باقتك" : "Build your bouquet style"}</Tag>
          <p style={{ color: C.creamD, marginTop: 10, lineHeight: 1.7 }}>
            {lang === "ar"
              ? "اختر التفضيلات التي سيستخدمها محل الورد لتحضير باقة قريبة من النمط المطلوب حسب زهور اليوم."
              : "Choose the preferences the real shop will use to prepare your bouquet from the flowers available today."}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) 420px",
            gap: 30,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: isMobile ? 18 : 28,
            }}
          >
            <Select label={optionLabel("occasion", lang)} value={form.occasion} onChange={(v) => set("occasion", v)} options={FILTER_OPTIONS.occasion} lang={lang} />
            <Select label={lang === "ar" ? "اللون الرئيسي" : "Main color"} value={form.color} onChange={(v) => set("color", v)} options={FILTER_OPTIONS.colors} lang={lang} />
            <Select label={optionLabel("budgetTier", lang)} value={form.budget} onChange={(v) => set("budget", v)} options={FILTER_OPTIONS.budgetTier} lang={lang} />
            <Select label={lang === "ar" ? "حجم الباقة" : "Bouquet size"} value={form.size} onChange={(v) => set("size", v)} options={SIZE_OPTIONS} />
            <Select label={lang === "ar" ? "نمط التغليف" : "Wrapping style"} value={form.wrapping} onChange={(v) => set("wrapping", v)} options={WRAP_OPTIONS} />
            <div>
              <label>{lang === "ar" ? "ملاحظات خاصة" : "Special notes"}</label>
              <textarea
                className="inp"
                rows={4}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder={lang === "ar" ? "مثال: ناعم وأنيق" : "Example: Soft and elegant"}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          <div
            style={{
              background: C.bgEl,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: isMobile ? 18 : 24,
              position: isMobile ? "static" : "sticky",
              top: 90,
            }}
          >
            <h2
              style={{
                fontFamily: FS,
                color: C.cream,
                fontWeight: 300,
                fontStyle: "italic",
                marginBottom: 16,
              }}
            >
              {lang === "ar" ? "نمط باقتك" : "Your bouquet style"}
            </h2>
            <div
              style={{
                border: `1px solid ${C.border}`,
                background: "rgba(0,0,0,.18)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  minHeight: 220,
                  borderRadius: 6,
                  background: C.bgCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={lang === "ar" ? "معاينة نمط الباقة" : "Bouquet style preview"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: "3.2rem", opacity: 0.55, marginBottom: 10 }}>💐</div>
                    <p style={{ color: C.creamD, fontSize: ".82rem", lineHeight: 1.6 }}>
                      {lang === "ar"
                        ? "أنشئ معاينة بالذكاء الاصطناعي لرؤية اتجاه الشكل فقط."
                        : "Create an AI preview to see the style direction only."}
                    </p>
                  </div>
                )}
              </div>
              <p style={{ color: C.creamD, fontSize: ".76rem", lineHeight: 1.55, marginBottom: 10 }}>
                {lang === "ar"
                  ? "المعاينة للإلهام فقط وليست وعداً بأن الباقة النهائية ستكون مطابقة."
                  : "The preview is for inspiration only; the final bouquet is not promised to match it exactly."}
              </p>
              {previewError && (
                <p style={{ color: "#ffb0b0", fontSize: ".76rem", lineHeight: 1.5, marginBottom: 10 }}>
                  {previewError}
                </p>
              )}
              <button
                className="btn-s"
                onClick={generatePreview}
                disabled={previewLoading}
                style={{ width: "100%", opacity: previewLoading ? 0.55 : 1 }}
              >
                {previewLoading
                  ? lang === "ar"
                    ? "جارٍ إنشاء المعاينة..."
                    : "Creating preview..."
                  : lang === "ar"
                    ? "إنشاء معاينة بالذكاء الاصطناعي"
                    : "Create AI Preview"}
              </button>
            </div>
            {Object.entries(summary).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14,
                  color: C.creamD,
                  fontSize: ".88rem",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <span>{key}</span>
                <strong style={{ color: C.cream, textAlign: "end" }}>{value}</strong>
              </div>
            ))}
            <div style={{ fontFamily: FS, color: C.accent, fontSize: "1.6rem", marginTop: 16 }}>
              {formatCurrency(price)}
            </div>
            <p style={{ color: C.creamD, fontSize: ".82rem", lineHeight: 1.7, margin: "14px 0" }}>
              {lang === "ar"
                ? "قد تختلف الزهور النهائية حسب توفر اليوم مع الحفاظ على نفس الألوان والطابع."
                : "Final flowers may vary depending on daily availability while keeping the same color theme and style."}
            </p>
            <AvailabilityNote compact style={{ marginBottom: 16 }} />
            <button
              className="btn-p"
              onClick={handleAdd}
              style={{ width: "100%", padding: "13px", marginBottom: 10 }}
            >
              {added
                ? tr.successAdd
                : lang === "ar"
                  ? "أضف الباقة المخصصة للسلة"
                  : "Add Custom Bouquet to Cart"}
            </button>
            <a
              className="btn-s"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <FaWhatsapp aria-hidden="true" />
              {lang === "ar" ? "إرسال عبر واتساب" : "Send to WhatsApp"}
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Select({ label, value, options, onChange, lang }) {
  return (
    <label style={{ marginBottom: 18 }}>
      <span style={{ display: "block", marginBottom: 8 }}>{label}</span>
      <select
        className="inp"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: FB }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {lang ? optionLabel(option, lang) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default React.memo(AIBuilderPage);
