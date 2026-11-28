import { useEffect, useRef, useState } from "react";
import { info, services } from "../lib/data";
import { sendEvent } from "../lib/collector";
import { track } from "../lib/measure";
import Icon from "./Icon";

type Channel = "relay" | "email" | "whatsapp";

type FormValues = {
  name: string;
  email: string;
  number: string;
  subject: string;
  message: string;
  honeypot: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL: FormValues = {
  name: "",
  email: "",
  number: "",
  subject: "",
  message: "",
  honeypot: "",
};

const emailRegex = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const phoneRegex = /^[+]?[\d ()-]{7,30}$/;

export default function ContactForm({ compact = false }: { compact?: boolean }) {
  const [channel, setChannel] = useState<Channel>("relay");
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [copiedMail, setCopiedMail] = useState(false);
  const [ready, setReady] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    setReady(true);
    const params = new URLSearchParams(window.location.search);
    const serviceSlug = params.get("service");
    if (serviceSlug) {
      const matched = services.find((s) => s.slug === serviceSlug);
      if (matched) {
        setValues((prev) => (prev.subject ? prev : { ...prev, subject: `Inquiry: ${matched.title}` }));
      }
    }
  }, []);

  const switchChannel = (next: Channel) => {
    setChannel(next);
    setErrors({});
    setStatus("idle");
    setFeedback("");
  };

  const validate = (v: FormValues, mode: Channel): FormErrors => {
    const next: FormErrors = {};
    if (v.name.trim().length < 2) next.name = "Please enter your name (at least 2 characters).";

    if (mode === "relay" || mode === "email") {
      if (!emailRegex.test(v.email.trim())) next.email = "Please enter a valid email address.";
    } else if (v.email.trim() && !emailRegex.test(v.email.trim())) {
      next.email = "If provided, please enter a valid email address.";
    }

    if (mode === "relay") {
      const digitsOnly = v.number.replace(/\D/g, "");
      if (!phoneRegex.test(v.number.trim()) || digitsOnly.length < 7) {
        next.number =
          "Enter a phone number for the relay, or choose Email Only or WhatsApp Direct.";
      }
    } else if (v.number.trim()) {
      const digitsOnly = v.number.replace(/\D/g, "");
      if (!phoneRegex.test(v.number.trim()) || digitsOnly.length < 7) {
        next.number = "If provided, enter a valid phone or WhatsApp number.";
      }
    }

    if (v.subject.trim().length < 3) next.subject = "Please enter a brief subject (at least 3 characters).";
    if (v.message.trim().length < 15) next.message = "Please describe your project or inquiry in at least 15 characters.";
    return next;
  };

  const setField = (key: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const formattedBody = [
    `Hello Shahan Ali,`,
    ``,
    `Name: ${values.name.trim() || "-"}`,
    values.email.trim() ? `Email: ${values.email.trim()}` : null,
    values.number.trim() ? `Phone / WhatsApp: ${values.number.trim()}` : null,
    `Subject: ${values.subject.trim() || "Project Inquiry"}`,
    ``,
    `Project Details:`,
    values.message.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappHref = `${info.whatsapp}?text=${encodeURIComponent(formattedBody)}`;
  const mailtoHref = `mailto:${info.email}?subject=${encodeURIComponent(
    `[PROBOY Inquiry] ${values.subject.trim() || "Project Inquiry"}`
  )}&body=${encodeURIComponent(formattedBody)}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ready || inFlight.current) return;

    if (values.honeypot.trim().length > 0) return;

    const validationErrors = validate(values, channel);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const form = e.currentTarget;
      setStatus("error");
      setFeedback("Please review the highlighted fields before continuing.");
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    if (channel === "whatsapp") {
      void sendEvent("whatsapp_click");
      track("contact_draft", { channel: "whatsapp" });
      window.open(whatsappHref, "_blank", "noopener,noreferrer");
      setStatus("success");
      setFeedback("Prepared your pre-filled WhatsApp inquiry. If the tab did not open, use the direct WhatsApp button below.");
      return;
    }

    if (channel === "email") {
      void sendEvent("contact_click");
      track("contact_draft", { channel: "mailto" });
      window.location.href = mailtoHref;
      setStatus("success");
      setFeedback(
        "Send the draft from your email app. If no app opened, copy the inquiry into your email provider."
      );
      return;
    }

    inFlight.current = true;
    setStatus("submitting");
    setFeedback("");

    const endpoint = info.contactForm?.endpoint || "https://proboy-contact.vercel.app/";
    const payload = {
      from: "SHAHAN",
      name: values.name.trim(),
      email: values.email.trim(),
      number: values.number.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: AbortSignal.timeout(12_000),
      });

      let data: { success?: boolean; error?: string; message?: string } | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || data?.success !== true) {
        setStatus("error");
        setFeedback("The relay did not accept this inquiry. Your draft is still here; use email or WhatsApp to continue.");
        return;
      }

      void sendEvent("contact_submit");
      track("contact_submit", { channel: "relay" });
      setStatus("success");
      setFeedback(
        "The contact relay accepted your inquiry. This does not confirm inbox delivery."
      );
      setValues(INITIAL);
      setErrors({});
    } catch {
      setStatus("error");
      setFeedback(
        "The relay did not respond. Your draft was kept. Use email or WhatsApp to continue."
      );
    } finally {
      inFlight.current = false;
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(formattedBody);
      setCopiedMail(true);
      window.setTimeout(() => setCopiedMail(false), 1800);
    } catch {
      setCopiedMail(false);
    }
  };

  const inputBase =
    "w-full mt-1.5 rounded-xl bg-black/50 border px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-red-500";

  return (
    <form onSubmit={handleSubmit} method="post" noValidate aria-label="Contact Shahan Ali">
      <noscript><p>Please use the direct email or WhatsApp links when JavaScript is off.</p></noscript>
      <fieldset disabled={!ready || status === "submitting"} className="min-w-0 space-y-5">
      {/* Honeypot field for automated bots */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input
          id="cf-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.honeypot}
          onChange={(e) => setField("honeypot", e.target.value)}
        />
      </div>

      {/* Preferred Inquiry Method Selector */}
      <div>
        <span className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
          Choose Inquiry Method
        </span>
        <div role="group" aria-label="Preferred contact channel" className="grid sm:grid-cols-3 gap-2">
          {(
            [
              ["relay", "Contact API Form", "Email + phone callback"],
              ["email", "Email Only", "Phone number optional"],
              ["whatsapp", "WhatsApp Direct", "Email optional"],
            ] as const
          ).map(([id, title, hint]) => {
            const active = channel === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => switchChannel(id)}
                className={`text-left rounded-xl px-3.5 py-2.5 border transition ${
                  active
                    ? "bg-red-600/20 border-red-500 text-white"
                    : "bg-white/[0.02] border-white/15 text-zinc-300 hover:border-white/35"
                }`}
              >
                <span className="block text-xs font-semibold">{title}</span>
                <span className="block text-[11px] text-zinc-400 mt-0.5">{hint}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          {channel === "relay"
            ? "Submits directly to proboy-contact.vercel.app (the external relay endpoint requires both email and phone)."
            : channel === "email"
            ? "Phone is optional — prepares a structured email draft for shahanali.dev@gmail.com."
            : "Email is optional — opens a pre-filled WhatsApp chat directly with +92 326 1684315."}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-name" className="block text-sm font-medium text-zinc-300">
            Full Name <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            maxLength={80}
            type="text"
            required
            autoComplete="name"
            placeholder="Your full name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "cf-name-err" : undefined}
            className={`${inputBase} ${errors.name ? "border-red-500" : "border-white/15"}`}
          />
          {errors.name && (
            <p id="cf-name-err" role="alert" className="mt-1.5 text-xs text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cf-email" className="block text-sm font-medium text-zinc-300">
            Email Address{" "}
            {channel !== "whatsapp" ? (
              <span className="text-red-400" aria-hidden="true">*</span>
            ) : (
              <span className="text-xs text-zinc-500">(optional)</span>
            )}
          </label>
          <input
            id="cf-email"
            name="email"
            maxLength={120}
            type="email"
            required={channel !== "whatsapp"}
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "cf-email-err" : undefined}
            className={`${inputBase} ${errors.email ? "border-red-500" : "border-white/15"}`}
          />
          {errors.email && (
            <p id="cf-email-err" role="alert" className="mt-1.5 text-xs text-red-400">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-number" className="block text-sm font-medium text-zinc-300">
            Phone / WhatsApp{" "}
            {channel === "relay" ? (
              <span className="text-red-400" aria-hidden="true">*</span>
            ) : (
              <span className="text-xs text-zinc-500">(optional)</span>
            )}
          </label>
          <input
            id="cf-number"
            name="number"
            maxLength={30}
            type="tel"
            required={channel === "relay"}
            autoComplete="tel"
            placeholder="+92 300 1234567"
            value={values.number}
            onChange={(e) => setField("number", e.target.value)}
            aria-invalid={Boolean(errors.number)}
            aria-describedby={errors.number ? "cf-number-err" : undefined}
            className={`${inputBase} ${errors.number ? "border-red-500" : "border-white/15"}`}
          />
          {errors.number && (
            <p id="cf-number-err" role="alert" className="mt-1.5 text-xs text-red-400">
              {errors.number}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cf-subject" className="block text-sm font-medium text-zinc-300">
            Subject <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="cf-subject"
            name="subject"
            maxLength={150}
            type="text"
            required
            placeholder="Full-Stack app, Frontend UI, WhatsApp bot, Shopify, or Gemini AI"
            value={values.subject}
            onChange={(e) => setField("subject", e.target.value)}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "cf-subject-err" : undefined}
            className={`${inputBase} ${errors.subject ? "border-red-500" : "border-white/15"}`}
          />
          {errors.subject && (
            <p id="cf-subject-err" role="alert" className="mt-1.5 text-xs text-red-400">
              {errors.subject}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className="block text-sm font-medium text-zinc-300">
          Project Details / Message <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          maxLength={3000}
          required
          rows={compact ? 4 : 5}
          placeholder="Describe what you want to build, your target timeline, and any links or technical requirements..."
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "cf-message-err" : undefined}
          className={`${inputBase} ${errors.message ? "border-red-500" : "border-white/15"}`}
        />
        {errors.message && (
          <p id="cf-message-err" role="alert" className="mt-1.5 text-xs text-red-400">
            {errors.message}
          </p>
        )}
      </div>

      <div className="pt-1 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white transition"
        >
          <Icon name={channel === "whatsapp" ? "whatsapp" : "send"} className="w-4 h-4" />
          {status === "submitting"
            ? "Sending Message..."
            : channel === "whatsapp"
            ? "Open Pre-Filled WhatsApp"
            : channel === "email"
            ? "Compose Email Inquiry"
            : "Send via Contact API"}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium border border-white/20 text-zinc-200 hover:border-white/50 hover:text-white transition"
        >
          <Icon name="whatsapp" className="w-4 h-4 text-emerald-400" />
          WhatsApp Direct
        </a>
        {channel === "email" && (
          <button
            type="button"
            onClick={() => void copySummary()}
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium border border-white/15 text-zinc-300 hover:border-white/40 hover:text-white transition"
          >
            <Icon name={copiedMail ? "check" : "copy"} className="w-3.5 h-3.5" />
            {copiedMail ? "Inquiry Copied" : "Copy Inquiry"}
          </button>
        )}
      </div>

      {status === "success" && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-200"
        >
          <p className="font-semibold text-emerald-300">
            {channel === "relay" ? "Inquiry accepted" : "Inquiry ready"}
          </p>
          <p className="mt-1">{feedback}</p>
        </div>
      )}

      {status === "error" && feedback && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
        >
          <p className="font-semibold text-red-300">Submission issue</p>
          <p className="mt-1">{feedback}</p>
          <p className="mt-2 text-xs text-zinc-300">
            Direct alternatives:{" "}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-red-300 hover:text-white"
            >
              Open in WhatsApp
            </a>{" "}
            or{" "}
            <a href={mailtoHref} className="underline text-red-300 hover:text-white">
              {info.email}
            </a>
            .
          </p>
        </div>
      )}
      </fieldset>
    </form>
  );
}
