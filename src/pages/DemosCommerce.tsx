import { useState } from "react";
import { Btn, Field, StorefrontEngine, emailOk, type StoreItem } from "../components/DemoPrimitives";
import { ProductAngleViewer, type AngleFrame, type ProductFinish } from "../components/ProductAngleViewer";

/* --------------------------------------------------------- 1. LuxeCart */
const LUXE_FRAMES: AngleFrame[] = [
  {
    label: "Front Dial",
    angleDeg: 0,
    src: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=960&q=80",
    caption: "Tourbillon Noir front dial view showing open-worked mechanical movement",
  },
  {
    label: "Crown Profile",
    angleDeg: 90,
    src: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=960&q=80",
    caption: "Fluted crown and brushed titanium case profile",
  },
  {
    label: "Clasp & Strap",
    angleDeg: 180,
    src: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=960&q=80",
    caption: "Deployant buckle and hand-stitched strap detail",
  },
  {
    label: "Wrist Perspective",
    angleDeg: 270,
    src: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=960&q=80",
    caption: "Three-quarter lug and sapphire crystal reflection",
  },
];

const LUXE_FINISHES: ProductFinish[] = [
  { id: "obsidian", name: "Obsidian DLC", swatch: "#1f2026" },
  { id: "rose-gold", name: "18k Rose Gold", swatch: "#d9a441" },
  { id: "titanium", name: "Grade 5 Titanium", swatch: "#9ca3af" },
];

const LUXE_CATALOG: StoreItem[] = [
  { id: 1, name: "Tourbillon Noir", cat: "Tourbillon", price: 12400, ref: "LC-011", badge: "Caliber 01", note: "Open-worked dial, 72h power reserve, sapphire caseback", variants: ["Alligator Strap", "Titanium Bracelet"] },
  { id: 2, name: "Chronograph Meridian", cat: "Chronograph", price: 4380, ref: "LC-024", note: "Column-wheel chronograph, ceramic tachymeter bezel", variants: ["40mm", "42mm"] },
  { id: 3, name: "Perpetual Ash", cat: "Dress", price: 6950, ref: "LC-037", note: "Astronomical moonphase complication, ultra-thin 7.8mm", variants: ["Slate Leather", "Milanese Mesh"] },
  { id: 4, name: "Diver Abyss 300", cat: "Sport", price: 3120, ref: "LC-042", badge: "300M", note: "Unidirectional ceramic bezel, Super-LumiNova markers", variants: ["FKM Rubber", "Brushed Steel"] },
  { id: 5, name: "Skeleton Vitrine", cat: "Tourbillon", price: 9800, ref: "LC-058", note: "Hand-beveled bridges, exhibition crystal", variants: ["Obsidian", "Silvered"] },
  { id: 6, name: "Classic Breguet", cat: "Dress", price: 2740, ref: "LC-063", note: "Engine-turned guilloché dial, blued steel hands", variants: ["38mm", "40mm"] },
  { id: 7, name: "GMT Voyager", cat: "Sport", price: 3890, ref: "LC-077", note: "Independent 24-hour jumping hand, dual-time bezel", variants: ["Midnight/Blue", "Noir/Crimson"] },
  { id: 8, name: "Panda Reserve", cat: "Chronograph", price: 5460, ref: "LC-088", note: "Reverse panda sub-dials, 100m water resistance", variants: ["Oyster Link", "Perforated Calf"] },
];

export function LuxeCart() {
  const [finish, setFinish] = useState("obsidian");
  return (
    <StorefrontEngine
      brand="LuxeCart"
      tagline="Private boutique of mechanical timepieces — interactive 360° angle viewer, variant picker, wishlist, and validated demo checkout."
      items={LUXE_CATALOG}
      variantLabel="Strap / Size"
      freeShippingThreshold={5000}
      shippingCost={45}
      headerSlot={
        <ProductAngleViewer
          title={`Tourbillon Noir — ${LUXE_FINISHES.find((f) => f.id === finish)?.name || "Obsidian DLC"}`}
          subtitle="Drag horizontally or step through 4 studio camera angles. Sample product photography."
          frames={LUXE_FRAMES}
          finishes={LUXE_FINISHES}
          selectedFinish={finish}
          onSelectFinish={setFinish}
        />
      }
    />
  );
}

/* --------------------------------------------------------- 8. Atelier Noir */
const ATELIER_CATALOG: StoreItem[] = [
  { id: 1, name: "Structured Wool Overcoat", cat: "Outerwear", price: 340, ref: "AN-101", badge: "Capsule 04", note: "Double-faced Italian virgin wool, horn buttons, relaxed drape", variants: ["S", "M", "L", "XL"] },
  { id: 2, name: "Raw Selvedge Work Jacket", cat: "Outerwear", price: 225, ref: "AN-104", note: "14oz Japanese rope-dyed denim, felled seams", variants: ["S", "M", "L"] },
  { id: 3, name: "Merino Mock-Neck Knit", cat: "Knitwear", price: 145, ref: "AN-112", note: "Extra-fine 19.5 micron merino wool, ribbed cuffs", variants: ["XS", "S", "M", "L"] },
  { id: 4, name: "Pleated Wide-Leg Trouser", cat: "Tailoring", price: 185, ref: "AN-118", note: "High-twist tropical wool, extended waist tab", variants: ["30", "32", "34", "36"] },
  { id: 5, name: "Heavyweight Box Tee", cat: "Essentials", price: 68, ref: "AN-124", note: "290gsm combed organic cotton, enzyme washed", variants: ["S", "M", "L", "XL"] },
  { id: 6, name: "Architectural Leather Tote", cat: "Accessories", price: 290, ref: "AN-131", note: "Full-grain vegetable-tanned calfskin, padded laptop sleeve", variants: ["Noir", "Espresso"] },
];

