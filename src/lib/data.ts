import infoRaw from "../data/info.json";
import projectsRaw from "../data/projects.json";
import imagesRaw from "../data/images.json";
import demosRaw from "../data/demos.json";
import servicesRaw from "../data/services.json";

export type Project = {
  slug: string;
  title: string;
  featured?: boolean;
  category: string;
  summary: string;
  description: string[];
  features: string[];
  technologies: string[];
  image: string;
  screenshots: string[];
  repo: string;
  demo: string;
  docs: string;
  creator: string;
  year: string;
};

export type ServiceDetail = {
  slug: string;
  icon: string;
  title: string;
  shortTitle: string;
  tagline: string;
  summary: string;
  overview: string[];
  deliverables: string[];
  technologies: string[];
  relatedProjectSlugs: string[];
  idealFor: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  category?: string;
  order?: number;
  width?: number;
  height?: number;
};

export type Demo = {
  slug: string;
  name: string;
  kind: string;
  category: string;
  accent: string;
  ink: string;
  featured?: boolean;
  has360Viewer?: boolean;
  summary: string;
  testGuide?: string;
  features: string[];
  hidden?: boolean;
  isCustom?: boolean;
};

const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function uniq<T extends { slug: string }>(items: T[], kind: string): T[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (!i.slug || seen.has(i.slug)) {
      console.warn(`[${kind}] skipped item with missing/duplicate slug`, i);
      return false;
    }
    seen.add(i.slug);
    return true;
  });
}

export const info = infoRaw;
export const site = (info.siteUrl || "").replace(/\/$/, "");

export const projects: Project[] = uniq(
  arr<Record<string, unknown>>(projectsRaw)
    .filter((p) => str(p.title))
    .map((p) => ({
      slug: str(p.slug) || slugify(str(p.title)),
      title: str(p.title),
      featured: !!p.featured,
      category: str(p.category, "Other"),
      summary: str(p.summary),
      description: arr<string>(p.description),
      features: arr<string>(p.features),
      technologies: arr<string>(p.technologies),
      image: str(p.image),
      screenshots: arr<string>(p.screenshots),
      repo: str(p.repo),
      demo: str(p.demo),
      docs: str(p.docs),
      creator: str(p.creator, info.name),
      year: str(p.year),
    })),
  "projects"
);

export const services: ServiceDetail[] = uniq(
  arr<ServiceDetail>(servicesRaw).filter((s) => Boolean(s.slug && s.title)),
  "services"
);
export const getService = (slug: string) => services.find((s) => s.slug === slug);

export const gallery: GalleryImage[] = arr<Record<string, unknown>>(imagesRaw)
  .filter((g) => str(g.src))
  .map((g) => ({
    src: str(g.src),
    alt: str(g.alt, "Gallery image"),
    caption: str(g.caption),
    category: str(g.category),
    order: Number(g.order) || 0,
    width: Number(g.width) || undefined,
    height: Number(g.height) || undefined,
  }))
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const socials = info.socials.filter((s) => s.url);

export const demos: Demo[] = (demosRaw.demos || []).filter((d) => d.slug && d.name);
export const getDemo = (slug: string) => demos.find((d) => d.slug === slug);
