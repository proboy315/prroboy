import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface SectionItem {
  id: string;
  number: string;
  label: string;
}

const SECTIONS: SectionItem[] = [
  { id: "hero", number: "01", label: "HERO" },
  { id: "about", number: "02", label: "ABOUT" },
  { id: "certificates", number: "03", label: "HONORS" },
  { id: "services", number: "04", label: "SERVICES" },
  { id: "projects", number: "05", label: "REAL WORKS" },
  { id: "showcase", number: "06", label: "SHOWCASE" },
  { id: "reviews", number: "07", label: "REVIEWS" },
  { id: "skills", number: "08", label: "STACK" },
  { id: "gallery", number: "09", label: "GALLERY" },
  { id: "qa", number: "10", label: "FAQ" },
  { id: "contact", number: "11", label: "CONTACT" }
];

export function ScrollProgressIndicator() {
  const [activeId, setActiveId] = useState("hero");
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollPercent(scrolled);

      const scrollPos = window.scrollY + 200;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveId(SECTIONS[i].id);
            break;
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentSection = SECTIONS.find((s) => s.id === activeId) || SECTIONS[0];

  return (
    <>
      {/* Top Global Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-900/50 z-[100] pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>
    </>
  );
}
