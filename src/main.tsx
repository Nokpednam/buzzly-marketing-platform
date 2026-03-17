import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";
import { logError } from "./services/errorLogger";

// Apply theme from localStorage before React renders (avoids flash, works on all pages)
const THEME_KEY = "buzzly_settings_theme";
const stored = localStorage.getItem(THEME_KEY);
if (stored === "dark") {
  document.documentElement.classList.add("dark");
} else if (stored === "light") {
  document.documentElement.classList.remove("dark");
} else if (stored === "system") {
  document.documentElement.classList.toggle(
    "dark",
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// Safe log — never throw (avoids cascade when DB/logging fails)
const safeLogError = (message: string, error?: unknown, meta?: Record<string, unknown>) => {
  logError(message, error, meta).catch((e) => {
    console.error("[Buzzly] Error logging failed:", e);
  });
};

// Global error handler for unhandled errors
window.addEventListener("error", (event) => {
  safeLogError("Unhandled error", event.error || new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    type: "window.error",
  });
});

// Global handler for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  safeLogError("Unhandled promise rejection", event.reason, {
    type: "unhandledrejection",
    promise: event.promise?.toString?.(),
  });
});

// Fallback UI when React fails to mount (prevents white screen)
function AppFallback({ error }: { error: Error }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        background: "#f9fafb",
        color: "#111827",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ color: "#6b7280", marginBottom: 16, maxWidth: 400, textAlign: "center" }}>
        Buzzly failed to load. Check the browser console (F12) for details.
      </p>
      <pre
        style={{
          padding: 16,
          background: "#f3f4f6",
          borderRadius: 8,
          fontSize: 12,
          overflow: "auto",
          maxWidth: 500,
          marginBottom: 16,
        }}
      >
        {error.message}
      </pre>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "10px 20px",
          background: "#1a3fbf",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Reload
      </button>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

try {
  const root = createRoot(rootEl);
  root.render(<App />);
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  safeLogError("React failed to mount", error);
  rootEl.innerHTML = "";
  const fallbackRoot = createRoot(rootEl);
  fallbackRoot.render(
    React.createElement(AppFallback, { error })
  );
}
