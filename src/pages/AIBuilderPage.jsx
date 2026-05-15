import React, { useState, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { C, FB, FS } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";
import {
  FLOWER_OPTS,
  COLOR_OPTS,
  RIBBON_OPTS,
  WRAP_OPTS,
} from "../constants/options";

function AIBuilderPage() {
  const { tr, addToCart, isMobile } = useApp();

  const [selFlowers, setSelFlowers] = useState([]);
  const [selColors, setSelColors] = useState([]);
  const [ribbon, setRibbon] = useState("gold");
  const [wrap, setWrap] = useState("elegant");

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);

  const [added, setAdded] = useState(false);

  const [refImage, setRefImage] = useState(null);

  // =========================
  // Upload Reference Image
  // =========================
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setRefImage(base64);
    };

    reader.readAsDataURL(file);
  }, []);

  // =========================
  // Toggle Selection
  // =========================
  const toggle = useCallback((arr, set, val) => {
    set((prev) =>
      prev.includes(val)
        ? prev.filter((x) => x !== val)
        : [...prev, val]
    );
  }, []);

  // =========================
  // Generate AI Image
  // =========================
  const generate = useCallback(async () => {
    if (selFlowers.length === 0) {
      return alert("Please choose at least one flower.");
    }

    setLoading(true);
    setGenerated(false);
    setGeneratedUrl(null);

    try {
      const flowerText = selFlowers.join(", ");
      const colorText =
        selColors.length > 0 ? selColors.join(", ") : "soft luxury tones";

      // Dynamic Prompt
      const finalPrompt = `
A luxury flower bouquet arrangement with ${flowerText}.
Main colors: ${colorText}.
Wrapped with ${wrap} wrapping paper.
Decorated with a beautiful ${ribbon} ribbon.

Hyper realistic bouquet.
Luxury florist photography.
Soft cinematic lighting.
Elegant composition.
8k ultra detailed.
Premium flower shop advertisement.
Depth of field.
Instagram luxury floral aesthetic.
Highly detailed flower textures.
Professional luxury bouquet design.
`;

      const payload = {
        prompt: finalPrompt,
        params: {
          width: 768,
          height: 768,
          steps: 30,
          cfg_scale: 7,
          n: 1,
        },
      };

      // Optional Image-to-Image
      if (refImage) {
        payload.source_processing = "img2img";
        payload.source_image = refImage;
        payload.params.denoising_strength = 0.6;
      }

      const response = await fetch(
        "https://aihorde.net/api/v2/generate/async",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.REACT_APP_AI_HORDE_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      const job = await response.json();

      if (!job.id) {
        throw new Error("Failed to create generation job");
      }

      // Poll Until Ready
      while (true) {
        const checkRes = await fetch(
          `https://aihorde.net/api/v2/generate/check/${job.id}`
        );

        const check = await checkRes.json();

        if (check.done) break;

        await new Promise((r) => setTimeout(r, 4000));
      }

      // Get Final Image
      const statusRes = await fetch(
        `https://aihorde.net/api/v2/generate/status/${job.id}`
      );

      const status = await statusRes.json();

      if (!status.generations?.length) {
        throw new Error("No image generated");
      }

      setGeneratedUrl(status.generations[0].img);
      setGenerated(true);
    } catch (err) {
      console.error(err);
      alert("Error generating image: " + err.message);
    }

    setLoading(false);
  }, [selFlowers, selColors, ribbon, wrap, refImage]);

  // =========================
  // Download Image
  // =========================
  const downloadImage = useCallback(() => {
    if (!generatedUrl) return;

    const a = document.createElement("a");
    a.href = generatedUrl;
    a.download = "bouquet.png";
    a.click();
  }, [generatedUrl]);

  // =========================
  // Add To Cart
  // =========================
  const handleAdd = useCallback(() => {
    addToCart(
      {
        id: `custom-${Date.now()}`,
        name: {
          en: "Custom AI Bouquet",
          ar: "باقة ذكاء اصطناعي",
        },
        price: 70,
        icon: "🌸",
        category: "custom",
        count: 1,
        image: generatedUrl,
        description: {
          en: "Custom generated bouquet",
          ar: "باقة مخصصة بالذكاء الاصطناعي",
        },
      },
      1
    );

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }, [addToCart, generatedUrl]);

  // =========================
  // Reusable Chip Button
  // =========================
  const ChipBtn = ({ val, arr, set, label }) => (
    <button
      onClick={() => toggle(arr, set, val)}
      style={{
        background: arr.includes(val)
          ? "rgba(201,149,108,.18)"
          : "rgba(255,255,255,.03)",

        border: `1px solid ${
          arr.includes(val) ? C.accent : C.border
        }`,

        color: arr.includes(val) ? C.accent : C.creamD,

        padding: "7px 16px",
        cursor: "pointer",
        fontSize: ".82rem",
        fontFamily: FB,
        borderRadius: 1,
        transition: "all .2s",
      }}
    >
      {arr.includes(val) ? "✓ " : ""}
      {label}
    </button>
  );

  return (
    <div
      style={{
        paddingTop: 90,
        minHeight: "100vh",
        background: C.bg,
      }}
    >
      <Section
        style={{
          paddingTop: 40,
          paddingBottom: 80,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          <Tag>{tr.aiTitle}</Tag>

          <p
            style={{
              color: C.creamD,
              marginTop: 8,
            }}
          >
            {tr.aiSub}
          </p>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "1fr 1fr",
            gap: 40,
          }}
        >
          {/* LEFT SIDE */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {/* FLOWERS */}
            <div>
              <label
                style={{
                  marginBottom: 12,
                  display: "block",
                }}
              >
                {tr.selFlowers}
              </label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {FLOWER_OPTS.map((f) => (
                  <ChipBtn
                    key={f}
                    val={f}
                    arr={selFlowers}
                    set={setSelFlowers}
                    label={tr[f]}
                  />
                ))}
              </div>
            </div>

            {/* COLORS */}
            <div>
              <label
                style={{
                  marginBottom: 12,
                  display: "block",
                }}
              >
                {tr.selColors}
              </label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {COLOR_OPTS.map((c) => (
                  <ChipBtn
                    key={c}
                    val={c}
                    arr={selColors}
                    set={setSelColors}
                    label={tr[c]}
                  />
                ))}
              </div>
            </div>

            {/* RIBBON */}
            <div>
              <label
                style={{
                  marginBottom: 12,
                  display: "block",
                }}
              >
                {tr.selRibbon}
              </label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {RIBBON_OPTS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRibbon(r)}
                    style={{
                      background:
                        ribbon === r
                          ? "rgba(201,149,108,.18)"
                          : "rgba(255,255,255,.03)",

                      border: `1px solid ${
                        ribbon === r
                          ? C.accent
                          : C.border
                      }`,

                      color:
                        ribbon === r
                          ? C.accent
                          : C.creamD,

                      padding: "7px 16px",
                      cursor: "pointer",
                      fontSize: ".82rem",
                      fontFamily: FB,
                      borderRadius: 1,
                    }}
                  >
                    {ribbon === r ? "✓ " : ""}
                    {tr[r]}
                  </button>
                ))}
              </div>
            </div>

            {/* WRAP */}
            <div>
              <label
                style={{
                  marginBottom: 12,
                  display: "block",
                }}
              >
                {tr.selWrapping}
              </label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {WRAP_OPTS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWrap(w)}
                    style={{
                      background:
                        wrap === w
                          ? "rgba(201,149,108,.18)"
                          : "rgba(255,255,255,.03)",

                      border: `1px solid ${
                        wrap === w
                          ? C.accent
                          : C.border
                      }`,

                      color:
                        wrap === w
                          ? C.accent
                          : C.creamD,

                      padding: "7px 16px",
                      cursor: "pointer",
                      fontSize: ".82rem",
                      fontFamily: FB,
                      borderRadius: 1,
                    }}
                  >
                    {wrap === w ? "✓ " : ""}
                    {tr[w]}
                  </button>
                ))}
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label
                style={{
                  marginBottom: 12,
                  display: "block",
                }}
              >
                Reference Image (optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  background: C.bgEl,
                  border: `1px solid ${C.border}`,
                  color: C.cream,
                  padding: "12px",
                  borderRadius: 2,
                  width: "100%",
                }}
              />
            </div>

            {/* GENERATE BUTTON */}
            <button
              className="btn-p"
              onClick={generate}
              disabled={
                loading || selFlowers.length === 0
              }
              style={{
                padding: "13px",
                opacity:
                  loading || selFlowers.length === 0
                    ? 0.5
                    : 1,
              }}
            >
              {loading
                ? tr.genLoading
                : tr.genBtn}
            </button>
            <button
  className="btn-p"
  onClick={downloadImage}
  style={{
    width: "100%",
    marginBottom: 12,
  }}
