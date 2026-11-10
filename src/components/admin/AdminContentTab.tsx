import { useEffect, useState } from "react";
import infoLocal from "../../data/info.json";
import servicesLocal from "../../data/services.json";
import imagesLocal from "../../data/images.json";
import demosLocal from "../../data/demos.json";
import blogLocal from "../../data/blog.json";
import { fileToBase64, getRepoFile, putRepoFile } from "../../lib/githubApi";
import type { GitHubConfig } from "../../lib/githubApi";
import Icon from "../Icon";
import { LiquidButton, LiquidCard, LiquidDock, LiquidPill } from "../LiquidGlass";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

type SubTab = "profile" | "socials" | "faq" | "services" | "gallery" | "demos" | "blog" | "raw";

export default function AdminContentTab({ cfg, connected, onToast, onRepoChange }: Props) {
  const [sub, setSub] = useState<SubTab>("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [infoData, setInfoData] = useState<typeof infoLocal>(infoLocal);
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

  const pullAll = async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const [fInfo, fSvc, fImg, fDemo, fBlog] = await Promise.all([
        getRepoFile(cfg, "src/data/info.json"),
        getRepoFile(cfg, "src/data/services.json"),
        getRepoFile(cfg, "src/data/images.json"),
        getRepoFile(cfg, "src/data/demos.json"),
        getRepoFile(cfg, "src/data/blog.json"),
      ]);
      const pInfo = JSON.parse(fInfo.content);
      setInfoData(pInfo);
      setInfoSha(fInfo.sha);
      setServicesData(JSON.parse(fSvc.content));
      setServicesSha(fSvc.sha);
      setImagesData(JSON.parse(fImg.content));
      setImagesSha(fImg.sha);
      setDemosData(JSON.parse(fDemo.content));
      setDemosSha(fDemo.sha);
      setBlogData(JSON.parse(fBlog.content));
      setBlogSha(fBlog.sha);
      setRawText(JSON.stringify(pInfo, null, 2));
      onToast("ok", "Pulled all src/data/*.json files from GitHub.");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to load data files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) void pullAll();
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  const saveJsonFile = async (
    path: string,
    data: unknown,
    sha: string | undefined,
    setSha: (s: string) => void
  ) => {
    if (!connected) {
      onToast("err", "Connect your GitHub repository first.");
      return;
    }
    setSaving(true);
    try {
      const res = await putRepoFile(
        cfg,
        path,
        JSON.stringify(data, null, 2) + "\n",
        `Update ${path} via Admin Panel`,
        { sha }
      );
      setSha(res.sha);
      onToast("ok", `${path} pushed to GitHub!`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : `Failed to save ${path}`);
    } finally {
      setSaving(false);
    }
  };

  const uploadGalleryImage = async (file: File | undefined) => {
    if (!file || !connected) return;
    setSaving(true);
    try {
      const safe = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
      const ghPath = `public/images/${safe}`;
      const b64 = await fileToBase64(file);
      await putRepoFile(cfg, ghPath, b64, `Upload gallery image ${ghPath}`, { isBase64: true });
      setImagesData((prev) => [
        ...prev,
        {
          src: `/images/${safe}`,
          alt: file.name.replace(/\.[^.]+$/, ""),
          caption: file.name.replace(/\.[^.]+$/, ""),
          category: "Portfolio",
          order: prev.length + 1,
          width: 1200,
          height: 800,
        },
      ]);
      onToast("ok", `Uploaded ${ghPath}! Click "Save Gallery" to commit images.json.`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const syncRawSelector = (path: string) => {
    setRawTarget(path);
    const map: Record<string, unknown> = {
      "src/data/info.json": infoData,
      "src/data/services.json": servicesData,
      "src/data/images.json": imagesData,
      "src/data/demos.json": demosData,
      "src/data/blog.json": blogData,
    };
    setRawText(JSON.stringify(map[path], null, 2));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <LiquidPill crimson>Site Content &amp; Data Control</LiquidPill>
          <h2 className="mt-2 text-2xl font-bold text-white">Profile, Services, Gallery, Demos &amp; Blog</h2>
          <p className="text-sm text-zinc-400">
            Full control over every section on your portfolio backed by <code className="text-zinc-200">src/data/*.json</code>.
          </p>
        </div>
        <LiquidButton onClick={pullAll} disabled={!connected || loading}>
          <Icon name="refresh" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Pull All Data
        </LiquidButton>
      </div>

      <LiquidDock>
        {(
          [
            ["profile", "Profile & Hero"],
            ["socials", "Socials, Nav & Stats"],
            ["faq", "Reviews, FAQ & Intro"],
            ["services", "Services"],
            ["gallery", "Gallery"],
            ["demos", "Demos"],
            ["blog", "Blog"],
            ["raw", "Raw JSON"],
          ] as [SubTab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSub(id)}
            className={`lg-tab ${sub === id ? "is-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </LiquidDock>

      {sub === "profile" && (
        <LiquidCard className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Identity, Hero &amp; Contact</h3>
            <LiquidButton
              variant="primary"
              disabled={!connected || saving}
              onClick={() => saveJsonFile("src/data/info.json", infoData, infoSha, setInfoSha)}
            >
              <Icon name="save" className="w-4 h-4" /> Save info.json
            </LiquidButton>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Full Name</label>
              <input
                className="lg-input"
                value={infoData.name}
                onChange={(e) => setInfoData({ ...infoData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Brand</label>
              <input
                className="lg-input"
                value={infoData.brand}
                onChange={(e) => setInfoData({ ...infoData, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Handle</label>
              <input
                className="lg-input"
                value={infoData.handle}
                onChange={(e) => setInfoData({ ...infoData, handle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Greeting</label>
              <input
                className="lg-input"
                value={infoData.greeting}
                onChange={(e) => setInfoData({ ...infoData, greeting: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Primary Role</label>
              <input
                className="lg-input"
                value={infoData.role}
                onChange={(e) => setInfoData({ ...infoData, role: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Availability Badge</label>
              <input
                className="lg-input"
                value={infoData.availability}
                onChange={(e) => setInfoData({ ...infoData, availability: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
              <input
                className="lg-input"
                value={infoData.email}
                onChange={(e) => setInfoData({ ...infoData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Phone</label>
              <input
                className="lg-input"
                value={infoData.phone}
                onChange={(e) => setInfoData({ ...infoData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">WhatsApp Link</label>
              <input
                className="lg-input"
                value={infoData.whatsapp}
                onChange={(e) => setInfoData({ ...infoData, whatsapp: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Location</label>
              <input
                className="lg-input"
                value={infoData.location}
                onChange={(e) => setInfoData({ ...infoData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">GitHub Profile URL</label>
              <input
                className="lg-input"
                value={infoData.github}
                onChange={(e) => setInfoData({ ...infoData, github: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Resume / CV Path (optional)</label>
              <input
                className="lg-input"
                value={infoData.resume}
                onChange={(e) => setInfoData({ ...infoData, resume: e.target.value })}
                placeholder="/resume.pdf"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Hero Description</label>
              <textarea
                rows={2}
                className="lg-input"
                value={infoData.heroDescription}
                onChange={(e) => setInfoData({ ...infoData, heroDescription: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Hero Emphasis</label>
              <textarea
                rows={2}
                className="lg-input"
                value={infoData.heroEmphasis}
                onChange={(e) => setInfoData({ ...infoData, heroEmphasis: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Aliases (comma separated)</label>
              <input
                className="lg-input"
                value={infoData.aliases.join(", ")}
                onChange={(e) =>
                  setInfoData({
                    ...infoData,
                    aliases: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Education Line</label>
              <input
                className="lg-input"
                value={infoData.education}
                onChange={(e) => setInfoData({ ...infoData, education: e.target.value })}
              />
            </div>
          </div>
        </LiquidCard>
      )}

      {sub === "socials" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <LiquidCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Social Links</h3>
              <div className="flex gap-2">
                <LiquidButton
                  onClick={() =>
                    setInfoData({
                      ...infoData,
                      socials: [...infoData.socials, { id: "globe", label: "Website", url: "" }],
                    })
                  }
                >
                  + Add
                </LiquidButton>
                <LiquidButton
                  variant="primary"
                  disabled={!connected || saving}
                  onClick={() => saveJsonFile("src/data/info.json", infoData, infoSha, setInfoSha)}
                >
                  Save
                </LiquidButton>
              </div>
            </div>
            <div className="space-y-2.5">
              {infoData.socials.map((s, idx) => (
                <div key={idx} className="grid grid-cols-[110px_120px_1fr_auto] gap-2 items-center">
                  <input
                    className="lg-input text-xs"
                    value={s.id}
                    placeholder="icon id"
                    onChange={(e) =>
                      setInfoData({
                        ...infoData,
                        socials: infoData.socials.map((x, i) => (i === idx ? { ...x, id: e.target.value } : x)),
                      })
                    }
                  />
                  <input
                    className="lg-input text-xs"
                    value={s.label}
                    placeholder="Label"
                    onChange={(e) =>
                      setInfoData({
                        ...infoData,
                        socials: infoData.socials.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                      })
                    }
                  />
                  <input
                    className="lg-input text-xs"
                    value={s.url}
                    placeholder="https://... (empty = hidden)"
                    onChange={(e) =>
                      setInfoData({
                        ...infoData,
                        socials: infoData.socials.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)),
                      })
                    }
                  />
                  <LiquidButton
                    onClick={() =>
                      setInfoData({
                        ...infoData,
                        socials: infoData.socials.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    ✕
                  </LiquidButton>
                </div>
              ))}
            </div>
          </LiquidCard>

          <LiquidCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Hero Stats &amp; Navigation</h3>
              <LiquidButton
                variant="primary"
                disabled={!connected || saving}
                onClick={() => saveJsonFile("src/data/info.json", infoData, infoSha, setInfoSha)}
              >
                Save info.json
              </LiquidButton>
            </div>
            <div className="space-y-2.5">
              {infoData.stats.map((st, idx) => (
                <div key={idx} className="grid grid-cols-[110px_1fr] gap-2">
                  <input
                    className="lg-input text-xs font-bold"
                    value={st.value}
                    onChange={(e) =>
                      setInfoData({
                        ...infoData,
                        stats: infoData.stats.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)),
                      })
                    }
                  />
                  <input
                    className="lg-input text-xs"
                    value={st.label}
                    onChange={(e) =>
                      setInfoData({
                        ...infoData,
                        stats: infoData.stats.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 space-y-2">
              <p className="text-xs text-zinc-400">Header Nav Links</p>
              {infoData.nav.map((n, idx) => (
                <div key={n.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    className="lg-input text-xs"
                    value={n.label}
                    onChange={(e) =>
                      setInfoData({
                        ...infoData,
                        nav: infoData.nav.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                      })
                    }
                  />
                  <input
                    className="lg-input text-xs font-mono"
                    value={n.href}
                    onChange={(e) =>
                      setInfoData({
                        ...infoData,
                        nav: infoData.nav.map((x, i) => (i === idx ? { ...x, href: e.target.value } : x)),
                      })
                    }
                  />
                  <label className="text-xs text-zinc-300 flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={n.header}
                      onChange={(e) =>
                        setInfoData({
                          ...infoData,
                          nav: infoData.nav.map((x, i) => (i === idx ? { ...x, header: e.target.checked } : x)),
                        })
                      }
                    />
                    Top
                  </label>
                </div>
              ))}
            </div>
          </LiquidCard>
        </div>
      )}

      {sub === "faq" && (
        <div className="space-y-6">
          <LiquidCard className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white">Intro Animation &amp; Analytics</h3>
              <LiquidButton
                variant="primary"
                disabled={!connected || saving}
                onClick={() => saveJsonFile("src/data/info.json", infoData, infoSha, setInfoSha)}
              >
                Save info.json
              </LiquidButton>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={infoData.introAnimation.enabled}
                  onChange={(e) =>
                    setInfoData({
                      ...infoData,
                      introAnimation: { ...infoData.introAnimation, enabled: e.target.checked },
                    })
                  }
                />
                Enable Intro Animation
              </label>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Intro Policy</label>
                <select
                  className="lg-input text-xs"
                  value={infoData.introAnimation.policy}
                  onChange={(e) =>
                    setInfoData({
                      ...infoData,
                      introAnimation: { ...infoData.introAnimation, policy: e.target.value },
                    })
                  }
                >
                  <option value="session">session</option>
                  <option value="once">once</option>
                  <option value="always">always</option>
                  <option value="never">never</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">GA4 Measurement ID</label>
                <input
                  className="lg-input text-xs"
                  value={infoData.analytics.gaMeasurementId}
                  onChange={(e) =>
                    setInfoData({
                      ...infoData,
                      analytics: { ...infoData.analytics, gaMeasurementId: e.target.value },
                    })
                  }
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Clarity Project ID</label>
                <input
                  className="lg-input text-xs"
                  value={infoData.analytics.clarityProjectId}
                  onChange={(e) =>
                    setInfoData({
                      ...infoData,
                      analytics: { ...infoData.analytics, clarityProjectId: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </LiquidCard>

          <LiquidCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">FAQ Items ({infoData.faq.length})</h3>
              <div className="flex gap-2">
                <LiquidButton
                  onClick={() =>
                    setInfoData({
                      ...infoData,
                      faq: [...infoData.faq, { q: "New question?", a: "Answer here." }],
                    })
                  }
                >
                  + Add FAQ
                </LiquidButton>
                <LiquidButton
                  variant="primary"
                  disabled={!connected || saving}
                  onClick={() => saveJsonFile("src/data/info.json", infoData, infoSha, setInfoSha)}
                >
                  Save FAQ
                </LiquidButton>
              </div>
            </div>
            <div className="space-y-4">
              {infoData.faq.map((f, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="lg-input font-semibold"
                      value={f.q}
                      onChange={(e) =>
                        setInfoData({
                          ...infoData,
                          faq: infoData.faq.map((x, i) => (i === idx ? { ...x, q: e.target.value } : x)),
                        })
                      }
                    />
                    <LiquidButton
                      onClick={() =>
                        setInfoData({ ...infoData, faq: infoData.faq.filter((_, i) => i !== idx) })
                      }
                    >
                      ✕
                    </LiquidButton>
                  </div>
                  <textarea
                    rows={2}
                    className="lg-input text-xs"
                    value={f.a}
                    onChange={(e) =>
                      setInfoData({
                        ...infoData,
                        faq: infoData.faq.map((x, i) => (i === idx ? { ...x, a: e.target.value } : x)),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </LiquidCard>
        </div>
      )}

      {sub === "services" && (
        <LiquidCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Services ({servicesData.length})</h3>
            <LiquidButton
              variant="primary"
              disabled={!connected || saving}
              onClick={() => saveJsonFile("src/data/services.json", servicesData, servicesSha, setServicesSha)}
            >
              <Icon name="save" className="w-4 h-4" /> Save services.json
            </LiquidButton>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {servicesData.map((svc, idx) => (
              <div key={svc.slug} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <input
                  className="lg-input font-semibold"
                  value={svc.title}
                  onChange={(e) =>
                    setServicesData(servicesData.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                  }
                />
                <input
                  className="lg-input text-xs"
                  value={svc.tagline}
                  onChange={(e) =>
                    setServicesData(servicesData.map((x, i) => (i === idx ? { ...x, tagline: e.target.value } : x)))
                  }
                />
                <textarea
                  rows={3}
                  className="lg-input text-xs"
                  value={svc.summary}
                  onChange={(e) =>
                    setServicesData(servicesData.map((x, i) => (i === idx ? { ...x, summary: e.target.value } : x)))
                  }
                />
              </div>
            ))}
          </div>
        </LiquidCard>
      )}

      {sub === "gallery" && (
        <LiquidCard className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white">Gallery Images ({imagesData.length})</h3>
            <div className="flex flex-wrap gap-2">
              <label className="lg-btn cursor-pointer">
                <Icon name="upload" className="w-4 h-4" /> Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!connected || saving}
                  onChange={(e) => {
                    void uploadGalleryImage(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <LiquidButton
                variant="primary"
                disabled={!connected || saving}
                onClick={() => saveJsonFile("src/data/images.json", imagesData, imagesSha, setImagesSha)}
              >
                <Icon name="save" className="w-4 h-4" /> Save Gallery
              </LiquidButton>
            </div>
          </div>
          <div className="space-y-3">
            {imagesData.map((img, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 grid sm:grid-cols-[120px_1fr_auto] gap-4 items-center">
                <img src={img.src} alt={img.alt} className="w-full h-20 object-cover rounded-lg border border-white/10" />
                <div className="space-y-2">
                  <input
                    className="lg-input text-xs font-mono"
                    value={img.src}
                    onChange={(e) =>
                      setImagesData(imagesData.map((x, i) => (i === idx ? { ...x, src: e.target.value } : x)))
                    }
                  />
                  <input
                    className="lg-input text-xs"
                    value={img.caption || ""}
                    placeholder="Caption"
                    onChange={(e) =>
                      setImagesData(imagesData.map((x, i) => (i === idx ? { ...x, caption: e.target.value } : x)))
                    }
                  />
                </div>
                <LiquidButton
                  onClick={() => setImagesData(imagesData.filter((_, i) => i !== idx))}
                >
                  <Icon name="trash" className="w-4 h-4 text-red-400" />
                </LiquidButton>
              </div>
            ))}
          </div>
        </LiquidCard>
      )}

      {sub === "demos" && (
        <LiquidCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Demos Registry ({demosData.demos.length})</h3>
            <LiquidButton
              variant="primary"
              disabled={!connected || saving}
              onClick={() => saveJsonFile("src/data/demos.json", demosData, demosSha, setDemosSha)}
            >
              <Icon name="save" className="w-4 h-4" /> Save demos.json
            </LiquidButton>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[540px] overflow-y-auto pr-1">
            {demosData.demos.map((d, idx) => (
              <div key={d.slug} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    className="lg-input text-xs font-semibold"
                    value={d.name}
                    onChange={(e) =>
                      setDemosData({
                        ...demosData,
                        demos: demosData.demos.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)),
                      })
                    }
                  />
                  <input
                    type="color"
                    value={d.accent}
                    onChange={(e) =>
                      setDemosData({
                        ...demosData,
                        demos: demosData.demos.map((x, i) => (i === idx ? { ...x, accent: e.target.value } : x)),
                      })
                    }
                    className="w-9 h-9 rounded-lg bg-transparent cursor-pointer"
                  />
                </div>
                <textarea
                  rows={2}
                  className="lg-input text-xs"
                  value={d.summary}
                  onChange={(e) =>
                    setDemosData({
                      ...demosData,
                      demos: demosData.demos.map((x, i) => (i === idx ? { ...x, summary: e.target.value } : x)),
                    })
                  }
                />
                <label className="inline-flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={Boolean(d.featured)}
                    onChange={(e) =>
                      setDemosData({
                        ...demosData,
                        demos: demosData.demos.map((x, i) => (i === idx ? { ...x, featured: e.target.checked } : x)),
                      })
                    }
                  />
                  Featured on Home
                </label>
              </div>
            ))}
          </div>
        </LiquidCard>
      )}

      {sub === "blog" && (
        <LiquidCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Blog Articles ({blogData.length})</h3>
            <div className="flex gap-2">
              <LiquidButton
                onClick={() =>
                  setBlogData([
                    ...blogData,
                    {
                      slug: `new-post-${blogData.length + 1}`,
                      title: "New Engineering Note",
                      summary: "Summary...",
                      publishedAt: new Date().toISOString().slice(0, 10),
                      updatedAt: new Date().toISOString().slice(0, 10),
                      category: "Engineering",
                      readingTime: "4 min read",
                      author: infoData.name,
                      tags: ["PROBOY"],
                      sections: [{ heading: "Overview", paragraphs: ["Write content here."] }],
                    },
                  ])
                }
              >
                + Add Post
              </LiquidButton>
              <LiquidButton
                variant="primary"
                disabled={!connected || saving}
                onClick={() => saveJsonFile("src/data/blog.json", blogData, blogSha, setBlogSha)}
              >
                <Icon name="save" className="w-4 h-4" /> Save blog.json
              </LiquidButton>
            </div>
          </div>
          <div className="space-y-4">
            {blogData.map((post, idx) => (
              <div key={post.slug + idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className="lg-input font-semibold"
                    value={post.title}
                    onChange={(e) =>
                      setBlogData(blogData.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                    }
                  />
                  <input
                    className="lg-input font-mono text-xs"
                    value={post.slug}
                    onChange={(e) =>
                      setBlogData(blogData.map((x, i) => (i === idx ? { ...x, slug: e.target.value } : x)))
                    }
                  />
                </div>
                <textarea
                  rows={2}
                  className="lg-input text-xs"
                  value={post.summary}
                  onChange={(e) =>
                    setBlogData(blogData.map((x, i) => (i === idx ? { ...x, summary: e.target.value } : x)))
                  }
                />
              </div>
            ))}
          </div>
        </LiquidCard>
      )}

      {sub === "raw" && (
        <LiquidCard className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              className="lg-input sm:w-72 font-mono text-xs"
              value={rawTarget}
              onChange={(e) => syncRawSelector(e.target.value)}
            >
              <option value="src/data/info.json">src/data/info.json</option>
              <option value="src/data/services.json">src/data/services.json</option>
              <option value="src/data/images.json">src/data/images.json</option>
              <option value="src/data/demos.json">src/data/demos.json</option>
              <option value="src/data/blog.json">src/data/blog.json</option>
            </select>
            <LiquidButton
              variant="primary"
              disabled={!connected || saving}
              onClick={async () => {
                try {
                  const parsed = JSON.parse(rawText);
                  const shaMap: Record<string, [string | undefined, (s: string) => void]> = {
                    "src/data/info.json": [infoSha, setInfoSha],
                    "src/data/services.json": [servicesSha, setServicesSha],
                    "src/data/images.json": [imagesSha, setImagesSha],
                    "src/data/demos.json": [demosSha, setDemosSha],
                    "src/data/blog.json": [blogSha, setBlogSha],
                  };
                  const [s, setS] = shaMap[rawTarget];
                  await saveJsonFile(rawTarget, parsed, s, setS);
                } catch (e) {
                  onToast("err", e instanceof Error ? e.message : "Invalid JSON");
                }
              }}
            >
              <Icon name="save" className="w-4 h-4" /> Commit Raw JSON
            </LiquidButton>
          </div>
          <textarea
            rows={20}
            spellCheck={false}
            className="lg-input font-mono text-xs leading-6"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </LiquidCard>
      )}
    </div>
  );
}
