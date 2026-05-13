"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ background: "#0a0e1a", margin: 0, padding: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#e2e8f0",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#00f0ff" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#f87171" }}>حدث خطأ</h1>
          <p style={{ color: "#94a3b8", marginBottom: "0.5rem", maxWidth: "400px", fontSize: "0.875rem" }}>
            {error.message || "حدث خطأ غير متوقع"}
          </p>
          <p style={{ color: "#64748b", fontSize: "0.7rem", marginBottom: "1rem", maxWidth: "400px", wordBreak: "break-all" }}>
            {error.stack?.substring(0, 300)}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,128,255,0.1))",
              border: "1px solid rgba(0,240,255,0.3)",
              color: "#00f0ff",
              borderRadius: "0.75rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
