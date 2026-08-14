import React from "react";
import {
  Code,
  Bot,
  ShoppingBag,
  Cpu,
  Terminal,
  TrendingUp,
  Layers,
  ChevronRight
} from "lucide-react";
import { TiltCard } from "./ui/TiltCard";

export function CinematicServices() {
  const services = [
    {
      title: "Full Stack Web Engineering",
      icon: Code,
      color: "text-cyan-300",
      glowColor: "rgba(56, 189, 248, 0.15)",
      bgIcon: "bg-cyan-500/10 border-cyan-500/20",
      linkText: "Hire For Web Project",
      linkUrl: "https://wa.me/923261684315",
      description:
        "Engineering high-performance web applications, enterprise client portals, and responsive administrative dashboards utilizing React 18, TypeScript, Vite, and Tailwind CSS with Express Node.js backends. Built from the ground up with clean modular architecture, strict type safety, RESTful API endpoints, real-time data synchronization, sub-second LCP page loading speed, and seamless cross-device layout adaptation."
    },
    {
      title: "Shopify OS 2.0 & E-Commerce",
      icon: ShoppingBag,
      color: "text-amber-300",
      glowColor: "rgba(245, 158, 11, 0.15)",
      bgIcon: "bg-amber-500/10 border-amber-500/20",
      linkText: "Order Custom Theme",
      linkUrl: "https://wa.me/923261684315",
      description:
        "Architecting bespoke Liquid themes, custom product configurators, and automated supplier inventory synchronization scripts for Shopify store owners worldwide. Specialized in high-converting checkout flows, page speed optimization, dynamic collection filters, interactive cart drawers, and custom Shopify API webhook integrations."
    },
    {
      title: "WhatsApp & Bot Automation",
      icon: Bot,
      color: "text-emerald-300",
      glowColor: "rgba(16, 185, 129, 0.15)",
      bgIcon: "bg-emerald-500/10 border-emerald-500/20",
      linkText: "Order Bot Engine",
      linkUrl: "https://wa.me/923261684315",
      description:
        "Building robust multi-device WhatsApp bots (ProBoy-MD) and messaging automation platforms powered by Node.js and the Baileys API. Features automated smart message responders, anti-link group moderation filters, media transcoding engines, custom command handlers, webhooks, and resilient cloud hosting for continuous 24/7 uptime."
    },
    {
      title: "AI Tools & Gemini Integration",
      icon: Cpu,
      color: "text-purple-300",
      glowColor: "rgba(168, 85, 247, 0.15)",
      bgIcon: "bg-purple-500/10 border-purple-500/20",
      linkText: "Build AI Feature",
      linkUrl: "https://wa.me/923261684315",
      description:
        "Seamlessly embedding Google Gemini AI models into full-stack web platforms, SaaS portals, and automated client workflows. Creating intelligent prompt processing engines, dynamic content generators, AI conversational assistants, document analysis tools, and multi-modal AI processing systems tailored to specific business requirements."
    },
    {
      title: "JS Obfuscation & Source Protection",
      icon: Terminal,
      color: "text-blue-300",
      glowColor: "rgba(59, 130, 246, 0.15)",
      bgIcon: "bg-blue-500/10 border-blue-500/20",
      linkText: "Open Security Tool",
      linkUrl: "/obfuscator/",
      description:
        "Protecting production web applications, proprietary algorithms, and client-side JavaScript source code against reverse engineering and unauthorized inspection. Deploying custom AST code compilers, multi-layer obfuscation algorithms, anti-debugging wrappers, and diagnostic shortlink control panels."
    },
    {
      title: "Creator Analytics & Monetization",
      icon: TrendingUp,
      color: "text-pink-300",
      glowColor: "rgba(236, 72, 153, 0.15)",
      bgIcon: "bg-pink-500/10 border-pink-500/20",
      linkText: "Book Consultation",
      linkUrl: "https://wa.me/923261684315",
      description:
        "Providing specialized technical guidance and custom analytics dashboards for digital creators, influencers, and media agencies across YouTube, TikTok, and Meta. Helping creators analyze CPM/RPM performance metrics, automate lead capture funnels, track conversion rates, and establish sustainable monetization systems from Pakistan."
    }
  ];

  return (
    <section id="services" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-4 py-1.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-2">
          <Layers size={14} className="text-emerald-400" />
          Primary Technical Services
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Services Offered by <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-purple-300 text-transparent bg-clip-text">Shahan Ali</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          High-performance web development, bot automation, Shopify store engineering, and artificial intelligence solutions.
        </p>
      </div>

      {/* Clean Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <TiltCard
              key={idx}
              glowColor={item.glowColor}
              className="backdrop-blur-2xl bg-slate-950/80 p-7 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/25 transition-all"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${item.bgIcon} border flex items-center justify-center ${item.color}`}>
                  <IconComponent size={22} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Production Ready</span>
                <a
                  href={item.linkUrl}
                  target={item.linkUrl.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`${item.color} hover:text-white flex items-center gap-1 font-bold transition-colors`}
                >
                  <span>{item.linkText}</span>
                  <ChevronRight size={14} />
                </a>
              </div>
            </TiltCard>
          );
        })}
      </div>

    </section>
  );
}
