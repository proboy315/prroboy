import React, { useState, useEffect, useRef } from "react";
import {
  Laptop,
  Globe,
  Heart,
  Rocket,
  ArrowRight,
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
  ArrowUpRight,
  Copy,
  Check,
  Award,
  BookOpen,
  Compass,
  MessageSquare
} from "lucide-react";

import ImageGallery from "./components/ImageGallery";
import { Waves } from "./components/ui/wave-background";
import { ContainerScroll } from "./components/ui/container-scroll-animation";
import { SplineScene } from "./components/ui/splite";
import { LiquidButton, MetalButton } from "./components/ui/liquid-glass-button";
import { TiltCard } from "./components/ui/TiltCard";
import { motion, AnimatePresence } from "motion/react";

// Types for Projects
interface Project {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  category: "all" | "bots" | "shopify" | "fullstack" | "monetization";
  link?: string;
  github?: string;
}

export default function App() {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active section tracking for navigation highlight
  const [activeSection, setActiveSection] = useState("hero");

  // Project sorting / filter state
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Eco Performance Optimization Mode and Spline Lazy-loader
  const [ecoMode, setEcoMode] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);

  // Sync ecoMode to global window scope for high-speed module access
  useEffect(() => {
    (window as any).__ECO_MODE__ = ecoMode;
  }, [ecoMode]);

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

  // Shared project list (robust initial values + client lookup try)
  const [projects, setProjects] = useState<Project[]>([
    {
      title: "ProBoy MD WhatsApp Bot",
      description: "Advanced multi-device WhatsApp automation system. Built with Node.js and venom-bot/baileys, supporting customized commands, auto-responder, media conversion, and secure admin control. Over 10,000 active group installations.",
      category: "bots",
      tags: ["Node.js", "Baileys API", "TypeScript", "Automation"],
      github: "https://github.com/ProBoy315",
      link: "https://wa.me/923261684315"
    },
    {
      title: "ProBoy MD Pairing Portal",
      description: "Instant secure multi-device pairing code generator for ProBoy MD WhatsApp bots. Connects directly to server-side webhook systems to deliver dynamic links without scanning QR codes.",
      category: "bots",
      tags: ["WhatsApp Linker", "Webhooks", "Render API", "Secure Handshake"],
      github: "https://github.com/ProBoy315",
      link: "/pair/"
    },
    {
      title: "Shopify Custom Automation Flow",
      description: "High-level inventory synchronization system and fulfillment automating flow connecting multiple supplier APIs to Shopify storefronts. Increases processing speed and reduces manual fulfillment errors to zero.",
      category: "shopify",
      tags: ["Liquid", "Shopify API", "Node.js", "Webhook Integration"],
      link: "https://wa.me/923261684315"
    },
    {
      title: "Social Monetization Tracker",
      description: "Analytical dashboard designed for creators looking to maximize YouTube, TikTok, and Facebook creator fund revenues. Features detailed target metrics, RPM analysis, and visual projection guides.",
      category: "monetization",
      tags: ["React.js", "API Integrations", "Data Visualization", "Tailwind CSS"],
      github: "https://github.com/ProBoy315"
    },
    {
      title: "Cyber-Glow Portfolio Engine",
      description: "A gorgeous, fully responsive, and highly search-optimized developer portfolio built in React with cutting-edge CSS, customized interactive backgrounds, and structured JSON-LD Schema implementation.",
      category: "fullstack",
      tags: ["React", "Custom Canvas", "SEO Optimization", "Tailwind CSS v4"],
      github: "https://github.com/ProBoy315",
      link: "https://proboy.vercel.app/"
    },
    {
      title: "ProBoy JS Obfuscator",
      description: "Secure, high-performance client-side JavaScript obfuscator tool to compile, safeguard, and optimize your production source files.",
      category: "fullstack",
      tags: ["JavaScript", "Obfuscation", "Security", "Utility"],
      github: "https://github.com/ProBoy315",
      link: "/obfuscator/"
    },
    {
      title: "ProBoy CamLink",
      description: "Generate dynamic camera shortlinks & view real-time smart device diagnostic logs and captured pictures on an elegant control panel.",
      category: "fullstack",
      tags: ["Camera capture", "Diagnostic logs", "Shortlinks", "Control panel"],
      github: "https://github.com/ProBoy315",
      link: "/camera/"
    },
    {
      title: "ProAutomations Telegram Client",
      description: "Automated alert script for Telegram channels forwarding real-time crypto triggers, hot deals, and stock fluctuations. Utilizes asynchronous Python frameworks with integrated webhook logs.",
      category: "bots",
      tags: ["Python", "Telethon", "Custom Webhooks", "Cron Jobs"],
      github: "https://github.com/ProBoy315"
    },
    {
      title: "Shopify Premium Theme Shell",
      description: "Custom lightweight, conversion-maximizing Shopify theme framework. Boasts standard-shattering LCP scores under 0.8 seconds and full compliance with dynamic checkout standards.",
      category: "shopify",
      tags: ["Liquid", "Tailwind CSS", "JavaScript", "Shopify OS 2.0"],
      link: "https://wa.me/923261684315"
    }
  ]);

  // Try to load additional projects if projects.json is present
  useEffect(() => {
    async function fetchExternalProjects() {
      try {
        const res = await fetch("./projects.json");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Merge or replace
            const formatted = data.map((p: any) => {
              // Intelligently infer category if not present
              let inferredCategory = p.category || "fullstack";
              if (!p.category) {
                const searchStr = `${p.title} ${p.description} ${p.tags?.join(" ")}`.toLowerCase();
                if (searchStr.includes("bot") || searchStr.includes("whatsapp") || searchStr.includes("telegram") || searchStr.includes("baileys") || searchStr.includes("npm") || searchStr.includes("nodejs")) {
                  inferredCategory = "bots";
                } else if (searchStr.includes("shopify") || searchStr.includes("liquid") || searchStr.includes("store") || searchStr.includes("cart") || searchStr.includes("checkout")) {
                  inferredCategory = "shopify";
                } else if (searchStr.includes("monetiz") || searchStr.includes("fund") || searchStr.includes("rpm") || searchStr.includes("adsense")) {
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
            setProjects(formatted);
          }
        }
      } catch (err) {
        // Ignore fallback failure, use the pre-seeded premium React projects safely
        console.log("No custom projects.json file found, displaying premium defaults.");
      }
    }
    fetchExternalProjects();
  }, []);

  // Filtered projects
  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  // Q&A accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(0); // first open by default

  const faqData = [
    {
      question: "Who is Shahan Ali (shahan315 / shahanali315)?",
      answer: "I am a self-taught full-stack developer, digital marketing strategist, and automation expert from Burewala, Pakistan, widely recognized online as shahan315, proboy315, or ProBoy. I study ICS 1st Year at Govt Graduate College Burewala and specialize in custom back-end automations, ProBoy-MD WhatsApp bots, and Shopify conversions."
    },
    {
      question: "What exactly is the ProBoy-MD Bot?",
      answer: "ProBoy-MD is a custom, highly reliable, multi-device compatible automated WhatsApp utility bot developed by shahanali315. It handles group safeguards, auto-responders, media transcoding (like high-fidelity audio/video and stickers), and secure command flows deployed on global cloud configurations."
    },
    {
      question: "Where can I find complete information about Shahan Ali (shahan315)?",
      answer: "This portfolio is the official verified platform to explore comprehensive information about Shahan Ali (including my ICS studies at Govt Graduate College Burewala, custom engineering projects like ProBoy-MD, and tailored Shopify Liquid storefront solutions). My official portfolio, technical index, and visual gallery are deployed here with absolute integrity for the global developer ecosystem."
    },
    {
      question: "What is Shahan Ali's official WhatsApp number for business and support?",
      answer: "You can reach me directly on my official business WhatsApp number at +923261684315 (or locally within Pakistan as 0326-1684315) for immediate support and collaboration. For live releases, automations, and direct script releases, join my verified WhatsApp Broadcast Channel: https://whatsapp.com/channel/0029Vb6vIroBPzjSw1lCQP0X."
    },
    {
      question: "Can you help set up high-converting Shopify stores?",
      answer: "Absolutely! I develop high-speed customized Shopify storefronts utilizing next-gen Liquid code, optimized SEO parameters, custom product page workflows, and automated API integrations designed to maximize your e-commerce profit margins."
    },
    {
      question: "What monetization services do you specialize in?",
      answer: "I assist creators and businesses in bypassing structural limits to monetize platforms like TikTok, Facebook, and YouTube from Pakistan, implementing optimized monetization setups and analytical frameworks to grow revenue streams sustainably."
    }
  ];

  // Particle Component Ref / Handling
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (ecoMode) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isSmallScreen = window.innerWidth < 768;
    const maxParticles = isSmallScreen ? 18 : 38;
    const connectionDist = isSmallScreen ? 60 : 100;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6, 182, 212, 0.65)"; // Cyan shadow glow
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);

    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      particles.forEach((p, idx) => {
        p.update();
        p.draw();

        // Check distance to connect
        for (let j = idx + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            // Linear fade out based on proximity
            const alpha = (1 - dist / connectionDist) * 0.25;
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`; // Emerald connector line
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ecoMode]);

  // Set active link on scroll
  useEffect(() => {
    function handleScroll() {
      const sections = ["hero", "about", "skills", "qa", "gallery", "projects", "contact"];
      const scrollPos = window.scrollY + 120;

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

  // Live Contact form state with success
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName || !formMsg) return;

    // Simulate database write / trigger local storage state
    const submission = {
      name: formName,
      email: formEmail,
      subject: formSubject,
      msg: formMsg,
      timestamp: new Date().toISOString()
    };
    const currentList = JSON.parse(localStorage.getItem("proboy_messages") || "[]");
    currentList.push(submission);
    localStorage.setItem("proboy_messages", JSON.stringify(currentList));

    // Clear and alert positive state
    setFormSuccess(true);
    setFormName("");
    setFormEmail("");
    setFormSubject("");
    setFormMsg("");
    setTimeout(() => setFormSuccess(false), 6000);
  }

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden font-sans select-none pb-12 leading-relaxed selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background Neon Elements & Grid Canvas Overlay */}
      <div className="absolute top-0 inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[35%] left-[45%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
        
        {/* Fine-line grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <canvas ref={canvasRef} id="particles" className="fixed inset-0 w-full h-full z-10 pointer-events-none" />

      {/* Main Container Layer above interactive effects */}
      <div className="relative z-20">

        {/* ================= STICKY HEADER AND RESPONSIVE NAVIGATION ================= */}
        <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              
              {/* Brand Logo with Glowing Text and Mini-Insignia */}
              <a href="#hero" className="flex items-center gap-2 group transition-transform duration-200">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-slate-950 shadow-md shadow-cyan-400/20 group-hover:scale-105 transition-transform duration-200">
                  P
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  Pro<span className="text-cyan-400">Boy</span>
                </span>
              </a>

              {/* Desktop Navigation Link Station */}
              <div className="hidden md:flex items-center space-x-6">
                {[
                  { name: "About", id: "about" },
                  { name: "Skills", id: "skills" },
                  { name: "Q&A", id: "qa" },
                  { name: "Gallery", id: "gallery" },
                  { name: "Projects", id: "projects" },
                  { name: "Contact", id: "contact" }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`text-sm font-semibold tracking-wide transition-all duration-200 relative py-1 hover:text-white ${
                      activeSection === item.id ? "text-cyan-400 font-bold" : "text-slate-400"
                    }`}
                  >
                    {item.name}
                    {activeSection === item.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                    )}
                  </a>
                ))}
                
                {/* Responsive Performance Optimizer Station */}
                <button
                  onClick={() => setEcoMode(!ecoMode)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide border flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    ecoMode
                      ? "bg-amber-500/10 border-amber-400/40 text-amber-400 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                      : "bg-cyan-500/10 border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  }`}
                  title={ecoMode ? "Click to enable rich 3D animations and particles (Turbo Mode)" : "Click to pause heavy physics and particles (Eco Mode)"}
                >
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ecoMode ? "bg-amber-400" : "bg-cyan-400"}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${ecoMode ? "bg-amber-500" : "bg-cyan-500"}`}></span>
                  </span>
                  <span>{ecoMode ? "Eco Saved" : "Turbo Mode"}</span>
                </button>

                {/* Secondary navigation actions */}
                <a
                  href="https://wa.me/923261684315"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/35 hover:-translate-y-[2px] active:translate-y-0 transition-all duration-200 flex items-center gap-2"
                >
                  <Phone size={14} className="fill-slate-950" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Hamburger Button and Toggle for Mobile View */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setEcoMode(!ecoMode)}
                  className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider border flex items-center gap-1 transition-all cursor-pointer ${
                    ecoMode
                      ? "bg-amber-500/10 border-amber-400/30 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.06)]"
                      : "bg-cyan-500/10 border-cyan-400/30 text-cyan-400"
                  }`}
                  title={ecoMode ? "Active: Low-lag mode" : "Active: Rich animations"}
                >
                  <span>{ecoMode ? "🔋 ECO" : "⚡ TURBO"}</span>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setMobileMenuOpen(!mobileMenuOpen);
                    }
                  }}
                  type="button"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

            </div>
          </div>

          {/* Collapsible Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-slate-950/95 border-b border-slate-900 transition-all duration-200">
              <div className="px-3 pt-2 pb-4 space-y-1">
                {[
                  { name: "About Me", id: "about" },
                  { name: "My Skills", id: "skills" },
                  { name: "FAQ Grid", id: "qa" },
                  { name: "Studio Gallery", id: "gallery" },
                  { name: "Creations & Projects", id: "projects" },
                  { name: "Connect Stations", id: "contact" }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-semibold ${
                      activeSection === item.id
                        ? "bg-slate-900 text-cyan-400 border-l-4 border-cyan-400"
                        : "text-slate-300 hover:bg-slate-900/50 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 px-4">
                  <a
                    href="https://wa.me/923261684315"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-400/10 active:scale-98 transition-transform"
                  >
                    <Phone size={18} />
                    <span>WhatsApp Developer</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ================= HERO SPOTLIGHT STATION ================= */}
        <section
          id="hero"
          className="min-h-screen relative overflow-hidden flex items-center justify-center pt-24 sm:pt-32 pb-16 px-4 md:px-8 mb-4 max-w-7xl mx-auto"
        >
          {/* Awesome live waves particle-simulation backdrop */}
          <Waves className="absolute inset-0 z-0 pointer-events-none opacity-30" strokeColor="rgba(6, 182, 212, 0.25)" pointerSize={0.4} disabled={ecoMode} />

          <div className="text-center max-w-4xl w-full flex flex-col items-center relative z-10">
            
            {/* Super premium circular avatar layout with fallback initials */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-emerald-400 to-amber-300 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-[3px] bg-gradient-to-tr from-cyan-400 to-emerald-400 relative z-10 transition-transform duration-500 group-hover:scale-[1.03]">
                <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center border-4 border-slate-950 relative">
                  <img
                    src="/img.png"
                    alt="Shahan Ali (ProBoy)"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // High dynamic CSS avatar substitution if default image fails
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const div = document.createElement('div');
                        div.className = "w-full h-full rounded-full bg-gradient-to-tr from-slate-900 to-slate-950 flex flex-col items-center justify-center font-black tracking-tighter text-3xl sm:text-4xl text-white";
                        div.innerHTML = '<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">SA</span><span class="text-[9px] uppercase tracking-[4px] font-semibold text-slate-400 mt-1">ProBoy</span>';
                        parent.appendChild(div);
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Floating verified badge */}
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-20 bg-emerald-500 text-slate-950 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-md">
                <CheckCircle2 size={16} className="text-slate-900" />
              </div>
            </div>

            {/* Glowing Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-cyan-400 font-semibold tracking-wide uppercase mb-6 shadow-indigo-950/20 shadow-md">
              <Sparkles size={14} />
              <span>Best Pakistani Developer & Automation Specialist</span>
            </div>

            {/* Impressive, Clean Typography displaying Shahan Ali (itx_proboy) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Hi, I'm <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 text-transparent bg-clip-text drop-shadow-[0_4px_12px_rgba(6,182,212,0.15)]">Shahan Ali</span>
            </h1>

            {/* Clean Subtitle Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-base text-slate-400 mb-8 max-w-2xl">
              <span className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-900/80">
                <Laptop size={15} className="text-cyan-400" /> Web Creator
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-900/80">
                <Bot size={15} className="text-emerald-400" /> Bot Architect
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-900/80">
                <ShoppingBag size={15} className="text-amber-400" /> Shopify Expert
              </span>
            </div>

            {/* Precise description that builds credibility and covers Pakistani region context */}
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl font-medium max-w-3xl mb-10 leading-relaxed px-2">
              Widely recognized as the <span className="text-cyan-400 font-bold">best Pakistani developer</span> for automated systems, I am currently an ICS 1st Year student at <span className="text-emerald-400 font-bold">Govt Graduate College Burewala</span>. I build robust <span className="text-amber-400 font-bold">WhatsApp Bots (ProBoy MD)</span> and hyper-speed Shopify stores.
            </p>

            {/* Glowing action buttons satisfying responsive design rules with stunning Liquid Glass aesthetic */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-lg px-4">
              <LiquidButton
                onClick={() => {
                  const el = document.getElementById("projects");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto flex-1 font-extrabold rounded-2xl text-center flex items-center justify-center gap-2.5 text-white bg-cyan-950/15 border border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer py-4"
              >
                <Rocket size={18} className="text-cyan-400 animate-pulse" />
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">My Creations</span>
              </LiquidButton>
              <LiquidButton
                onClick={() => window.open("https://github.com/ProBoy315", "_blank")}
                className="w-full sm:w-auto flex-1 font-extrabold rounded-2xl text-center flex items-center justify-center gap-2.5 text-white bg-emerald-950/10 border border-emerald-500/20 hover:border-emerald-400/80 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer py-4"
              >
                <Github size={18} className="text-emerald-400" />
                <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">GitHub Code</span>
              </LiquidButton>
            </div>

            {/* Integrated high-fidelity social profile indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://whatsapp.com/channel/0029Vb6vIroBPzjSw1lCQP0X"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-emerald-950/20 border border-emerald-900/30 hover:border-emerald-400 hover:text-emerald-400 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 px-4 shadow-emerald-950/20 shadow-md"
                aria-label="WhatsApp official channel"
              >
                <MessageSquare size={18} className="text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold tracking-tight text-slate-300">WhatsApp Channel</span>
              </a>
              <a
                href="https://tiktok.com/@itx_proboy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-slate-900/70 border border-slate-800 hover:border-cyan-400/40 hover:text-cyan-400 hover:-translate-y-1 transition-all duration-200"
                aria-label="TikTok social link"
              >
                <Compass size={20} />
              </a>
              <a
                href="https://instagram.com/itx___proboy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-slate-900/70 border border-slate-800 hover:border-emerald-400/40 hover:text-emerald-400 hover:-translate-y-1 transition-all duration-200"
                aria-label="Instagram social link"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100093176537267"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-slate-900/70 border border-slate-800 hover:border-blue-400/40 hover:text-blue-400 hover:-translate-y-1 transition-all duration-200"
                aria-label="Facebook social link"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://t.me/itx_proboy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-slate-900/70 border border-slate-800 hover:border-sky-400/40 hover:text-sky-400 hover:-translate-y-1 transition-all duration-200"
                aria-label="Telegram social link"
              >
                <Send size={20} />
              </a>
            </div>

          </div>
        </section>

        {/* ================= ABOUT ME & DIGITAL SERVICES SECTION ================= */}
        <section id="about" className="py-20 px-4 max-w-7xl mx-auto border-t border-slate-900/60">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase bg-cyan-950/20 px-3 py-1 rounded-full border border-cyan-900/30 inline-flex items-center gap-2 mb-3">
              <Award size={13} />
              About Shahan Ali
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Get To Know <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">The Creator</span>
            </h2>
            <p className="mt-3 text-slate-400 text-base">
              A balanced look into my daily philosophy, core technical skill sets, and personal standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Map Location */}
            <TiltCard glowColor="rgba(6, 182, 212, 0.20)" className="backdrop-blur-xl bg-white/[0.03] p-6 rounded-3xl border border-white/5 relative group overflow-hidden hover:border-cyan-500/30 hover:bg-white/[0.06] shadow-[0_8px_32px_0_rgba(6,182,212,0.02)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 flex items-center justify-center mb-4 border border-cyan-500/10">
                <MapPin className="text-cyan-400" size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Location & Region</h3>
              <p className="text-slate-400 text-sm">
                Proudly operating from <span className="text-cyan-400">Burewala, Punjab, Pakistan</span>. Designing for local and international markets with high connectivity.
              </p>
            </TiltCard>

            {/* Card 2: Passions */}
            <TiltCard glowColor="rgba(16, 185, 129, 0.20)" className="backdrop-blur-xl bg-white/[0.03] p-6 rounded-3xl border border-white/5 relative group overflow-hidden hover:border-emerald-500/30 hover:bg-white/[0.06] shadow-[0_8px_32px_0_rgba(16,185,129,0.02)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 flex items-center justify-center mb-4 border border-emerald-500/10">
                <Globe className="text-emerald-400" size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Core Passions</h3>
              <p className="text-slate-400 text-sm">
                Engineering intelligent automation. Integrating conversational bots with REST APIs and building seamless Shopify themes to maximize checkout metrics.
              </p>
            </TiltCard>

            {/* Card 3: Values */}
            <TiltCard glowColor="rgba(245, 158, 11, 0.20)" className="backdrop-blur-xl bg-white/[0.03] p-6 rounded-3xl border border-white/5 relative group overflow-hidden hover:border-amber-500/30 hover:bg-white/[0.06] shadow-[0_8px_32px_0_rgba(245,158,11,0.02)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-amber-950/40 flex items-center justify-center mb-4 border border-amber-500/10">
                <Heart className="text-amber-400" size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Moral Blueprint</h3>
              <p className="text-slate-400 text-sm">
                Grounded heavily on absolute honesty, straight talk, and trust in Allah. I operate with complete transparency regarding what's possible and reasonable.
              </p>
            </TiltCard>

            {/* Card 4: Current Focus */}
            <TiltCard glowColor="rgba(6, 182, 212, 0.20)" className="backdrop-blur-xl bg-white/[0.03] p-6 rounded-3xl border border-white/5 relative group overflow-hidden hover:border-cyan-500/30 hover:bg-white/[0.06] shadow-[0_8px_32px_0_rgba(6,182,212,0.02)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 flex items-center justify-center mb-4 border border-cyan-500/10">
                <TrendingUp className="text-cyan-400" size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Platform Power</h3>
              <p className="text-slate-400 text-sm">
                Monetization frameworks. Helping local stars and sellers access TikTok, Facebook Creator portals, and standard Stripe-payout e-commerce routes seamlessly.
              </p>
            </TiltCard>

            {/* Card 5: Life Goal */}
            <TiltCard glowColor="rgba(16, 185, 129, 0.20)" className="backdrop-blur-xl bg-white/[0.03] p-6 rounded-3xl border border-white/5 relative group overflow-hidden hover:border-emerald-500/30 hover:bg-white/[0.06] shadow-[0_8px_32px_0_rgba(16,185,129,0.02)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 flex items-center justify-center mb-4 border border-emerald-500/10">
                <Compass className="text-emerald-400" size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Simple Living</h3>
              <p className="text-slate-400 text-sm">
                Living beautifully and simply. No chasing endless noise. Delivering pristine work, helping clients succeed, and spending my days peacefully.
              </p>
            </TiltCard>

            {/* Card 6: Academic & Tech Study */}
            <TiltCard glowColor="rgba(245, 158, 11, 0.20)" className="backdrop-blur-xl bg-white/[0.03] p-6 rounded-3xl border border-white/5 relative group overflow-hidden hover:border-amber-500/30 hover:bg-white/[0.06] shadow-[0_8px_32px_0_rgba(245,158,11,0.02)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-2xl bg-amber-950/40 flex items-center justify-center mb-4 border border-amber-500/10">
                <BookOpen className="text-amber-400" size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Academics & ICS Hub</h3>
              <p className="text-slate-400 text-sm">
                1st Year <span className="text-amber-400">ICS (Intermediate in Computer Science)</span> student at <span className="text-white">Govt Graduate College Burewala</span>. Combining foundational education with real-world building to stand out as the <span className="text-cyan-400">best Pakistani developer</span>.
              </p>
            </TiltCard>

          </div>
        </section>

        {/* ================= TECH STACK & ORBITAL SKILLS ================= */}
        <section id="skills" className="py-20 px-4 bg-slate-950/40 relative border-t border-slate-100/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Text Information column */}
              <div className="lg:col-span-5 text-left">
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-900/30 inline-flex items-center gap-2 mb-3">
                  <Workflow size={13} />
                  My Toolbox
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Premium Tech Stack & <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">Expertise</span>
                </h2>
                <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
                  I specialize in lightweight, lightning-fast scripts and dynamic web layers. I choose high-concurrency frameworks that support massive workloads (like multi-device chat engines) without buckling under memory strain and load.
                </p>

                {/* Direct skill level percentages grid for fidelity */}
                <div className="mt-8 space-y-4">
                  {[
                    { label: "Bot Automations & APIs", percent: "95%", color: "bg-cyan-400" },
                    { label: "Shopify Custom Integration", percent: "90%", color: "bg-emerald-400" },
                    { label: "Full-Stack Node/TypeScript", percent: "88%", color: "bg-amber-400" }
                  ].map((skill, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>{skill.label}</span>
                        <span>{skill.percent}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full ${skill.color} rounded-full`} style={{ width: skill.percent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid of beautifully classified skill tags in premium liquid glass */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Category 1 */}
                  <TiltCard glowColor="rgba(6, 182, 212, 0.18)" className="backdrop-blur-xl bg-white/[0.02] p-5 rounded-3xl border border-white/5 hover:border-cyan-500/20 shadow-lg group">
                    <div className="flex items-center gap-2 mb-3 text-cyan-400">
                      <Code size={18} className="group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold text-white text-sm">Languages</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["HTML5", "CSS3 / Tailwind", "TypeScript", "Node.js", "Python", "PHP"].map(item => (
                        <span key={item} className="text-xs font-semibold bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-250">
                          {item}
                        </span>
                      ))}
                    </div>
                  </TiltCard>
 
                  {/* Category 2 */}
                  <TiltCard glowColor="rgba(16, 185, 129, 0.18)" className="backdrop-blur-xl bg-white/[0.02] p-5 rounded-3xl border border-white/5 hover:border-emerald-500/20 shadow-lg group">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400">
                      <Bot size={18} className="group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold text-white text-sm">Bot Frameworks</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Baileys API", "Venom-bot", "Telegraf CLI", "Telethon", "Custom Webhooks"].map(item => (
                        <span key={item} className="text-xs font-semibold bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-slate-300 hover:text-emerald-400 hover:border-emerald-400/30 transition-all duration-250">
                          {item}
                        </span>
                      ))}
                    </div>
                  </TiltCard>
 
                  {/* Category 3 */}
                  <TiltCard glowColor="rgba(245, 158, 11, 0.18)" className="backdrop-blur-xl bg-white/[0.02] p-5 rounded-3xl border border-white/5 hover:border-amber-500/20 shadow-lg group">
                    <div className="flex items-center gap-2 mb-3 text-amber-400">
                      <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold text-white text-sm">E-Commerce & DB</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Shopify Liquid", "Shopify OS 2.0", "Cart APIs", "MySQL", "MongoDB", "Firestore"].map(item => (
                        <span key={item} className="text-xs font-semibold bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-slate-300 hover:text-amber-400 hover:border-amber-400/30 transition-all duration-250">
                          {item}
                        </span>
                      ))}
                    </div>
                  </TiltCard>
 
                  {/* Category 4 */}
                  <TiltCard glowColor="rgba(6, 182, 212, 0.18)" className="backdrop-blur-xl bg-white/[0.02] p-5 rounded-3xl border border-white/5 hover:border-cyan-500/20 shadow-lg group">
                    <div className="flex items-center gap-2 mb-3 text-cyan-400">
                      <Shield size={18} className="group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold text-white text-sm">Operations</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["API Prototyping", "Cron Jobs", "Security Audit", "Git/GitHub", "Digital Marketing"].map(item => (
                        <span key={item} className="text-xs font-semibold bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-250">
                          {item}
                        </span>
                      ))}
                    </div>
                  </TiltCard>
 
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= HIGH-FIDELITY FAQ ACCORDION SECTION ================= */}
        <section id="qa" className="py-20 px-4 max-w-7xl mx-auto border-t border-slate-900/60">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase bg-amber-950/20 px-3 py-1 rounded-full border border-amber-900/30 inline-flex items-center gap-2 mb-3">
              <MessageSquare size={13} />
              Quick Q&A
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">Questions</span>
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Got questions about my developer identity or bot services? Read quick answers below.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="backdrop-blur-xl bg-white/[0.015] border border-white/5 rounded-3xl overflow-hidden hover:border-cyan-500/20 transition-all duration-300 shadow-[0_4px_24px_rgba(6,182,212,0.01)]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-white hover:text-cyan-400 focus:outline-none transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    <span className={`transition-transform duration-300 text-cyan-400 ${isOpen ? "rotate-180" : ""}`}>
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
                        transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm sm:text-base text-slate-300 border-t border-white/5 pt-4 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>


        </section>

        {/* ================= INTERACTIVE DIGITAL MEDIA GALLERY SECTION ================= */}
        <section id="gallery" className="py-24 px-4 max-w-7xl mx-auto border-t border-slate-900/60 relative overflow-hidden">
          {/* Subtle Ambient Background light glows */}
          <div className="absolute top-12 left-1/3 w-72 h-72 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-12 right-1/4 w-80 h-80 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="text-center mb-16 relative z-10">
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase bg-cyan-950/20 px-3.5 py-1.5 rounded-full border border-cyan-900/30 inline-flex items-center gap-2 mb-4">
              <Sparkles size={13} className="animate-spin-slow" />
              Creative Studio Capture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Official Media & <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">Visual Workspace</span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore actual design snapshots, server orchestration, custom e-commerce configurations, and technical setups. Designed with 3D-interactivity and optimized for Google Image SEO.
            </p>
          </div>

          <ImageGallery />
        </section>

        {/* ================= 3D INTERACTIVE HUB & FLOATING SEAMLESS SCENE ================= */}
        <section id="showcase-3d" className="py-24 px-4 max-w-7xl mx-auto border-t border-white/5 relative overflow-hidden">
          {/* Eye-catching background mesh blurs and vibrant color flow */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="flex flex-col items-center mb-16 text-center relative z-10">
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-500/10 inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live 3D Automation Workspace
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
              Interact with <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 text-transparent bg-clip-text">Future-Ready Tech</span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore Shahan's integrated 3D virtual sandbox space without restrictive boxes. Rotate and interact with custom automations, scripts, and server nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* 3D Spline Scene Row (Seamlessly floating, absolutely borderless, no box!) */}
            <div className="lg:col-span-6 h-[400px] lg:h-[500px] relative flex items-center justify-center animate-fadeIn">
              <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
              
              {(!splineLoaded || ecoMode) ? (
                <div className="w-full h-full rounded-3xl bg-slate-950/40 border border-white/5 p-6 flex flex-col justify-between overflow-hidden relative group">
                  {/* Tech grid backdrop */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <Workflow className="text-cyan-400 animate-pulse" size={18} />
                      <span className="font-mono text-xs text-slate-400 font-bold">Node-MD cluster console</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] text-emerald-400 font-mono tracking-wider font-bold">ONLINE</span>
                    </div>
                  </div>

                  {/* Live Simulated Diagnostics / Terminal style */}
                  <div className="my-3 space-y-4 font-mono text-xs relative z-10 text-left">
                    <div className="space-y-1.5 bg-slate-950/80 p-4 rounded-xl border border-white/5 font-mono text-[11px] leading-relaxed">
                      <p className="text-cyan-400">$ proboy connect --cluster-asia-southeast</p>
                      <p className="text-slate-400">⚡ Initializing premium multi-device secure bridge...</p>
                      <p className="text-emerald-400 font-semibold">✔ Connected to Burewala Operational HQ [Active latency: 12ms]</p>
                      <p className="text-slate-500 text-[10px]">⚡ Memory load: 24.2MB | Webhook Status: Listening on Port 3000</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center animate-pulse">
                        <span className="text-slate-500 text-[9px] block uppercase tracking-wider">Uptime</span>
                        <span className="text-[11px] sm:text-xs font-black text-white font-mono">99.98%</span>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-slate-500 text-[9px] block uppercase tracking-wider">Requests</span>
                        <span className="text-[11px] sm:text-xs font-black text-cyan-400 font-mono">248K</span>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-slate-500 text-[9px] block uppercase tracking-wider">Nodes</span>
                        <span className="text-[11px] sm:text-xs font-black text-emerald-400 font-mono">03 Live</span>
                      </div>
                    </div>
                  </div>

                  {/* Activate 3D Button */}
                  <div className="flex flex-col items-center gap-3 relative z-10 w-full mb-1">
                    <button
                      onClick={() => setSplineLoaded(true)}
                      disabled={ecoMode}
                      className={`w-full py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer ${
                        ecoMode
                          ? "bg-slate-950/20 border-white/5 text-slate-500 cursor-not-allowed"
                          : "bg-cyan-500/10 border-cyan-400/20 hover:border-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] active:scale-98"
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>{ecoMode ? "Interactive 3D Disabled" : "Launch Dynamic 3D Environment"}</span>
                    </button>
                    <p className="text-[9px] text-slate-500 font-medium tracking-wide">
                      {ecoMode 
                        ? "Switch to Turbo Mode in the header navigation to activate 3D features" 
                        : "Tap to mount standard multi-axis WebGL viewport (requires modern GPU)"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <SplineScene 
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Badge */}
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-lg border border-white/5 text-[10px] font-mono tracking-wider font-bold text-cyan-400 flex items-center gap-1.5 shadow-lg">
                    <Sparkles size={11} className="text-cyan-400 animate-spin-slow" />
                    <span>INTERACTIVE 3D (DRAG/HOLD MOUSE OUTSIDE TO ROTATE)</span>
                  </div>

                  {/* Close 3D Workspace */}
                  <button
                    onClick={() => setSplineLoaded(false)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/60 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer shadow-lg z-30"
                    title="Close 3D View"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Real-time stats & controls on the Right (Styled as gorgeous colorful Liquid Glass blocks!) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/[0.02] border border-white/5 shadow-[0_8px_32px_0_rgba(6,182,212,0.03)] relative overflow-hidden group">
                {/* Liquid glow accent line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 opacity-60" />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-black font-mono text-cyan-400 tracking-widest uppercase">PROBOY-MD SHIELD ENGINE</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/40 border border-cyan-800/30 text-[9px] font-bold font-mono text-cyan-300">
                    STATUS: ACTIVE
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">
                  ProBoy-MD Automation Cluster
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  Deploying multi-device cloud configurations designed to ensure maximum uptime, rapid webhook deliveries, and lightweight, stable client communication workflows.
                </p>

                {/* Highly structured, colourful eye-catching metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Active Connections", value: "3,150+", suffix: "Globally Deployed", border: "hover:border-cyan-500/30" },
                    { label: "Average Response", value: "<150ms", suffix: "Ultra-Fast Triggers", border: "hover:border-emerald-500/30" },
                    { label: "Shopify Speed Score", value: "99/100", suffix: "Mobile Performance", border: "hover:border-amber-500/30" },
                    { label: "Server Uptime", value: "99.98%", suffix: "Continuous SLA", border: "hover:border-indigo-500/30" }
                  ].map((stat, sIdx) => (
                    <div key={sIdx} className={`p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md flex flex-col gap-1 transition-all duration-300 shadow-md ${stat.border}`}>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{stat.label}</span>
                      <span className="text-lg font-black text-white">{stat.value}</span>
                      <span className="text-[9px] font-semibold text-cyan-400/80">{stat.suffix}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">SYSTEM COORDINATES</span>
                    <span className="text-xs font-semibold text-slate-300 font-mono">Burewala, PK · Cloud Node 315</span>
                  </div>
                  
                  <LiquidButton 
                    onClick={() => {
                      const contactSec = document.getElementById("contact");
                      if (contactSec) contactSec.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="cursor-pointer border border-emerald-500/20 px-3 py-1"
                  >
                    <span className="text-xs font-extrabold text-white px-2 py-0.5 flex items-center gap-2">Connect Node <Sparkles size={11} className="text-emerald-400" /></span>
                  </LiquidButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COMPREHENSIVE PROJECTS GALLERY SECTION ================= */}
        <section id="projects" className="py-20 px-4 bg-slate-950/40 border-t border-slate-100/5">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="text-left">
                <span className="text-xs font-black tracking-widest text-cyan-400 uppercase bg-cyan-950/20 px-3 py-1 rounded-full border border-cyan-900/30 inline-flex items-center gap-2 mb-3">
                  <Laptop size={13} />
                  My Engineering Arena
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Featured Digital <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">Creations</span>
                </h2>
                <p className="mt-2 text-slate-400 text-sm sm:text-medium max-w-xl">
                  Filter through bots, custom Liquid front-ends, and tracking APIs designed with zero waste.
                </p>
              </div>

              {/* Filtering mechanism button controls */}
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "All Work", id: "all" },
                  { name: "Bots / APIs", id: "bots" },
                  { name: "Shopify", id: "shopify" },
                  { name: "Monetization", id: "monetization" },
                  { name: "Fullstack", id: "fullstack" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeCategory === cat.id
                        ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-400/10"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid display optimized for mobile scrolling, touch-pad gestures, and desktop grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj, idx) => {
                const getGlowColor = (cat: string) => {
                  switch (cat) {
                    case "bots": return "rgba(6, 182, 212, 0.22)";
                    case "shopify": return "rgba(16, 185, 129, 0.22)";
                    case "monetization": return "rgba(245, 158, 11, 0.22)";
                    case "fullstack": return "rgba(99, 102, 241, 0.22)";
                    default: return "rgba(6, 182, 212, 0.22)";
                  }
                };

                return (
                  <TiltCard
                    key={idx}
                    glowColor={getGlowColor(proj.category)}
                    className="backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between group shadow-2xl h-full"
                  >
                    <div className="h-full flex flex-col justify-between">
                      <div>
                        {/* Placeholder and Dynamic Graphic frame */}
                        <div className="h-44 w-full relative overflow-hidden bg-slate-950/40 flex flex-col items-center justify-center border-b border-white/5">
                          
                          {proj.image ? (
                            <div className="absolute inset-0 w-full h-full">
                              <img
                                src={proj.image}
                                alt={proj.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  // If image loading fails, hide it to fallback to the dynamic graphic below
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              {/* Rich dark gradient overlay for text readability on card image */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                            </div>
                          ) : null}

                          {/* Generates a stylized backdrop color matching the category */}
                          <div className={`absolute inset-0 opacity-15 ${
                            proj.category === 'bots' ? 'bg-cyan-500' :
                            proj.category === 'shopify' ? 'bg-emerald-500' :
                            proj.category === 'monetization' ? 'bg-amber-500' : 'bg-indigo-500'
                          }`} />
                          
                          <div className="relative z-10 text-center flex flex-col items-center p-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-center mb-2 shadow-md">
                              {proj.category === 'bots' && <Bot size={20} className="text-cyan-400" />}
                              {proj.category === 'shopify' && <ShoppingBag size={20} className="text-emerald-400" />}
                              {proj.category === 'monetization' && <TrendingUp size={20} className="text-amber-400" />}
                              {proj.category === 'fullstack' && <Code size={20} className="text-indigo-400" />}
                            </div>
                            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400/90 block mb-1">
                              {proj.category}
                            </span>
                            <h4 className="font-bold text-white tracking-tight line-clamp-1 drop-shadow-md">{proj.title}</h4>
                          </div>

                        </div>

                        <div className="p-5">
                          {/* Tags list */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {proj.tags.map(tag => (
                              <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold bg-white/5 backdrop-blur-md text-slate-300 px-2.5 py-1 rounded-xl border border-white/5 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-4">
                            {proj.description}
                          </p>
                        </div>
                      </div>

                      {/* Operational links */}
                      <div className="px-5 pb-5 pt-2 flex items-center gap-3">
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl hover:shadow-md hover:shadow-cyan-400/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>Launch App</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <Github size={12} className="text-cyan-400" />
                            <span>Source Code</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>

          </div>
        </section>

        {/* ================= INTERACTIVE CONNECT TERMINAL SECTION ================= */}
        <section id="contact" className="py-20 px-4 max-w-7xl mx-auto border-t border-slate-900/60">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Column 1: Informational contacts */}
            <div className="lg:col-span-5 space-y-8">
              <div className="text-left">
                <span className="text-xs font-black tracking-widest text-cyan-400 uppercase bg-cyan-950/20 px-3 py-1 rounded-full border border-cyan-900/30 inline-flex items-center gap-2 mb-3">
                  <Mail size={13} />
                  Connect Stations
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Let's Discuss <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">Your Next Project</span>
                </h2>
                <p className="mt-3 text-slate-400 text-sm sm:text-medium">
                  Got an automation concept, a Shopify design query, or content payout problem from Pakistan? Send an instant line.
                </p>
              </div>

              {/* Direct clickable contact cards */}
              <div className="space-y-4">
                
                {/* Email container with copy trigger */}
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4 hover:border-cyan-500/20 transition-all duration-300 group shadow-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-cyan-950/40 rounded-2xl flex items-center justify-center border border-cyan-500/10 flex-shrink-0">
                      <Mail className="text-cyan-400 group-hover:scale-110 transition-transform" size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-mono uppercase text-slate-500 block">Personal Email</span>
                      <a href="mailto:luciferkiller315@gmail.com" className="text-sm sm:text-base font-bold text-white hover:text-cyan-400 break-all transition-colors">
                        luciferkiller315@gmail.com
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => copyText("luciferkiller315@gmail.com", "email")}
                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                    title="Copy Email Address"
                  >
                    {copiedEmail ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>

                {/* WhatsApp container with direct trigger and copy */}
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4 hover:border-emerald-500/20 transition-all duration-300 group shadow-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-emerald-950/40 rounded-2xl flex items-center justify-center border border-emerald-500/10 flex-shrink-0">
                      <Phone className="text-emerald-400 group-hover:scale-110 transition-transform" size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-mono uppercase text-slate-500 block">WhatsApp Line</span>
                      <a href="https://wa.me/923261684315" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition-colors">
                        +92-326-1684315
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => copyText("+923261684315", "phone")}
                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                    title="Copy WhatsApp Number"
                  >
                    {copiedPhone ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>

                {/* WhatsApp Channel container */}
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4 hover:border-cyan-500/20 transition-all duration-300 group shadow-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-cyan-950/40 rounded-2xl flex items-center justify-center border border-cyan-500/10 flex-shrink-0">
                      <MessageSquare className="text-cyan-400 group-hover:scale-110 transition-transform" size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-mono uppercase text-slate-500 block">WhatsApp Broadcast Channel</span>
                      <a href="https://whatsapp.com/channel/0029Vb6vIroBPzjSw1lCQP0X" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-bold text-slate-200 hover:text-cyan-400 truncate block transition-colors">
                        Join ProBoy Official Channel
                      </a>
                    </div>
                  </div>
                  <a
                    href="https://whatsapp.com/channel/0029Vb6vIroBPzjSw1lCQP0X"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-cyan-500/10 border border-cyan-500/10 hover:border-cyan-400 hover:bg-cyan-500/20 rounded-xl text-cyan-400 hover:text-white transition-all flex-shrink-0"
                    title="Join WhatsApp Channel"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>

                {/* Geographical Area Info */}
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex items-center gap-3 hover:border-amber-500/20 transition-all duration-300 group shadow-md">
                  <div className="w-10 h-10 bg-amber-950/40 rounded-2xl flex items-center justify-center border border-amber-500/10 flex-shrink-0">
                    <MapPin className="text-amber-400 group-hover:scale-110 transition-transform" size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase text-slate-500 block">Operational HQ</span>
                    <a
                      href="https://maps.app.goo.gl/vPiWfSYFZXvaJpLx9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base font-bold text-white hover:text-amber-400 flex items-center gap-1 transition-colors"
                    >
                      Burewala, Punjab, Pakistan
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Column 2: Interactive functional Quick Send form with persistent localStorage success visual logs */}
            <div className="lg:col-span-7">
              <div className="backdrop-blur-xl bg-white/[0.02] p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-cyan-500/20 shadow-2xl transition-all duration-300">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Send size={18} className="text-cyan-400 animate-pulse" />
                  Send Shahan an Instant Wire
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
                  Have a quick proposal? Fill the fields to trigger client-side persistent storage validation logs.
                </p>

                {formSuccess ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-3 animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 items-center justify-center inline-flex font-bold">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-emerald-400 font-extrabold text-base sm:text-lg">Wire Dispatched Successfully!</h4>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      Thank you! Your inquiry was successfully recorded in client-side storage index. I will contact you on your registered address soon!
                    </p>
                    <button
                      onClick={() => setFormSuccess(false)}
                      className="text-white hover:text-emerald-400 font-bold text-xs underline cursor-pointer inline-block mt-2"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="form-name" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Full Name *
                        </label>
                        <input
                          id="form-name"
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Shahan Ali"
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:bg-white/10 focus:outline-none p-3.5 rounded-2xl text-slate-200 text-sm placeholder-slate-700 transition-all focus:ring-1 focus:ring-cyan-500/20 shadow-inner"
                        />
                      </div>
                      <div>
                        <label htmlFor="form-email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Email Address
                        </label>
                        <input
                          id="form-email"
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="client@mail.com"
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:bg-white/10 focus:outline-none p-3.5 rounded-2xl text-slate-200 text-sm placeholder-slate-700 transition-all focus:ring-1 focus:ring-cyan-500/20 shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="form-subject" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Inquiry Subject
                      </label>
                      <input
                        id="form-subject"
                        type="text"
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        placeholder="WhatsApp / Shopify Automations proposal"
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:bg-white/10 focus:outline-none p-3.5 rounded-2xl text-slate-200 text-sm placeholder-slate-700 transition-all focus:ring-1 focus:ring-cyan-500/20 shadow-inner"
                      />
                    </div>

                    <div>
                      <label htmlFor="form-msg" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Message Content *
                      </label>
                      <textarea
                        id="form-msg"
                        required
                        rows={4}
                        value={formMsg}
                        onChange={(e) => setFormMsg(e.target.value)}
                        placeholder="Write details on your proposed project idea here..."
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:bg-white/10 focus:outline-none p-3.5 rounded-2xl text-slate-200 text-sm placeholder-slate-700 transition-all focus:ring-1 focus:ring-cyan-500/20 shadow-inner resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 text-slate-950 py-3.5 rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-cyan-400/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                    >
                      <Send size={16} />
                      <span>Transmit Message</span>
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </section>

        {/* ================= COMPACT FOOTER ================= */}
        <footer className="pt-12 pb-6 px-4 text-center border-t border-slate-900 max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xs">
              P
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">
              Shahan Ali <span className="text-cyan-400">ProBoy</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs tracking-wider font-semibold">
            © 2026 Shahan Ali - ProBoy. All rights reserved. Self‑Taught & Faith Driven.
          </p>
        </footer>

        {/* Floating Scroll-to-Top Rocket Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 24, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.8 }}
              whileHover={{ scale: 1.1, rotate: -15 }}
              whileTap={{ scale: 0.92 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-slate-950/80 backdrop-blur-xl border border-cyan-400/50 rounded-full flex items-center justify-center text-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.25)] hover:text-emerald-400 hover:border-emerald-400/50 transition-colors cursor-pointer group"
              aria-label="Scroll to top of page"
            >
              <Rocket size={18} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
