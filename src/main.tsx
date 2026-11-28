import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { bootSiteConfig } from "./lib/siteConfig";
import { initEffects } from "./lib/effects";
import { initEventTracking } from "./lib/collector";
import { normalizePath, preloadRoute } from "./routes/routeMap";
import { applyPreviewRobots } from "./lib/seo";

bootSiteConfig();
initEffects();
initEventTracking();

async function mount() {
  const rootEl = document.getElementById("root")!;
  const builtPath = rootEl.firstElementChild?.getAttribute("data-proboy-route");
  const path = builtPath || normalizePath(window.location.pathname);
  applyPreviewRobots();
  const page = await preloadRoute(path);
  const app = <StrictMode><App path={path} page={page} /></StrictMode>;

  if (builtPath) {
    rootEl.dataset.prerendered = "true";
    hydrateRoot(rootEl, app);
  } else {
    createRoot(rootEl).render(app);
  }
}

void mount().catch((error) => {
  // Leave the prerendered content and native links usable if a chunk cannot load.
  console.error("Could not start portfolio interactions.", error);
});
