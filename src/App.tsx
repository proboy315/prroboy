import React, { useState, useEffect, useRef } from "react";
import {
  Laptop,
  Globe,
  Heart,
  Rocket,
  ExternalLink,
  Github,
  Instagram,
  Facebook,
  Send,
  MapPin,
  Sparkles,
  Code,
  Database,
  Bot,
  ShoppingBag,
  TrendingUp,
  Workflow,
  Shield,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  Mail,
  Phone,
  Copy,
  Check,
  Award,
  BookOpen,
  Compass,
  MessageSquare,
  Cpu,
  Terminal,
  Zap,
  Layers,
  Star,
  UserCheck
} from "lucide-react";

import ImageGallery from "./components/ImageGallery";
import { ParticleWaveBackground } from "./components/ParticleWaveBackground";
import { Waves } from "./components/ui/wave-background";
import { LiquidButton } from "./components/ui/liquid-glass-button";
import { TiltCard } from "./components/ui/TiltCard";
import { motion, AnimatePresence } from "motion/react";

// Types for Projects
interface Project {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  category: "all" | "bots" | "shopify" | "fullstack" | "ai" | "monetization";
  link?: string;
  github?: string;
}

interface SpatialSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const SpatialSection: React.FC<SpatialSectionProps> = ({ id, children, className = "" }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 70, scale: 0.94, rotateX: 6 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1]
      }}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d"
      }}
      className={`relative transform-gpu ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default function App() {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active section tracking for navigation highlight
  const [activeSection, setActiveSection] = useState("hero");

  // Project filter state
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Performance Optimization Eco Mode
  const [ecoMode, setEcoMode] = useState(false);

  // Floating Back-to-Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Shared project list with primary identity and subpages
  const [projects, setProjects] = useState<Project[]>([
    {
      title: "ProBoy-MD WhatsApp Bot",
      description: "Advanced multi-device WhatsApp automation engine developed by Shahan Ali. Features custom command handlers, auto-responders, media transcoding, and high-concurrency cloud node execution.",
      image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=800&q=80",
      category: "bots",
      tags: ["Node.js", "Baileys API", "TypeScript", "Automation"],
      github: "https://github.com/ProBoy315/ProBoy-MD",
      link: "https://wa.me/923261684315"
    },
    {
      title: "ProBoy CamLink & Control Panel",
      description: "Generates dynamic camera shortlinks with real-time smart device diagnostic logs, image capture feeds, and camera link tools on an elegant glass control panel.",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
      category: "fullstack",
      tags: ["Camera Capture", "Diagnostic Logs", "Shortlinks", "Control Panel"],
      github: "https://github.com/ProBoy315",
      link: "/camera/"
    },
    {
      title: "ProBoy JS Obfuscator Tool",
      description: "High-performance client-side JavaScript obfuscator designed to encode, safeguard, and optimize production source files against unauthorized inspection.",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      category: "fullstack",
      tags: ["JavaScript", "Obfuscation", "Security", "Code Compiler"],
      github: "https://github.com/ProBoy315",
      link: "/obfuscator/"
    },
    {
      title: "ProBoy MD Pairing Portal",
      description: "Instant secure multi-device pairing code generator for WhatsApp bots. Delivers seamless dynamic pairing without requiring QR code scanning.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      category: "bots",
      tags: ["WhatsApp Linker", "Webhooks", "Render API", "Pairing Code"],
      github: "https://github.com/ProBoy315",
      link: "/pair/"
    },
    {
      title: "ProBoy-SiM Database Portal",
      description: "Advanced data lookup interface providing structured simulation database files and activation reports with interactive tabular filtering.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      category: "fullstack",
      tags: ["SIM Database", "API Sync", "MySQL", "Information Portal"],
      github: "https://github.com/ProBoy315",
      link: "https://proboy.vercel.app/sim.html"
    },
    {
      title: "Shopify Custom E-Commerce Engine",
      description: "High-level inventory synchronization system and fulfillment automating flow connecting multiple supplier APIs to Shopify storefronts with sub-second LCP.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
      category: "shopify",
      tags: ["Liquid", "Shopify OS 2.0", "Custom Themes", "Webhook Integration"],
      link: "https://wa.me/923261684315"
    },
    {
      title: "Social Creator Monetization Dashboard",
      description: "Analytical dashboard created for digital creators to maximize YouTube, TikTok, and Facebook creator fund revenues with RPM forecasts.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      category: "monetization",
      tags: ["React.js", "Data Visualization", "API Analytics", "Monetization"],
      github: "https://github.com/ProBoy315"
    }
  ]);

  // Try loading additional projects if projects.json exists
  useEffect(() => {
    async function fetchExternalProjects() {
      try {
        const res = await fetch("./projects.json");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((p: any) => {
              let inferredCategory = p.category || "fullstack";
              if (!p.category) {
                const searchStr = `${p.title} ${p.description} ${p.tags?.join(" ")}`.toLowerCase();
                if (searchStr.includes("bot") || searchStr.includes("whatsapp") || searchStr.includes("telegram")) {
                  inferredCategory = "bots";
                } else if (searchStr.includes("shopify") || searchStr.includes("liquid")) {
                  inferredCategory = "shopify";
                } else if (searchStr.includes("monetiz") || searchStr.includes("rpm")) {
                  inferredCategory = "monetization";
                }
              }
              return {
                title: p.title || "Untitled Creation",
                description: p.description || "",
                image: p.image || "",
                tags: p.tags || [],
                category: inferredCategory,
                link: p.link || "",
                github: p.github || ""
              };
            });
            // Merge unique projects
            setProjects(formatted);
          }
        }
      } catch (err) {
        console.log("Using primary project data.");
      }
    }
    fetchExternalProjects();
  }, []);

  // Filtered projects
  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  // Q&A accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqData = [
    {
      question: "Who is Shahan Ali (Shahan Ali Developer)?",
      answer: "Shahan Ali is a Full Stack, AI, Bot, and Shopify Developer from Burewala, Punjab, Pakistan. Known online as shahan315, proboy315, and ProBoy, he is an ICS 1st Year student at Govt Graduate College Burewala, specializing in automated web applications, ProBoy-MD WhatsApp bots, and high-conversion e-commerce solutions."
    },
    {
      question: "What primary services does Shahan Ali offer?",
      answer: "Shahan Ali offers Full Stack Web Application Development, AI Integration & Prompt Engineering, Custom WhatsApp & Telegram Bot Creation (ProBoy-MD), Shopify Liquid Theme Customization, and Automation Workflow Scripts."
    },
    {
      question: "What is the ProBoy-MD WhatsApp Bot?",
      answer: "ProBoy-MD is an automated WhatsApp helper engine built by Shahan Ali using Node.js and the Baileys API. It features multi-device support, auto-responses, group management filters, media transcoding, and high uptime cloud hosting."
    },
    {
      question: "How can I contact Shahan Ali directly?",
      answer: "You can contact Shahan Ali directly on WhatsApp at +923261684315 (locally 0326-1684315) or email luciferkiller315@gmail.com. You can also join his official WhatsApp Broadcast Channel: https://whatsapp.com/channel/0029Vb6vIroBPzjSw1lCQP0X."
    },
    {
      question: "Where can I view Shahan Ali's live sub-tools and code?",
      answer: "Shahan Ali's portfolio includes live tools such as ProBoy CamLink (/camera/), ProBoy JS Obfuscator (/obfuscator/), and ProBoy MD Pairing Code Generator (/pair/), alongside open-source repositories on GitHub (@ProBoy315)."
    }
  ];

  // Set active link on scroll
  useEffect(() => {
    function handleScroll() {
      const sections = ["hero", "about", "services", "projects", "skills", "gallery", "qa", "contact"];
      const scrollPos = window.scrollY + 140;

      for (const sect of sections) {
        const el = document.getElementById(sect);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sect);
            break;
          }
        }
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Copy Contact Info Interactions
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  function copyText(text: string, type: "email" | "phone") {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  }

  // Live Contact Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName || !formMsg) return;

    const submission = {
      name: formName,
      email: formEmail,
      msg: formMsg,
      timestamp: new Date().toISOString()
    };
    const currentList = JSON.parse(localStorage.getItem("shahan_messages") || "[]");
    currentList.push(submission);
    localStorage.setItem("shahan_messages", JSON.stringify(currentList));

    setFormSuccess(true);
    setFormName("");
    setFormEmail("");
    setFormMsg("");
    setTimeout(() => setFormSuccess(false), 5000);
  }

  return (
    <div className="min-h-screen bg-[#030509] text-slate-100 relative overflow-hidden font-sans select-none pb-12 leading-relaxed selection:bg-cyan-500/30 selection:text-white">
      
      {/* VisionOS & Liquid Glass Ambient Luxury Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Abstract Soft Layered Gradients */}
        <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.07)_0%,transparent_70%)] rounded-full blur-[120px]" />
        <div className="absolute top-[35%] right-[-10%] w-[750px] h-[750px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[900px] h-[900px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_70%)] rounded-full blur-[160px]" />

        {/* Vision Fine Grid Overlay */}
        <div className="absolute inset-0 bg-vision-grid opacity-80" />

        {/* Fine Noise Texture */}
        <div className="absolute inset-0 bg-noise-texture opacity-90" />

        {/* Abstract Large Glass Ring Geometry (Apple Vision Inspired) */}
        <div className="absolute -top-40 right-10 w-[700px] h-[700px] rounded-full border border-cyan-400/10 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] rounded-full border border-emerald-400/10 bg-gradient-to-tr from-emerald-500/[0.015] to-transparent pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full border border-purple-400/10 bg-gradient-to-tl from-purple-500/[0.015] to-transparent pointer-events-none" />
      </div>

      <ParticleWaveBackground ecoMode={ecoMode} />

      {/* Main Container Layer */}
      <div className="relative z-20">

        {/* ================= FLOATING LIQUID GLASS NAVIGATION ================= */}
        <header className="fixed top-4 left-0 w-full z-50 px-4 sm:px-6 pointer-events-none">
          <nav className="max-w-6xl mx-auto backdrop-blur-2xl bg-slate-950/70 border border-white/10 rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_16px_40px_rgba(0,0,0,0.5)] pointer-events-auto transition-all duration-300">
            
            {/* Brand Identity */}
            <a href="#hero" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 via-emerald-400 to-purple-400 p-[1px] shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-black text-xs text-cyan-300">
                  SA
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Shahan Ali
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase -mt-0.5">
                  Developer
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-medium">
              {[
                { name: "About", id: "about" },
                { name: "Services", id: "services" },
                { name: "Projects", id: "projects" },
                { name: "Skills", id: "skills" },
                { name: "Gallery", id: "gallery" },
                { name: "FAQ", id: "qa" },
                { name: "Contact", id: "contact" }
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`transition-all duration-200 relative py-1 hover:text-white ${
                    activeSection === item.id ? "text-cyan-300 font-semibold" : "text-slate-400"
                  }`}
                >
                  {item.name}
                  {activeSection === item.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                  )}
                </a>
              ))}
            </div>

            {/* Right Action Station */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setEcoMode(!ecoMode)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                  ecoMode
                    ? "bg-amber-500/10 border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                title={ecoMode ? "Eco Mode: Active" : "Click for Eco Mode"}
              >
                <Zap size={12} className={ecoMode ? "text-amber-400" : "text-cyan-400"} />
                <span>{ecoMode ? "Eco" : "Ultra"}</span>
              </button>

              <a
                href="https://wa.me/923261684315"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-4 py-1.5 rounded-full font-semibold text-xs transition-all duration-300 flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm"
              >
                <Phone size={13} className="text-emerald-400" />
                <span>Connect</span>
              </a>
            </div>

            {/* Mobile Drawer Trigger */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </nav>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden max-w-6xl mx-auto mt-2 backdrop-blur-2xl bg-slate-950/90 border border-white/10 rounded-3xl p-4 shadow-2xl pointer-events-auto space-y-2">
              {[
                { name: "About Shahan Ali", id: "about" },
                { name: "Services", id: "services" },
                { name: "Projects & Tools", id: "projects" },
                { name: "Skills & Stack", id: "skills" },
                { name: "Studio Gallery", id: "gallery" },
                { name: "FAQ", id: "qa" },
                { name: "Contact", id: "contact" }
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                    activeSection === item.id
                      ? "bg-white/10 text-cyan-300"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEcoMode(!ecoMode)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5"
                >
                  <Zap size={12} className={ecoMode ? "text-amber-400" : "text-cyan-400"} />
                  <span>{ecoMode ? "Eco Mode On" : "Ultra Mode"}</span>
                </button>
                <a
                  href="https://wa.me/923261684315"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone size={13} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </header>

        {/* ================= HERO SECTION ================= */}
        <SpatialSection
          id="hero"
          className="min-h-screen relative flex items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <Waves className="absolute inset-0 z-0 pointer-events-none opacity-20" strokeColor="rgba(178, 217, 229, 0.2)" pointerSize={0.3} disabled={ecoMode} />

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Hero Left Content Column */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6 order-2 lg:order-1">
              
              {/* Availability Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-cyan-300 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Available for New Projects & Collaborations</span>
              </div>

              {/* Main Name Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                <span className="text-white">Shahan</span>{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-purple-300 text-transparent bg-clip-text">
                  Ali
                </span>
              </h1>

              {/* Primary Role Subtitle */}
              <p className="text-lg sm:text-xl text-slate-300 font-medium tracking-wide">
                Full Stack, AI & Bot Developer from <span className="text-cyan-300 font-semibold">Pakistan</span>
              </p>

              {/* Secondary Keyword Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10 text-slate-300 flex items-center gap-1.5">
                  <Laptop size={14} className="text-cyan-400" /> Web Applications
                </span>
                <span className="px-3 py-1 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10 text-slate-300 flex items-center gap-1.5">
                  <Cpu size={14} className="text-purple-400" /> AI Systems
                </span>
                <span className="px-3 py-1 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10 text-slate-300 flex items-center gap-1.5">
                  <Bot size={14} className="text-emerald-400" /> WhatsApp Bots
                </span>
                <span className="px-3 py-1 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10 text-slate-300 flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-amber-400" /> Shopify Expert
                </span>
              </div>

              {/* High Quality Persona Description */}
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Crafting high-speed web portals, intelligent automated bots (ProBoy-MD), and customized Shopify architectures. Studying ICS at <span className="text-slate-200 font-semibold">Govt Graduate College Burewala</span> while serving clients worldwide. Known online as <span className="text-cyan-400 font-mono">shahan315</span>.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                <LiquidButton
                  onClick={() => {
                    const el = document.getElementById("projects");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto font-bold rounded-2xl px-6 py-3.5 text-xs uppercase tracking-wider text-white bg-cyan-950/20 border border-cyan-400/30 hover:border-cyan-400/80 hover:shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <Rocket size={16} className="text-cyan-400" />
                  <span>View Projects</span>
                </LiquidButton>

                <LiquidButton
                  onClick={() => window.open("https://github.com/ProBoy315", "_blank")}
                  className="w-full sm:w-auto font-bold rounded-2xl px-6 py-3.5 text-xs uppercase tracking-wider text-white bg-slate-900/40 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                >
                  <Github size={16} className="text-slate-300" />
                  <span>GitHub Profile</span>
                </LiquidButton>
              </div>

              {/* Social Channels Row */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="https://whatsapp.com/channel/0029Vb6vIroBPzjSw1lCQP0X"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 hover:border-emerald-400/50 hover:text-emerald-400 transition-all text-slate-400 flex items-center gap-2 text-xs font-medium px-3.5"
                  title="WhatsApp Broadcast Channel"
                >
                  <MessageSquare size={16} className="text-emerald-400" />
                  <span>WhatsApp Channel</span>
                </a>
                <a
                  href="https://tiktok.com/@itx_proboy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:text-cyan-400 transition-all text-slate-400"
                  aria-label="TikTok"
                >
                  <Compass size={16} />
                </a>
                <a
                  href="https://instagram.com/itx___proboy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 hover:border-purple-400/50 hover:text-purple-400 transition-all text-slate-400"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=100093176537267"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 hover:border-blue-400/50 hover:text-blue-400 transition-all text-slate-400"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://t.me/itx_proboy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 hover:border-sky-400/50 hover:text-sky-400 transition-all text-slate-400"
                  aria-label="Telegram"
                >
                  <Send size={16} />
                </a>
              </div>

            </div>

            {/* Hero Right Visual Column */}
            <div className="lg:col-span-5 flex justify-center relative order-1 lg:order-2 my-4 lg:my-0">
              <div className="relative w-full max-w-[280px] sm:max-w-sm aspect-[4/5] rounded-3xl p-3 backdrop-blur-2xl bg-white/[0.03] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] group">
                
                {/* Image Frame */}
                <div className="w-full h-full rounded-2xl overflow-hidden relative bg-slate-950">
                  <img
                    src="/img.png"
                    alt="Shahan Ali - Full Stack Developer Pakistan"
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const div = document.createElement('div');
                        div.className = "w-full h-full rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center";
                        div.innerHTML = '<span class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">SA</span><span class="text-sm font-semibold text-white mt-2">Shahan Ali</span><span class="text-xs text-slate-400">Developer Pakistan</span>';
                        parent.appendChild(div);
                      }
                    }}
                  />
                  
                  {/* Subtle Light Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* Floating Glass Badges */}
                <div className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 backdrop-blur-xl bg-slate-950/80 border border-white/10 p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold text-white">Shahan Ali</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono">Full Stack & AI</div>
                  </div>
                </div>

                <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 backdrop-blur-xl bg-slate-950/80 border border-white/10 p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold text-white">Burewala</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono">Punjab, Pakistan</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </SpatialSection>

        {/* ================= ABOUT SHAHAN ALI ================= */}
        <SpatialSection id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/20 inline-flex items-center gap-2">
              <Award size={13} />
              About Shahan Ali
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineering Digital Excellence in <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 text-transparent bg-clip-text">Pakistan</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Blending academic computer science fundamentals with real-world automated system engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <TiltCard glowColor="rgba(178, 217, 229, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
                <MapPin size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Location & Base</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Operating from <span className="text-cyan-300">Burewala, Punjab, Pakistan</span>. Building high-availability solutions for clients locally and across global servers.
              </p>
            </TiltCard>

            <TiltCard glowColor="rgba(16, 185, 129, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                <BookOpen size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Academic Journey</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                1st Year ICS (Intermediate in Computer Science) student at <span className="text-emerald-300">Govt Graduate College Burewala</span>.
              </p>
            </TiltCard>

            <TiltCard glowColor="rgba(168, 85, 247, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                <Cpu size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Core Philosophy</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Building fast, lightweight, and scalable software with clean modular architecture and high performance.
              </p>
            </TiltCard>

          </div>
        </SpatialSection>

        {/* ================= SERVICES & CAPABILITIES ================= */}
        <SpatialSection id="services" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/30 px-3.5 py-1.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-2">
              <Layers size={13} />
              What I Build
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Services & <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 text-transparent bg-clip-text">Capabilities</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              End-to-end technical development for individuals, businesses, and digital creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Service 1 */}
            <TiltCard glowColor="rgba(178, 217, 229, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-cyan-400/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
                <Code size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Full Stack Web Engineering</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Building responsive, modern, and high-speed web platforms using React, TypeScript, Vite, Tailwind CSS, and Node.js REST APIs.
              </p>
            </TiltCard>

            {/* Service 2 */}
            <TiltCard glowColor="rgba(168, 85, 247, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-purple-400/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                <Cpu size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">AI Tools & Integrations</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Integrating LLMs (Gemini API), automated smart agents, dynamic content generators, and conversational AI tools into web systems.
              </p>
            </TiltCard>

            {/* Service 3 */}
            <TiltCard glowColor="rgba(16, 185, 129, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-emerald-400/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Bot size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">WhatsApp & Bot Automation</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Architecting automated multi-device bots (ProBoy-MD), webhook handlers, group moderation filters, and auto-reply servers.
              </p>
            </TiltCard>

            {/* Service 4 */}
            <TiltCard glowColor="rgba(245, 158, 11, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-amber-400/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                <ShoppingBag size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Shopify OS 2.0 & Liquid</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Designing lightweight, high-conversion Shopify Liquid themes, automated fulfillment scripts, and product page speed optimizations.
              </p>
            </TiltCard>

            {/* Service 5 */}
            <TiltCard glowColor="rgba(59, 130, 246, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-blue-400/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300">
                <Terminal size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Code Obfuscation & Security</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Developing client-side JavaScript compilation tools (ProBoy JS Obfuscator) and diagnostic tools (ProBoy CamLink) to protect production code.
              </p>
            </TiltCard>

            {/* Service 6 */}
            <TiltCard glowColor="rgba(236, 72, 153, 0.15)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-4 hover:border-pink-400/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-300">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Monetization & Analytics</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Providing analytical dashboards and monetization frameworks for YouTube, TikTok, and Facebook creator portals from Pakistan.
              </p>
            </TiltCard>

          </div>
        </SpatialSection>

        {/* ================= PROJECTS & CREATIONS ================= */}
        <SpatialSection id="projects" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/20 inline-flex items-center gap-2">
              <Rocket size={13} />
              Selected Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-purple-300 text-transparent bg-clip-text">Creations & Tools</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Explore Shahan Ali's live web tools, automation bots, and full-stack software.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: "all", label: "All Projects" },
              { id: "bots", label: "AI & Bots" },
              { id: "fullstack", label: "Full Stack & Tools" },
              { id: "shopify", label: "Shopify" },
              { id: "monetization", label: "Monetization" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-white/15 text-white border border-white/20 shadow-md"
                    : "bg-white/[0.02] text-slate-400 border border-white/5 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => (
              <TiltCard
                key={idx}
                glowColor="rgba(178, 217, 229, 0.12)"
                className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-white/25 transition-all group"
              >
                <div className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300 font-mono uppercase tracking-wider text-[10px]">
                      {project.category}
                    </span>
                    {project.link && project.link.trim() !== "" && (
                      <span className="text-slate-500 group-hover:text-cyan-300 transition-colors">
                        <ExternalLink size={14} />
                      </span>
                    )}
                  </div>

                  {/* Project Image Frame */}
                  {project.image && project.image.trim() !== "" && (
                    <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative bg-slate-950 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-50 pointer-events-none" />
                    </div>
                  )}

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/5 text-[10px] text-slate-300 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold gap-2">
                  {project.link && project.link.trim() !== "" ? (
                    <a
                      href={project.link}
                      target={project.link.startsWith("http") ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20"
                    >
                      <span>Open Project</span>
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(0,242,255,0.15)] backdrop-blur-md">
                      <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                      <span>Coming Soon</span>
                    </div>
                  )}

                  {project.github && project.github.trim() !== "" && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                    >
                      <Github size={13} />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </TiltCard>
            ))}
          </div>
        </SpatialSection>

        {/* ================= SKILLS & TOOLKIT ================= */}
        <SpatialSection id="skills" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/30 px-3.5 py-1.5 rounded-full border border-purple-500/20 inline-flex items-center gap-2">
              <Workflow size={13} />
              Technical Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Shahan Ali's <span className="bg-gradient-to-r from-purple-300 via-cyan-300 to-emerald-300 text-transparent bg-clip-text">Toolkit & Languages</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              High-performance technologies utilized across production systems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <TiltCard glowColor="rgba(178, 217, 229, 0.12)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="text-cyan-300 font-bold text-sm flex items-center gap-2">
                <Code size={16} /> Languages
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {["JavaScript", "TypeScript", "HTML5/CSS3", "Python", "PHP", "SQL"].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </TiltCard>

            <TiltCard glowColor="rgba(16, 185, 129, 0.12)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="text-emerald-300 font-bold text-sm flex items-center gap-2">
                <Bot size={16} /> Bot Engines
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Baileys API", "Venom-Bot", "Node.js", "Express", "Telegraf", "Telethon"].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </TiltCard>

            <TiltCard glowColor="rgba(245, 158, 11, 0.12)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="text-amber-300 font-bold text-sm flex items-center gap-2">
                <ShoppingBag size={16} /> E-Commerce & DB
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Shopify Liquid", "Shopify OS 2.0", "MySQL", "MongoDB", "Firestore", "REST APIs"].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </TiltCard>

            <TiltCard glowColor="rgba(168, 85, 247, 0.12)" className="backdrop-blur-2xl bg-white/[0.03] p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="text-purple-300 font-bold text-sm flex items-center gap-2">
                <Cpu size={16} /> Cloud & AI
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Gemini API", "Vercel", "Render", "Git & GitHub", "Tailwind CSS", "Vite"].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </TiltCard>

          </div>
        </SpatialSection>

        {/* ================= DIGITAL MEDIA GALLERY ================= */}
        <SpatialSection id="gallery" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/20 inline-flex items-center gap-2">
              <Sparkles size={13} />
              Media Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Visual Workspace & <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 text-transparent bg-clip-text">Gallery</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Explore Shahan Ali's verified workspace imagery and project captures.
            </p>
          </div>

          <ImageGallery />
        </SpatialSection>

        {/* ================= FAQ SECTION ================= */}
        <SpatialSection id="qa" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-950/30 px-3.5 py-1.5 rounded-full border border-amber-500/20 inline-flex items-center gap-2">
              <MessageSquare size={13} />
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Questions & <span className="bg-gradient-to-r from-amber-300 to-cyan-300 text-transparent bg-clip-text">Answers</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-white hover:text-cyan-300 focus:outline-none transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    <span className={`transition-transform duration-300 text-cyan-300 ${isOpen ? "rotate-180" : ""}`}>
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm text-slate-300 border-t border-white/5 pt-4 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </SpatialSection>

        {/* ================= CONTACT STATION ================= */}
        <SpatialSection id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/20 inline-flex items-center gap-2">
              <Send size={13} />
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Connect with <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 text-transparent bg-clip-text">Shahan Ali</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Have a web project, bot request, or software inquiry? Send a direct message.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Direct Info Card */}
            <div className="lg:col-span-5 backdrop-blur-2xl bg-white/[0.03] p-8 rounded-3xl border border-white/10 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Shahan Ali</h3>
                <p className="text-xs text-cyan-300 font-mono mt-1">shahan315 · proboy315</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                
                {/* Email */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-cyan-300" />
                    <span className="text-slate-300 truncate max-w-[180px] sm:max-w-xs">luciferkiller315@gmail.com</span>
                  </div>
                  <button
                    onClick={() => copyText("luciferkiller315@gmail.com", "email")}
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-emerald-300" />
                    <span className="text-slate-300">+92 326 1684315</span>
                  </div>
                  <button
                    onClick={() => copyText("+923261684315", "phone")}
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="Copy Phone"
                  >
                    {copiedPhone ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <MapPin size={16} className="text-purple-300" />
                  <span className="text-slate-300">Burewala, Punjab, Pakistan</span>
                </div>

              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/923261684315"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Phone size={16} />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Interactive Form */}
            <div className="lg:col-span-7 backdrop-blur-2xl bg-white/[0.03] p-8 rounded-3xl border border-white/10">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formMsg}
                    onChange={(e) => setFormMsg(e.target.value)}
                    placeholder="Tell me about your project or inquiry..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-400/30 hover:border-cyan-400/80 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send size={16} className="text-cyan-300" />
                  <span>Send Message</span>
                </button>

                {formSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Message sent successfully! Shahan Ali will review it shortly.</span>
                  </div>
                )}
              </form>
            </div>

          </div>
        </SpatialSection>

        {/* ================= FOOTER ================= */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5 text-center text-xs text-slate-500 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-slate-300">Shahan Ali</span>
            <span>·</span>
            <span className="font-mono text-cyan-400">shahan315</span>
            <span>·</span>
            <span>Burewala, Pakistan</span>
          </div>
          <p>© 2026 Shahan Ali. Designed with Liquid Glass UI. All rights reserved.</p>
        </footer>

      </div>

      {/* Floating Scroll to Top Trigger */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-2xl backdrop-blur-2xl bg-slate-950/80 border border-white/15 text-slate-300 hover:text-white shadow-2xl transition-all cursor-pointer hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronDown size={18} className="rotate-180 text-cyan-300" />
        </button>
      )}

    </div>
  );
}
