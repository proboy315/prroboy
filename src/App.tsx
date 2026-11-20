import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/react";
import Home from "./pages/Home";
import AboutPage from "./pages/About";
import { ServicesHub, ServiceDetailPage } from "./pages/Services";
import ProjectsPage from "./pages/ProjectsPage";
import { ProjectPage, NotFound } from "./pages/Detail";
import ProBoyMd from "./pages/ProBoyMd";
import BotDocs from "./pages/BotDocs";
import Press from "./pages/Press";
import Mentions from "./pages/Mentions";
import { BlogIndexPage, BlogArticlePage } from "./pages/Blog";
import ContactPage from "./pages/Contact";
import Demos from "./pages/Demos";
import DemosDirectory from "./pages/DemosDirectory";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import { LiquidAmbient } from "./components/LiquidGlass";
import Intro, { shouldShowIntro } from "./components/Intro";
import { Header, Sidebar, Drawer, Footer, BackToTop, useActiveSection } from "./components/Layout";
import { info } from "./lib/data";
import { replayBrokenImageErrors } from "./lib/imageFallback";
import { trackPageView } from "./lib/analytics";
import { analyticsAllowed, getConsent, sendPageView, subscribeConsent } from "./lib/collector";
import { getCachedConfig, isPreviewMode, useSiteConfig } from "./lib/siteConfig";
import { playPageTransition } from "./lib/effects";
import { AnnouncementPill, MaintenanceOverlay, PreviewBadge, PrivacyNotice, ScrollProgress } from "./components/SiteShell";
import { usePath } from "./lib/router";

const HOME_SECTION_IDS = ["home", "about", "services", "projects", "demos", "certificates", "qa", "contact"];

function OptionalAnalytics() {
  const [mounted, setMounted] = useState(false);
  const cfg = useSiteConfig();
  useSyncExternalStore(subscribeConsent, getConsent, () => "unset");
  const allowed = analyticsAllowed(cfg);

  useEffect(() => {
    setMounted(true);
    // Third-party tags (Vercel Analytics, GA4, Clarity) load ONLY while the owner's master switch is ON
    // and the visitor has not opted out / sent a privacy signal.
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

export default function App({ initialPath }: { initialPath?: string }) {
  const rawPath = usePath(initialPath);
  const path = rawPath === "/" ? "/" : rawPath.replace(/\/$/, "");
  const [intro, setIntro] = useState(false);
  const [menu, setMenu] = useState(false);
  const activeSection = useActiveSection(path === "/" ? HOME_SECTION_IDS : []);

  useEffect(() => {
    if (path === "/" && getCachedConfig()?.features.intro !== false && shouldShowIntro()) {
      setIntro(true);
    }
  }, []);

  useEffect(() => {
    // Recover missing assets: files that failed before hydration never fire onError.
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
    if (path === "/" && window.location.hash) {
      setTimeout(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView(), 80);
    }
    return () => {
      changes.disconnect();
      io.disconnect();
    };
  }, [path, intro]);

  const projectMatch = path.match(/^\/projects\/([a-z0-9-]+)$/);
  const serviceMatch = path.match(/^\/services\/([a-z0-9-]+)$/);
  const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/);
  const demoMatch = path.match(/^\/demos\/([a-z0-9-]+)$/);
  const docsMatch = path.match(/^\/proboy-md\/docs\/([a-z0-9-]+)$/);

  const page =
    path === "/" ? (
      <Home />
    ) : path === "/about" ? (
      <AboutPage />
    ) : path === "/services" ? (
      <ServicesHub />
    ) : serviceMatch ? (
      <ServiceDetailPage slug={serviceMatch[1]} />
    ) : path === "/projects" ? (
      <ProjectsPage />
    ) : projectMatch ? (
      <ProjectPage slug={projectMatch[1]} />
    ) : path === "/proboy-md" ? (
      <ProBoyMd />
    ) : path === "/proboy-md/docs" ? (
      <BotDocs slug="documentation-home" />
    ) : docsMatch ? (
      <BotDocs slug={docsMatch[1]} />
    ) : path === "/press" ? (
      <Press />
    ) : path === "/mentions" ? (
      <Mentions />
    ) : path === "/blog" ? (
      <BlogIndexPage />
    ) : blogMatch ? (
      <BlogArticlePage slug={blogMatch[1]} />
    ) : path === "/contact" ? (
      <ContactPage />
    ) : path === "/demos" ? (
      <DemosDirectory initialTab="directory" />
    ) : path === "/demos/control-room" ? (
      <DemosDirectory initialTab="control-room" />
    ) : demoMatch ? (
      <Demos slug={demoMatch[1]} />
    ) : path === "/privacy" ? (
      <Privacy />
    ) : path === "/admin" ? (
      <Admin />
    ) : (
      <NotFound path={path} />
    );

  const isAdmin = path === "/admin";

  const firstPath = useRef(true);
  useEffect(() => {
    if (analyticsAllowed()) trackPageView(path); // legacy on-device counter, only while analytics is ON
    void sendPageView(path); // first-party collector: waits for config, no-op unless allowed
    if (firstPath.current) firstPath.current = false;
    else playPageTransition();
  }, [path]);

  const siteCfg = useSiteConfig();
  const maintenance = siteCfg.maintenance.enabled && !isPreviewMode() && !isAdmin;

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#06080d] text-white overflow-x-clip relative">
        <Admin />
        <OptionalAnalytics />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white overflow-x-clip relative">
      <LiquidAmbient />
      {intro && <Intro onDone={() => setIntro(false)} />}
      <div inert={menu || intro || maintenance}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] bg-red-600 px-4 py-2 rounded"
        >
          Skip to content
        </a>
        <Header currentPath={path} menuOpen={menu} setMenuOpen={setMenu} />
        {path === "/" && <Sidebar active={activeSection} />}
        <main id="main" className="relative z-10">
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
