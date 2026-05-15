import React, { useState, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { C } from "../constants/theme";
import Section from "../components/ui/Section";
import Tag from "../components/ui/Tag";

function AIImagePage() {
  const { tr, isMobile } = useApp();
  const [refImage, setRefImage] = useState(null);
  const [prompt, setPrompt] = useState(
    "A hyper-realistic, close-up shot of a massive, lush bouquet of deep purple and lavender lilacs. The petals feature visible dew drops and intricate textures. The bouquet is wrapped in heavy, matte-finish black architectural paper with sharp, elegant folds. A wide, shimmering metallic gold satin ribbon is tied in a perfect, voluminous bow around the stems. Lighting is soft and cinematic (Chiaroscuro style), casting gentle shadows and highlighting the gold's luster. Shot on 85mm lens, f/1.8, 8k resolution, elegant interior background."
  );
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);

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

  const generate = useCallback(async () => {
    if (!refImage) return alert("Please upload a reference image.");
    setLoading(true);
    setGeneratedUrl(null);

    try {
      const data = {
        prompt,
        source_processing: "img2img",
        source_image: refImage,
        params: { width: 512, height: 512, denoising_strength: 0.6, n: 1 },
      };

      const response = await fetch("https://aihorde.net/api/v2/generate/async", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "z_a7rtYlaByXMzPiFhkKYQ",
        },
        body: JSON.stringify(data),
      });
      const job = await response.json();
      const generationId = job.id;

      while (true) {
        const checkRes = await fetch(
          `https://aihorde.net/api/v2/generate/check/${generationId}`
        );
        const check = await checkRes.json();
        if (check.done) break;
        await new Promise((r) => setTimeout(r, 5000));
      }

      const statusRes = await fetch(
        `https://aihorde.net/api/v2/generate/status/${generationId}`
      );
      const status = await statusRes.json();
      setGeneratedUrl(status.generations[0].img);
    } catch (err) {
      alert("Error generating image: " + err.message);
    }
    setLoading(false);
  }, [prompt, refImage]);

  const download = useCallback(() => {
    if (!generatedUrl) return;
    const a = document.createElement("a");
    a.href = generatedUrl;
    a.download = "generated_image.png";
    a.click();
  }, [generatedUrl]);

  return (
    <div style={{ paddingTop: 90, minHeight: "100vh", background: C.bg }}>
      <Section style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Tag>{tr.aiImgTitle}</Tag>
          <p style={{ color: C.creamD, marginTop: 8 }}>{tr.aiImgSub}</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <label style={{ marginBottom: 12, display: "block" }}>
                {tr.uploadRef}
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
            <div>
              <label style={{ marginBottom: 12, display: "block" }}>
                {tr.enterPrompt}
              </label>
              <textarea
                className="inp"
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <button
              className="btn-p"
              onClick={generate}
              disabled={!refImage || loading}
              style={{ padding: "13px", opacity: !refImage || loading ? 0.5 : 1 }}
            >
              {loading ? tr.genImgLoading : tr.genImgBtn}
            </button>
          </div>

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
            {!loading && !generatedUrl && (
              <div style={{ opacity: 0.4 }}>
                <div style={{ fontSize: "5rem", marginBottom: 16 }}>🎨</div>
                <p style={{ color: C.creamD, fontSize: ".9rem" }}>
                  Your generated image will appear here
                </p>
              </div>
            )}
            {loading && (
              <div>
                <div
                  style={{
                    fontSize: "4rem",
                    animation: "spin 2s linear infinite",
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
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  {tr.genImgLoading}
                </p>
              </div>
            )}
            {generatedUrl && !loading && (
              <div className="fadeUp">
                <img
                  src={generatedUrl}
                  alt="Generated"
                  style={{ maxWidth: "100%", borderRadius: 4, marginBottom: 20 }}
                />
                <div
                  style={{
                    background: "rgba(201,149,108,.08)",
                    border: `1px solid ${C.border}`,
                    padding: "16px 24px",
                    borderRadius: 2,
                    marginBottom: 20,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: ".75rem",
                      color: C.creamD,
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                    }}
                  >
                    {tr.genImgDone}
                  </div>
                </div>
                <button className="btn-p" onClick={download} style={{ width: "100%" }}>
                  {tr.downloadImg}
                </button>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

export default React.memo(AIImagePage);