export function AtelierNoir() {
  return (
    <StorefrontEngine
      brand="Atelier Noir"
      tagline="Contemporary garment studio — filter by capsule, choose sizing, save pieces to your wishlist, and test bag checkout."
      items={ATELIER_CATALOG}
      variantLabel="Size / Color"
      freeShippingThreshold={250}
      shippingCost={15}
    />
  );
}

/* --------------------------------------------------------- 9. Voltix Gear */
const VOLTIX_FRAMES: AngleFrame[] = [
  {
    label: "Studio Front",
    angleDeg: 0,
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=960&q=80",
    caption: "Voltix Studio ANC Pro wireless headphones front studio view",
  },
  {
    label: "Ear Cup Detail",
    angleDeg: 90,
    src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=960&q=80",
    caption: "CNC anodized aluminum gimbal and memory-foam cushion",
  },
  {
    label: "Desk Setup",
    angleDeg: 180,
    src: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=960&q=80",
    caption: "Fold-flat travel profile and USB-C lossless DAC cable",
  },
];

const VOLTIX_FINISHES: ProductFinish[] = [
  { id: "matte-slate", name: "Matte Slate", swatch: "#334155" },
  { id: "arctic-silver", name: "Arctic Silver", swatch: "#cbd5e1" },
  { id: "cobalt", name: "Deep Cobalt", swatch: "#0284c7" },
];

const VOLTIX_CATALOG: StoreItem[] = [
  { id: 1, name: "Studio ANC Pro Headphones", cat: "Audio", price: 329, ref: "VX-01", badge: "42h Battery", note: "40mm bio-cellulose drivers, adaptive hybrid ANC, USB-C lossless", variants: ["Matte Slate", "Arctic Silver"] },
  { id: 2, name: "Tactile75 Mechanical Keyboard", cat: "Peripherals", price: 189, ref: "VX-04", note: "Gasket-mounted CNC aluminum chassis, hot-swappable tactile switches", variants: ["Linear Red", "Tactile Brown"] },
  { id: 3, name: "GaN-140W Desktop Charger", cat: "Power", price: 89, ref: "VX-08", note: "3x USB-C PD 3.1 + 1x USB-A with real-time OLED wattage display", variants: ["US/Global Plug", "UK/EU Adapter"] },
  { id: 4, name: "UltraDock Thunderbolt 4 Hub", cat: "Peripherals", price: 249, ref: "VX-11", note: "40Gbps bandwidth, dual 4K 60Hz display output, 96W host charging", variants: ["Space Gray"] },
  { id: 5, name: "PulsePods Open Earbuds", cat: "Audio", price: 149, ref: "VX-15", note: "IPX5 sweat resistance, multipoint Bluetooth 5.4, wireless case", variants: ["Graphite", "Frost"] },
  { id: 6, name: "NVMe Pocket SSD 2TB", cat: "Storage", price: 179, ref: "VX-19", note: "2,000 MB/s read/write, finned aluminum heatsink enclosure", variants: ["1TB", "2TB"] },
];

export function VoltixGear() {
  const [finish, setFinish] = useState("matte-slate");
  return (
    <StorefrontEngine
      brand="Voltix Gear"
      tagline="Precision audio and desktop hardware — inspect angles in the 360° studio viewer, compare specs, and configure bundles."
      items={VOLTIX_CATALOG}
      variantLabel="Configuration"
      freeShippingThreshold={150}
      shippingCost={12}
      headerSlot={
        <ProductAngleViewer
          title={`Studio ANC Pro — ${VOLTIX_FINISHES.find((f) => f.id === finish)?.name || "Matte Slate"}`}
          subtitle="Interactive multi-angle hardware inspection. Sample product imagery."
          frames={VOLTIX_FRAMES}
          finishes={VOLTIX_FINISHES}
          selectedFinish={finish}
          onSelectFinish={setFinish}
        />
      }
      extraSection={
        <section className="d-card" style={{ marginTop: 24 }}>
          <h2>Quick Spec Comparison (Sample Hardware)</h2>
          <div className="d-table-scroll">
            <table className="d-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Category</th>
                  <th>Key Spec</th>
                  <th>Connectivity</th>
                  <th>Sample Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Studio ANC Pro</td>
                  <td>Audio</td>
                  <td>42h playback · −43dB ANC</td>
                  <td>Bluetooth 5.4 + USB-C DAC</td>
                  <td>$329</td>
                </tr>
                <tr>
                  <td>Tactile75 Keyboard</td>
                  <td>Peripherals</td>
                  <td>75% Gasket · QMK/VIA</td>
                  <td>2.4GHz / BT / Wired</td>
                  <td>$189</td>
                </tr>
                <tr>
                  <td>UltraDock TB4</td>
                  <td>Peripherals</td>
                  <td>Dual 4K 60Hz · 96W PD</td>
                  <td>Thunderbolt 4 (40Gbps)</td>
                  <td>$249</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      }
    />
  );
}

