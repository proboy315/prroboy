import type { ReactElement } from "react";
import Home from "../pages/Home";

export function normalizePath(raw: string): string {
  return raw === "/" ? "/" : raw.replace(/\/$/, "") || "/";
}

export async function preloadRoute(rawPath: string): Promise<ReactElement> {
  const path = normalizePath(rawPath);
  if (path === "/") return <Home />;
  if (path === "/about") {
    const { default: C } = await import("../pages/About");
    return <C />;
  }
  if (path === "/services") {
    const { ServicesHub } = await import("../pages/Services");
    return <ServicesHub />;
  }
  const serviceMatch = path.match(/^\/services\/([a-z0-9-]+)$/);
  if (serviceMatch) {
    const { ServiceDetailPage } = await import("../pages/Services");
    return <ServiceDetailPage slug={serviceMatch[1]} />;
  }
  if (path === "/projects") {
    const { default: C } = await import("../pages/ProjectsPage");
    return <C />;
  }
  if (path === "/projects/proboy-camlink") {
    const { ArchivedCamLink } = await import("../pages/Detail");
    return <ArchivedCamLink />;
  }
  const projectMatch = path.match(/^\/projects\/([a-z0-9-]+)$/);
  if (projectMatch) {
    const { ProjectPage } = await import("../pages/Detail");
    return <ProjectPage slug={projectMatch[1]} />;
  }
  if (path === "/proboy-md") {
    const { default: C } = await import("../pages/ProBoyMd");
    return <C />;
  }
  if (path === "/proboy-md/docs") {
    const { default: C } = await import("../pages/BotDocs");
    return <C slug="documentation-home" />;
  }
  const docsMatch = path.match(/^\/proboy-md\/docs\/([a-z0-9-]+)$/);
  if (docsMatch) {
    const { default: C } = await import("../pages/BotDocs");
    return <C slug={docsMatch[1]} />;
  }
  if (path === "/press") {
    const { default: C } = await import("../pages/Press");
    return <C />;
  }
  if (path === "/mentions") {
    const { default: C } = await import("../pages/Mentions");
    return <C />;
  }
  if (path === "/blog") {
    const { BlogIndexPage } = await import("../pages/Blog");
    return <BlogIndexPage />;
  }
  const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const { BlogArticlePage } = await import("../pages/Blog");
    return <BlogArticlePage slug={blogMatch[1]} />;
  }
  if (path === "/contact") {
    const { default: C } = await import("../pages/Contact");
    return <C />;
  }
  if (path === "/demos") {
    const { default: C } = await import("../pages/DemosDirectory");
    return <C initialTab="directory" />;
  }
  if (path === "/demos/control-room") {
    const { default: C } = await import("../pages/DemosDirectory");
    return <C initialTab="control-room" />;
  }
  const demoMatch = path.match(/^\/demos\/([a-z0-9-]+)$/);
  if (demoMatch) {
    const { default: C, preloadDemoComponent } = await import("../pages/Demos");
    const preloadedDemo = await preloadDemoComponent(demoMatch[1]);
    return <C slug={demoMatch[1]} preloadedDemo={preloadedDemo} />;
  }
  if (path === "/privacy") {
    const { default: C } = await import("../pages/Privacy");
    return <C />;
  }
  if (path === "/admin") {
    const { default: C } = await import("../pages/Admin");
    return <C />;
  }
  const { NotFound } = await import("../pages/Detail");
  return <NotFound path={path} />;
}
