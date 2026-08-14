import React from "react";
import {
  Code,
  Bot,
  ShoppingBag,
  Cpu,
  Workflow,
  Terminal,
  Database,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { TiltCard } from "./ui/TiltCard";

interface SkillCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  bgIcon: string;
  skills: Array<{ name: string; tag?: string }>;
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Full Stack & Web Engineering",
    icon: Code,
    color: "text-cyan-300",
    glowColor: "rgba(56, 189, 248, 0.15)",
    bgIcon: "bg-cyan-500/10 border-cyan-500/20",
    skills: [
      { name: "React 18 & JSX" },
      { name: "TypeScript" },
      { name: "Vite" },
      { name: "Tailwind CSS" },
      { name: "Node.js & Express" },
      { name: "REST APIs & Webhooks" }
    ]
  },
  {
    title: "Bot Automation & Messaging",
    icon: Bot,
    color: "text-emerald-300",
    glowColor: "rgba(16, 185, 129, 0.15)",
    bgIcon: "bg-emerald-500/10 border-emerald-500/20",
    skills: [
      { name: "ProBoy-MD Engine" },
      { name: "Baileys API" },
      { name: "Multi-Device Pairing" },
      { name: "Group Anti-Link Moderation" },
      { name: "Auto-Responders" },
      { name: "Media Transcoding" }
    ]
  },
  {
    title: "Shopify & E-Commerce",
    icon: ShoppingBag,
    color: "text-amber-300",
    glowColor: "rgba(245, 158, 11, 0.15)",
    bgIcon: "bg-amber-500/10 border-amber-500/20",
    skills: [
      { name: "Shopify OS 2.0" },
      { name: "Liquid Templating" },
      { name: "Custom Checkout" },
      { name: "Supplier Sync Scripts" },
      { name: "Store LCP Optimization" },
      { name: "Cart & Drawer APIs" }
    ]
  },
  {
    title: "AI Models & Gemini Integration",
    icon: Cpu,
    color: "text-purple-300",
    glowColor: "rgba(168, 85, 247, 0.15)",
    bgIcon: "bg-purple-500/10 border-purple-500/20",
    skills: [
      { name: "Google Gemini 2.5 API" },
      { name: "Prompt Engineering" },
      { name: "Dynamic Text Generation" },
      { name: "QuizOff 2026 Certified" },
      { name: "LLM Agent Workflows" },
      { name: "AI Chatbots" }
    ]
  },
  {
    title: "Databases & Cloud Hosting",
    icon: Database,
    color: "text-pink-300",
    glowColor: "rgba(236, 72, 153, 0.15)",
    bgIcon: "bg-pink-500/10 border-pink-500/20",
    skills: [
      { name: "MySQL" },
      { name: "Firestore / Firebase" },
      { name: "GitHub CI/CD" },
      { name: "Vercel Edge Deployment" },
      { name: "Render Cloud Nodes" },
      { name: "Local Storage State" }
    ]
  },
  {
    title: "Security & Utility Tools",
    icon: Terminal,
    color: "text-blue-300",
    glowColor: "rgba(59, 130, 246, 0.15)",
    bgIcon: "bg-blue-500/10 border-blue-500/20",
    skills: [
      { name: "JS Obfuscation & AST" },
      { name: "Anti-Tamper Compilation" },
      { name: "ProBoy CamLink" },
      { name: "Diagnostic Shortlinks" },
      { name: "Git & Version Control" },
      { name: "Linux Bash Commands" }
    ]
  }
];

export function InteractiveSkillEcosystem() {
  return (
    <section id="skills" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative">
      
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/40 px-4 py-1.5 rounded-full border border-purple-500/20 inline-flex items-center gap-2">
          <Workflow size={14} className="text-purple-400" />
          Technical Skillset
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Core Technologies & <span className="bg-gradient-to-r from-purple-300 via-cyan-300 to-emerald-300 text-transparent bg-clip-text">Capabilities</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Clean overview of programming languages, frameworks, bot platforms, e-commerce engines, and AI integrations.
        </p>
      </div>

      {/* Grid of Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SKILL_CATEGORIES.map((cat, idx) => {
          const IconComponent = cat.icon;
          return (
            <TiltCard
              key={idx}
              glowColor={cat.glowColor}
              className="backdrop-blur-2xl bg-slate-950/80 p-6 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${cat.bgIcon} border flex items-center justify-center ${cat.color}`}>
                    <IconComponent size={20} />
                  </div>
                  <h3 className="text-base font-extrabold text-white">{cat.title}</h3>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 font-semibold flex items-center gap-1.5 hover:border-white/25 transition-colors"
                    >
                      <CheckCircle2 size={12} className={cat.color} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>

    </section>
  );
}