/* --------------------------------------------------------- 10. Kanso Living */
const KANSO_FRAMES: AngleFrame[] = [
  {
    label: "Three-Quarter",
    angleDeg: 0,
    src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=960&q=80",
    caption: "Kanso Modular Lounge Sofa three-quarter studio view",
  },
  {
    label: "Joinery & Arm",
    angleDeg: 90,
    src: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=960&q=80",
    caption: "Solid timber frame and woven upholstery profile",
  },
  {
    label: "Living Space",
    angleDeg: 180,
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=960&q=80",
    caption: "Proportion and seat depth in a daylight room setting",
  },
];

const KANSO_FINISHES: ProductFinish[] = [
  { id: "white-oak", name: "Smoked White Oak", swatch: "#b08968" },
  { id: "walnut", name: "American Walnut", swatch: "#5c3d2e" },
  { id: "oat-boucle", name: "Oat Bouclé", swatch: "#e5dec9" },
];

const KANSO_CATALOG: StoreItem[] = [
  { id: 1, name: "Sora Low Lounge Chair", cat: "Seating", price: 890, ref: "KL-01", badge: "Solid Oak", note: "Kiln-dried white oak joinery, high-resilience linen cushions (76 × 80 × 72 cm)", variants: ["Natural Oak", "Walnut"] },
  { id: 2, name: "Nami Modular 3-Seat Sofa", cat: "Seating", price: 2150, ref: "KL-03", note: "Deep 94cm lounge profile, stain-resistant woven bouclé upholstery", variants: ["Oat Bouclé", "Charcoal Weave"] },
  { id: 3, name: "Tori Architectural Dining Table", cat: "Tables", price: 1480, ref: "KL-07", note: "Beveled solid ash tabletop, seats 6–8 comfortably (200 × 95 × 75 cm)", variants: ["180 cm", "220 cm"] },
  { id: 4, name: "Kiri Cantilever Desk", cat: "Workspace", price: 760, ref: "KL-12", note: "Integrated cable trough, soft-close pencil drawer (140 × 70 × 74 cm)", variants: ["Ash", "Walnut"] },
  { id: 5, name: "Akari Paper Floor Lamp", cat: "Lighting", price: 240, ref: "KL-18", note: "Mulberry bark diffuser shade, warm 2700K dimmable LED bulb included", variants: ["120 cm", "160 cm"] },
  { id: 6, name: "Moku Credenza Sideboard", cat: "Storage", price: 1290, ref: "KL-22", note: "Slatted tambour sliding doors, adjustable interior shelving", variants: ["Oak", "Walnut"] },
];

export function KansoLiving() {
  const [finish, setFinish] = useState("white-oak");
  return (
    <StorefrontEngine
      brand="Kanso Living"
      tagline="Architectural furniture and lighting — inspect finishes in the 360° angle viewer, check dimensions, and test freight checkout."
      items={KANSO_CATALOG}
      variantLabel="Timber / Size"
      freeShippingThreshold={1500}
      shippingCost={95}
      headerSlot={
        <ProductAngleViewer
          title={`Modular Lounge Series — ${KANSO_FINISHES.find((f) => f.id === finish)?.name || "Smoked White Oak"}`}
          subtitle="Switch timber/fabric finishes and inspect multiple studio angles. Sample imagery."
          frames={KANSO_FRAMES}
          finishes={KANSO_FINISHES}
          selectedFinish={finish}
          onSelectFinish={setFinish}
        />
      }
    />
  );
}

/* --------------------------------------------------------- 11. Lumina Botanicals */
const LUMINA_CATALOG: StoreItem[] = [
  { id: 1, name: "Barrier Cloud Cleanser", cat: "Cleanse", price: 28, ref: "LB-01", badge: "pH 5.2", note: "Amino-acid gel cleanser with oat beta-glucan and panthenol", variants: ["150 ml", "300 ml Refill"] },
  { id: 2, name: "10% Niacinamide + Zinc Serum", cat: "Treat", price: 36, ref: "LB-04", note: "Balances excess sebum and refines uneven skin texture without fragrance", variants: ["30 ml", "50 ml"] },
  { id: 3, name: "Ceramide + Squalane Recovery Cream", cat: "Hydrate", price: 44, ref: "LB-07", note: "Triple-ceramide lipid complex for dry and sensitized skin barriers", variants: ["50 ml Jar"] },
  { id: 4, name: "Invisible Mineral SPF 50+", cat: "Protect", price: 34, ref: "LB-10", note: "Non-nano zinc oxide daily sunscreen with zero white cast", variants: ["50 ml Tube"] },
  { id: 5, name: "PHA Gentle Resurfacing Toner", cat: "Treat", price: 30, ref: "LB-14", note: "3% gluconolactone + centella asiatica for calm overnight renewal", variants: ["120 ml"] },
  { id: 6, name: "Complete 3-Step Barrier Kit", cat: "Sets", price: 92, ref: "LB-20", badge: "Save 15%", note: "Includes Cleanser + Niacinamide Serum + Ceramide Recovery Cream", variants: ["Dry/Sensitive", "Combination"] },
];

