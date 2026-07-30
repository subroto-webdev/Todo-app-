"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
          background: "#f8fafc",
        }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#64748b", maxWidth: 380 }}>
            A critical error occurred. Please try reloading the page — if the problem persists, contact support.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#059669",
              color: "#fff",
              padding: "0.625rem 1.5rem",
              borderRadius: "0.75rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
