import { createRoot } from "react-dom/client";
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

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
    logError(
        'Unhandled error',
        event.error || new Error(event.message),
        {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            type: 'window.error',
        }
    );
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    logError(
        'Unhandled promise rejection',
        event.reason,
        {
            type: 'unhandledrejection',
            promise: event.promise?.toString(),
        }
    );

    // Prevent default browser console error
    event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
