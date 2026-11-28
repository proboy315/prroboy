import { useEffect, useState } from "react";
import {
  extractIndexHtmlSeo,
  fileToBase64,
  getRepoFile,
  putRepoFile,
  syncIndexHtmlSeo,
} from "../../lib/githubApi";
import type { GitHubConfig, SeoHtmlSyncInput } from "../../lib/githubApi";
import infoLocal from "../../data/info.json";
import Icon from "../Icon";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

export default function AdminSeoTab({ cfg, connected, onToast, onRepoChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);

  const [infoObj, setInfoObj] = useState<typeof infoLocal>(infoLocal);
  const [infoSha, setInfoSha] = useState<string | undefined>(undefined);
  const [indexHtml, setIndexHtml] = useState("");
  const [indexSha, setIndexSha] = useState<string | undefined>(undefined);

  const [robotsTxt, setRobotsTxt] = useState("");
  const [robotsSha, setRobotsSha] = useState<string | undefined>(undefined);
  const [vercelJson, setVercelJson] = useState("");
  const [vercelSha, setVercelSha] = useState<string | undefined>(undefined);

  const [ogPreviewDataUrl, setOgPreviewDataUrl] = useState("");
  const [portraitPreviewDataUrl, setPortraitPreviewDataUrl] = useState("");
  const [commitMsg, setCommitMsg] = useState("Update SEO, OG tags & social metadata via Admin");

  const [seo, setSeo] = useState<SeoHtmlSyncInput>({
    title: infoLocal.seo.title,
    description: infoLocal.seo.description,
    siteUrl: infoLocal.siteUrl,
    ogType: "profile",
    ogSiteName: `${infoLocal.name} / ${infoLocal.brand}`,
    ogTitle: infoLocal.seo.title,
    ogDescription: infoLocal.seo.description,
    ogImage: infoLocal.seo.ogImage || "/images/og-shahan-ali.jpg",
    ogImageAlt: `${infoLocal.name} (${infoLocal.brand}), developer from Burewala, Pakistan`,
    ogImageWidth: "1200",
    ogImageHeight: "630",
    ogLocale: "en_US",
    twitterCard: "summary_large_image",
    twitterSite: "@itx_proboy",
    twitterCreator: "@itx_proboy",
    twitterTitle: infoLocal.seo.title,
    twitterDescription: infoLocal.seo.description,
    twitterImage: infoLocal.seo.ogImage || "/images/og-shahan-ali.jpg",
    robots: "index, follow",
    googleVerification: "",
    themeColor: "#07070a",
    geoRegion: infoLocal.geo?.region || "PK-PB",
    geoPlacename: infoLocal.geo?.placename || "Burewala",
    geoPosition: `${infoLocal.geo?.lat || 30.1667};${infoLocal.geo?.lng || 72.6833}`,
    preloadPortrait: infoLocal.profileImage || "/images/shahan-ali-portrait.jpg",
  });

  const [portraitPath, setPortraitPath] = useState(infoLocal.profileImage || "/images/shahan-ali-portrait.jpg");
  const [portraitAlt, setPortraitAlt] = useState(infoLocal.portrait?.alt || "");
  const [portraitUpload, setPortraitUpload] = useState<{ path: string; width: number; height: number }>();

  const loadFromGitHub = async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const [infoFile, htmlFile, robotsFile, vercelFile] = await Promise.all([
        getRepoFile(cfg, "src/data/info.json"),
        getRepoFile(cfg, "index.html"),
        getRepoFile(cfg, "public/robots.txt").catch(() => null),
        getRepoFile(cfg, "vercel.json").catch(() => null),
      ]);
      const parsedInfo = JSON.parse(infoFile.content) as typeof infoLocal;
      setInfoObj(parsedInfo);
      setInfoSha(infoFile.sha);
      setIndexHtml(htmlFile.content);
      setIndexSha(htmlFile.sha);
      if (robotsFile) {
        setRobotsTxt(robotsFile.content);
        setRobotsSha(robotsFile.sha);
      }
      if (vercelFile) {
        setVercelJson(vercelFile.content);
        setVercelSha(vercelFile.sha);
      }
      const extracted = extractIndexHtmlSeo(htmlFile.content);
      setPortraitPath(parsedInfo.profileImage || "");
      setPortraitAlt(parsedInfo.portrait?.alt || "");
      setSeo((prev) => ({
        ...prev,
        title: parsedInfo.seo?.title || extracted.title || prev.title,
        description: parsedInfo.seo?.description || extracted.description || prev.description,
        siteUrl: parsedInfo.siteUrl || prev.siteUrl,
        ogType: extracted.ogType || "profile",
        ogSiteName: extracted.ogSiteName || `${parsedInfo.name} / ${parsedInfo.brand}`,
        ogTitle: extracted.ogTitle || parsedInfo.seo?.title || prev.ogTitle,
        ogDescription: extracted.ogDescription || parsedInfo.seo?.description || prev.ogDescription,
        ogImage: parsedInfo.seo?.ogImage || extracted.ogImage || "/images/og-shahan-ali.jpg",
        ogImageAlt: extracted.ogImageAlt || prev.ogImageAlt,
        ogImageWidth: extracted.ogImageWidth || "1200",
        ogImageHeight: extracted.ogImageHeight || "630",
        ogLocale: extracted.ogLocale || "en_US",
        twitterCard: extracted.twitterCard || "summary_large_image",
        twitterSite: extracted.twitterSite || "@itx_proboy",
        twitterCreator: extracted.twitterCreator || "@itx_proboy",
        twitterTitle: extracted.twitterTitle || parsedInfo.seo?.title || prev.twitterTitle,
        twitterDescription: extracted.twitterDescription || parsedInfo.seo?.description || prev.twitterDescription,
        twitterImage: extracted.twitterImage || parsedInfo.seo?.ogImage || "/images/og-shahan-ali.jpg",
        robots: extracted.robots || "index, follow",
        googleVerification: extracted.googleVerification || "",
        themeColor: extracted.themeColor || "#07070a",
        geoRegion: parsedInfo.geo?.region || extracted.geoRegion || "PK-PB",
        geoPlacename: parsedInfo.geo?.placename || extracted.geoPlacename || "Burewala",
        geoPosition: `${parsedInfo.geo?.lat || 30.1667};${parsedInfo.geo?.lng || 72.6833}`,
        preloadPortrait: parsedInfo.profileImage || "",
      }));
      onToast("ok", "Live SEO, index.html, robots.txt & info.json loaded from GitHub.");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to load SEO files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) void loadFromGitHub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  const handleSaveSeo = async () => {
    if (!connected) {
      onToast("err", "Unlock your vault & connect first.");
      return;
    }
    setSaving(true);
    try {
      const [latStr, lngStr] = seo.geoPosition.split(";").map((x) => x.trim());
      const updatedInfo = {
        ...infoObj,
        siteUrl: seo.siteUrl.trim().replace(/\/$/, ""),
        profileImage: portraitPath.trim(),
        portrait: {
          ...infoObj.portrait,
          alt: portraitAlt.trim(),
          ...(portraitUpload && portraitUpload.path === portraitPath.trim()
            ? { width: portraitUpload.width, height: portraitUpload.height }
            : {}),
        },
        geo: {
          ...infoObj.geo,
          lat: Number(latStr) || infoObj.geo.lat,
          lng: Number(lngStr) || infoObj.geo.lng,
          region: seo.geoRegion.trim(),
          placename: seo.geoPlacename.trim(),
        },
        seo: {
          ...infoObj.seo,
          title: seo.title.trim(),
          description: seo.description.trim(),
          ogImage: seo.ogImage.trim(),
        },
      };
      const nextHtml = indexHtml ? syncIndexHtmlSeo(indexHtml, { ...seo, preloadPortrait: portraitPath.trim() }) : "";
      const infoRes = await putRepoFile(cfg, "src/data/info.json", JSON.stringify(updatedInfo, null, 2) + "\n", commitMsg, {
        sha: infoSha,
      });
      setInfoObj(updatedInfo);
      setInfoSha(infoRes.sha);
      if (nextHtml) {
        const htmlRes = await putRepoFile(cfg, "index.html", nextHtml, commitMsg, { sha: indexSha });
        setIndexHtml(nextHtml);
        setIndexSha(htmlRes.sha);
      }
      onToast("ok", "SEO + OG tags committed to GitHub. Vercel will redeploy automatically.");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to save SEO.");
    } finally {
      setSaving(false);
    }
  };

  const uploadOg = async (file?: File) => {
    if (!file || !connected) return;
    setUploadingOg(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safe = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-_]+/g, "-") || "og-image";
      const ghPath = `public/images/${safe}.${ext}`;
      const pub = `/images/${safe}.${ext}`;
      await putRepoFile(cfg, ghPath, await fileToBase64(file), `Upload OG image ${ghPath}`, { isBase64: true });
      const r = new FileReader();
      r.onload = () => setOgPreviewDataUrl(String(r.result || ""));
      r.readAsDataURL(file);
      setSeo((p) => ({ ...p, ogImage: pub, twitterImage: pub }));
      onToast("ok", `Uploaded ${ghPath}. Press Save to link it in info.json + index.html.`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "OG upload failed.");
    } finally {
      setUploadingOg(false);
    }
  };

  const uploadPortrait = async (file?: File) => {
    if (!file || !connected) return;
    setUploadingPortrait(true);
    try {
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[file.type];
      if (!ext || file.size > 15 * 1024 * 1024) throw new Error("Choose a JPEG, PNG, WebP or AVIF image under 15 MB.");
      const bitmap = await createImageBitmap(file);
      const { width, height } = bitmap;
      bitmap.close();
      const bytes = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      const fingerprint = Array.from(new Uint8Array(bytes).slice(0, 6), byte => byte.toString(16).padStart(2, "0")).join("");
      const pub = `/images/shahan-ali-portrait-${fingerprint}.${ext}`;
      const ghPath = `public${pub}`;
      await putRepoFile(cfg, ghPath, await fileToBase64(file), `Upload portrait ${ghPath}`, { isBase64: true });
      const r = new FileReader();
      r.onload = () => setPortraitPreviewDataUrl(String(r.result || ""));
      r.readAsDataURL(file);
      setPortraitPath(pub);
      setPortraitUpload({ path: pub, width, height });
      onToast("ok", `Portrait uploaded. Press Save to store the path.`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Portrait upload failed.");
    } finally {
      setUploadingPortrait(false);
    }
  };

  const saveExtra = async (path: string, content: string, sha: string | undefined, setS: (s: string) => void) => {
    if (!connected) return;
    setSaving(true);
    try {
      const res = await putRepoFile(cfg, path, content, `Update ${path} via Admin`, { sha });
      setS(res.sha);
      onToast("ok", `${path} saved.`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : `Failed to save ${path}`);
    } finally {
      setSaving(false);
    }
  };

  const ogSrc = ogPreviewDataUrl || seo.ogImage;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ad-card">
        <div className="ad-card-head">
          <div>
            <span className="ad-pill ad-pill-red">SEO · Open Graph · Twitter</span>
            <h2 className="ad-card-title" style={{ marginTop: 10, fontSize: 20 }}>
              Search &amp; Social Preview Control
            </h2>
            <p className="ad-card-sub">
              One save updates <code>src/data/info.json</code> + <code>index.html</code> (static, prerender &amp; runtime tags).
            </p>
          </div>
          <div className="ad-row" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button className="ad-btn ad-btn-sm" onClick={loadFromGitHub} disabled={!connected || loading}>
              <Icon name="refresh" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Pull
            </button>
            <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={handleSaveSeo} disabled={!connected || saving}>
              <Icon name="save" className="w-4 h-4" /> {saving ? "Pushing…" : "Save & Push"}
            </button>
          </div>
        </div>

        <div className="ad-grid-2">
          <div className="ad-item" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="ad-brand-sub">Google preview</p>
              <div style={{ marginTop: 10, background: "#080c15", border: "1px solid #1c2742", borderRadius: 12, padding: 14 }}>
                <p style={{ fontSize: 11, color: "#7c86a3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {seo.siteUrl || "https://…"}/
                </p>
                <p style={{ color: "#7aa2ff", fontSize: 16, fontWeight: 600, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {seo.title}
                </p>
                <p style={{ color: "#9aa3bd", fontSize: 12, marginTop: 4, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {seo.description}
                </p>
              </div>
              <p className="ad-hint">Title {seo.title.length}/60 · Description {seo.description.length}/160</p>
            </div>
          </div>
          <div className="ad-item" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="ad-brand-sub">OG / WhatsApp / X card</p>
              <div style={{ marginTop: 10, border: "1px solid #1c2742", borderRadius: 12, overflow: "hidden", background: "#080c15" }}>
                <div style={{ aspectRatio: "1200/630", maxHeight: 170, overflow: "hidden", background: "#131a2b", display: "grid", placeItems: "center" }}>
                  {ogSrc ? <img src={ogSrc} alt={seo.ogImageAlt} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 12, color: "#5b657f" }}>No OG image</span>}
                </div>
                <div style={{ padding: 12 }}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#7c86a3" }}>{seo.ogSiteName}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seo.ogTitle || seo.title}</p>
                  <p style={{ fontSize: 12, color: "#9aa3bd", marginTop: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{seo.ogDescription || seo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ad-grid-2">
        <div className="ad-card">
          <h3 className="ad-card-title">Core meta &amp; verification</h3>
          <p className="ad-card-sub">Canonical URL, robots, theme color, Google verification, geo tags.</p>
          <div className="ad-list" style={{ marginTop: 14 }}>
            <div className="ad-field" style={{ marginTop: 0 }}>
              <label className="ad-label">Canonical site URL</label>
              <input className="ad-input" value={seo.siteUrl} onChange={(e) => setSeo({ ...seo, siteUrl: e.target.value })} placeholder="https://example.com" autoComplete="off" spellCheck={false} />
            </div>
            <div className="ad-field" style={{ marginTop: 0 }}>
              <label className="ad-label">Default page title</label>
              <input className="ad-input" value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} autoComplete="off" />
            </div>
            <div className="ad-field" style={{ marginTop: 0 }}>
              <label className="ad-label">Meta description</label>
              <textarea className="ad-input" rows={3} value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} autoComplete="off" />
            </div>
            <div className="ad-form-grid">
              <div>
                <label className="ad-label">Robots</label>
                <select className="ad-select" value={seo.robots} onChange={(e) => setSeo({ ...seo, robots: e.target.value })}>
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
              <div>
                <label className="ad-label">Theme color</label>
                <input className="ad-input" value={seo.themeColor} onChange={(e) => setSeo({ ...seo, themeColor: e.target.value })} />
              </div>
            </div>
            <div className="ad-field" style={{ marginTop: 0 }}>
              <label className="ad-label">Google site-verification code</label>
              <input className="ad-input ad-mono" value={seo.googleVerification} onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })} autoComplete="off" spellCheck={false} />
            </div>
            <div className="ad-form-grid-3">
              <div>
                <label className="ad-label">Geo region</label>
                <input className="ad-input" value={seo.geoRegion} onChange={(e) => setSeo({ ...seo, geoRegion: e.target.value })} />
              </div>
              <div>
                <label className="ad-label">Geo place</label>
                <input className="ad-input" value={seo.geoPlacename} onChange={(e) => setSeo({ ...seo, geoPlacename: e.target.value })} />
              </div>
              <div>
                <label className="ad-label">Lat;Lng</label>
                <input className="ad-input" value={seo.geoPosition} onChange={(e) => setSeo({ ...seo, geoPosition: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        <div className="ad-card">
          <h3 className="ad-card-title">Open Graph &amp; Twitter cards</h3>
          <p className="ad-card-sub">WhatsApp, Facebook, LinkedIn &amp; X unfurls read these tags.</p>
          <div className="ad-list" style={{ marginTop: 14 }}>
            <div className="ad-form-grid">
              <div>
                <label className="ad-label">og:type</label>
                <select className="ad-select" value={seo.ogType} onChange={(e) => setSeo({ ...seo, ogType: e.target.value })}>
                  <option value="profile">profile</option>
                  <option value="website">website</option>
                  <option value="article">article</option>
                </select>
              </div>
              <div>
                <label className="ad-label">og:site_name</label>
                <input className="ad-input" value={seo.ogSiteName} onChange={(e) => setSeo({ ...seo, ogSiteName: e.target.value })} />
              </div>
            </div>
            <div className="ad-field" style={{ marginTop: 0 }}>
              <label className="ad-label">og:title</label>
              <input className="ad-input" value={seo.ogTitle} onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })} />
            </div>
            <div className="ad-field" style={{ marginTop: 0 }}>
              <label className="ad-label">og:description</label>
              <textarea className="ad-input" rows={2} value={seo.ogDescription} onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })} />
            </div>
            <div className="ad-field" style={{ marginTop: 0 }}>
              <label className="ad-label">og:image path / URL</label>
              <div className="ad-row">
                <input className="ad-input ad-mono" style={{ flex: 1 }} value={seo.ogImage} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value, twitterImage: e.target.value })} autoComplete="off" spellCheck={false} />
                <label className="ad-btn ad-btn-sm" style={{ cursor: "pointer" }}>
                  <Icon name="upload" className="w-4 h-4" /> {uploadingOg ? "…" : "Upload"}
                  <input type="file" accept="image/*" hidden disabled={!connected || uploadingOg} onChange={(e) => { void uploadOg(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              </div>
            </div>
            <div className="ad-form-grid-3">
              <div>
                <label className="ad-label">og:locale</label>
                <input className="ad-input" value={seo.ogLocale} onChange={(e) => setSeo({ ...seo, ogLocale: e.target.value })} />
              </div>
              <div>
                <label className="ad-label">Width</label>
                <input className="ad-input" value={seo.ogImageWidth} onChange={(e) => setSeo({ ...seo, ogImageWidth: e.target.value })} />
              </div>
              <div>
                <label className="ad-label">Height</label>
                <input className="ad-input" value={seo.ogImageHeight} onChange={(e) => setSeo({ ...seo, ogImageHeight: e.target.value })} />
              </div>
            </div>
            <div className="ad-field" style={{ marginTop: 0 }}>
              <label className="ad-label">og:image:alt</label>
              <input className="ad-input" value={seo.ogImageAlt} onChange={(e) => setSeo({ ...seo, ogImageAlt: e.target.value })} />
            </div>
            <div className="ad-form-grid-3">
              <div>
                <label className="ad-label">twitter:card</label>
                <select className="ad-select" value={seo.twitterCard} onChange={(e) => setSeo({ ...seo, twitterCard: e.target.value })}>
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="summary">summary</option>
                </select>
              </div>
              <div>
                <label className="ad-label">twitter:site</label>
                <input className="ad-input" value={seo.twitterSite} onChange={(e) => setSeo({ ...seo, twitterSite: e.target.value })} />
              </div>
              <div>
                <label className="ad-label">twitter:creator</label>
                <input className="ad-input" value={seo.twitterCreator} onChange={(e) => setSeo({ ...seo, twitterCreator: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ad-card">
        <div className="ad-card-head">
          <div>
            <h3 className="ad-card-title">Hero portrait</h3>
            <p className="ad-card-sub">Uploads straight to <code>public/images/</code> and stores the path in <code>profileImage</code>.</p>
          </div>
          <label className="ad-btn ad-btn-sm" style={{ cursor: "pointer" }}>
            <Icon name="upload" className="w-4 h-4" /> {uploadingPortrait ? "Uploading…" : "Upload portrait"}
            <input type="file" accept="image/*" hidden disabled={!connected || uploadingPortrait} onChange={(e) => { void uploadPortrait(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
        <div className="ad-form-grid-3" style={{ alignItems: "center" }}>
          <div style={{ height: 110, borderRadius: 12, overflow: "hidden", border: "1px solid #223047", background: "#080c15", display: "grid", placeItems: "center" }}>
            {portraitPreviewDataUrl || portraitPath ? <img src={portraitPreviewDataUrl || portraitPath} alt="Portrait" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 12, color: "#5b657f" }}>No portrait</span>}
          </div>
          <div>
            <label className="ad-label">profileImage path</label>
            <input className="ad-input ad-mono" value={portraitPath} onChange={(e) => setPortraitPath(e.target.value)} autoComplete="off" spellCheck={false} />
          </div>
          <div>
            <label className="ad-label">portrait.alt</label>
            <input className="ad-input" value={portraitAlt} onChange={(e) => setPortraitAlt(e.target.value)} />
          </div>
        </div>
        <div className="ad-row" style={{ marginTop: 16, flexWrap: "wrap" }}>
          <input className="ad-input ad-mono" style={{ flex: 1, minWidth: 220 }} value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)} placeholder="Commit message" autoComplete="off" />
          <button className="ad-btn ad-btn-primary" onClick={handleSaveSeo} disabled={!connected || saving}>
            <Icon name="save" className="w-4 h-4" /> {saving ? "Pushing…" : "Save SEO & Push"}
          </button>
        </div>
      </div>

      <div className="ad-grid-2">
        <div className="ad-card">
          <div className="ad-card-head">
            <h3 className="ad-card-title">public/robots.txt</h3>
            <button className="ad-btn ad-btn-sm" disabled={!connected || saving} onClick={() => saveExtra("public/robots.txt", robotsTxt, robotsSha, setRobotsSha)}>Save</button>
          </div>
          <textarea className="ad-textarea" rows={7} value={robotsTxt} onChange={(e) => setRobotsTxt(e.target.value)} spellCheck={false} />
        </div>
        <div className="ad-card">
          <div className="ad-card-head">
            <h3 className="ad-card-title">vercel.json</h3>
            <button className="ad-btn ad-btn-sm" disabled={!connected || saving} onClick={() => saveExtra("vercel.json", vercelJson, vercelSha, setVercelSha)}>Save</button>
          </div>
          <textarea className="ad-textarea" rows={7} value={vercelJson} onChange={(e) => setVercelJson(e.target.value)} spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
