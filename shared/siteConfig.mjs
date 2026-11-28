// Shared (server + browser) schema for the ProBoy runtime site configuration.
// The server uses sanitizeConfig() to validate everything an admin saves;
// the public site uses DEFAULT_CONFIG as the fallback when the API is unreachable.
// Nothing in this file is secret: the published config is served publicly.

export const THEMES = ["obsidian", "crimson", "aurora", "iridescent"];
export const FONTS = ["inter", "system", "serif", "mono"];
export const CARD_STYLES = ["glass", "solid", "outline"];
export const BUTTON_STYLES = ["pill", "rounded", "sharp"];
export const SPACINGS = ["compact", "comfortable", "spacious"];
export const HEADER_STYLES = ["glass", "solid", "transparent"];
export const ANNOUNCEMENT_TONES = ["info", "success", "warning"];
export const CONSENT_MODES = ["notice", "optin"];
export const HOME_SECTIONS = ["about", "services", "projects", "demos", "certificates", "qa", "contact"];

export const DEFAULT_CONFIG = Object.freeze({
  ui: {
    theme: "iridescent",
    accent: "#ef1d3e",
    accent2: "#38bdf8",
    background: "#050507",
    fontFamily: "inter",
    fontScale: 1,
    radius: 22,
    cardStyle: "glass",
    buttonStyle: "pill",
    spacing: "comfortable",
    headerStyle: "glass",
    glow: 55,
    ringGlow: 70,
    showHeader: true,
    showFooter: true,
  },
  motion: {
    enabled: true,
    intensity: 60,
    tilt3d: 55,
    parallax: true,
    reveal: true,
    hover: true,
    scrollProgress: true,
    smoothScroll: true,
    ambientBackground: false,
  },
  sections: { about: true, services: true, projects: true, demos: true, certificates: true, qa: true, contact: true },
  features: { intro: true, backToTop: true, privacyNotice: true },
  maintenance: { enabled: false, title: "Be right back", message: "ProBoy is being updated. Please check again shortly." },
  announcement: { enabled: false, text: "", link: "", linkLabel: "Learn more", tone: "info" },
  analytics: { enabled: false, consentMode: "notice", retentionDays: 180, trackEvents: true },
  security: { trustedDeviceDays: 30 },
});

const HEX = /^#[0-9a-fA-F]{6}$/;
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const bool = (v, d) => (typeof v === "boolean" ? v : d);
const num = (v, d, min, max) => {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
const oneOf = (v, list, d) => (list.includes(v) ? v : d);
const hex = (v, d) => (typeof v === "string" && HEX.test(v) ? v.toLowerCase() : d);
const text = (v, d, max) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : d);
const safeLink = (v) => {
  const s = text(v, "", 300);
  if (!s) return "";
  return /^(\/(?!\/)|https:\/\/|mailto:)/i.test(s) ? s : "";
};

/** Validate + normalise a config object. Unknown keys are dropped, bad values fall back to defaults. */
export function sanitizeConfig(input, base = DEFAULT_CONFIG) {
  const i = isObj(input) ? input : {};
  const d = base;
  const ui = isObj(i.ui) ? i.ui : {};
  const mo = isObj(i.motion) ? i.motion : {};
  const se = isObj(i.sections) ? i.sections : {};
  const fe = isObj(i.features) ? i.features : {};
  const ma = isObj(i.maintenance) ? i.maintenance : {};
  const an = isObj(i.announcement) ? i.announcement : {};
  const aa = isObj(i.analytics) ? i.analytics : {};
  const sc = isObj(i.security) ? i.security : {};
  return {
    ui: {
      theme: oneOf(ui.theme, THEMES, d.ui.theme),
      accent: hex(ui.accent, d.ui.accent),
      accent2: hex(ui.accent2, d.ui.accent2),
      background: hex(ui.background, d.ui.background),
      fontFamily: oneOf(ui.fontFamily, FONTS, d.ui.fontFamily),
      fontScale: num(ui.fontScale, d.ui.fontScale, 0.85, 1.25),
      radius: num(ui.radius, d.ui.radius, 0, 36),
      cardStyle: oneOf(ui.cardStyle, CARD_STYLES, d.ui.cardStyle),
      buttonStyle: oneOf(ui.buttonStyle, BUTTON_STYLES, d.ui.buttonStyle),
      spacing: oneOf(ui.spacing, SPACINGS, d.ui.spacing),
      headerStyle: oneOf(ui.headerStyle, HEADER_STYLES, d.ui.headerStyle),
      glow: num(ui.glow, d.ui.glow, 0, 100),
      ringGlow: num(ui.ringGlow, d.ui.ringGlow, 0, 100),
      showHeader: bool(ui.showHeader, d.ui.showHeader),
      showFooter: bool(ui.showFooter, d.ui.showFooter),
    },
    motion: {
      enabled: bool(mo.enabled, d.motion.enabled),
      intensity: num(mo.intensity, d.motion.intensity, 0, 100),
      tilt3d: num(mo.tilt3d, d.motion.tilt3d, 0, 100),
      parallax: bool(mo.parallax, d.motion.parallax),
      reveal: bool(mo.reveal, d.motion.reveal),
      hover: bool(mo.hover, d.motion.hover),
      scrollProgress: bool(mo.scrollProgress, d.motion.scrollProgress),
      smoothScroll: bool(mo.smoothScroll, d.motion.smoothScroll),
      ambientBackground: bool(mo.ambientBackground, d.motion.ambientBackground),
    },
    sections: Object.fromEntries(HOME_SECTIONS.map((k) => [k, bool(se[k], d.sections[k])])),
    features: {
      intro: bool(fe.intro, d.features.intro),
      backToTop: bool(fe.backToTop, d.features.backToTop),
      privacyNotice: bool(fe.privacyNotice, d.features.privacyNotice),
    },
    maintenance: {
      enabled: bool(ma.enabled, d.maintenance.enabled),
      title: text(ma.title, d.maintenance.title, 80) || d.maintenance.title,
      message: text(ma.message, d.maintenance.message, 400) || d.maintenance.message,
    },
    announcement: {
      enabled: bool(an.enabled, d.announcement.enabled),
      text: text(an.text, d.announcement.text, 240),
      link: safeLink(an.link),
      linkLabel: text(an.linkLabel, d.announcement.linkLabel, 40) || d.announcement.linkLabel,
      tone: oneOf(an.tone, ANNOUNCEMENT_TONES, d.announcement.tone),
    },
    analytics: {
      enabled: bool(aa.enabled, d.analytics.enabled),
      consentMode: oneOf(aa.consentMode, CONSENT_MODES, d.analytics.consentMode),
      retentionDays: Math.round(num(aa.retentionDays, d.analytics.retentionDays, 7, 730)),
      trackEvents: bool(aa.trackEvents, d.analytics.trackEvents),
    },
    security: { trustedDeviceDays: Math.round(num(sc.trustedDeviceDays, d.security.trustedDeviceDays, 1, 90)) },
  };
}

/** The subset that is safe (and useful) to serve to anonymous visitors. */
export function publicConfig(cfg) {
  return {
    ui: cfg.ui,
    motion: cfg.motion,
    sections: cfg.sections,
    features: cfg.features,
    maintenance: cfg.maintenance,
    announcement: cfg.announcement,
    analytics: { enabled: cfg.analytics.enabled, consentMode: cfg.analytics.consentMode, trackEvents: cfg.analytics.trackEvents },
  };
}
