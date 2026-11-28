import { lazy, Suspense, useEffect, useState, useSyncExternalStore, type ReactElement } from "react";
import { Analytics } from "@vercel/analytics/react";
import { LiquidAmbient } from "./components/LiquidGlass";
import { Header, Sidebar, Drawer, Footer, BackToTop, useActiveSection } from "./components/Layout";
import { info } from "./lib/data";
import { replayBrokenImageErrors } from "./lib/imageFallback";
import { analyticsAllowed, getConsent, sendPageView, subscribeConsent } from "./lib/collector";
import { getCachedConfig, isPreviewMode, useSiteConfig } from "./lib/siteConfig";
import { AnnouncementPill, MaintenanceOverlay, PreviewBadge, PrivacyNotice, ScrollProgress } from "./components/SiteShell";

const HOME_SECTION_IDS = ["home", "about", "services", "projects", "demos", "certificates", "qa", "contact"];
const Intro = lazy(() => import("./components/Intro"));

function OptionalAnalytics() {
  const [mounted, setMounted] = useState(false);
  const cfg = useSiteConfig();
  useSyncExternalStore(subscribeConsent, getConsent, () => "unset");
  const allowed = analyticsAllowed(cfg);

  useEffect(() => {
    setMounted(true);
    if (!allowed) return;

    const gaId = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || info.analytics?.gaMeasurementId || "";
    if (gaId && !document.getElementById("ga4-script")) {
      const s = document.createElement("script");
      s.id = "ga4-script";
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(s);

      const inline = document.createElement("script");
      inline.id = "ga4-inline";
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`;
      document.head.appendChild(inline);
    }

    const clarityId =
      (import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined) || info.analytics?.clarityProjectId || "";
    if (clarityId && !document.getElementById("clarity-script")) {
      const inline = document.createElement("script");
      inline.id = "clarity-script";
      inline.textContent = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityId)});`;
      document.head.appendChild(inline);
    }
  }, [allowed]);

  if (!mounted || !allowed) return null;
  return info.analytics?.vercelAnalytics !== false ? <Analytics /> : null;
}

export default function App({ path, page }: { path: string; page: ReactElement }) {
  const [intro, setIntro] = useState(false);
  const [menu, setMenu] = useState(false);
  const activeSection = useActiveSection(path === "/" ? HOME_SECTION_IDS : []);

  useEffect(() => {
    if (path !== "/" || window.location.hash || getCachedConfig()?.features.intro === false ||
      (!import.meta.env.DEV && document.getElementById("root")?.dataset.introAvailable !== "true")) return;
    let active = true;
    void import("./components/Intro").then(({ shouldShowIntro }) => {
      if (active && shouldShowIntro()) setIntro(true);
    }).catch(() => {});
    return () => { active = false; };
  }, [path]);

  useEffect(() => {
    const sweep = () => replayBrokenImageErrors();
    sweep();
    const timer = window.setTimeout(sweep, 1200);
    window.addEventListener("load", sweep);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", sweep);
    };
  }, [path]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08 }
    );
    const observe = (node: Element) => {
      if (node.matches(".reveal:not(.in)")) io.observe(node);
      node.querySelectorAll(".reveal:not(.in)").forEach((element) => io.observe(element));
    };
    const main = document.getElementById("main");
    if (main) observe(main);
    const changes = new MutationObserver((records) =>
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) observe(node);
        })
      )
    );
    if (main) changes.observe(main, { childList: true, subtree: true });
    return () => {
      changes.disconnect();
      io.disconnect();
    };
  }, [path, intro]);

  const isAdmin = path === "/admin";

  useEffect(() => {
    if (path !== "/404") void sendPageView(path);
  }, [path]);

  const siteCfg = useSiteConfig();
  const maintenance = siteCfg.maintenance.enabled && !isPreviewMode() && !isAdmin;

  if (isAdmin) {
    return (
      <div data-proboy-route={path} className="min-h-screen bg-[#06080d] text-white overflow-x-clip relative">
        {page}
      </div>
    );
  }

  return (
    <div data-proboy-route={path} className="min-h-screen bg-[#07070a] text-white overflow-x-clip relative">
      <LiquidAmbient />
      {intro && <Suspense fallback={null}><Intro onDone={() => setIntro(false)} /></Suspense>}
      <div inert={menu || intro || maintenance}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] bg-red-600 px-4 py-2 rounded"
        >
          Skip to content
        </a>
        <Header currentPath={path} menuOpen={menu} setMenuOpen={setMenu} />
        {path === "/" && <Sidebar active={activeSection} />}
        <main id="main" tabIndex={-1} className="relative z-10">
          {page}
        </main>
        <Footer />
        <BackToTop />
      </div>
      <Drawer open={menu} setOpen={setMenu} currentPath={path} />
      <ScrollProgress />
      <AnnouncementPill />
      <PrivacyNotice />
      <PreviewBadge />
      <MaintenanceOverlay path={path} />
      <OptionalAnalytics />
    </div>
  );
}
