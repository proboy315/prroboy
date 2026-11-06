import { useState, type ReactNode } from "react";
import Icon from "./Icon";
import { getDemo, type Demo } from "../lib/data";
import { onLink } from "../lib/router";
import { NotFound } from "../pages/Detail";

export function DemoShell({
  slug,
  customDemo,
  children,
}: {
  slug: string;
  customDemo?: Demo;
  children: ReactNode;
}) {
  const d = getDemo(slug) || customDemo;
  if (!d) return <NotFound path={`/demos/${slug}`} />;
  return (
    <div
      className="demo"
      style={{ "--accent": d.accent, "--ink": d.ink } as React.CSSProperties}
      data-demo={d.slug}
    >
      <div className="demo-bar">
        <div className="demo-bar-inner">
          <a href="/demos" onClick={onLink} className="demo-back" aria-label="Back to all demos">
            <Icon name="left" className="w-4 h-4" /> All Demos
          </a>
          <span className="demo-logo">
            <span className="demo-dot" />
            {d.name}
          </span>
          <span className="demo-kind">Sample Demo · {d.kind}</span>
          <a href={`/contact?service=full-stack-web-development`} onClick={onLink} className="demo-hire">
            Build something like this <Icon name="arrow" className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {d.testGuide && (
        <div className="demo-guide-strip">
          <div>
            <strong>What to test:</strong> <span>{d.testGuide}</span>
          </div>
          <span className="demo-sample-pill">Sample Data · UI Demo Only</span>
        </div>
      )}

      <main className="demo-stage">{children}</main>

      <footer className="demo-foot">
        <div className="demo-foot-inner">
          <p>
            <strong>{d.name}</strong> — {d.category} interactive demonstration built by Shahan Ali (PROBOY). Fictional
            sample data only; not a live store or client deployment.
          </p>
          <div className="demo-foot-links">
            <a href="/demos" onClick={onLink}>
              Demos Directory
            </a>
            <a href="/demos/control-room" onClick={onLink}>
              Demo Control Room
            </a>
            <a href="/contact" onClick={onLink}>
              Hire Shahan Ali
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const Btn = ({
  children,
  kind = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "primary" | "ghost" }) => (
  <button className={`d-btn d-btn--${kind} ${className}`.trim()} {...rest}>
    {children}
  </button>
);

export const Field = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) => (
  <label className="d-field" htmlFor={id}>
    <span>{label}</span>
    {children}
    {error && (
      <em className="d-error" role="alert">
        {error}
      </em>
    )}
  </label>
);

export const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export type StoreItem = {
  id: number;
  name: string;
  cat: string;
  price: number;
  ref: string;
  note: string;
  variants: string[];
  badge?: string;
  image?: string;
};

export function StorefrontEngine({
  brand,
  tagline,
  items,
  variantLabel = "Option",
  freeShippingThreshold = 200,
  shippingCost = 18,
  promoCode = "PROBOY10",
  promoDiscountPercent = 10,
  headerSlot,
  extraSection,
}: {
  brand: string;
  tagline: string;
  items: StoreItem[];
  variantLabel?: string;
  freeShippingThreshold?: number;
  shippingCost?: number;
  promoCode?: string;
  promoDiscountPercent?: number;
  headerSlot?: ReactNode;
  extraSection?: ReactNode;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [detailItem, setDetailItem] = useState<StoreItem | null>(null);
  const [cart, setCart] = useState<{ id: number; variant: string; qty: number }[]>([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"cart" | "pay" | "done">("cart");
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMsg, setPromoMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const cats = ["All", ...new Set(items.map((p) => p.cat))];

  const filtered = items
    .filter(
      (p) =>
        (cat === "All" || p.cat === cat) &&
        `${p.name} ${p.cat} ${p.note} ${p.ref}`.toLowerCase().includes(q.toLowerCase())
    )
    .sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : a.id - b.id
    );

  const getChosenVariant = (item: StoreItem) => selectedVariants[item.id] || item.variants[0] || "Standard";

  const add = (item: StoreItem) => {
    const variant = getChosenVariant(item);
    setCart((c) => {
      const idx = c.findIndex((x) => x.id === item.id && x.variant === variant);
      if (idx >= 0) {
        return c.map((x, i) => (i === idx ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...c, { id: item.id, variant, qty: 1 }];
    });
    setStep("cart");
    setOpen(true);
  };

  const setQty = (id: number, variant: string, qty: number) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((x) => !(x.id === id && x.variant === variant))
        : c.map((x) => (x.id === id && x.variant === variant ? { ...x, qty } : x))
    );

  const toggleWishlist = (id: number) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  const lines = cart.map((x) => ({ ...x, p: items.find((p) => p.id === x.id)! })).filter((x) => Boolean(x.p));
  const subtotal = lines.reduce((n, l) => n + l.p.price * l.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * (promoDiscountPercent / 100)) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = discountedSubtotal === 0 || discountedSubtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = discountedSubtotal + shipping;
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() === promoCode) {
      setPromoApplied(true);
      setPromoMsg(`Code ${promoCode} applied (${promoDiscountPercent}% off sample subtotal).`);
    } else {
      setPromoApplied(false);
      setPromoMsg(`Try sample code "${promoCode}" for ${promoDiscountPercent}% off.`);
    }
  };

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2) err.name = "Enter your full name.";
    if (!emailOk(form.email)) err.email = "Enter a valid email address.";
    if (form.address.trim().length < 8) err.address = "Enter a complete delivery address.";
    setErrs(err);
    if (!Object.keys(err).length) {
      setStep("done");
      setCart([]);
      setPromoApplied(false);
      setPromoInput("");
    }
  };

  return (
    <>
      <header className="d-hero">
        <h1>{brand}</h1>
        <p>{tagline}</p>
      </header>

      {headerSlot}

      <div className="d-toolbar">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search catalog by name, category, or detail..."
          aria-label="Search products"
        />
        <div className="d-chips" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <select
          aria-label="Sort products"
          value={sort}
          onChange={(e) => setSort(e.target.value as "featured" | "price-asc" | "price-desc")}
          className="d-sort-select"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <Btn
          type="button"
          className="d-cart-toggle"
          onClick={() => {
            setOpen(true);
            setStep("cart");
          }}
        >
          Bag ({itemCount}) · Saved ({wishlist.length})
        </Btn>
      </div>

      <p className="d-count" role="status">
        Showing {filtered.length} of {items.length} sample item{items.length === 1 ? "" : "s"}
        {wishlist.length > 0 ? ` · ${wishlist.length} saved in wishlist` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="d-empty">
          <p>No sample item matches &ldquo;{q}&rdquo;.</p>
          <Btn
            type="button"
            kind="ghost"
            onClick={() => {
              setQ("");
              setCat("All");
            }}
          >
            Reset search &amp; filters
          </Btn>
        </div>
      ) : (
        <ul className="d-products">
          {filtered.map((p) => {
            const chosen = getChosenVariant(p);
            const saved = wishlist.includes(p.id);
            return (
              <li key={p.id}>
                <div className="d-swatch">
                  {p.image && !imgErrors[p.id] ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={() => setImgErrors((prev) => ({ ...prev, [p.id]: true }))}
                    />
                  ) : (
                    <span>{p.ref}</span>
                  )}
                  {p.badge && <em className="d-item-badge">{p.badge}</em>}
                  <button
                    type="button"
                    className={`d-wish-btn${saved ? " is-saved" : ""}`}
                    aria-pressed={saved}
                    aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
                    onClick={() => toggleWishlist(p.id)}
                  >
                    ♥
                  </button>
                </div>

                <p className="d-cat">{p.cat}</p>
                <h3>{p.name}</h3>
                <p className="d-note">{p.note}</p>

                {p.variants.length > 1 && (
                  <div className="d-variant-row" role="group" aria-label={`${variantLabel} for ${p.name}`}>
                    {p.variants.map((v) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={chosen === v}
                        className={chosen === v ? "is-on" : ""}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [p.id]: v }))}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}

                <div className="d-row d-product-foot">
                  <strong>${p.price.toLocaleString()}</strong>
                  <div className="d-row">
                    <Btn type="button" kind="ghost" onClick={() => setDetailItem(p)}>
                      Specs
                    </Btn>
                    <Btn type="button" onClick={() => add(p)}>
                      Add
                    </Btn>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {extraSection}

      {/* Product Detail Modal */}
      {detailItem && (
        <>
          <div className="d-modal" role="dialog" aria-modal="true" aria-label={detailItem.name}>
            <div className="d-drawer-head">
              <div>
                <p className="d-cat">
                  {detailItem.cat} · Ref {detailItem.ref}
                </p>
                <h2>{detailItem.name}</h2>
              </div>
              <Btn type="button" kind="ghost" onClick={() => setDetailItem(null)}>
                Close
              </Btn>
            </div>
            <p className="d-note">{detailItem.note}</p>
            <p className="d-modal-price">${detailItem.price.toLocaleString()}</p>
            <div className="d-variant-row" style={{ marginTop: 12 }}>
              {detailItem.variants.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={getChosenVariant(detailItem) === v}
                  className={getChosenVariant(detailItem) === v ? "is-on" : ""}
                  onClick={() => setSelectedVariants((prev) => ({ ...prev, [detailItem.id]: v }))}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="d-row" style={{ marginTop: 18 }}>
              <Btn
                type="button"
                onClick={() => {
                  add(detailItem);
                  setDetailItem(null);
                }}
              >
                Add to bag ({getChosenVariant(detailItem)})
              </Btn>
              <Btn type="button" kind="ghost" onClick={() => toggleWishlist(detailItem.id)}>
                {wishlist.includes(detailItem.id) ? "Saved in Wishlist" : "Save to Wishlist"}
              </Btn>
            </div>
          </div>
          <div className="d-scrim" onClick={() => setDetailItem(null)} />
        </>
      )}

      {/* Cart & Checkout Drawer */}
      <div className={`d-drawer ${open ? "open" : ""}`} aria-hidden={!open} role="dialog" aria-label="Shopping bag">
        <div className="d-drawer-head">
          <h2>{step === "cart" ? "Your Bag" : step === "pay" ? "Demo Checkout" : "Order Confirmed"}</h2>
          <Btn type="button" kind="ghost" onClick={() => setOpen(false)} aria-label="Close bag">
            Close
          </Btn>
        </div>

        {step === "cart" &&
          (lines.length === 0 ? (
            <p className="d-note">Your sample bag is empty. Add any item from the catalog to test totals and checkout.</p>
          ) : (
            <ul className="d-cart-list">
              {lines.map((l) => (
                <li key={`${l.id}-${l.variant}`}>
                  <div>
                    <strong>{l.p.name}</strong>
                    <small className="d-cart-var">
                      {variantLabel}: {l.variant}
                    </small>
                    <span>${(l.p.price * l.qty).toLocaleString()}</span>
                  </div>
                  <div className="d-qty">
                    <Btn
                      type="button"
                      kind="ghost"
                      onClick={() => setQty(l.id, l.variant, l.qty - 1)}
                      aria-label={`Decrease ${l.p.name}`}
                    >
                      −
                    </Btn>
                    <span>{l.qty}</span>
                    <Btn
                      type="button"
                      kind="ghost"
                      onClick={() => setQty(l.id, l.variant, l.qty + 1)}
                      aria-label={`Increase ${l.p.name}`}
                    >
                      +
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {step !== "done" && lines.length > 0 && (
          <>
            <div className="d-promo-box">
              <div className="d-row">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={`Promo code (${promoCode})`}
                  aria-label="Promo code"
                  className="d-promo-input"
                />
                <Btn type="button" kind="ghost" onClick={applyPromo}>
                  Apply
                </Btn>
              </div>
              {promoMsg && <p className="d-note" style={{ marginTop: 6 }}>{promoMsg}</p>}
            </div>

            <div className="d-totals-box">
              <div>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div>
                  <span>Sample Discount ({promoDiscountPercent}%)</span>
                  <span>−${discount.toLocaleString()}</span>
                </div>
              )}
              <div>
                <span>Estimated Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
              </div>
              <div className="d-total">
                <span>Total</span>
                <strong>${total.toLocaleString()}</strong>
              </div>
            </div>

            {step === "cart" && (
              <Btn
                type="button"
                style={{ width: "100%" }}
                onClick={() => {
                  setStep("pay");
                  setErrs({});
                }}
              >
                Proceed to Demo Checkout
              </Btn>
            )}
          </>
        )}

        {step === "pay" && (
          <form onSubmit={pay} noValidate className="d-form">
            <Field id="st-name" label="Recipient Full Name" error={errs.name}>
              <input
                id="st-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </Field>
            <Field id="st-email" label="Confirmation Email" error={errs.email}>
              <input
                id="st-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </Field>
            <Field id="st-addr" label="Delivery Address" error={errs.address}>
              <textarea
                id="st-addr"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <Btn type="submit">Complete Demo Order</Btn>
            <Btn type="button" kind="ghost" style={{ marginTop: 8 }} onClick={() => setStep("cart")}>
              Back to Bag
            </Btn>
            <p className="d-note" style={{ marginTop: 10 }}>
              Simulation only — no payment card data is collected and no real order is placed.
            </p>
          </form>
        )}

        {step === "done" && (
          <div className="d-success">
            <p className="d-badge">Demo Order Confirmed</p>
            <p style={{ marginTop: 12 }}>
              Sample order for <strong>{form.name}</strong> logged locally ({form.email}). No charge was made and nothing
              left your browser.
            </p>
            <Btn
              type="button"
              kind="ghost"
              style={{ marginTop: 14 }}
              onClick={() => {
                setOpen(false);
                setStep("cart");
                setForm({ name: "", email: "", address: "" });
              }}
            >
              Continue Exploring
            </Btn>
          </div>
        )}
      </div>
      {open && <div className="d-scrim" onClick={() => setOpen(false)} />}
    </>
  );
}
