import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler to suppress non-Error exceptions from Radix UI
window.addEventListener('error', (event) => {
  // Check if this is a non-Error object being thrown
  if (event.error === null || event.error === undefined || 
      (typeof event.error !== 'object' || !(event.error instanceof Error))) {
    // Prevent the error from propagating (likely from Radix UI internal handling)
    event.preventDefault();
    return;
  }
});

// Handle unhandled promise rejections with non-Error values
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason === null || event.reason === undefined ||
      (typeof event.reason !== 'object' || !(event.reason instanceof Error))) {
    // Prevent the rejection from being logged (likely from Radix UI internal handling)
    event.preventDefault();
    return;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
