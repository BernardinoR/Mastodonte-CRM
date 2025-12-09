import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

window.addEventListener('error', (event) => {
  if (event.error === null || event.error === undefined || 
      (typeof event.error !== 'object' || !(event.error instanceof Error))) {
    event.preventDefault();
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason === null || event.reason === undefined ||
      (typeof event.reason !== 'object' || !(event.reason instanceof Error))) {
    event.preventDefault();
    return;
  }
});

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
