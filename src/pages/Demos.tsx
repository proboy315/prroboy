import { Suspense, lazy, type ComponentType, type ReactElement } from "react";
import { DemoShell } from "../components/DemoPrimitives";
import { demos, getDemo } from "../lib/data";
import { useSeo } from "../lib/seo";
import { NotFound } from "./Detail";
import "./demos.css";

const COMMERCE_EXPORTS = [
  "luxecart-store",
  "ember-kitchen",
  "haven-properties",
  "atelier-noir",
  "voltix-gear",
  "kanso-living",
  "lumina-botanicals",
  "freshcart-market",
  "solis-stays",
  "apex-motors",
] as const;

type CommerceKey = (typeof COMMERCE_EXPORTS)[number];

const COMMERCE_EXPORT_NAME: Record<CommerceKey, string> = {
  "luxecart-store": "LuxeCart",
  "ember-kitchen": "EmberKitchen",
  "haven-properties": "Haven",
  "atelier-noir": "AtelierNoir",
  "voltix-gear": "VoltixGear",
  "kanso-living": "KansoLiving",
  "lumina-botanicals": "LuminaBotanicals",
  "freshcart-market": "FreshCart",
  "solis-stays": "SolisStays",
  "apex-motors": "ApexMotors",
};

const WORKSPACE_EXPORT_NAME: Record<string, string> = {
  "pulse-dashboard": "Pulse",
  "northline-agency": "Northline",
  "synth-ai-studio": "SynthStudio",
  "forge-docs": "ForgeDocs",
  "skillforge-lms": "SkillForgeLms",
  "talentgrid-jobs": "TalentGridJobs",
  "meridian-press": "MeridianPress",
  "stagepass-live": "StagePassLive",
  "ironpulse-club": "IronPulseClub",
  "medicare-connect": "CarePointClinic",
  "clientflow-crm": "ClientFlowCrm",
  "sprintboard-kanban": "SprintBoardKanban",
  "memberstack-hub": "MemberVault",
  "ledgernote-finance": "LedgerNoteFinance",
};

export async function preloadDemoComponent(slug: string): Promise<ReactElement | undefined> {
  if (slug in COMMERCE_EXPORT_NAME) {
    const mod = (await import("./DemosCommerce")) as Record<string, ComponentType>;
    const Comp = mod[COMMERCE_EXPORT_NAME[slug as CommerceKey]];
    return Comp ? <Comp /> : undefined;
  }
  if (slug in WORKSPACE_EXPORT_NAME) {
    const mod = (await import("./DemosWorkspaces")) as Record<string, ComponentType>;
    const Comp = mod[WORKSPACE_EXPORT_NAME[slug]];
    return Comp ? <Comp /> : undefined;
  }
  return undefined;
}

function makeLazyDemo(slug: string) {
  if (slug in COMMERCE_EXPORT_NAME) {
    return lazy(async () => {
      const mod = (await import("./DemosCommerce")) as Record<string, ComponentType>;
      return { default: mod[COMMERCE_EXPORT_NAME[slug as CommerceKey]] };
    });
  }
  if (slug in WORKSPACE_EXPORT_NAME) {
    return lazy(async () => {
      const mod = (await import("./DemosWorkspaces")) as Record<string, ComponentType>;
      return { default: mod[WORKSPACE_EXPORT_NAME[slug]] };
    });
  }
  return null;
}

const lazyCache = new Map<string, ComponentType>();

export default function Demos({
  slug,
  preloadedDemo,
}: {
  slug: string;
  preloadedDemo?: ReactElement;
}) {
  const d = getDemo(slug);
  useSeo({
    title: d ? `${d.name} Demo | Shahan Ali (PROBOY)` : "Demo Not Found — PROBOY",
    description: d
      ? `Try ${d.name}, a ${d.kind} demo by Shahan Ali. Explore working controls with sample data; this is not a client project.`
      : "The requested demo does not exist.",
    path: `/demos/${slug}`,
    noindex: !d,
    jsonLd: d
      ? [
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: d.name,
            applicationCategory: d.category,
            description: d.summary,
            creator: { "@type": "Person", name: "Shahan Ali", alternateName: ["ProBoy", "ProBoy315"] },
          },
        ]
      : [],
  });

  if (!d) return <NotFound path={`/demos/${slug}`} />;
  if (preloadedDemo) {
    return <DemoShell slug={slug}>{preloadedDemo}</DemoShell>;
  }

  let LazyPage = lazyCache.get(slug);
  if (!LazyPage) {
    const created = makeLazyDemo(slug);
    if (!created) return <NotFound path={`/demos/${slug}`} />;
    LazyPage = created;
    lazyCache.set(slug, created);
  }

  return (
    <DemoShell slug={slug}>
      <Suspense fallback={<p className="d-note">Loading interactive demo…</p>}>
        <LazyPage />
      </Suspense>
    </DemoShell>
  );
}

export { demos };
