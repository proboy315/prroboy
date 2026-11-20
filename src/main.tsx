import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { bootSiteConfig } from "./lib/siteConfig";
import { initEffects } from "./lib/effects";
import { initEventTracking } from "./lib/collector";

// Apply the cached/default look before first paint, then refresh from /api/site-config.
bootSiteConfig();
initEffects();
initEventTracking();

const rootEl = document.getElementById("root")!;

if (rootEl.hasChildNodes()) {
  hydrateRoot(
    rootEl,
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
