import Icon from "../components/Icon";
import { blogPosts, getBlogPost, info, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, personLd, useSeo } from "../lib/seo";
import { NotFound } from "./Detail";

export function BlogIndexPage() {
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Blog", "/blog"],
  ];

  useSeo({
    title: `Engineering Notes | Shahan Ali (PROBOY)`,
    description: `Read Shahan Ali's notes on ProBoy-MD and building web apps, bots and AI tools. Practical lessons from projects he has worked on.`,
    path: "/blog",
    jsonLd: [
      breadcrumbLd(trail),
      personLd(),
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${info.name} (${info.brand}) — Engineering Blog`,
        url: `${site}/blog`,
        author: { "@id": `${site}/#person` },
      },
    ],
  });

  return (
    <article className="max-w-[1040px] mx-auto px-5 lg:px-10 pt-32 lg:pt-40 pb-12">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-8">
        <ol className="flex flex-wrap gap-2">
          {trail.map(([name, path], i) => (
            <li key={path} className="flex gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i < trail.length - 1 ? (
                <a href={path} onClick={onLink} className="hover:text-red-400">
                  {name}
                </a>
              ) : (
                <span aria-current="page" className="text-zinc-300">
                  {name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="max-w-3xl">
        <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">Writing &amp; Engineering Notes</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight">
          Technical notes from real builds
        </h1>
        <p className="mt-5 text-lg text-zinc-300 leading-relaxed">
          Practical write-ups by {info.name} ({info.brand}) documenting software architecture, WhatsApp Multi-Device bot
          internals, Shopify storefront engineering, and AI integrations.
        </p>
      </header>

      <section aria-label="Published articles" className="mt-12 space-y-6">
        {blogPosts.map((post) => (
          <article key={post.slug} className="glass card3d p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="text-red-400 font-semibold uppercase tracking-wider">{post.category}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime}</span>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
              <a href={`/blog/${post.slug}`} onClick={onLink} className="hover:text-red-400 transition">
                {post.title}
              </a>
            </h2>
            <p className="mt-3 text-zinc-300 leading-relaxed">{post.summary}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                    {tag}
                  </li>
                ))}
              </ul>
              <a
                href={`/blog/${post.slug}`}
                onClick={onLink}
                className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
              >
                Read article <Icon name="arrow" className="w-4 h-4" />
              </a>
            </div>
          </article>
        ))}
      </section>

      <aside className="mt-12 glass p-6 sm:p-7 text-sm text-zinc-400">
        <p>
          More deep-dive engineering guides covering Shopify Liquid performance, Google Gemini API prompt guardrails,
          and full-stack deployment patterns are planned for upcoming updates.
        </p>
      </aside>
    </article>
  );
}

export function BlogArticlePage({ slug }: { slug: string }) {
  const post = getBlogPost(slug);
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Blog", "/blog"],
    [post?.title || "Article", `/blog/${slug}`],
  ];

  useSeo({
    title: post ? `${post.title.split(":")[0]} | ${info.name} (${info.brand})` : `Article Not Found — ${info.brand}`,
    description: post?.summary || "Requested article could not be found.",
    path: `/blog/${slug}`,
    ogType: "article",
    noindex: !post,
    jsonLd: post
      ? [
          breadcrumbLd(trail),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.summary,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            url: `${site}/blog/${post.slug}`,
            author: { "@id": `${site}/#person`, "@type": "Person", name: info.name },
            publisher: { "@id": `${site}/#person`, "@type": "Person", name: info.name },
            keywords: post.tags.join(", "),
          },
        ]
      : [],
  });

  if (!post) return <NotFound />;

  return (
    <article className="max-w-[860px] mx-auto px-5 lg:px-10 pt-32 lg:pt-40 pb-12">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-8">
        <ol className="flex flex-wrap gap-2">
          {trail.map(([name, path], i) => (
            <li key={path} className="flex gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i < trail.length - 1 ? (
                <a href={path} onClick={onLink} className="hover:text-red-400">
                  {name}
                </a>
              ) : (
                <span aria-current="page" className="text-zinc-300 line-clamp-1">
                  {name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <span className="text-red-400 font-semibold uppercase tracking-wider">{post.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt}>Published {post.publishedAt}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime}</span>
        </div>
        <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">{post.title}</h1>
        <p className="mt-5 text-lg text-zinc-300 leading-relaxed">{post.summary}</p>
        <p className="mt-4 text-sm text-zinc-400">
          Written by{" "}
          <a href="/about" onClick={onLink} className="text-white hover:text-red-400 underline underline-offset-4">
            {post.author} ({info.brand})
          </a>
        </p>
      </header>

      <div className="mt-10 space-y-10 border-t border-white/10 pt-10">
        {post.sections.map((sec) => (
          <section key={sec.heading} className="space-y-4">
            <h2 className="text-2xl font-bold text-white">{sec.heading}</h2>
            {sec.paragraphs.map((p) => (
              <p key={p} className="text-zinc-300 leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <footer className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        <a href="/blog" onClick={onLink} className="text-sm text-red-400 hover:text-red-300 font-medium">
          ← Back to all articles
        </a>
        <a
          href="/proboy-md"
          onClick={onLink}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white/5 border border-white/15 hover:border-red-500 text-zinc-200 hover:text-white transition"
        >
          Explore ProBoy-MD Commands <Icon name="arrow" className="w-4 h-4" />
        </a>
      </footer>
    </article>
  );
}
