import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logError } from "./services/errorLogger";

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
