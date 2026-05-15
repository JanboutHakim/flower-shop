import React, { useState, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";

function DashboardLoginPage() {
  const { tr, navigate, setAuth } = useApp();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(() => {
    setLoading(true);
    setErr(false);
    setTimeout(() => {
      if (user === "admin" && pass === "flowers2024") {
        setAuth(true);
        navigate("dashboard");
      } else {
        setErr(true);
        setLoading(false);
      }
    }, 600);
  }, [user, pass, setAuth, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `radial-gradient(ellipse at center, rgba(201,149,108,.06) 0%, transparent 70%)`,
      }}
    >
      <div
        className="fadeUp"
        style={{
          background: C.bgCard,
          border: `1px solid ${C.borderH}`,
          borderRadius: 2,
          padding: "48px 40px",
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🌸</div>
        <h2
          style={{
            fontFamily: FS,
            fontSize: "1.8rem",
            fontWeight: 300,
            color: C.cream,
            fontStyle: "italic",
            marginBottom: 6,
          }}
        >
          Bloom & Grace
        </h2>
        <p
          style={{
            color: C.creamD,
            fontSize: ".8rem",
            letterSpacing: ".12em",
            textTransform: "uppercase",
            marginBottom: 36,
          }}
        >
          {tr.dashboard}
        </p>

        {err && (
          <div
            style={{
              background: "rgba(160,48,88,.1)",
              border: "1px solid rgba(160,48,88,.3)",
              color: "#c8507a",
              padding: "10px 16px",
              fontSize: ".85rem",
              marginBottom: 20,
              borderRadius: 1,
            }}
          >
            {tr.wrongCreds}
          </div>
        )}

        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <label>{tr.username}</label>
          <input
            className="inp"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        <div style={{ marginBottom: 28, textAlign: "left" }}>
          <label>{tr.password}</label>
          <input
            className="inp"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        <button
          className="btn-p"
          onClick={handleLogin}
          style={{ width: "100%", padding: "13px", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "..." : tr.loginBtn}
        </button>
        <p
          style={{ color: C.creamD, fontSize: ".75rem", marginTop: 20, opacity: 0.6 }}
        >
          admin / flowers2024
        </p>
      </div>
    </div>
  );
}

export default React.memo(DashboardLoginPage);