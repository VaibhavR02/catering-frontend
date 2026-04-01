import React from "react";

const Loading = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: "var(--bg-void)",
      }}
    >
      <div style={{ fontSize: 52 }}>🍱</div>
      <div
        style={{
          width: 24,
          height: 24,
          border: "2.5px solid var(--border-dim)",
          borderTopColor: "var(--ember)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <p
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
        }}
      >
        Loading MealBox…
      </p>
    </div>
  );
};

export default Loading;
