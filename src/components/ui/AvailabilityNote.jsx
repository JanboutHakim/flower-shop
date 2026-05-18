import React from "react";
import { FaLeaf } from "react-icons/fa";
import { useApp } from "../../contexts/AppContext";
import { C } from "../../constants/theme";
import { AVAILABILITY_NOTE } from "../../lib/product";

function AvailabilityNote({ compact = false, style }) {
  const { lang } = useApp();

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: "rgba(201,149,108,.07)",
        border: `1px solid ${C.borderH}`,
        borderRadius: 8,
        padding: compact ? "12px 14px" : "14px 16px",
        color: C.creamD,
        lineHeight: 1.65,
        fontSize: compact ? ".78rem" : ".86rem",
        ...style,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(201,149,108,.14)",
          color: C.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 28px",
          marginTop: 2,
        }}
      >
        <FaLeaf aria-hidden="true" />
      </span>
      <span>{AVAILABILITY_NOTE[lang] || AVAILABILITY_NOTE.en}</span>
    </div>
  );
}

export default React.memo(AvailabilityNote);
