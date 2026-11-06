import { DemoShell } from "../components/DemoPrimitives";
import { demos, getDemo } from "../lib/data";
import { useSeo } from "../lib/seo";
import { NotFound } from "./Detail";
import {
  ApexMotors,
  AtelierNoir,
  EmberKitchen,
  FreshCart,
  Haven,
  KansoLiving,
  LuminaBotanicals,
  LuxeCart,
  SolisStays,
  VoltixGear,
} from "./DemosCommerce";
import {
  CarePointClinic,
  ClientFlowCrm,
  ForgeDocs,
  IronPulseClub,
  LedgerNoteFinance,
  MemberVault,
  MeridianPress,
  Northline,
  Pulse,
  SkillForgeLms,
  SprintBoardKanban,
  StagePassLive,
  SynthStudio,
  TalentGridJobs,
} from "./DemosWorkspaces";
import "./demos.css";

const registry: Record<string, () => React.ReactNode> = {
  "luxecart-store": LuxeCart,
  "pulse-dashboard": Pulse,
  "ember-kitchen": EmberKitchen,
  "haven-properties": Haven,
  "northline-agency": Northline,
  "synth-ai-studio": SynthStudio,
  "forge-docs": ForgeDocs,
  "atelier-noir": AtelierNoir,
  "voltix-gear": VoltixGear,
  "kanso-living": KansoLiving,
  "lumina-botanicals": LuminaBotanicals,
  "freshcart-market": FreshCart,
  "solis-stays": SolisStays,
  "apex-motors": ApexMotors,
  "skillforge-lms": SkillForgeLms,
  "talentgrid-jobs": TalentGridJobs,
  "meridian-press": MeridianPress,
  "stagepass-live": StagePassLive,
  "ironpulse-club": IronPulseClub,
  "medicare-connect": CarePointClinic,
  "clientflow-crm": ClientFlowCrm,
  "sprintboard-kanban": SprintBoardKanban,
  "memberstack-hub": MemberVault,
  "ledgernote-finance": LedgerNoteFinance,
};

export default function Demos({ slug }: { slug: string }) {
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

  const Page = registry[slug];
  if (!d || !Page) return <NotFound path={`/demos/${slug}`} />;
  return (
    <DemoShell slug={slug}>
      <Page />
    </DemoShell>
  );
}

export { demos };
