import React from "react";

function Section({ children, style = {} }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", ...style }}>
      {children}
    </div>
  );
}

export default React.memo(Section);