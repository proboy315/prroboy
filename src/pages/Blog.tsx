import { useEffect, useMemo, useState } from "react";
import { articles, type Article } from "../data/editorial";
import { info, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { track } from "../lib/measure";
import { CodeCopy, Crumbs, LinkList } from "../components/Reading";
import "./reading.css";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const articleMinutes = (post: Article) => Math.max(1, Math.ceil((post.answer + post.audience + post.sections.map(s => s.heading + s.paragraphs.join(" ") + (s.code || "")).join(" ")).trim().split(/\s+/).length / 200));
export const articleSeo = (post: Article) => ({
  title: `${post.title} | PROBOY`, description: post.summary, path: `/blog/${post.slug}`, ogType: "article" as const,
  jsonLd: [breadcrumbLd([["Home", "/"], ["Blog", "/blog"], [post.title, `/blog/${post.slug}`]]), {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.summary,
    datePublished: post.publishedAt, dateModified: post.updatedAt, url: `${site}/blog/${post.slug}`,
    author: { "@type": "Person", "@id": `${site}/#person`, name: info.name },
    publisher: { "@type": "Person", "@id": `${site}/#person`, name: info.name },
  }],
});

export function BlogIndexPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(articles.map(a => a.category))];
  const results = useMemo(() => articles.filter(a => (category === "All" || a.category === category) &&
    `${a.title} ${a.summary} ${a.tags.join(" ")} ${a.sections.map(s => s.paragraphs.join(" ")).join(" ")}`.toLowerCase().includes(q.trim().toLowerCase())), [q, category]);
  useSeo({ title: "Engineering Notes | Shahan Ali (PROBOY)", description: "Source-checked guides on ProBoy-MD, React SEO, accessibility and honest developer project practice.", path: "/blog", jsonLd: [breadcrumbLd([["Home", "/"], ["Blog", "/blog"]]), { "@context": "https://schema.org", "@type": "Blog", name: "PROBOY Engineering Notes", url: `${site}/blog`, author: { "@id": `${site}/#person` } }] });
  return <div className="reading-shell">
    <Crumbs items={[["Home", "/"], ["Blog", "/blog"]]} />
    <header className="reading-hero"><p className="reading-kicker">The PROBOY journal</p><h1>Engineering notes, with receipts.</h1><p>Practical guides grounded in code, primary documentation and real limitations. Written by <a href="/about" onClick={onLink}>Shahan Ali</a>.</p></header>
    <form role="search" className="reading-search" onSubmit={e => e.preventDefault()}><label htmlFor="blog-search">Search articles</label><input id="blog-search" type="search" placeholder="Search title, tag or topic" value={q} onChange={e => { setQ(e.target.value); if (e.target.value.trim().length === 3) track("blog_search", { query_length: 3 }); }} /></form>
    <div className="reading-filters" role="group" aria-label="Article category">{categories.map(c => <button key={c} type="button" aria-pressed={category === c} onClick={() => { setCategory(c); track("blog_category", { category: c }); }}>{c}</button>)}</div>
    <p role="status" className="reading-muted">{results.length} {results.length === 1 ? "article" : "articles"} found</p>
    {results.length === 0 ? <div className="reading-empty"><h2>No articles found</h2><p>Try a broader term or show all categories.</p><button onClick={() => { setQ(""); setCategory("All"); }}>Reset search</button></div> : <div className="reading-list">{results.map((a, i) => <article key={a.slug} className={i === 0 && !q && category === "All" ? "reading-featured" : ""}><p className="reading-meta">{a.category} / <time dateTime={a.publishedAt}>{a.publishedAt}</time> / {articleMinutes(a)} min read</p><h2><a href={`/blog/${a.slug}`} onClick={onLink}>{a.title}</a></h2><p>{a.summary}</p><p className="reading-tags">{a.tags.join("  /  ")}</p></article>)}</div>}
    <p className="reading-end">Looking for the bot itself? Read the <a href="/proboy-md/docs" onClick={onLink}>ProBoy-MD documentation</a>, explore <a href="/projects" onClick={onLink}>real projects</a>, or <a href="/contact" onClick={(e) => { track("contact_cta", { from: "blog" }); onLink(e); }}>contact Shahan about a project</a>. For verified facts and approved bios, see the <a href="/press" onClick={onLink}>press kit</a>.</p>
  </div>;
}

export function BlogArticlePage({ slug: articleSlug }: { slug: string }) {
  const post = articles.find(a => a.slug === articleSlug);
  useSeo(post ? articleSeo(post) : { title: "Article not found | PROBOY", description: "This article is not published.", path: `/blog/${articleSlug}`, noindex: true });
  useEffect(() => { if (post) track("blog_article_view", { slug: post.slug }); }, [post?.slug]);
  if (!post) return <div className="reading-shell"><h1>Article not found</h1><a href="/blog" onClick={onLink}>Back to the blog</a></div>;
  const i = articles.indexOf(post);
  return <article className="reading-shell reading-article">
    <Crumbs items={[["Home", "/"], ["Blog", "/blog"], [post.title, `/blog/${post.slug}`]]} />
    <header className="reading-hero"><p className="reading-kicker">{post.category}</p><h1>{post.title}</h1><p>{post.summary}</p><p className="reading-meta"><a href="/about" onClick={onLink}>Shahan Ali (PROBOY)</a> / <time dateTime={post.publishedAt}>Published {post.publishedAt}</time> / <time dateTime={post.updatedAt}>Reviewed {post.updatedAt}</time> / {articleMinutes(post)} min read</p></header>
    <div className="reading-columns"><div className="reading-body"><p className="reading-answer">{post.answer}</p><p>{post.audience}</p>
      {post.sections.map(s => <section key={s.heading} aria-labelledby={slug(s.heading)}><h2 id={slug(s.heading)}>{s.heading}</h2>{s.paragraphs.map(p => <p key={p}>{p}</p>)}{s.code && <CodeCopy code={s.code} />}</section>)}
      <section><h2>Sources and further reading</h2><LinkList links={post.sources} />{post.relatedDocs && <p>Continue in the <a href={post.relatedDocs === "documentation-home" ? "/proboy-md/docs" : `/proboy-md/docs/${post.relatedDocs}`} onClick={onLink}>related ProBoy-MD documentation</a>.</p>}</section>
      <aside className="reading-author"><h2>About the author</h2><p><a href="/about" onClick={onLink}>Shahan Ali</a>, also known as PROBOY, proboy315 and shahan315, builds web apps and maintains ProBoy-MD. See his <a href={info.github} target="_blank" rel="noopener noreferrer">GitHub profile</a>. This article was reviewed on <time dateTime={post.updatedAt}>{post.updatedAt}</time>.</p></aside>
      <nav aria-label="Article navigation" className="reading-next">{i > 0 && <a href={`/blog/${articles[i-1].slug}`} onClick={onLink}>Previous: {articles[i-1].title}</a>}{i < articles.length - 1 && <a href={`/blog/${articles[i+1].slug}`} onClick={onLink}>Next: {articles[i+1].title}</a>}</nav>
    </div><aside className="reading-toc" aria-label="On this page"><strong>On this page</strong>{post.sections.map(s => <a key={s.heading} href={`#${slug(s.heading)}`}>{s.heading}</a>)}<a href="/blog" onClick={onLink}>All articles</a></aside></div>
  </article>;
}