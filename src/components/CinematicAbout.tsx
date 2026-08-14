import React from "react";
import { motion } from "motion/react";
import {
  Award,
  BookOpen,
  MapPin,
  Cpu,
  CheckCircle2,
  Code,
  Bot,
  ShoppingBag,
  Sparkles,
  Shield,
  Clock,
  Send,
  Zap,
  Layers,
  Terminal
} from "lucide-react";
import { TiltCard } from "./ui/TiltCard";

export function CinematicAbout() {
  return (
    <section id="about" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative">
      
      {/* Header Badge & Title */}
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 px-4 py-1.5 rounded-full border border-cyan-500/20 inline-flex items-center gap-2">
          <Award size={14} className="text-cyan-400" />
          The Shahan Ali Story
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Engineering High-Speed Systems From <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-purple-300 text-transparent bg-clip-text">Burewala, Pakistan</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Combining formal computer science studies with production-grade full-stack web development, bot automation, and custom e-commerce architectures.
        </p>
      </div>

      {/* Story Chapter Journey Grid */}
      <div className="space-y-16">
        
        {/* CHAPTER 1: WHO I AM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest block">CHAPTER 01</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">WHO I AM</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              My name is <span className="text-white font-bold">Shahan Ali</span> (known globally as <span className="text-cyan-300 font-mono">shahan315</span> and <span className="text-purple-300 font-mono">proboy315</span>). I am an ICS 1st Year (Intermediate in Computer Science) student at <span className="text-slate-200 font-semibold">Govt Graduate College Burewala, Punjab, Pakistan</span>.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1">
                <MapPin size={12} /> Burewala, PK
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                <BookOpen size={12} /> ICS 1st Year
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1">
                <Shield size={12} /> Google Certified
              </span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <TiltCard glowColor="rgba(56, 189, 248, 0.12)" className="backdrop-blur-2xl bg-slate-950/80 p-7 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold font-mono">
                  SA
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Shahan Ali</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Govt Graduate College Burewala · District Vehari</p>
                </div>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                "I believe that deep understanding of software engineering fundamentals combined with intense practical application produces extraordinary digital products. Even while pursuing my ICS college education, I operate a full-stack development workflow serving clients worldwide."
              </p>
            </TiltCard>
          </div>
        </div>

        {/* CHAPTER 2: WHAT I BUILD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
                  <Code size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">Full Stack Portals</h4>
                <p className="text-xs text-slate-400">React, TypeScript, Vite, Tailwind CSS & Express backends with optimized LCP.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <Bot size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">ProBoy-MD Bots</h4>
                <p className="text-xs text-slate-400">Multi-device WhatsApp automation with auto-responders, filters & cloud nodes.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                  <ShoppingBag size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">Shopify OS 2.0</h4>
                <p className="text-xs text-slate-400">Custom Liquid theme architecture, checkout tweaks, and supplier sync scripts.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                  <Cpu size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">AI Agents</h4>
                <p className="text-xs text-slate-400">Google Gemini API integration, dynamic text generation, and prompt workflows.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3 order-1 lg:order-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block">CHAPTER 02</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">WHAT I BUILD</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              From standalone interactive client tools and full-stack web portals to automated multi-device WhatsApp bots (<span className="text-emerald-300 font-mono">ProBoy-MD</span>) and custom Shopify Liquid themes.
            </p>
          </div>
        </div>

        {/* CHAPTER 3: HOW I THINK & SPECIALIZE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest block">CHAPTER 03</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">HOW I THINK</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Clean modular code structure, sub-second LCP performance, bulletproof error handling, and 100% transparent client communication on WhatsApp.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="space-y-3">
              {[
                { title: "Modular Architecture", desc: "Types, utilities, components, and API routes kept clean and well-structured.", icon: Layers, color: "text-cyan-300" },
                { title: "Performance First", desc: "Sub-second LCP loading times with lazy assets and lightweight scripts.", icon: Zap, color: "text-amber-300" },
                { title: "Verified Competence", desc: "Competed in Google Gemini QuizOff 2026 among 525,000+ candidates globally.", icon: Award, color: "text-purple-300" }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${item.color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
