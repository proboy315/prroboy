import { useEffect, useRef, useState } from "react";
import { info, services } from "../lib/data";
import Icon from "./Icon";

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^[+]?[\d\s().-]{7,22}$/;

export default function ContactForm({ compact = false }: { compact?: boolean }) {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const inFlight = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const serviceSlug = params.get("service");
    if (serviceSlug) {
      const matched = services.find((s) => s.slug === serviceSlug);
      if (matched) {
        setValues((prev) => (prev.subject ? prev : { ...prev, subject: `Inquiry: ${matched.title}` }));
      }
    }
  }, []);

  const validate = (v: FormValues): FormErrors => {
    const next: FormErrors = {};
    if (v.name.trim().length < 2) next.name = "Please enter your full name (at least 2 characters).";
    if (!emailRegex.test(v.email.trim())) next.email = "Please enter a valid email address.";
    const digitsOnly = v.number.replace(/\D/g, "");
    if (!phoneRegex.test(v.number.trim()) || digitsOnly.length < 7) {
      next.number = "Please enter a valid phone or WhatsApp number with country code (e.g. +92 300 1234567).";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlight.current) return;

    // Client-side honeypot spam check (never forwarded to the API)
    if (values.honeypot.trim().length > 0) {
      return;
    }

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setStatus("error");
      setFeedback("Please review the highlighted fields before submitting.");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: { success?: boolean; error?: string; message?: string } | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || (data && data.success === false)) {
        const apiError = data?.error || data?.message || `Contact service returned HTTP ${response.status}.`;
        setStatus("error");
        setFeedback(`Message could not be sent: ${apiError}`);
        return;
      }

      setStatus("success");
      setFeedback("Your message has been submitted to Shahan Ali. You can also follow up directly on WhatsApp or email if urgent.");
      setValues(INITIAL);
      setErrors({});
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Network request failed";
      setStatus("error");
      setFeedback(`Unable to reach the contact server (${reason}). Please use the direct WhatsApp or email option below.`);
    } finally {
      inFlight.current = false;
    }
  };

  const whatsappFallbackText = encodeURIComponent(
    `Hello Shahan Ali!\n\nName: ${values.name || "-"}\nEmail: ${values.email || "-"}\nPhone: ${values.number || "-"}\nSubject: ${values.subject || "Project Inquiry"}\nMessage: ${values.message || ""}`
  );
  const whatsappFallbackHref = `${info.whatsapp}?text=${whatsappFallbackText}`;

  const inputBase =
    "w-full mt-1.5 rounded-xl bg-black/50 border px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-red-500";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Contact Shahan Ali">
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

      <div className={compact ? "grid sm:grid-cols-2 gap-4" : "grid sm:grid-cols-2 gap-4"}>
        <div>
          <label htmlFor="cf-name" className="block text-sm font-medium text-zinc-300">
            Full Name <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
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
            Email Address <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
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
            Phone / WhatsApp Number <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="cf-number"
            name="number"
            type="tel"
            required
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
            type="text"
            required
            placeholder="Web app, WhatsApp bot, Shopify, or AI"
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
          required
          rows={compact ? 4 : 5}
          placeholder="Describe what you want to build, your timeline, and any links or requirements..."
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

      <div className="pt-1 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white transition"
        >
          <Icon name="send" className="w-4 h-4" />
          {status === "submitting" ? "Sending Message..." : "Send Message"}
        </button>
        <a
          href={whatsappFallbackHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium border border-white/20 text-zinc-200 hover:border-white/50 hover:text-white transition"
        >
          <Icon name="whatsapp" className="w-4 h-4 text-emerald-400" />
          Message on WhatsApp
        </a>
      </div>

      {status === "success" && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-200"
        >
          <p className="font-semibold text-emerald-300">Message sent</p>
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
            <a href={whatsappFallbackHref} target="_blank" rel="noopener noreferrer" className="underline text-red-300 hover:text-white">
              Open in WhatsApp
            </a>{" "}
            or{" "}
            <a href={`mailto:${info.email}`} className="underline text-red-300 hover:text-white">
              {info.email}
            </a>
            .
          </p>
        </div>
      )}
    </form>
  );
}
