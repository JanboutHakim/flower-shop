import React, { useState, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { C, FS } from "../constants/theme";

function DashboardLoginPage() {
  const { tr, loginDashboard } = useApp();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (event) => {
    event?.preventDefault?.();
    if (loading) return;

    setLoading(true);
    setErr("");

    try {
      await loginDashboard(email, pass);
    } catch (error) {
      setErr(error.message || tr.wrongCreds);
      setLoading(false);
    }
  }, [email, loading, loginDashboard, pass, tr.wrongCreds]);

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
      <form
        onSubmit={handleLogin}
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
            {err}
          </div>
        )}

        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <label>Email</label>
          <input
            className="inp"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div style={{ marginBottom: 28, textAlign: "left" }}>
          <label>{tr.password}</label>
          <input
            className="inp"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          className="btn-p"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "..." : tr.loginBtn}
        </button>
        <p
          style={{ color: C.creamD, fontSize: ".75rem", marginTop: 20, opacity: 0.6 }}
        >
          Use the admin email and password from Supabase Auth.
        </p>
      </form>
    </div>
  );
}

export default React.memo(DashboardLoginPage);