export function LuminaBotanicals() {
  return (
    <StorefrontEngine
      brand="Lumina Botanicals"
      tagline="Fragrance-free clinical skincare — filter by routine step, compare active ingredients, and test bundle checkout."
      items={LUMINA_CATALOG}
      variantLabel="Size / Skin Type"
      freeShippingThreshold={65}
      shippingCost={8}
    />
  );
}

/* --------------------------------------------------------- 12. FreshCart */
const FRESHCART_CATALOG: StoreItem[] = [
  { id: 1, name: "Organic Hass Avocados (4 Pack)", cat: "Produce", price: 6, ref: "FC-01", badge: "Organic", note: "Ripe-and-ready hand-picked avocados from partner orchards", variants: ["4 Pack", "8 Pack"] },
  { id: 2, name: "Artisan Sourdough Country Loaf", cat: "Bakery", price: 7, ref: "FC-05", note: "36-hour cold-fermented stone-ground wheat boule", variants: ["Whole Loaf", "Sliced"] },
  { id: 3, name: "Pasture-Raised Free-Range Eggs", cat: "Dairy & Eggs", price: 8, ref: "FC-09", badge: "Grade A", note: "12 large brown eggs from rotational pasture farms", variants: ["12 Count", "24 Count"] },
  { id: 4, name: "Cold-Pressed Extra Virgin Olive Oil", cat: "Pantry", price: 19, ref: "FC-14", note: "First-harvest single-estate olive oil in UV-protected glass", variants: ["500 ml", "1 Liter"] },
  { id: 5, name: "Baby Spinach & Kale Salad Mix", cat: "Produce", price: 5, ref: "FC-18", badge: "Washed", note: "Triple-washed tender greens ready for bowls and sautés", variants: ["250 g"] },
  { id: 6, name: "Single-Origin Arabica Whole Beans", cat: "Beverages", price: 16, ref: "FC-23", note: "Medium roast with notes of dark cocoa and roasted hazelnut", variants: ["340 g Whole", "340 g Ground"] },
];

