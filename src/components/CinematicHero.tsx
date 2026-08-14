import React from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Code,
  Bot,
  ShoppingBag,
  Cpu,
  MapPin,
  Rocket,
  Phone,
  Github,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send
} from "lucide-react";
import { LiquidButton } from "./ui/liquid-glass-button";

interface CinematicHeroProps {
  ecoMode?: boolean;
}

export function CinematicHero({ ecoMode = false }: CinematicHeroProps) {
  const { scrollY } = useScroll();
  const stageScale = useTransform(scrollY, [0, 500], [1, 0.95]);
  const stageOpacity = useTransform(scrollY, [0, 600], [1, 0.4]);

  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center">
      
      <motion.div
        style={{ scale: ecoMode ? 1 : stageScale, opacity: ecoMode ? 1 : stageOpacity }}
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
      >
        
        {/* ================= LEFT COLUMN: HERO INFORMATION ================= */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-2xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-cyan-300 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Available for New Projects & Collaborations</span>
          </div>

          {/* Main Name Heading */}
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-7xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
              Shahan <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-purple-300 text-transparent bg-clip-text">Ali</span>
            </h1>
            <p className="text-lg sm:text-xl font-bold tracking-wide text-slate-300 flex flex-wrap items-center gap-2">
              <span className="text-cyan-300">Full Stack</span>
              <span className="text-slate-600">•</span>
              <span className="text-purple-300">AI & Bot Developer</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-300">Shopify Expert</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300">Burewala, PK</span>
            </p>
          </div>

          {/* Core Speciality Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { name: "Web Applications", color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
              { name: "ProBoy-MD WhatsApp Bots", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
              { name: "Shopify OS 2.0 & Liquid", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
              { name: "Google Gemini Integration", color: "bg-purple-500/10 text-purple-300 border-purple-500/20" }
            ].map((pill, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${pill.color}`}
              >
                {pill.name}
              </span>
            ))}
          </div>

          {/* Detailed Persona Description */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Crafting high-speed web portals, intelligent automated bots (<span className="text-cyan-300 font-mono font-bold">ProBoy-MD</span>), and customized Shopify architectures. Studying ICS at Govt Graduate College Burewala while serving clients worldwide. Known online as <span className="text-cyan-400 font-mono font-bold">shahan315</span> / <span className="text-purple-400 font-mono font-bold">proboy315</span>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <LiquidButton
              onClick={() => {
                const el = document.getElementById("projects");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="font-bold rounded-2xl px-6 py-3.5 text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-400/40 hover:border-cyan-400 shadow-xl cursor-pointer flex items-center gap-2"
            >
              <Rocket size={16} className="text-cyan-300" />
              <span>View Projects</span>
            </LiquidButton>

            <LiquidButton
              onClick={() => window.open("https://wa.me/923261684315", "_blank")}
              className="font-bold rounded-2xl px-6 py-3.5 text-xs uppercase tracking-wider text-white bg-slate-900/80 border border-white/10 hover:border-emerald-400/50 cursor-pointer flex items-center gap-2"
            >
              <Phone size={16} className="text-emerald-400" />
              <span>Direct WhatsApp Chat</span>
            </LiquidButton>

            <a
              href="https://github.com/ProBoy315"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="GitHub Profile @ProBoy315"
            >
              <Github size={18} />
            </a>
          </div>

          {/* Social Channels Row */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Connect Online:</span>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="https://whatsapp.com/channel/0029Vb4IebYAYlUJ3dSoR70e"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <MessageSquare size={14} className="text-emerald-400" />
                <span>WhatsApp Channel</span>
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://www.tiktok.com/@shahan_ali.315"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-300 transition-colors"
              >
                TikTok @shahan_ali.315
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://instagram.com/shahanali315"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-300 transition-colors"
              >
                Instagram
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://t.me/shahan315"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: SHAHAN ALI PHOTO FRAME ================= */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative group max-w-md w-full">
            
            {/* Background Glow Ring */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-purple-500 opacity-30 blur-2xl group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />

            {/* Photo Container Card */}
            <div className="relative rounded-3xl p-3 bg-slate-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-visible">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 flex items-center justify-center">
                <img
                  src="/img.png"
                  alt="Shahan Ali - Full Stack & AI Developer Burewala Pakistan"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback avatar if /img.png is missing or fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Small Top Right Corner Glass Badge inside frame */}
              <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-lg bg-slate-950/80 border border-cyan-400/30 backdrop-blur-xl text-[9px] font-bold text-white shadow-xl flex items-center gap-1 whitespace-nowrap pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Shahan Ali</span>
                <span className="text-cyan-300 font-mono text-[9px]">• Developer</span>
              </div>

              {/* Small Bottom Left Corner Location Badge attached to frame (left attached, extending outside) */}
              <div className="absolute bottom-3 -left-3 z-20 px-2.5 py-1 rounded-lg bg-slate-950/95 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center gap-1.5 text-[9px] font-bold text-white whitespace-nowrap pointer-events-none">
                <MapPin size={10} className="text-cyan-400 flex-shrink-0" />
                <span>Burewala, Punjab, Pakistan</span>
                <span className="text-[8px] text-emerald-400 font-mono bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
                  ICS Student
                </span>
              </div>

            </div>

          </div>
        </div>

      </motion.div>

    </section>
  );
}