>
  Download Image
</button>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              background: C.bgEl,
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 460,
              padding: 32,
              textAlign: "center",
            }}
          >
            {/* EMPTY */}
            {!loading && !generated && (
              <div style={{ opacity: 0.4 }}>
                <div
                  style={{
                    fontSize: "5rem",
                    marginBottom: 16,
                  }}
                >
                  🌸
                </div>

                <p
                  style={{
                    color: C.creamD,
                    fontSize: ".9rem",
                  }}
                >
                  Your AI bouquet preview will appear here
                </p>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div>
                <div
                  style={{
                    fontSize: "4rem",
                    animation:
                      "spin 2s linear infinite",
                    display: "inline-block",
                    marginBottom: 20,
                  }}
                >
                  ⚙️
                </div>

                <p
                  style={{
                    color: C.accent,
                    fontSize: ".9rem",
                    letterSpacing: ".1em",
                    animation:
                      "pulse 1.5s infinite",
                  }}
                >
                  {tr.genLoading}
                </p>
              </div>
            )}

            {/* GENERATED */}
            {generated &&
              generatedUrl &&
              !loading && (
                <div
                  className="fadeUp"
                  style={{ width: "100%" }}
                >
                  {/* IMAGE */}
                  <img
                    src={generatedUrl}
                    alt="Generated Bouquet"
                    style={{
                      width: "100%",
                      borderRadius: 4,
                      marginBottom: 20,
                      objectFit: "cover",
                    }}
                  />

                  {/* DETAILS */}
                  <div
                    style={{
                      background:
                        "rgba(201,149,108,.08)",

                      border: `1px solid ${C.border}`,

                      padding: "16px 24px",
                      borderRadius: 2,
                      marginBottom: 20,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        fontSize: ".75rem",
                        color: C.creamD,
                        marginBottom: 6,
                        textTransform:
                          "uppercase",
                        letterSpacing: ".1em",
                      }}
                    >
                      {tr.genDone}
                    </div>

                    <div
                      style={{
                        color: C.cream,
                        fontSize: ".85rem",
                        lineHeight: 1.7,
                      }}
                    >
                      🌸{" "}
                      {selFlowers
                        .map((f) => tr[f])
                        .join(", ")}

                      <br />

                      🎨{" "}
                      {selColors
                        .map((c) => tr[c])
                        .join(", ")}

                      <br />

                      🎀 {tr[ribbon]} ribbon ·{" "}
                      {tr[wrap]} wrap
                    </div>

                    <div
                      style={{
                        fontFamily: FS,
                        color: C.accent,
                        fontSize: "1.4rem",
                        marginTop: 10,
                      }}
                    >
                      $70
                    </div>
                  </div>

                  {/* DOWNLOAD */}
                  <button
                    className="btn-p"
                    onClick={downloadImage}
                    style={{
                      width: "100%",
                      marginBottom: 12,
                    }}
                  >
                    Download Image
                  </button>

                  {/* ADD TO CART */}
                  <button
                    className="btn-p"
                    onClick={handleAdd}
                    style={{
                      width: "100%",
                      background: added
                        ? "linear-gradient(135deg,#2a6a3a,#1a4a2a)"
                        : undefined,
                    }}
                  >
                    {added
                      ? tr.successAdd
                      : tr.addBuilt}
                  </button>
                </div>
              )}
          </div>
        </div>
      </Section>
    </div>
  );
}

export default React.memo(AIBuilderPage);