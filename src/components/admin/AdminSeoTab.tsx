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
import { LiquidButton, LiquidCard, LiquidPill } from "../LiquidGlass";

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

  const [ogPreviewDataUrl, setOgPreviewDataUrl] = useState<string>("");
  const [portraitPreviewDataUrl, setPortraitPreviewDataUrl] = useState<string>("");
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
      onToast("ok", "Loaded live SEO, index.html, robots.txt & info.json from GitHub.");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to load SEO files from GitHub.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      void loadFromGitHub();
    }
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  const handleSaveSeo = async () => {
    if (!connected) {
      onToast("err", "Connect your GitHub repository & token first.");
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

      const nextHtml = indexHtml
        ? syncIndexHtmlSeo(indexHtml, { ...seo, preloadPortrait: portraitPath.trim() })
        : "";

      const infoRes = await putRepoFile(
        cfg,
        "src/data/info.json",
        JSON.stringify(updatedInfo, null, 2) + "\n",
        commitMsg || "Update SEO config in info.json",
        { sha: infoSha }
      );
      setInfoObj(updatedInfo);
      setInfoSha(infoRes.sha);

      if (nextHtml) {
        const htmlRes = await putRepoFile(
          cfg,
          "index.html",
          nextHtml,
          commitMsg || "Sync SEO & OG tags in index.html",
          { sha: indexSha }
        );
        setIndexHtml(nextHtml);
        setIndexSha(htmlRes.sha);
      }

      onToast("ok", "SEO, OG tags, Twitter cards & info.json committed to GitHub!");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to save SEO changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadOgImage = async (file?: File) => {
    if (!file || !connected) return;
    setUploadingOg(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = file.name
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-|-$/g, "") || "og-image";
      const targetPath = `public/images/${safeName}.${ext}`;
      const publicUrlPath = `/images/${safeName}.${ext}`;
      const b64 = await fileToBase64(file);

      await putRepoFile(cfg, targetPath, b64, `Upload OG image ${targetPath} via Admin`, {
        isBase64: true,
      });

      const reader = new FileReader();
      reader.onload = () => setOgPreviewDataUrl(String(reader.result || ""));
      reader.readAsDataURL(file);

      setSeo((prev) => ({
        ...prev,
        ogImage: publicUrlPath,
        twitterImage: publicUrlPath,
      }));
      onToast("ok", `Uploaded ${targetPath} to GitHub! Click "Save SEO & Push" to update info.json & index.html.`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to upload OG image.");
    } finally {
      setUploadingOg(false);
    }
  };

  const handleUploadPortrait = async (file?: File) => {
    if (!file || !connected) return;
    setUploadingPortrait(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const targetPath = `public/images/shahan-ali-portrait.${ext}`;
      const publicUrlPath = `/images/shahan-ali-portrait.${ext}`;
      const b64 = await fileToBase64(file);

      await putRepoFile(cfg, targetPath, b64, `Upload hero portrait ${targetPath} via Admin`, {
        isBase64: true,
      });

      const reader = new FileReader();
      reader.onload = () => setPortraitPreviewDataUrl(String(reader.result || ""));
      reader.readAsDataURL(file);

      setPortraitPath(publicUrlPath);
      onToast("ok", `Portrait uploaded to ${targetPath}! Click "Save SEO & Push" to save path in info.json.`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to upload portrait.");
    } finally {
      setUploadingPortrait(false);
    }
  };

  const handleSaveExtraFile = async (path: string, content: string, sha: string | undefined, onDone: (s: string) => void) => {
    if (!connected) return;
    setSaving(true);
    try {
      const res = await putRepoFile(cfg, path, content, `Update ${path} via Admin`, { sha });
      onDone(res.sha);
      onToast("ok", `${path} saved to GitHub!`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : `Failed to save ${path}`);
    } finally {
      setSaving(false);
    }
  };

  const previewOgSrc =
    ogPreviewDataUrl ||
    (seo.ogImage.startsWith("http") ? seo.ogImage : seo.ogImage);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <LiquidPill crimson>SEO · Open Graph · Twitter Cards</LiquidPill>
          <h2 className="mt-2 text-2xl font-bold text-white">SEO &amp; Social Media Meta Control</h2>
          <p className="text-sm text-zinc-400">
            Updates both <code className="text-zinc-200">src/data/info.json</code> and{" "}
            <code className="text-zinc-200">index.html</code> (static + prerendered + runtime OG tags).
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <LiquidButton onClick={loadFromGitHub} disabled={!connected || loading}>
            <Icon name="refresh" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Syncing..." : "Pull from GitHub"}
          </LiquidButton>
          <LiquidButton variant="primary" onClick={handleSaveSeo} disabled={!connected || saving}>
            <Icon name="save" className="w-4 h-4" />
            {saving ? "Pushing..." : "Save SEO & Push"}
          </LiquidButton>
        </div>
      </div>

      {/* Live Preview Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        <LiquidCard className="p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 mb-3">Google Search Preview</p>
          <div className="rounded-xl bg-black/40 border border-white/10 p-4 space-y-1">
            <p className="text-xs text-zinc-400 truncate">{seo.siteUrl || "https://proboy.vercel.app"}/</p>
            <p className="text-lg font-medium text-sky-400 leading-snug line-clamp-1">{seo.title}</p>
            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{seo.description}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-400">
            <span>Title: {seo.title.length}/60 chars</span>
            <span>·</span>
            <span>Desc: {seo.description.length}/160 chars</span>
          </div>
        </LiquidCard>

        <LiquidCard className="p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 mb-3">
            Open Graph / WhatsApp / X Card Preview
          </p>
          <div className="rounded-xl overflow-hidden border border-white/15 bg-black/45 grid sm:grid-cols-[160px_1fr]">
            <div className="bg-zinc-900 aspect-[1200/630] sm:aspect-auto flex items-center justify-center overflow-hidden">
              {previewOgSrc ? (
                <img src={previewOgSrc} alt={seo.ogImageAlt} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-zinc-500">No OG Image</span>
              )}
            </div>
            <div className="p-3.5 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">{seo.ogSiteName}</p>
              <p className="text-sm font-semibold text-white line-clamp-1">{seo.ogTitle || seo.title}</p>
              <p className="text-xs text-zinc-400 line-clamp-2">{seo.ogDescription || seo.description}</p>
            </div>
          </div>
        </LiquidCard>
      </div>

      {/* Main SEO Form */}
      <div className="grid lg:grid-cols-2 gap-6">
        <LiquidCard className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Icon name="globe" className="w-4 h-4 text-red-400" /> Core Meta &amp; Verification
          </h3>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Canonical Site URL</label>
            <input
              className="lg-input"
              value={seo.siteUrl}
              onChange={(e) => setSeo({ ...seo, siteUrl: e.target.value })}
              placeholder="https://proboy.vercel.app"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Default Page Title</label>
            <input
              className="lg-input"
              value={seo.title}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Meta Description</label>
            <textarea
              rows={3}
              className="lg-input"
              value={seo.description}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Robots Directive</label>
              <select
                className="lg-input"
                value={seo.robots}
                onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
              >
                <option value="index, follow">index, follow</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Theme Color</label>
              <input
                className="lg-input"
                value={seo.themeColor}
                onChange={(e) => setSeo({ ...seo, themeColor: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Google Site Verification Code</label>
            <input
              className="lg-input font-mono text-xs"
              value={seo.googleVerification}
              onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Geo Region</label>
              <input
                className="lg-input"
                value={seo.geoRegion}
                onChange={(e) => setSeo({ ...seo, geoRegion: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Geo Place</label>
              <input
                className="lg-input"
                value={seo.geoPlacename}
                onChange={(e) => setSeo({ ...seo, geoPlacename: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Lat;Lng</label>
              <input
                className="lg-input"
                value={seo.geoPosition}
                onChange={(e) => setSeo({ ...seo, geoPosition: e.target.value })}
              />
            </div>
          </div>
        </LiquidCard>

        <LiquidCard className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Icon name="image" className="w-4 h-4 text-red-400" /> Open Graph &amp; Twitter Cards
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">og:type</label>
              <select
                className="lg-input"
                value={seo.ogType}
                onChange={(e) => setSeo({ ...seo, ogType: e.target.value })}
              >
                <option value="profile">profile</option>
                <option value="website">website</option>
                <option value="article">article</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">og:site_name</label>
              <input
                className="lg-input"
                value={seo.ogSiteName}
                onChange={(e) => setSeo({ ...seo, ogSiteName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">og:title</label>
            <input
              className="lg-input"
              value={seo.ogTitle}
              onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">og:description</label>
            <textarea
              rows={2}
              className="lg-input"
              value={seo.ogDescription}
              onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">og:image path or URL</label>
            <div className="flex flex-wrap gap-2">
              <input
                className="lg-input flex-1 min-w-[200px]"
                value={seo.ogImage}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value, twitterImage: e.target.value })}
              />
              <label className="lg-btn cursor-pointer shrink-0">
                <Icon name="upload" className="w-4 h-4" />
                {uploadingOg ? "Uploading..." : "Upload OG Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!connected || uploadingOg}
                  onChange={(e) => {
                    void handleUploadOgImage(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs text-zinc-400 mb-1.5">og:locale</label>
              <input
                className="lg-input"
                value={seo.ogLocale}
                onChange={(e) => setSeo({ ...seo, ogLocale: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Width</label>
              <input
                className="lg-input"
                value={seo.ogImageWidth}
                onChange={(e) => setSeo({ ...seo, ogImageWidth: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Height</label>
              <input
                className="lg-input"
                value={seo.ogImageHeight}
                onChange={(e) => setSeo({ ...seo, ogImageHeight: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">og:image:alt</label>
            <input
              className="lg-input"
              value={seo.ogImageAlt}
              onChange={(e) => setSeo({ ...seo, ogImageAlt: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">twitter:card</label>
              <select
                className="lg-input"
                value={seo.twitterCard}
                onChange={(e) => setSeo({ ...seo, twitterCard: e.target.value })}
              >
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">twitter:site</label>
              <input
                className="lg-input"
                value={seo.twitterSite}
                onChange={(e) => setSeo({ ...seo, twitterSite: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">twitter:creator</label>
              <input
                className="lg-input"
                value={seo.twitterCreator}
                onChange={(e) => setSeo({ ...seo, twitterCreator: e.target.value })}
              />
            </div>
          </div>
        </LiquidCard>
      </div>

      {/* Hero Portrait + Commit Message */}
      <LiquidCard className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Hero Portrait Image &amp; Alt Text</h3>
            <p className="text-xs text-zinc-400">
              Upload a portrait directly to <code className="text-zinc-200">public/images/</code> and update{" "}
              <code className="text-zinc-200">profileImage</code>.
            </p>
          </div>
          <label className="lg-btn cursor-pointer">
            <Icon name="upload" className="w-4 h-4" />
            {uploadingPortrait ? "Uploading Portrait..." : "Upload Portrait to GitHub"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!connected || uploadingPortrait}
              onChange={(e) => {
                void handleUploadPortrait(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="grid sm:grid-cols-[120px_1fr_1fr] gap-4 items-center">
          <div className="h-28 rounded-xl overflow-hidden border border-white/15 bg-black/40 grid place-items-center">
            {portraitPreviewDataUrl || portraitPath ? (
              <img
                src={portraitPreviewDataUrl || portraitPath}
                alt="Portrait preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-zinc-500">No portrait</span>
            )}
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">profileImage path</label>
            <input
              className="lg-input"
              value={portraitPath}
              onChange={(e) => setPortraitPath(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">portrait.alt</label>
            <input
              className="lg-input"
              value={portraitAlt}
              onChange={(e) => setPortraitAlt(e.target.value)}
            />
          </div>
        </div>
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
          <input
            className="lg-input flex-1 min-w-[220px]"
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder="Git commit message"
          />
          <LiquidButton variant="primary" onClick={handleSaveSeo} disabled={!connected || saving}>
            <Icon name="save" className="w-4 h-4" />
            {saving ? "Committing..." : "Save SEO & Push to GitHub"}
          </LiquidButton>
        </div>
      </LiquidCard>

      {/* robots.txt & vercel.json quick editors */}
      <div className="grid lg:grid-cols-2 gap-6">
        <LiquidCard className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">public/robots.txt</h3>
            <LiquidButton
              disabled={!connected || saving}
              onClick={() =>
                handleSaveExtraFile("public/robots.txt", robotsTxt, robotsSha, (s) => setRobotsSha(s))
              }
            >
              <Icon name="save" className="w-4 h-4" /> Save robots.txt
            </LiquidButton>
          </div>
          <textarea
            rows={7}
            className="lg-input font-mono text-xs leading-relaxed"
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
          />
        </LiquidCard>

        <LiquidCard className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">vercel.json (Rewrites &amp; Redirects)</h3>
            <LiquidButton
              disabled={!connected || saving}
              onClick={() =>
                handleSaveExtraFile("vercel.json", vercelJson, vercelSha, (s) => setVercelSha(s))
              }
            >
              <Icon name="save" className="w-4 h-4" /> Save vercel.json
            </LiquidButton>
          </div>
          <textarea
            rows={7}
            className="lg-input font-mono text-xs leading-relaxed"
            value={vercelJson}
            onChange={(e) => setVercelJson(e.target.value)}
          />
        </LiquidCard>
      </div>
    </div>
  );
}
