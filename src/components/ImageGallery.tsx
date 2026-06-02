import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Maximize2, X, ChevronLeft, ChevronRight, Download, Image as ImageIcon, Sparkles, ExternalLink } from "lucide-react";

interface GalleryItem {
  title: string;
  description: string;
  url: string;
  alt: string;
}

export default function ImageGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/gallery.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load gallery data");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          throw new Error("Invalid gallery format");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % items.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + items.length) % items.length);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <ImageIcon className="absolute inset-0 m-auto text-cyan-400 animate-pulse" size={16} />
        </div>
        <p className="text-xs font-mono text-slate-500 mt-4 tracking-widest uppercase">Loading Digital Gallery...</p>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-900/20 rounded-2xl border border-slate-900">
        <ImageIcon size={32} className="text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-mono">No gallery visuals locked. Add items to gallery.json in the public directory.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Dynamic Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            onClick={() => setActiveIndex(idx)}
            className="group cursor-pointer relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-900 hover:border-cyan-500/30 overflow-hidden shadow-xl hover:shadow-cyan-950/10 transition-all duration-500 flex flex-col justify-between"
          >
            {/* Image Frame with Tilt Overly and Gloss */}
            <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-950">
              <img
                src={item.url}
                alt={item.alt || item.title}
                title={item.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              
              {/* Premium overlay with subtle futuristic gloss */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-cyan-950/20 transition-all duration-300 pointer-events-none" />
              
              {/* Action indicators */}
              <div className="absolute top-4 right-4 flex gap-2 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-400 shadow-lg">
                  <Maximize2 size={14} />
                </span>
              </div>

              {/* Float-badge representing index number */}
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono font-bold tracking-tight text-slate-400 group-hover:text-cyan-400 transition-colors">
                PRO-VISUAL #{String(idx + 1).padStart(2, '0')}
              </div>
            </div>

            {/* Static descriptive block designed to satisfy search engine bots for ranking */}
            <div className="p-5 border-t border-slate-900/80 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Bot index keywords underneath to let crawl engines consume */}
              <div className="mt-4 pt-3 border-t border-slate-950/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Google Image Node
                </span>
                <span className="text-[10px] font-mono text-cyan-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Interactive View <ExternalLink size={10} />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal display */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
            className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          >
            {/* Top Bar inside modal */}
            <div className="flex items-center justify-between max-w-7xl mx-auto w-full py-4 relative z-10">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                  <Sparkles size={16} />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
                    {items[activeIndex].title}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    Visual Item {activeIndex + 1} of {items.length} · Live Feed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={items[activeIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                  title="Download / View Original Image"
                >
                  <Download size={15} />
                  <span className="text-xs font-bold font-mono hidden sm:inline">ORIGINAL</span>
                </a>
                <button
                  onClick={() => setActiveIndex(null)}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
                  title="Close Gallery"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Middle Container for responsive sliding image */}
            <div className="flex-1 flex items-center justify-center relative max-w-5xl mx-auto w-full my-4">
              {/* Left arrow trigger */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-cyan-400 transition-all shadow-lg backdrop-blur-sm"
                title="Previous Image"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Main image container */}
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative max-h-[60vh] sm:max-h-[70vh] rounded-2xl overflow-hidden border border-slate-900 bg-slate-950 flex items-center justify-center p-1 shadow-2xl"
              >
                <img
                  src={items[activeIndex].url}
                  alt={items[activeIndex].alt || items[activeIndex].title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[58vh] sm:max-h-[68vh] object-contain rounded-xl"
                  onClick={(e) => e.stopPropagation()} // halt closing
                />
              </motion.div>

              {/* Right arrow trigger */}
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-cyan-400 transition-all shadow-lg backdrop-blur-sm"
                title="Next Image"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Bottom Bar meta info overlay inside modal */}
            <div className="max-w-3xl mx-auto text-center w-full py-6 relative z-10 border-t border-slate-900/80">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
                {items[activeIndex].description}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  SHAHAN-ALI-SEO-INDEX
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                  ALT: {items[activeIndex].alt}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
