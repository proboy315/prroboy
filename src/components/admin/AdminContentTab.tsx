import { useEffect, useState } from "react";
import infoLocal from "../../data/info.json";
import servicesLocal from "../../data/services.json";
import imagesLocal from "../../data/images.json";
import demosLocal from "../../data/demos.json";
import blogLocal from "../../data/blog.json";
import { fileToBase64, getRepoFile, putRepoFile } from "../../lib/githubApi";
import type { GitHubConfig } from "../../lib/githubApi";
import Icon from "../Icon";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

type Sub = "profile" | "socials" | "more" | "services" | "gallery" | "demos" | "blog" | "raw";

export default function AdminContentTab({ cfg, connected, onToast, onRepoChange }: Props) {
  const [sub, setSub] = useState<Sub>("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [infoData, setInfoData] = useState(infoLocal);
  const [infoSha, setInfoSha] = useState<string | undefined>();
  const [servicesData, setServicesData] = useState(servicesLocal);
  const [servicesSha, setServicesSha] = useState<string | undefined>();
  const [imagesData, setImagesData] = useState(imagesLocal);
  const [imagesSha, setImagesSha] = useState<string | undefined>();
  const [demosData, setDemosData] = useState(demosLocal);
  const [demosSha, setDemosSha] = useState<string | undefined>();
  const [blogData, setBlogData] = useState(blogLocal);
  const [blogSha, setBlogSha] = useState<string | undefined>();

  const [rawTarget, setRawTarget] = useState("src/data/info.json");
  const [rawText, setRawText] = useState(JSON.stringify(infoLocal, null, 2));

  const pull = async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const [a, b, c, d, e] = await Promise.all([
        getRepoFile(cfg, "src/data/info.json"),
        getRepoFile(cfg, "src/data/services.json"),
        getRepoFile(cfg, "src/data/images.json"),
        getRepoFile(cfg, "src/data/demos.json"),
        getRepoFile(cfg, "src/data/blog.json"),
      ]);
      const pInfo = JSON.parse(a.content);
      setInfoData(pInfo);
      setInfoSha(a.sha);
      setServicesData(JSON.parse(b.content));
      setServicesSha(b.sha);
      setImagesData(JSON.parse(c.content));
      setImagesSha(c.sha);
      setDemosData(JSON.parse(d.content));
      setDemosSha(d.sha);
      setBlogData(JSON.parse(e.content));
      setBlogSha(e.sha);
      setRawText(JSON.stringify(pInfo, null, 2));
      onToast("ok", "All data files pulled from GitHub.");
    } catch (err) {
      onToast("err", err instanceof Error ? err.message : "Pull failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) void pull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  const save = async (path: string, data: unknown, sha: string | undefined, setS: (s: string) => void) => {
    if (!connected) return onToast("err", "Unlock & connect first.");
    setSaving(true);
    try {
      const r = await putRepoFile(cfg, path, JSON.stringify(data, null, 2) + "\n", `Update ${path}`, { sha });
      setS(r.sha);
      onToast("ok", `${path} pushed.`);
      onRepoChange();
    } catch (err) {
      onToast("err", err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: [Sub, string][] = [
    ["profile", "Profile & Hero"],
    ["socials", "Socials · Stats · Nav"],
    ["more", "FAQ · Reviews · Intro"],
    ["services", "Services"],
    ["gallery", "Gallery"],
    ["demos", "Demos"],
    ["blog", "Blog"],
    ["raw", "Raw JSON"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ad-card">
        <div className="ad-card-head">
          <div>
            <span className="ad-pill ad-pill-red">Site content · src/data/*.json</span>
            <h2 className="ad-card-title" style={{ marginTop: 10, fontSize: 20 }}>Content control center</h2>
          </div>
          <button className="ad-btn ad-btn-sm" onClick={pull} disabled={!connected || loading}>
            <Icon name="refresh" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Pull all
          </button>
        </div>
        <div className="ad-tabs">
          {tabs.map(([id, label]) => (
            <button key={id} className={`ad-tab ${sub === id ? "active" : ""}`} onClick={() => setSub(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {sub === "profile" && (
        <div className="ad-card">
          <div className="ad-card-head">
            <h3 className="ad-card-title">Identity, hero &amp; contact</h3>
            <button className="ad-btn ad-btn-primary ad-btn-sm" disabled={!connected || saving} onClick={() => save("src/data/info.json", infoData, infoSha, setInfoSha)}>
              <Icon name="save" className="w-4 h-4" /> Save
            </button>
          </div>
          <div className="ad-form-grid-3">
            {(
              [
                ["name", "Full name"],
                ["brand", "Brand"],
                ["handle", "Handle"],
                ["greeting", "Greeting"],
                ["role", "Primary role"],
                ["availability", "Availability badge"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["whatsapp", "WhatsApp link"],
                ["location", "Location"],
                ["github", "GitHub URL"],
                ["resume", "Resume path (optional)"],
              ] as const
            ).map(([k, label]) => (
              <div key={k}>
                <label className="ad-label">{label}</label>
                <input
                  className="ad-input"
                  value={String((infoData as Record<string, unknown>)[k] || "")}
                  onChange={(e) => setInfoData({ ...infoData, [k]: e.target.value })}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
          <div className="ad-form-grid" style={{ marginTop: 14 }}>
            <div>
              <label className="ad-label">Hero description</label>
              <textarea className="ad-input" rows={2} value={infoData.heroDescription} onChange={(e) => setInfoData({ ...infoData, heroDescription: e.target.value })} />
            </div>
            <div>
              <label className="ad-label">Hero emphasis</label>
              <textarea className="ad-input" rows={2} value={infoData.heroEmphasis} onChange={(e) => setInfoData({ ...infoData, heroEmphasis: e.target.value })} />
            </div>
            <div>
              <label className="ad-label">Aliases (comma separated)</label>
              <input className="ad-input" value={infoData.aliases.join(", ")} onChange={(e) => setInfoData({ ...infoData, aliases: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </div>
            <div>
              <label className="ad-label">Education line</label>
              <input className="ad-input" value={infoData.education} onChange={(e) => setInfoData({ ...infoData, education: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {sub === "socials" && (
        <div className="ad-grid-2">
          <div className="ad-card">
            <div className="ad-card-head">
              <h3 className="ad-card-title">Social links</h3>
              <div className="ad-row">
                <button className="ad-btn ad-btn-sm" onClick={() => setInfoData({ ...infoData, socials: [...infoData.socials, { id: "globe", label: "Website", url: "" }] })}>+ Add</button>
                <button className="ad-btn ad-btn-primary ad-btn-sm" disabled={!connected || saving} onClick={() => save("src/data/info.json", infoData, infoSha, setInfoSha)}>Save</button>
              </div>
            </div>
            <div className="ad-list">
              {infoData.socials.map((s, i) => (
                <div key={i} className="ad-row">
                  <input className="ad-input ad-mono" style={{ maxWidth: 90 }} value={s.id} onChange={(e) => setInfoData({ ...infoData, socials: infoData.socials.map((x, xi) => (xi === i ? { ...x, id: e.target.value } : x)) })} placeholder="icon" />
                  <input className="ad-input" style={{ maxWidth: 110 }} value={s.label} onChange={(e) => setInfoData({ ...infoData, socials: infoData.socials.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)) })} />
                  <input className="ad-input ad-mono" style={{ flex: 1 }} value={s.url} onChange={(e) => setInfoData({ ...infoData, socials: infoData.socials.map((x, xi) => (xi === i ? { ...x, url: e.target.value } : x)) })} placeholder="https://… (empty = hidden)" autoComplete="off" spellCheck={false} />
                  <button className="ad-btn ad-btn-sm" onClick={() => setInfoData({ ...infoData, socials: infoData.socials.filter((_, xi) => xi !== i) })}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <div className="ad-card">
            <div className="ad-card-head">
              <h3 className="ad-card-title">Hero stats &amp; nav</h3>
              <button className="ad-btn ad-btn-primary ad-btn-sm" disabled={!connected || saving} onClick={() => save("src/data/info.json", infoData, infoSha, setInfoSha)}>Save</button>
            </div>
            <div className="ad-list">
              {infoData.stats.map((st, i) => (
                <div key={i} className="ad-row">
                  <input className="ad-input" style={{ maxWidth: 90, fontWeight: 800 }} value={st.value} onChange={(e) => setInfoData({ ...infoData, stats: infoData.stats.map((x, xi) => (xi === i ? { ...x, value: e.target.value } : x)) })} />
                  <input className="ad-input" style={{ flex: 1 }} value={st.label} onChange={(e) => setInfoData({ ...infoData, stats: infoData.stats.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)) })} />
                </div>
              ))}
            </div>
            <p className="ad-label" style={{ marginTop: 16 }}>Header nav</p>
            <div className="ad-list">
              {infoData.nav.map((n, i) => (
                <div key={n.id} className="ad-row">
                  <input className="ad-input" style={{ flex: 1 }} value={n.label} onChange={(e) => setInfoData({ ...infoData, nav: infoData.nav.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)) })} />
                  <input className="ad-input ad-mono" style={{ flex: 1 }} value={n.href} onChange={(e) => setInfoData({ ...infoData, nav: infoData.nav.map((x, xi) => (xi === i ? { ...x, href: e.target.value } : x)) })} />
                  <label style={{ fontSize: 12, color: "#b9c0d8", display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="checkbox" checked={n.header} onChange={(e) => setInfoData({ ...infoData, nav: infoData.nav.map((x, xi) => (xi === i ? { ...x, header: e.target.checked } : x)) })} /> Top
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sub === "more" && (
        <div className="ad-card">
          <div className="ad-card-head">
            <h3 className="ad-card-title">Intro, analytics &amp; FAQ ({infoData.faq.length})</h3>
            <div className="ad-row">
              <button className="ad-btn ad-btn-sm" onClick={() => setInfoData({ ...infoData, faq: [...infoData.faq, { q: "New question?", a: "Answer here." }] })}>+ FAQ</button>
              <button className="ad-btn ad-btn-primary ad-btn-sm" disabled={!connected || saving} onClick={() => save("src/data/info.json", infoData, infoSha, setInfoSha)}>Save</button>
            </div>
          </div>
          <div className="ad-form-grid">
            <label style={{ fontSize: 13, color: "#d5dbea", display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={infoData.introAnimation.enabled} onChange={(e) => setInfoData({ ...infoData, introAnimation: { ...infoData.introAnimation, enabled: e.target.checked } })} /> Enable intro animation
            </label>
            <div>
              <label className="ad-label">Intro policy</label>
              <select className="ad-select" value={infoData.introAnimation.policy} onChange={(e) => setInfoData({ ...infoData, introAnimation: { ...infoData.introAnimation, policy: e.target.value } })}>
                <option value="session">session</option>
                <option value="once">once</option>
                <option value="always">always</option>
                <option value="never">never</option>
              </select>
            </div>
            <div>
              <label className="ad-label">GA4 measurement ID</label>
              <input className="ad-input ad-mono" value={infoData.analytics.gaMeasurementId} onChange={(e) => setInfoData({ ...infoData, analytics: { ...infoData.analytics, gaMeasurementId: e.target.value } })} placeholder="G-XXXXXXXXXX" autoComplete="off" spellCheck={false} />
            </div>
            <div>
              <label className="ad-label">Contact endpoint</label>
              <input className="ad-input ad-mono" value={infoData.contactForm?.endpoint || ""} onChange={(e) => setInfoData({ ...infoData, contactForm: { ...infoData.contactForm, endpoint: e.target.value } })} autoComplete="off" spellCheck={false} />
            </div>
          </div>
          <div className="ad-list" style={{ marginTop: 16 }}>
            {infoData.faq.map((f, i) => (
              <div key={i} className="ad-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div className="ad-row">
                  <input className="ad-input" style={{ flex: 1, fontWeight: 700 }} value={f.q} onChange={(e) => setInfoData({ ...infoData, faq: infoData.faq.map((x, xi) => (xi === i ? { ...x, q: e.target.value } : x)) })} />
                  <button className="ad-btn ad-btn-sm" onClick={() => setInfoData({ ...infoData, faq: infoData.faq.filter((_, xi) => xi !== i) })}>✕</button>
                </div>
                <textarea className="ad-input" rows={2} value={f.a} onChange={(e) => setInfoData({ ...infoData, faq: infoData.faq.map((x, xi) => (xi === i ? { ...x, a: e.target.value } : x)) })} />
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "services" && (
        <div className="ad-card">
          <div className="ad-card-head">
            <h3 className="ad-card-title">Services ({servicesData.length})</h3>
            <button className="ad-btn ad-btn-primary ad-btn-sm" disabled={!connected || saving} onClick={() => save("src/data/services.json", servicesData, servicesSha, setServicesSha)}>Save</button>
          </div>
          <div className="ad-grid-2">
            {servicesData.map((s, i) => (
              <div key={s.slug} className="ad-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <input className="ad-input" style={{ fontWeight: 700 }} value={s.title} onChange={(e) => setServicesData(servicesData.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)))} />
                <input className="ad-input" value={s.tagline} onChange={(e) => setServicesData(servicesData.map((x, xi) => (xi === i ? { ...x, tagline: e.target.value } : x)))} />
                <textarea className="ad-input" rows={3} value={s.summary} onChange={(e) => setServicesData(servicesData.map((x, xi) => (xi === i ? { ...x, summary: e.target.value } : x)))} />
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "gallery" && (
        <div className="ad-card">
          <div className="ad-card-head">
            <h3 className="ad-card-title">Gallery ({imagesData.length})</h3>
            <div className="ad-row">
              <label className="ad-btn ad-btn-sm" style={{ cursor: "pointer" }}>
                <Icon name="upload" className="w-4 h-4" /> Upload
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={!connected || saving}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setSaving(true);
                    try {
                      const safe = f.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
                      await putRepoFile(cfg, `public/images/${safe}`, await fileToBase64(f), `Upload ${safe}`, { isBase64: true });
                      setImagesData((p) => [...p, { src: `/images/${safe}`, alt: f.name, caption: f.name, category: "Portfolio", order: p.length + 1, width: 1200, height: 800 }]);
                      onToast("ok", "Uploaded. Press Save Gallery.");
                      onRepoChange();
                    } catch (err) {
                      onToast("err", err instanceof Error ? err.message : "Upload failed.");
                    } finally {
                      setSaving(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              <button className="ad-btn ad-btn-primary ad-btn-sm" disabled={!connected || saving} onClick={() => save("src/data/images.json", imagesData, imagesSha, setImagesSha)}>Save</button>
            </div>
          </div>
          <div className="ad-list">
            {imagesData.map((img, i) => (
              <div key={i} className="ad-item">
                <img src={img.src} alt="" className="ad-thumb" />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  <input className="ad-input ad-mono" value={img.src} onChange={(e) => setImagesData(imagesData.map((x, xi) => (xi === i ? { ...x, src: e.target.value } : x)))} />
                  <input className="ad-input" value={img.caption || ""} onChange={(e) => setImagesData(imagesData.map((x, xi) => (xi === i ? { ...x, caption: e.target.value } : x)))} placeholder="Caption" />
                </div>
                <button className="ad-btn ad-btn-sm" onClick={() => setImagesData(imagesData.filter((_, xi) => xi !== i))}><Icon name="trash" className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "demos" && (
        <div className="ad-card">
          <div className="ad-card-head">
            <h3 className="ad-card-title">Demos ({demosData.demos.length})</h3>
            <button className="ad-btn ad-btn-primary ad-btn-sm" disabled={!connected || saving} onClick={() => save("src/data/demos.json", demosData, demosSha, setDemosSha)}>Save</button>
          </div>
          <div className="ad-grid-2">
            {demosData.demos.map((d, i) => (
              <div key={d.slug} className="ad-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div className="ad-row">
                  <input className="ad-input" style={{ flex: 1, fontWeight: 700 }} value={d.name} onChange={(e) => setDemosData({ ...demosData, demos: demosData.demos.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)) })} />
                  <input type="color" value={d.accent} onChange={(e) => setDemosData({ ...demosData, demos: demosData.demos.map((x, xi) => (xi === i ? { ...x, accent: e.target.value } : x)) })} style={{ width: 36, height: 36, borderRadius: 8, background: "none", border: "1px solid #223047" }} />
                </div>
                <textarea className="ad-input" rows={2} value={d.summary} onChange={(e) => setDemosData({ ...demosData, demos: demosData.demos.map((x, xi) => (xi === i ? { ...x, summary: e.target.value } : x)) })} />
                <label style={{ fontSize: 12, color: "#b9c0d8", display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" checked={Boolean(d.featured)} onChange={(e) => setDemosData({ ...demosData, demos: demosData.demos.map((x, xi) => (xi === i ? { ...x, featured: e.target.checked } : x)) })} /> Featured on home
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "blog" && (
        <div className="ad-card">
          <div className="ad-card-head">
            <h3 className="ad-card-title">Blog ({blogData.length})</h3>
            <div className="ad-row">
              <button
                className="ad-btn ad-btn-sm"
                onClick={() => setBlogData([...blogData, { slug: `new-post-${blogData.length + 1}`, title: "New post", summary: "Summary…", publishedAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10), category: "Engineering", readingTime: "4 min read", author: infoData.name, tags: ["PROBOY"], sections: [{ heading: "Overview", paragraphs: ["Write here."] }] }])}
              >
                + Post
              </button>
              <button className="ad-btn ad-btn-primary ad-btn-sm" disabled={!connected || saving} onClick={() => save("src/data/blog.json", blogData, blogSha, setBlogSha)}>Save</button>
            </div>
          </div>
          <div className="ad-list">
            {blogData.map((p, i) => (
              <div key={i} className="ad-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div className="ad-form-grid">
                  <input className="ad-input" style={{ fontWeight: 700 }} value={p.title} onChange={(e) => setBlogData(blogData.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)))} />
                  <input className="ad-input ad-mono" value={p.slug} onChange={(e) => setBlogData(blogData.map((x, xi) => (xi === i ? { ...x, slug: e.target.value } : x)))} />
                </div>
                <textarea className="ad-input" rows={2} value={p.summary} onChange={(e) => setBlogData(blogData.map((x, xi) => (xi === i ? { ...x, summary: e.target.value } : x)))} />
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "raw" && (
        <div className="ad-card">
          <div className="ad-card-head">
            <select className="ad-select" style={{ maxWidth: 300 }} value={rawTarget} onChange={(e) => {
              setRawTarget(e.target.value);
              const m: Record<string, unknown> = { "src/data/info.json": infoData, "src/data/services.json": servicesData, "src/data/images.json": imagesData, "src/data/demos.json": demosData, "src/data/blog.json": blogData };
              setRawText(JSON.stringify(m[e.target.value], null, 2));
            }}>
              <option value="src/data/info.json">src/data/info.json</option>
              <option value="src/data/services.json">src/data/services.json</option>
              <option value="src/data/images.json">src/data/images.json</option>
              <option value="src/data/demos.json">src/data/demos.json</option>
              <option value="src/data/blog.json">src/data/blog.json</option>
            </select>
            <button
              className="ad-btn ad-btn-primary ad-btn-sm"
              disabled={!connected || saving}
              onClick={() => {
                try {
                  const parsed = JSON.parse(rawText);
                  const m: Record<string, [string | undefined, (s: string) => void]> = {
                    "src/data/info.json": [infoSha, setInfoSha],
                    "src/data/services.json": [servicesSha, setServicesSha],
                    "src/data/images.json": [imagesSha, setImagesSha],
                    "src/data/demos.json": [demosSha, setDemosSha],
                    "src/data/blog.json": [blogSha, setBlogSha],
                  };
                  void save(rawTarget, parsed, m[rawTarget][0], m[rawTarget][1]);
                } catch {
                  onToast("err", "Invalid JSON.");
                }
              }}
            >
              Commit raw JSON
            </button>
          </div>
          <textarea className="ad-textarea" rows={20} spellCheck={false} value={rawText} onChange={(e) => setRawText(e.target.value)} />
        </div>
      )}
    </div>
  );
}
