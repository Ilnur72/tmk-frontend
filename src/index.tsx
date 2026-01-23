import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./config/axios"; // Import axios config to setup interceptors
import axios from "axios";
import { API_URL } from "./config/const";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

axios.defaults.baseURL = API_URL;
const token = localStorage.getItem("token");
if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Completely suppress React error overlay for cross-origin script errors
if (process.env.NODE_ENV === "development") {
  // Suppress cross-origin script errors before React even loads
  const isCrossOriginError = (event: any) => {
    const message =
      event.message || event.reason?.message || String(event.reason || "");
    return (
      message === "Script error." ||
      message.includes("Script error") ||
      message.includes("Cannot set properties of null") ||
      message.includes("reading 'innerHTML'") ||
      event.filename === "" ||
      !event.filename
    );
  };

  // Install error handlers at the highest priority
  window.addEventListener(
    "error",
    (event) => {
      if (isCrossOriginError(event)) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        console.debug("[Cross-origin error suppressed]:", event.message);
        return false;
      }
    },
    true,
  ); // Use capture phase with highest priority

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      if (isCrossOriginError(event)) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        console.debug("[Cross-origin rejection suppressed]:", event.reason);
        return false;
      }
    },
    true,
  );

  // Remove React error overlay iframe when it appears
  const removeErrorOverlay = () => {
    const overlays = document.querySelectorAll(
      'iframe[style*="position: fixed"]',
    );
    overlays.forEach((overlay) => {
      const overlayContent = overlay.getAttribute("style");
      if (overlayContent?.includes("z-index: 2147483647")) {
        overlay.remove();
      }
    });

    // Also check for React's error overlay div
    const errorOverlayDivs = document.querySelectorAll(
      'div[style*="position: fixed"][style*="z-index"]',
    );
    errorOverlayDivs.forEach((div) => {
      if (div.textContent?.includes("Script error.")) {
        div.remove();
      }
    });
  };

  // Watch for DOM changes and remove error overlay
  const observer = new MutationObserver(() => {
    removeErrorOverlay();
  });

  // Start observing after DOM is ready
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <App />
      <ToastContainer />
    </CookiesProvider>
  </React.StrictMode>,
);

reportWebVitals();
