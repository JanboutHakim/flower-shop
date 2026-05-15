import React from "react";
import { C } from "../../constants/theme";

function Tag({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: ".72rem",
        letterSpacing: ".18em",
        textTransform: "uppercase",
        color: C.accent,
        borderTop: `1px solid ${C.accent}`,
        borderBottom: `1px solid ${C.accent}`,
        padding: "5px 14px",
        marginBottom: 14,
      }}
    >
      {children}
    </span>
  );
}

export default React.memo(Tag);