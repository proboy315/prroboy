import { useEffect, useState } from "react";
import Home from "./pages/Home";
import ProBoyMd from "./pages/ProBoyMd";
import { ProjectPage, ShowcasePage, NotFound } from "./pages/Detail";
import Intro, { shouldShowIntro } from "./components/Intro";
import { Header, Sidebar, Drawer, Footer, BackToTop, useActiveSection } from "./components/Layout";
import { info } from "./lib/data";
import { usePath } from "./lib/router";

const ids = info.nav.map((n) => n.id);

export default function App() {
  const path = usePath();
  const [intro, setIntro] = useState(() => path === "/" && shouldShowIntro());
  const [menu, setMenu] = useState(false);
  const active = useActiveSection(path === "/" ? ids : []);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.08 });
    const observe = (node: Element) => {
      if (node.matches(".reveal:not(.in)")) io.observe(node);
      node.querySelectorAll(".reveal:not(.in)").forEach((element) => io.observe(element));
    };
    const main = document.getElementById("main");
    if (main) observe(main);
    // Filtered project/showcase items can mount after the initial page render.
    const changes = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node instanceof Element) observe(node);
    })));
    if (main) changes.observe(main, { childList: true, subtree: true });
    if (path === "/" && location.hash) setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView(), 80);
    return () => { changes.disconnect(); io.disconnect(); };
  }, [path, intro]);

  const docs = /^\/proboy-md\/?$/.test(path);
  const m = path.match(/^\/(projects|showcase)\/([a-z0-9-]+)\/?$/);
  const page = docs ? <ProBoyMd /> : path === "/" ? <Home /> : m?.[1] === "projects" ? <ProjectPage slug={m[2]} /> : m ? <ShowcasePage slug={m[2]} /> : <NotFound />;

  return (
    <div className="min-h-screen bg-[#07070a] text-white overflow-x-clip relative">
      {intro && <Intro onDone={() => setIntro(false)} />}
      <div inert={menu || intro}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] bg-red-600 px-4 py-2 rounded">Skip to content</a>
      {!docs && <Header active={active} menuOpen={menu} setMenuOpen={setMenu} />}
      {path === "/" && <Sidebar active={active} />}
      <main id="main" className="relative z-10">{page}</main>
      {!docs && <Footer />}
      {!docs && <BackToTop />}
      </div>
      {!docs && <Drawer open={menu} setOpen={setMenu} active={active} />}
    </div>
  );
}
