import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import AvailabilityNote from "../components/ui/AvailabilityNote";
import { createWhatsAppLink } from "../lib/whatsapp";

function ContactPage() {
  const { tr, lang, isMobile } = useApp();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    area: "",
    message: "",
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const whatsappUrl = createWhatsAppLink(`Hello Soul Flower,

Customer name: ${form.name || "-"}
Phone: ${form.phone || "-"}
Delivery date/time: ${form.date || "-"}
Recipient area/address: ${form.area || "-"}
Gift message / request: ${form.message || "-"}

Please confirm availability and delivery time before preparation.`);

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg }}>
      <Section style={{ paddingTop: 42, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <Tag>{tr.contactTitle || "Contact Soul Flower"}</Tag>
          <p style={{ color: C.creamD, lineHeight: 1.7, marginTop: 12 }}>
            {tr.contactSub || "Tell us what you need and we will confirm the bouquet details through WhatsApp before preparation."}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
            gap: 30,
            alignItems: "start",
          }}
        >
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: isMobile ? 18 : 28 }}>
            <Field label={lang === "ar" ? "الاسم" : "Customer name"} value={form.name} onChange={(v) => set("name", v)} />
            <Field label={lang === "ar" ? "رقم الهاتف" : "Customer phone"} value={form.phone} onChange={(v) => set("phone", v)} />
            <Field label={lang === "ar" ? "تاريخ/وقت التوصيل" : "Delivery date/time"} value={form.date} onChange={(v) => set("date", v)} />
            <Field label={lang === "ar" ? "العنوان أو المنطقة" : "Recipient area/address"} value={form.area} onChange={(v) => set("area", v)} />
            <div style={{ marginBottom: 18 }}>
              <label>{lang === "ar" ? "رسالة الهدية أو الطلب" : "Gift message or request"}</label>
              <textarea className="inp" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} style={{ resize: "vertical" }} />
            </div>
            <a
              className="btn-p"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <FaWhatsapp aria-hidden="true" />
              {lang === "ar" ? "تواصل عبر واتساب" : "Contact on WhatsApp"}
            </a>
          </div>

          <div style={{ background: C.bgEl, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24 }}>
            <h2 style={{ fontFamily: FS, color: C.cream, fontWeight: 300, fontStyle: "italic", marginBottom: 14 }}>
              {lang === "ar" ? "قبل الطلب" : "Before you order"}
            </h2>
            <AvailabilityNote compact style={{ marginBottom: 18 }} />
            <p style={{ color: C.creamD, lineHeight: 1.8, fontSize: ".9rem" }}>
              WhatsApp: +963 965 578 857
              <br />
              Aleppo, Syria
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label>{label}</label>
      <input className="inp" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default React.memo(ContactPage);