export function FreshCart() {
  const [slot, setSlot] = useState("Today · 17:00 – 19:00");
  return (
    <StorefrontEngine
      brand="FreshCart"
      tagline="Same-day neighborhood grocery market — pick a delivery window, filter aisles, and test live basket totals."
      items={FRESHCART_CATALOG}
      variantLabel="Pack Size"
      freeShippingThreshold={35}
      shippingCost={5}
      headerSlot={
        <div className="d-card" style={{ marginBottom: 18 }}>
          <div className="d-card-head" style={{ flexWrap: "wrap" }}>
            <div>
              <p className="d-cat">Scheduled Delivery Slot</p>
              <strong style={{ fontSize: 16 }}>{slot}</strong>
            </div>
            <div className="d-chips" role="group" aria-label="Choose delivery window">
              {["Today · 17:00 – 19:00", "Today · 19:00 – 21:00", "Tomorrow · 09:00 – 11:00"].map((s) => (
                <button key={s} type="button" aria-pressed={slot === s} className={slot === s ? "on" : ""} onClick={() => setSlot(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}

/* --------------------------------------------------------- 3. Ember Kitchen */
const MENU_ITEMS = [
  { c: "Starters", tag: "Seafood", n: "Charred Octopus", p: 14, d: "Smoked paprika, potato confit, preserved lemon" },
  { c: "Starters", tag: "Vegan", n: "Beetroot Tartare", p: 11, d: "Roasted hazelnut, aged balsamic, toasted rye crisp" },
  { c: "Starters", tag: "Vegetarian", n: "Wood-Fired Flatbread", p: 9, d: "Whipped feta, wild thyme, warm chili honey" },
  { c: "Mains", tag: "Signature", n: "48h Braised Short Rib", p: 27, d: "Bone marrow butter, charred pearl onion, jus" },
  { c: "Mains", tag: "Vegetarian", n: "Wild Mushroom Risotto", p: 21, d: "Carnaroli rice, aged parmesan, black truffle oil" },
  { c: "Mains", tag: "Seafood", n: "Pan-Roasted Sea Bass", p: 26, d: "Braised fennel, saffron broth, coastal samphire" },
  { c: "Desserts", tag: "Vegetarian", n: "Salted Caramel Plate", p: 9, d: "Tonka bean cream, roasted cocoa nib, sea salt" },
  { c: "Desserts", tag: "Vegan", n: "Citrus Panna Cotta", p: 8, d: "Bergamot gel, cold-pressed olive oil, pistachio" },
];

export function EmberKitchen() {
  const [course, setCourse] = useState("All");
  const [diet, setDiet] = useState("All");
  const [tray, setTray] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [f, setF] = useState({ name: "", phone: "", date: "", time: "19:30", guests: "2", seating: "Main Dining" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [ok, setOk] = useState("");

  const courses = ["All", ...new Set(MENU_ITEMS.map((m) => m.c))];
  const diets = ["All", "Vegetarian", "Vegan", "Seafood"];
  const items = MENU_ITEMS.filter(
    (m) => (course === "All" || m.c === course) && (diet === "All" || m.tag === diet)
  );

  const addTray = (name: string, price: number) => {
    setTray((prev) =>
      prev.some((x) => x.name === name)
        ? prev.map((x) => (x.name === name ? { ...x, qty: x.qty + 1 } : x))
        : [...prev, { name, price, qty: 1 }]
    );
  };

  const trayTotal = tray.reduce((sum, x) => sum + x.price * x.qty, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (f.name.trim().length < 2) v.name = "Please enter your name.";
    if (!/^[0-9+\s()-]{7,}$/.test(f.phone)) v.phone = "Enter a valid contact number.";
    if (!f.date) v.date = "Choose a reservation date.";
    else if (new Date(f.date) < new Date(new Date().toDateString())) v.date = "Choose today or a future date.";
    setErr(v);
    if (!Object.keys(v).length) {
      setOk(
        `Sample reservation confirmed for ${f.guests} guest(s) on ${f.date} at ${f.time} (${f.seating}) under ${f.name}. No live restaurant booking was sent.`
      );
      setF({ name: "", phone: "", date: "", time: "19:30", guests: "2", seating: "Main Dining" });
    } else {
      setOk("");
    }
  };

  return (
    <>
      <header className="d-hero">
        <h1>Ember Kitchen</h1>
        <p>Open-fire seasonal kitchen — filter dishes by course or diet, build a takeaway tray, or reserve a table.</p>
      </header>
      <div className="d-split">
        <section>
          <div className="d-toolbar">
            <div className="d-chips" role="group" aria-label="Filter menu by course">
              {courses.map((x) => (
                <button key={x} type="button" aria-pressed={course === x} className={course === x ? "on" : ""} onClick={() => setCourse(x)}>
                  {x}
                </button>
              ))}
            </div>
            <div className="d-chips" role="group" aria-label="Filter by dietary tag">
              {diets.map((d) => (
                <button key={d} type="button" aria-pressed={diet === d} className={diet === d ? "on" : ""} onClick={() => setDiet(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <ul className="d-menu">
            {items.map((m) => (
              <li key={m.n}>
                <div>
                  <span className="d-cat">{m.c} · {m.tag}</span>
                  <h3>{m.n}</h3>
                  <p>{m.d}</p>
                </div>
                <div className="d-row">
                  <span>${m.p}</span>
                  <Btn type="button" kind="ghost" onClick={() => addTray(m.n, m.p)}>
                    + Tray
                  </Btn>
                </div>
              </li>
            ))}
          </ul>

          {tray.length > 0 && (
            <div className="d-card" style={{ marginTop: 18 }}>
              <div className="d-card-head">
                <h2>Takeaway Tray (Sample)</h2>
                <Btn type="button" kind="ghost" onClick={() => setTray([])}>
                  Clear
                </Btn>
              </div>
              <ul className="d-cart-list" style={{ marginTop: 10 }}>
                {tray.map((item) => (
                  <li key={item.name}>
                    <div>
                      <strong>{item.name} × {item.qty}</strong>
                      <span>${item.price * item.qty}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="d-total">
                <span>Estimated Pickup Total</span>
                <strong>${trayTotal}</strong>
              </div>
            </div>
          )}
        </section>

        <section className="d-card" id="reserve">
          <h2>Reserve a Table</h2>
          <form className="d-form" onSubmit={submit} noValidate>
            <Field id="ek-name" label="Guest Name" error={err.name}>
              <input id="ek-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
            </Field>
            <Field id="ek-phone" label="Phone Number" error={err.phone}>
              <input id="ek-phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />
            </Field>
            <div className="d-grid2">
              <Field id="ek-date" label="Date" error={err.date}>
                <input id="ek-date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
              </Field>
              <Field id="ek-time" label="Time">
                <select id="ek-time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })}>
                  <option>18:00</option>
                  <option>19:30</option>
                  <option>21:00</option>
                </select>
              </Field>
            </div>
            <div className="d-grid2">
              <Field id="ek-guests" label="Party Size">
                <select id="ek-guests" value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </Field>
              <Field id="ek-seat" label="Seating">
                <select id="ek-seat" value={f.seating} onChange={(e) => setF({ ...f, seating: e.target.value })}>
                  <option>Main Dining</option>
                  <option>Chef&apos;s Counter</option>
                  <option>Garden Terrace</option>
                </select>
              </Field>
            </div>
            <Btn type="submit">Request Demo Reservation</Btn>
            {ok && (
              <p className="d-success-inline" role="status">
                {ok}
              </p>
            )}
          </form>
        </section>
      </div>
    </>
  );
}

/* --------------------------------------------------------- 4. Haven Properties */
const HOMES_DATA = [
  { id: 1, t: "Terrace on Oak Street", type: "House", beds: 4, price: 745000, city: "Burewala", area: 285, note: "Corner plot, solar ready, double garage, landscaped courtyard" },
  { id: 2, t: "Cedar Court Penthouse", type: "Apartment", beds: 2, price: 312000, city: "Lahore", area: 118, note: "South-facing terrace, gated underground parking, concierge" },
  { id: 3, t: "Riverline Canal Duplex", type: "Apartment", beds: 3, price: 468000, city: "Multan", area: 176, note: "Canal view, private lift lobby, backup power" },
  { id: 4, t: "Orchard Estate Farmhouse", type: "House", beds: 5, price: 980000, city: "Burewala", area: 640, note: "4-acre citrus orchard, deep bore well, guest pavilion" },
  { id: 5, t: "Studio Loft on MG Road", type: "Studio", beds: 1, price: 168000, city: "Faisalabad", area: 62, note: "Turnkey furnished, acoustic glazing, walk to transit" },
  { id: 6, t: "Maple Park Townhouse", type: "Townhouse", beds: 3, price: 395000, city: "Lahore", area: 154, note: "Facing community park, two covered parking bays" },
];

export function Haven() {
  const [type, setType] = useState("All");
  const [beds, setBeds] = useState(0);
  const [max, setMax] = useState(1000000);
  const [open, setOpen] = useState<number | null>(1);
  const [saved, setSaved] = useState<number[]>([1]);
  const [downPct, setDownPct] = useState(20);
  const [ratePct, setRatePct] = useState(6.5);
  const [q, setQ] = useState({ name: "", email: "", msg: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const types = ["All", ...new Set(HOMES_DATA.map((h) => h.type))];
  const list = HOMES_DATA.filter((h) => (type === "All" || h.type === type) && h.beds >= beds && h.price <= max);
  const activeHome = HOMES_DATA.find((h) => h.id === open) || list[0] || HOMES_DATA[0];

  const principal = activeHome.price * (1 - downPct / 100);
  const monthlyRate = ratePct / 100 / 12;
  const months = 20 * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? Math.round((principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)))
      : Math.round(principal / months);

  const toggleSave = (id: number) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (q.name.trim().length < 2) v.name = "Enter your full name.";
    if (!emailOk(q.email)) v.email = "Enter a valid email address.";
    if (q.msg.trim().length < 10) v.msg = "Write at least 10 characters about your viewing preference.";
    setErr(v);
    setSent(!Object.keys(v).length);
  };

  return (
    <>
      <header className="d-hero">
        <h1>Haven</h1>
        <p>Architectural real-estate portal — filter listings, estimate monthly payments, shortlist homes, and inquire.</p>
      </header>

      <div className="d-toolbar">
        <Field id="hv-type" label="Property Type">
          <select id="hv-type" value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field id="hv-beds" label="Min Bedrooms">
          <select id="hv-beds" value={beds} onChange={(e) => setBeds(Number(e.target.value))}>
            <option value={0}>Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </Field>
        <Field id="hv-max" label={`Max Budget: $${max.toLocaleString()}`}>
          <input id="hv-max" type="range" min={150000} max={1000000} step={10000} value={max} onChange={(e) => setMax(Number(e.target.value))} />
        </Field>
      </div>

      <p className="d-count" role="status">
        {list.length} sample propert{list.length === 1 ? "y" : "ies"} · {saved.length} shortlisted
      </p>

      <div className="d-split">
        <div>
          {list.length === 0 ? (
            <div className="d-empty">
              <p>No property matches those filters.</p>
              <Btn
                type="button"
                kind="ghost"
                onClick={() => {
                  setType("All");
                  setBeds(0);
                  setMax(1000000);
                }}
              >
                Reset Filters
              </Btn>
            </div>
          ) : (
            <ul className="d-homes">
              {list.map((h) => (
                <li key={h.id} className={open === h.id ? "open" : ""}>
                  <button
                    type="button"
                    className="d-home-head"
                    onClick={() => setOpen(open === h.id ? null : h.id)}
                    aria-expanded={open === h.id}
                  >
                    <div>
                      <p className="d-cat">
                        {h.type} · {h.city}
                      </p>
                      <h3>{h.t}</h3>
                    </div>
                    <strong>${h.price.toLocaleString()}</strong>
                  </button>
                  {open === h.id && (
                    <div className="d-home-body">
                      <ul>
                        <li>{h.beds} bedrooms</li>
                        <li>{h.area} sq yd</li>
                        <li>{h.note}</li>
                      </ul>
                      <div className="d-row">
                        <Btn type="button" kind="ghost" onClick={() => toggleSave(h.id)}>
                          {saved.includes(h.id) ? "Saved ★" : "Save Listing"}
                        </Btn>
                        <a href="#hv-enquire" className="d-link">
                          Request viewing for {h.t}
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <section className="d-card">
            <p className="d-cat">Interactive Estimator (Sample)</p>
            <h2>Monthly Payment · {activeHome.t}</h2>
            <p className="d-modal-price">${monthlyPayment.toLocaleString()} / mo</p>
            <p className="d-note">20-year illustrative schedule on ${activeHome.price.toLocaleString()} list price.</p>
            <div className="d-grid2" style={{ marginTop: 12 }}>
              <Field id="hv-down" label={`Down Payment (${downPct}%)`}>
                <input id="hv-down" type="range" min={10} max={60} step={5} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} />
              </Field>
              <Field id="hv-rate" label={`Annual Rate (${ratePct}%)`}>
                <input id="hv-rate" type="range" min={3} max={12} step={0.5} value={ratePct} onChange={(e) => setRatePct(Number(e.target.value))} />
              </Field>
            </div>
          </section>

          <section className="d-card" id="hv-enquire">
            <h2>Schedule Private Viewing</h2>
            <form className="d-form" onSubmit={send} noValidate>
              <Field id="hv-name" label="Your Name" error={err.name}>
                <input id="hv-name" value={q.name} onChange={(e) => setQ({ ...q, name: e.target.value })} autoComplete="name" />
              </Field>
              <Field id="hv-email" label="Email" error={err.email}>
                <input id="hv-email" type="email" value={q.email} onChange={(e) => setQ({ ...q, email: e.target.value })} autoComplete="email" />
              </Field>
              <Field id="hv-msg" label="Notes" error={err.msg}>
                <textarea id="hv-msg" rows={3} value={q.msg} onChange={(e) => setQ({ ...q, msg: e.target.value })} />
              </Field>
              <Btn type="submit">Send Demo Inquiry</Btn>
              {sent && (
                <p className="d-success-inline" role="status">
                  Sample inquiry logged for {activeHome.t} ({q.email}). No real broker message was dispatched.
                </p>
              )}
            </form>
          </section>
        </div>
      </div>
    </>
  );
}

/* --------------------------------------------------------- 13. Solis Stays */
const RETREATS = [
  { id: 1, name: "Cliffside Caldera Suite", region: "Santorini", rate: 420, maxGuests: 2, perk: "Private heated plunge pool & caldera terrace" },
  { id: 2, name: "Cedar Forest Glass Cabin", region: "Kyoto", rate: 310, maxGuests: 3, perk: "Hinoki soaking tub & private bamboo garden" },
  { id: 3, name: "Dune Horizon Desert Pavilion", region: "Wadi Rum", rate: 360, maxGuests: 4, perk: "Stargazing skylight & guided desert supper" },
  { id: 4, name: "Alpine Ridge Timber Chalet", region: "Zermatt", rate: 490, maxGuests: 6, perk: "Matterhorn balcony, sauna & ski-in access" },
];

export function SolisStays() {
  const [region, setRegion] = useState("All");
  const [nights, setNights] = useState(3);
  const [guests, setGuests] = useState(2);
  const [selectedId, setSelectedId] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [err, setErr] = useState("");
  const [confirmed, setConfirmed] = useState("");

  const regions = ["All", ...new Set(RETREATS.map((r) => r.region))];
  const visible = RETREATS.filter((r) => (region === "All" || r.region === region) && r.maxGuests >= guests);
  const active = RETREATS.find((r) => r.id === selectedId) || visible[0] || RETREATS[0];
  const staySubtotal = active.rate * nights;
  const serviceFee = Math.round(staySubtotal * 0.12);
  const stayTotal = staySubtotal + serviceFee;

  const book = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim().length < 2 || !emailOk(guestEmail)) {
      setErr("Enter a valid guest name and email address to test the booking confirmation.");
      setConfirmed("");
      return;
    }
    setErr("");
    setConfirmed(
      `Sample reservation confirmed: ${active.name} (${nights} night(s), ${guests} guest(s)) for ${guestName}. Total: $${stayTotal.toLocaleString()}.`
    );
  };

  return (
    <>
      <header className="d-hero">
        <h1>Solis Stays</h1>
        <p>Boutique hotel and villa reservation platform — filter destinations, calculate nightly totals, and book.</p>
      </header>
      <div className="d-toolbar">
        <div className="d-chips" role="group" aria-label="Filter by region">
          {regions.map((r) => (
            <button key={r} type="button" aria-pressed={region === r} className={region === r ? "on" : ""} onClick={() => setRegion(r)}>
              {r}
            </button>
          ))}
        </div>
        <Field id="ss-nights" label={`Nights: ${nights}`}>
          <input id="ss-nights" type="range" min={1} max={14} value={nights} onChange={(e) => setNights(Number(e.target.value))} />
        </Field>
        <Field id="ss-guests" label="Guests">
          <select id="ss-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {[1, 2, 3, 4, 6].map((g) => (
              <option key={g} value={g}>
                {g} Guest{g > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="d-split">
        <ul className="d-homes">
          {visible.map((r) => (
            <li key={r.id} className={active.id === r.id ? "open" : ""}>
              <button type="button" className="d-home-head" onClick={() => setSelectedId(r.id)} aria-pressed={active.id === r.id}>
                <div>
                  <p className="d-cat">{r.region} · Up to {r.maxGuests} guests</p>
                  <h3>{r.name}</h3>
                  <p className="d-note" style={{ marginTop: 4 }}>{r.perk}</p>
                </div>
                <strong>${r.rate}/night</strong>
              </button>
            </li>
          ))}
        </ul>

        <section className="d-card">
          <p className="d-cat">Stay Summary (Sample)</p>
          <h2>{active.name}</h2>
          <div className="d-totals-box" style={{ marginTop: 12 }}>
            <div>
              <span>${active.rate} × {nights} night(s)</span>
              <span>${staySubtotal.toLocaleString()}</span>
            </div>
            <div>
              <span>Hospitality &amp; Cleaning Fee</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <div className="d-total">
              <span>Estimated Total</span>
              <strong>${stayTotal.toLocaleString()}</strong>
            </div>
          </div>
          <form className="d-form" onSubmit={book} noValidate>
            <Field id="ss-name" label="Primary Guest Name">
              <input id="ss-name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </Field>
            <Field id="ss-email" label="Confirmation Email">
              <input id="ss-email" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            </Field>
            {err && <p role="alert" className="d-error">{err}</p>}
            <Btn type="submit">Confirm Demo Reservation</Btn>
            {confirmed && <p className="d-success-inline" role="status">{confirmed}</p>}
          </form>
        </section>
      </div>
    </>
  );
}

/* --------------------------------------------------------- 14. Apex Motors */
const APEX_FRAMES: AngleFrame[] = [
  {
    label: "Front Three-Quarter",
    angleDeg: 0,
    src: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=960&q=80",
    caption: "Apex GT-E electric coupe front three-quarter profile",
  },
  {
    label: "Side Silhouette",
    angleDeg: 90,
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=960&q=80",
    caption: "Aerodynamic side profile and forged alloy wheel geometry",
  },
  {
    label: "Driver Cockpit",
    angleDeg: 180,
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=960&q=80",
    caption: "Driver-focused cockpit and panoramic glass roof",
  },
];

const APEX_PAINTS: ProductFinish[] = [
  { id: "crimson", name: "Track Crimson", swatch: "#dc2626", priceDelta: 0 },
  { id: "obsidian", name: "Stealth Obsidian", swatch: "#18181b", priceDelta: 1500 },
  { id: "glacier", name: "Glacier White", swatch: "#f4f4f5", priceDelta: 1200 },
];

export function ApexMotors() {
  const [paint, setPaint] = useState("crimson");
  const [trim, setTrim] = useState<"Dual-Motor AWD" | "Track Performance">("Dual-Motor AWD");
  const [termMonths, setTermMonths] = useState(48);
  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [bookedMsg, setBookedMsg] = useState("");
  const [formErr, setFormErr] = useState("");

  const paintObj = APEX_PAINTS.find((p) => p.id === paint) || APEX_PAINTS[0];
  const basePrice = trim === "Dual-Motor AWD" ? 68500 : 84900;
  const totalPrice = basePrice + (paintObj.priceDelta || 0);
  const estLease = Math.round(((totalPrice - 7500) * 0.55) / termMonths + 165);

  const scheduleDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverName.trim().length < 2 || !emailOk(driverEmail)) {
      setFormErr("Enter your full name and valid email to schedule a sample test drive.");
      setBookedMsg("");
      return;
    }
    setFormErr("");
    setBookedMsg(
      `Sample test drive scheduled for ${driverName} — Apex GT-E (${trim}, ${paintObj.name}). Confirmation logged locally.`
    );
  };

  return (
    <>
      <header className="d-hero">
        <h1>Apex Motors</h1>
        <p>Performance EV showroom — inspect angles in the 360° viewer, configure trims, estimate lease terms, and book a drive.</p>
      </header>

      <ProductAngleViewer
        title={`Apex GT-E · ${trim} (${paintObj.name})`}
        subtitle="Switch paint finishes and inspect exterior & cockpit angles. Sample automotive photography."
        frames={APEX_FRAMES}
        finishes={APEX_PAINTS}
        selectedFinish={paint}
        onSelectFinish={setPaint}
      />

      <div className="d-split">
        <section className="d-card">
          <p className="d-cat">Powertrain &amp; Lease Configurator</p>
          <h2>Configure Your Build</h2>
          <div className="d-chips" role="group" aria-label="Select trim" style={{ marginTop: 12 }}>
            {(["Dual-Motor AWD", "Track Performance"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={trim === t} className={trim === t ? "on" : ""} onClick={() => setTrim(t)}>
                {t}
              </button>
            ))}
          </div>

          <div className="d-kpis" style={{ marginTop: 16 }}>
            <div>
              <p>0–100 km/h</p>
              <strong>{trim === "Dual-Motor AWD" ? "3.8 s" : "2.9 s"}</strong>
              <span>Sample spec</span>
            </div>
            <div>
              <p>WLTP Range</p>
              <strong>{trim === "Dual-Motor AWD" ? "580 km" : "520 km"}</strong>
              <span>Estimated</span>
            </div>
            <div>
              <p>Configured Price</p>
              <strong>${totalPrice.toLocaleString()}</strong>
              <span>{paintObj.name}</span>
            </div>
          </div>

          <Field id="ap-term" label={`Lease Term: ${termMonths} months (Est. $${estLease}/mo with $7,500 down)`}>
            <input id="ap-term" type="range" min={24} max={60} step={12} value={termMonths} onChange={(e) => setTermMonths(Number(e.target.value))} />
          </Field>
        </section>

        <section className="d-card">
          <p className="d-cat">Showroom Appointment</p>
          <h2>Book a Demo Test Drive</h2>
          <form className="d-form" onSubmit={scheduleDrive} noValidate>
            <Field id="ap-name" label="Driver Full Name">
              <input id="ap-name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </Field>
            <Field id="ap-email" label="Email Address">
              <input id="ap-email" type="email" value={driverEmail} onChange={(e) => setDriverEmail(e.target.value)} />
            </Field>
            {formErr && <p role="alert" className="d-error">{formErr}</p>}
            <Btn type="submit">Reserve Demo Drive Slot</Btn>
            {bookedMsg && <p className="d-success-inline" role="status">{bookedMsg}</p>}
          </form>
        </section>
      </div>
    </>
  );
}
