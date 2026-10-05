"use client";

import { useState, useEffect, useRef } from "react";
import s from "./admin.module.css";

// ── Utilities ──────────────────────────────────────────────────────────────────

function fmtInr(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function statusCls(status) {
  const map = {
    pending: s.badgePending,
    paid: s.badgePaid,
    confirmed: s.badgeConfirmed,
    shipped: s.badgeShipped,
    delivered: s.badgeDelivered,
    payment_failed: s.badgeFailed,
  };
  return map[status] || s.badgePending;
}

async function api(path, opts = {}) {
  const res = await fetch(path, { credentials: "include", ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Login ──────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.loginWrap}>
      <div className={s.loginCard}>
        <p className={s.loginBrand}>DeadKind</p>
        <p className={s.loginSub}>Admin Dashboard</p>
        <form onSubmit={submit}>
          <div className={s.formGroup}>
            <label className={s.label}>Password</label>
            <input
              type="password"
              className={s.input}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>
          {error && <div className={`${s.alert} ${s.alertError}`} style={{ marginBottom: 12 }}>{error}</div>}
          <button className={`${s.btn} ${s.btnFull}`} type="submit" disabled={busy}>
            {busy ? "Verifying…" : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",    label: "Overview",    icon: "▦" },
  { id: "products",   label: "Products",    icon: "◈" },
  { id: "orders",     label: "Orders",      icon: "◉" },
  { id: "categories", label: "Categories",  icon: "◫" },
  { id: "meta",       label: "Meta",        icon: "◐" },
  { id: "messages",   label: "Messages",    icon: "◎" },
];

function Sidebar({ active, onChange, onLogout }) {
  return (
    <aside className={s.sidebar}>
      <div className={s.sidebarTop}>
        <div className={s.sidebarBrand}>DK-2050</div>
        <div className={s.sidebarRole}>Admin Panel</div>
      </div>
      <nav className={s.nav}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${s.navBtn} ${active === t.id ? s.navBtnActive : ""}`}
            onClick={() => onChange(t.id)}
          >
            <span className={s.navIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
      <div className={s.sidebarFoot}>
        <button className={`${s.btn} ${s.btnSecondary} ${s.btnFull} ${s.btnSm}`} onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/stats")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={s.loading}>Loading…</div>;
  if (error) return <div className={`${s.alert} ${s.alertError}`}>{error}</div>;
  if (!data) return null;

  const { totalProducts, activeProducts, totalOrders, totalRevenue, ordersByStatus, recentOrders, lowStockProducts, _mockData } = data;

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Overview</h1>
      </div>

      {_mockData && (
        <div className={`${s.alert} ${s.alertWarn}`}>
          Firebase not configured — showing mock data. Add your service account credentials to see real stats.
        </div>
      )}

      <div className={s.statsGrid}>
        <StatCard label="Total Products" value={totalProducts} sub={`${activeProducts} active`} />
        <StatCard label="Total Orders" value={totalOrders} sub={`${ordersByStatus?.pending || 0} pending`} />
        <StatCard label="Revenue (paid)" value={fmtInr(totalRevenue)} />
        <StatCard label="Paid" value={ordersByStatus?.paid || 0} />
        <StatCard label="Shipped" value={ordersByStatus?.shipped || 0} />
        <StatCard label="Delivered" value={ordersByStatus?.delivered || 0} />
      </div>

      {lowStockProducts?.length > 0 && (
        <div className={s.section}>
          <p className={s.sectionLabel}>⚠ Low Stock — any variant &lt; 5</p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Product</th><th>Low Variants</th></tr></thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td className={s.tdName}>{p.name}</td>
                    <td>{p.lowVariants?.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={s.section}>
        <p className={s.sectionLabel}>Recent Orders</p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recentOrders?.length ? recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className={s.tdName}>{o.orderId}</td>
                  <td>{o.customer?.fullName}</td>
                  <td>{fmtInr(o.pricing?.total)}</td>
                  <td><span className={`${s.badge} ${statusCls(o.status)}`}>{o.status}</span></td>
                  <td className={s.tdMeta}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#333", padding: "24px" }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className={s.statCard}>
      <p className={s.statLabel}>{label}</p>
      <p className={s.statValue}>{value}</p>
      {sub && <p className={s.statSub}>{sub}</p>}
    </div>
  );
}

// ── Product Preview Modal ──────────────────────────────────────────────────────

function ProductPreviewModal({ product, meta, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [openSections, setOpenSections] = useState({ description: true, details: false });

  const images = product.images?.length
    ? product.images
    : Object.values(product.colourImages || {}).flat().filter(Boolean);

  const totalStock = Object.values(product.stock || {}).reduce((a, b) => a + Number(b), 0);
  const inStock = totalStock > 0;

  const discountPct = product.comparePrice && product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const subcatName = meta.subcategories.find((sc) => sc.id === product.subcategoryId)?.name || null;

  function toggle(section) {
    setOpenSections((p) => ({ ...p, [section]: !p[section] }));
  }

  // close on backdrop click
  function onBackdrop(e) { if (e.target === e.currentTarget) onClose(); }

  return (
    <div className={s.previewOverlay} onClick={onBackdrop}>
      <div className={s.previewModal}>
        {/* Header */}
        <div className={s.previewHead}>
          <span className={s.previewHeadLabel}>Product Preview</span>
          <button className={s.previewClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.previewBody}>
          {/* Gallery */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className={s.previewGallery}>
              {images.length ? (
                <img src={images[imgIdx]} alt={product.name} />
              ) : (
                <div className={s.previewGalleryEmpty}>No image</div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    className={`${s.previewGalleryNav} ${s.prev}`}
                    onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  >‹</button>
                  <button
                    className={`${s.previewGalleryNav} ${s.next}`}
                    onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  >›</button>
                  <span className={s.previewGalleryCounter}>
                    {String(imgIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                  </span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className={s.previewThumbs}>
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className={`${s.previewThumb}${i === imgIdx ? " " + s.active : ""}`}
                    onClick={() => setImgIdx(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={s.previewInfo}>
            {subcatName && <div className={s.previewCategory}>{subcatName}</div>}

            <div className={s.previewName}>{product.name}</div>

            <div className={s.previewPriceRow}>
              <span className={s.previewPrice}>{fmtInr(product.price)}</span>
              {product.comparePrice && (
                <span className={s.previewCompare}>{fmtInr(product.comparePrice)}</span>
              )}
              {discountPct && (
                <span className={s.previewDiscount}>-{discountPct}%</span>
              )}
            </div>

            {/* Colour swatches */}
            {product.colours?.length > 0 && (
              <div>
                <div className={s.previewSectionLabel}>Colour</div>
                <div className={s.previewSwatches}>
                  {product.colours.map((cId) => {
                    const col = meta.colours[cId];
                    return (
                      <div
                        key={cId}
                        className={s.previewSwatch}
                        title={col?.name || cId}
                        style={{ background: col?.hex || "#ccc" }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size pills */}
            {product.sizes?.length > 0 && (
              <div>
                <div className={s.previewSectionLabel}>Size</div>
                <div className={s.previewSizes}>
                  {product.sizes.map((szId) => (
                    <div key={szId} className={s.previewSizeBtn}>
                      {meta.sizes[szId] || szId}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className={`${s.previewStockBadge}${inStock ? "" : " " + s.oos}`}>
              {inStock ? `● In Stock (${totalStock} units)` : "● Out of Stock"}
            </div>

            {/* Accordions */}
            <div className={s.previewAccordion}>
              {product.description && (
                <div className={s.previewAccordionItem}>
                  <button className={s.previewAccordionToggle} onClick={() => toggle("description")}>
                    Description
                    <span>{openSections.description ? "−" : "+"}</span>
                  </button>
                  {openSections.description && (
                    <div className={s.previewAccordionContent}>{product.description}</div>
                  )}
                </div>
              )}
              {(product.material || product.fit || product.sku) && (
                <div className={s.previewAccordionItem}>
                  <button className={s.previewAccordionToggle} onClick={() => toggle("details")}>
                    Product Details
                    <span>{openSections.details ? "−" : "+"}</span>
                  </button>
                  {openSections.details && (
                    <div className={s.previewAccordionContent}>
                      {product.material && <div><strong>Material:</strong> {product.material}</div>}
                      {product.fit && <div><strong>Fit:</strong> {product.fit}</div>}
                      {product.sku && <div><strong>SKU:</strong> {product.sku}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Products ───────────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(null); // null = closed, {} = new, {...} = editing
  const [previewProduct, setPreviewProduct] = useState(null);
  const [meta, setMeta] = useState({ categories: [], subcategories: [], colours: {}, sizes: {} });

  async function load() {
    setLoading(true);
    try {
      const [pd, cats, subs, colours, sizes] = await Promise.all([
        api("/api/admin/products"),
        api("/api/admin/categories"),
        api("/api/admin/subcategories"),
        api("/api/colours"),
        api("/api/sizes"),
      ]);
      setProducts(pd.products || []);
      setMeta({
        categories: cats.categories || [],
        subcategories: subs.subcategories || [],
        colours: colours.colours || {},
        sizes: sizes.sizes || {},
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api(`/api/admin/products/${id}`, { method: "DELETE" });
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch (e) { alert(e.message); }
  }

  function handleSaved(product, isNew) {
    if (isNew) setProducts((p) => [product, ...p]);
    else setProducts((p) => p.map((x) => (x.id === product.id ? product : x)));
    setFormData(null);
  }

  const filtered = products.filter(
    (p) => !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Products</h1>
        <button className={s.btn} onClick={() => setFormData({})}>+ Add Product</button>
      </div>

      {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}

      <div className={s.toolbar}>
        <input
          className={`${s.input} ${s.toolbarSearch}`}
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={s.tableWrap}>
        {loading ? (
          <div className={s.loading}>Loading products…</div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: 56 }}></th>
                <th>Name</th><th>Price</th><th>Subcategory</th>
                <th>Status</th><th>Hero</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((p) => {
                const firstImg = p.images?.[0]
                  || (p.colourImages ? Object.values(p.colourImages).flat()[0] : null);
                return (
                <tr key={p.id}>
                  <td style={{ padding: "6px 8px" }}>
                    {firstImg
                      ? <img src={firstImg} alt={p.name} className={s.productThumb} />
                      : <div className={s.productThumbEmpty}>?</div>
                    }
                  </td>
                  <td>
                    <div className={s.tdName}>{p.name}</div>
                    <div className={s.tdMeta}>Stock: {Object.values(p.stock || {}).reduce((a, b) => a + Number(b), 0)}</div>
                  </td>
                  <td>
                    {fmtInr(p.price)}
                    {p.comparePrice && (
                      <span style={{ marginLeft: 6, textDecoration: "line-through", color: "#444", fontSize: 11 }}>
                        {fmtInr(p.comparePrice)}
                      </span>
                    )}
                  </td>
                  <td className={s.tdMeta}>
                    {meta.subcategories.find((sc) => sc.id === p.subcategoryId)?.name || p.subcategoryId}
                  </td>
                  <td>
                    <span className={`${s.badge} ${p.isArchived ? s.badgeArchived : s.badgeActive}`}>
                      {p.isArchived ? "Archived" : "Active"}
                    </span>
                  </td>
                  <td style={{ color: p.hero ? "#fbbf24" : "#333" }}>{p.hero ? "★" : "—"}</td>
                  <td>
                    <div className={s.tdActions}>
                      <button
                        className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`}
                        onClick={() => setPreviewProduct(p)}
                      >View</button>
                      <button
                        className={`${s.btn} ${s.btnSecondary} ${s.btnSm}`}
                        onClick={() => setFormData(p)}
                      >Edit</button>
                      <button
                        className={`${s.btn} ${s.btnDanger} ${s.btnSm}`}
                        onClick={() => handleDelete(p.id)}
                      >Del</button>
                    </div>
                  </td>
                </tr>
              );}) : (
                <tr>
                  <td colSpan={7}>
                    <div className={s.empty}>
                      <p className={s.emptyTitle}>{search ? "No products match" : "No products yet — add one above"}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {formData !== null && (
        <ProductForm
          product={Object.keys(formData).length ? formData : null}
          meta={meta}
          onSaved={handleSaved}
          onClose={() => setFormData(null)}
        />
      )}

      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          meta={meta}
          onClose={() => setPreviewProduct(null)}
        />
      )}
    </>
  );
}

// ── Product Form ───────────────────────────────────────────────────────────────

const BLANK = {
  name: "", price: "", comparePrice: "",
  description: "", material: "", fit: "",
  categoryId: "", subcategoryId: "",
  hero: false, isArchived: false,
  colours: [], sizes: [], images: [], stock: {},
};

function buildStock(colours, sizes, existing = {}) {
  const out = {};
  for (const c of colours) for (const sz of sizes) {
    const k = `${c}_${sz}`;
    out[k] = existing[k] ?? 0;
  }
  return out;
}

function ProductForm({ product, meta, onSaved, onClose }) {
  const isNew = !product;
  const [form, setForm] = useState(() => {
    if (product) {
      // Migrated products store images under colourImages — flatten into images[] if needed
      const images = product.images?.length
        ? product.images
        : Object.values(product.colourImages || {}).flat().filter(Boolean);
      return { ...BLANK, ...product, images, price: product.price?.toString() ?? "", comparePrice: product.comparePrice?.toString() ?? "" };
    }
    const allColours = Object.keys(meta.colours);
    const allSizes = Object.keys(meta.sizes);
    return { ...BLANK, colours: allColours, sizes: allSizes, stock: buildStock(allColours, allSizes, {}) };
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  // If meta loads after the form mounts (race condition), back-fill all colours & sizes
  useEffect(() => {
    if (!isNew) return;
    const allColours = Object.keys(meta.colours);
    const allSizes = Object.keys(meta.sizes);
    if (!allColours.length && !allSizes.length) return;
    setForm((f) => {
      // Only auto-select if nothing is selected yet (don't override user's choices)
      const colours = f.colours.length === 0 ? allColours : f.colours;
      const sizes   = f.sizes.length   === 0 ? allSizes   : f.sizes;
      return { ...f, colours, sizes, stock: buildStock(colours, sizes, f.stock) };
    });
  }, [Object.keys(meta.colours).join(","), Object.keys(meta.sizes).join(",")]);

  const filteredSubs = meta.subcategories.filter((sc) => sc.categoryId === form.categoryId);

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  function toggleColour(id) {
    setForm((f) => {
      const colours = f.colours.includes(id) ? f.colours.filter((c) => c !== id) : [...f.colours, id];
      return { ...f, colours, stock: buildStock(colours, f.sizes, f.stock) };
    });
  }

  function toggleSize(id) {
    setForm((f) => {
      const sizes = f.sizes.includes(id) ? f.sizes.filter((sz) => sz !== id) : [...f.sizes, id];
      return { ...f, sizes, stock: buildStock(f.colours, sizes, f.stock) };
    });
  }

  function setStock(key, val) {
    setForm((f) => ({ ...f, stock: { ...f.stock, [key]: Number(val) || 0 } }));
  }

  async function handleImages(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const data = await api("/api/admin/upload", { method: "POST", body: fd });
        urls.push(data.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      };
      let result;
      if (isNew) {
        result = await api("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        result = await api(`/api/admin/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      onSaved(result.product, isNew);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h2 className={s.panelTitle}>{isNew ? "Add Product" : "Edit Product"}</h2>
          <button className={s.btnIcon} onClick={onClose}>✕</button>
        </div>

        {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ── Basic ── */}
          <div className={s.section}>
            <p className={s.sectionLabel}>Basic Info</p>
            <div className={s.formGroup}>
              <label className={s.label}>Product Name *</label>
              <input className={s.input} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}>
                <label className={s.label}>Price ₹ *</label>
                <input className={s.input} type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} required />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Compare Price ₹</label>
                <input className={s.input} type="number" min="0" value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} placeholder="Strike-through price" />
              </div>
            </div>
            <div className={s.formGroup}>
              <label className={s.label}>Description</label>
              <textarea className={s.textarea} value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
            </div>
            <div className={s.formRow}>
              <div className={s.formGroup}>
                <label className={s.label}>Material</label>
                <input className={s.input} value={form.material} onChange={(e) => set("material", e.target.value)} placeholder="e.g. Cotton Blend" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Fit</label>
                <input className={s.input} value={form.fit} onChange={(e) => set("fit", e.target.value)} placeholder="e.g. Oversized" />
              </div>
            </div>
          </div>

          {/* ── Category ── */}
          <div className={s.section}>
            <p className={s.sectionLabel}>Category</p>
            <div className={s.formRow}>
              <div className={s.formGroup}>
                <label className={s.label}>Category *</label>
                <select
                  className={s.select}
                  value={form.categoryId}
                  onChange={(e) => { set("categoryId", e.target.value); set("subcategoryId", ""); }}
                  required
                >
                  <option value="">Select…</option>
                  {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Subcategory *</label>
                <select
                  className={s.select}
                  value={form.subcategoryId}
                  onChange={(e) => set("subcategoryId", e.target.value)}
                  required
                  disabled={!form.categoryId}
                >
                  <option value="">Select…</option>
                  {filteredSubs.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Flags ── */}
          <div className={s.section}>
            <p className={s.sectionLabel}>Flags</p>
            <Toggle checked={form.hero} onChange={(v) => set("hero", v)} label="Hero product (featured on landing)" />
            <Toggle checked={form.isArchived} onChange={(v) => set("isArchived", v)} label="Archived (hidden from shop)" />
          </div>

          {/* ── Images ── */}
          <div className={s.section}>
            <p className={s.sectionLabel}>Images</p>
            <div className={s.imageRow}>
              {form.images.map((url) => (
                <div key={url} className={s.imgThumb}>
                  <img src={url} alt="" />
                  <button type="button" className={s.imgRemove} onClick={() => setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }))}>✕</button>
                </div>
              ))}
              <label className={s.uploadLabel}>
                {uploading ? "Uploading…" : "+ Add Images"}
                <input
                  ref={fileRef}
                  type="file"
                  className={s.uploadFileInput}
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* ── Colours ── */}
          <div className={s.section}>
            <p className={s.sectionLabel}>Colours</p>
            <div className={s.chips}>
              {Object.entries(meta.colours).map(([id, c]) => (
                <button
                  key={id}
                  type="button"
                  className={`${s.chip} ${form.colours.includes(id) ? s.chipOn : ""}`}
                  onClick={() => toggleColour(id)}
                >
                  <span className={s.colorDot} style={{ background: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sizes ── */}
          <div className={s.section}>
            <p className={s.sectionLabel}>Sizes</p>
            <div className={s.chips}>
              {Object.entries(meta.sizes).map(([id, name]) => (
                <button
                  key={id}
                  type="button"
                  className={`${s.chip} ${form.sizes.includes(id) ? s.chipOn : ""}`}
                  onClick={() => toggleSize(id)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* ── Stock ── */}
          {form.colours.length > 0 && form.sizes.length > 0 && (
            <div className={s.section}>
              <p className={s.sectionLabel}>Stock per Variant</p>
              <div className={s.stockWrap}>
                <table className={s.stockTable}>
                  <thead>
                    <tr>
                      <th>Colour \ Size</th>
                      {form.sizes.map((sid) => <th key={sid}>{meta.sizes[sid]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {form.colours.map((cid) => (
                      <tr key={cid}>
                        <td>
                          <span className={s.colorDot} style={{ background: meta.colours[cid]?.hex, marginRight: 6 }} />
                          {meta.colours[cid]?.name}
                        </td>
                        {form.sizes.map((sid) => (
                          <td key={sid}>
                            <input
                              type="number"
                              className={s.stockInput}
                              value={form.stock[`${cid}_${sid}`] ?? 0}
                              onChange={(e) => setStock(`${cid}_${sid}`, e.target.value)}
                              min="0"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className={`${s.row} ${s.mt16}`}>
            <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={onClose}>Cancel</button>
            <button type="submit" className={s.btn} disabled={saving} style={{ marginLeft: "auto" }}>
              {saving ? "Saving…" : isNew ? "Create Product" : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className={s.toggleRow}>
      <label className={s.toggleWrap}>
        <input type="checkbox" className={s.toggleInput} checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={s.toggleTrack} />
      </label>
      {label && <span className={s.toggleLabel}>{label}</span>}
    </div>
  );
}

// ── Orders — Pipeline View ─────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: "paid",      label: "PENDING ORDERS",   sub: "Paid, awaiting confirmation", nextStatus: "confirmed", btnLabel: "✓ Confirm Order",   btnVariant: "blue",   statColor: "amber"  },
  { key: "confirmed", label: "CONFIRMED ORDERS",  sub: "Ready to ship",               nextStatus: "shipped",   btnLabel: "📦 Mark Shipped",   btnVariant: "purple", statColor: "blue"   },
  { key: "shipped",   label: "SHIPPED ORDERS",    sub: "Out for delivery",             nextStatus: "delivered", btnLabel: "🚚 Mark Delivered", btnVariant: "green",  statColor: "purple" },
  { key: "delivered", label: "DELIVERED ORDERS",  sub: "Successfully delivered",       nextStatus: null,        btnLabel: null,                btnVariant: null,     statColor: "green"  },
];

const STAT_COLOR_CLS = { amber: "pipeStatAmber", blue: "pipeStatBlue", purple: "pipeStatPurple", green: "pipeStatGreen" };
const SEC_COLOR_CLS  = { amber: "sectionAmber",  blue: "sectionBlue",  purple: "sectionPurple",  green: "sectionGreen"  };
const BTN_VARIANT_CLS = { blue: "btnAdvanceBlue", purple: "btnAdvancePurple", green: "btnAdvanceGreen" };

function fmtDate(ts) {
  if (!ts) return "—";
  const d = typeof ts === "number" ? new Date(ts) : ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [advancing, setAdvancing] = useState({});

  useEffect(() => {
    api("/api/admin/orders")
      .then((d) => setOrders(d.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function matchSearch(o) {
    if (!search) return true;
    const q = search.toLowerCase();
    return [o.orderId, o.customer?.fullName, o.customer?.email, o.customer?.phone]
      .filter(Boolean).join(" ").toLowerCase().includes(q);
  }

  async function advance(id, nextStatus) {
    setAdvancing((a) => ({ ...a, [id]: true }));
    try {
      const data = await api(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      setOrders((list) => list.map((x) => (x.id === id ? { ...x, ...data } : x)));
    } catch (e) {
      alert(e.message);
    } finally {
      setAdvancing((a) => ({ ...a, [id]: false }));
    }
  }

  const counts = PIPELINE_STAGES.reduce((acc, st) => {
    acc[st.key] = orders.filter((o) => o.status === st.key).length;
    return acc;
  }, {});

  const stages = filter === "all" ? PIPELINE_STAGES : PIPELINE_STAGES.filter((p) => p.key === filter);

  if (loading) return <div className={s.loading}>Loading orders…</div>;

  return (
    <>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Order Pipeline</h1>
          <p className={s.pageMeta}>Track orders from payment to delivery · {orders.length} total</p>
        </div>
      </div>

      {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}

      {/* Stat cards */}
      <div className={s.pipeStats}>
        {PIPELINE_STAGES.map((st) => (
          <div
            key={st.key}
            className={`${s.pipeStat} ${s[STAT_COLOR_CLS[st.statColor]]} ${filter === st.key ? s.pipeStatActiveFilter : ""}`}
            onClick={() => setFilter(filter === st.key ? "all" : st.key)}
          >
            <p className={s.pipeStatLabel}>{st.key === "paid" ? "Pending" : st.key.charAt(0).toUpperCase() + st.key.slice(1)}</p>
            <p className={s.pipeStatVal}>{counts[st.key] || 0}</p>
            <p className={s.pipeStatDesc}>{st.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className={s.ordersBar}>
        <input
          className={`${s.input} ${s.toolbarSearch}`}
          placeholder="Search by order ID, name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={`${s.filterBtn} ${filter === "all" ? s.filterBtnActive : ""}`} onClick={() => setFilter("all")}>All</button>
        {PIPELINE_STAGES.map((st) => (
          <button key={st.key} className={`${s.filterBtn} ${filter === st.key ? s.filterBtnActive : ""}`} onClick={() => setFilter(st.key)}>
            <span className={s.filterDot} style={{ background: { amber: "#f59e0b", blue: "#3b82f6", purple: "#a855f7", green: "#22c55e" }[st.statColor] }} />
            {st.key === "paid" ? "Pending" : st.key.charAt(0).toUpperCase() + st.key.slice(1)}
          </button>
        ))}
      </div>

      {/* Pipeline sections */}
      {stages.map((st) => {
        const stageOrders = orders.filter((o) => o.status === st.key && matchSearch(o));
        return (
          <div key={st.key} className={`${s.pipeSection} ${s[SEC_COLOR_CLS[st.statColor]]}`}>
            <div className={s.pipeSectionHead}>
              <span className={s.pipeSectionDot} />
              <span className={s.pipeSectionTitle}>{st.label}</span>
              <span className={s.pipeSectionCount}>{stageOrders.length}</span>
            </div>
            <div className={s.pipeSectionBody}>
              {stageOrders.length === 0 ? (
                <div className={s.empty}>
                  <p className={s.emptyTitle}>{st.key === "delivered" ? "🎉 Delivered orders appear here" : `No ${st.key} orders`}</p>
                </div>
              ) : stageOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  stage={st}
                  expanded={!!expanded[order.id]}
                  advancing={!!advancing[order.id]}
                  onToggle={() => setExpanded((e) => ({ ...e, [order.id]: !e[order.id] }))}
                  onAdvance={() => advance(order.id, st.nextStatus)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function OrderCard({ order, stage, expanded, advancing, onToggle, onAdvance }) {
  const customer = order.customer || {};
  const shipping  = order.shipping  || {};
  const pricing   = order.pricing   || {};
  const items     = order.items     || [];
  const rzp       = order.razorpay  || {};

  const addrParts = [shipping.address1, shipping.address2, shipping.city, shipping.state, shipping.pincode].filter(Boolean);

  return (
    <div className={s.orderCard}>
      <div className={s.orderCardMain}>
        {/* ── Left ── */}
        <div className={s.orderLeft}>
          <div className={s.orderTopRow}>
            <span className={s.orderIdBadge}>#{order.orderId || order.id}</span>
            <span className={s.orderDate}>{fmtDate(order.createdAt)}</span>
            <span className={s.orderPaidBadge}>✓ PAID</span>
            {order.paymentMethod && <span className={s.orderMethodTag}>{order.paymentMethod.toUpperCase()}</span>}
          </div>

          <div className={s.orderCustomerRow}>
            <span className={s.customerName}>{customer.fullName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "—"}</span>
            {customer.phone && <span className={s.customerContact}>📱 {customer.phone}</span>}
            {customer.email && <span className={s.customerContact}>✉ {customer.email}</span>}
          </div>

          <div className={s.orderAddr}>
            <div className={s.addrLabel}>Ship To</div>
            {addrParts.join(", ") || "—"}
          </div>

          <div className={s.itemChips}>
            {items.slice(0, 4).map((item, i) => (
              <div key={i} className={s.itemChip}>
                {item.images?.[0] ? <img className={s.itemChipImg} src={item.images[0]} alt={item.name} /> : <span style={{ fontSize: 14 }}>👕</span>}
                <span>{item.name}</span>
                {(item.sizeName || item.size) && <span style={{ color: "#94a3b8" }}>/ {item.sizeName || item.size}</span>}
                <span className={s.itemQty}>×{item.qty}</span>
              </div>
            ))}
            {items.length > 4 && <div className={s.itemChip}>+{items.length - 4} more</div>}
          </div>
        </div>

        {/* ── Right ── */}
        <div className={s.orderRight}>
          <div>
            <div className={s.orderTotalLabel}>Order Total</div>
            <div className={s.orderTotalVal}>₹{Number(pricing.total || 0).toLocaleString("en-IN")}</div>
          </div>
          {rzp.paymentId && <div className={s.rzpId}>RZP: {rzp.paymentId}</div>}
          <div className={s.orderActions}>
            <button className={s.btnToggleDetail} onClick={onToggle}>
              Details {expanded ? "▴" : "▾"}
            </button>
            {stage.nextStatus && (
              <button
                className={`${s.btnAdvance} ${s[BTN_VARIANT_CLS[stage.btnVariant]]}`}
                onClick={onAdvance}
                disabled={advancing}
              >
                {advancing ? "Updating…" : stage.btnLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && <OrderDetail order={order} items={items} pricing={pricing} rzp={rzp} shipping={shipping} customer={customer} />}
    </div>
  );
}

function OrderDetail({ order, items, pricing, rzp, shipping, customer }) {
  return (
    <div className={s.orderDetailWrap}>
      <div className={s.detailGrid}>
        <div className={s.detailBlock}>
          <p className={s.detailBlockTitle}>Customer Info</p>
          <div className={s.detailRow}><span className={s.detailKey}>Name</span><span className={s.detailVal}>{customer.fullName || "—"}</span></div>
          <div className={s.detailRow}><span className={s.detailKey}>Email</span><span className={`${s.detailVal} ${s.detailValMono}`}>{customer.email || "—"}</span></div>
          <div className={s.detailRow}><span className={s.detailKey}>Phone</span><span className={`${s.detailVal} ${s.detailValMono}`}>{customer.phone || "—"}</span></div>
        </div>

        <div className={s.detailBlock}>
          <p className={s.detailBlockTitle}>Shipping Address</p>
          <div className={s.detailRow}><span className={s.detailKey}>Address</span><span className={s.detailVal}>{[shipping.address1, shipping.address2].filter(Boolean).join(" · ") || "—"}</span></div>
          <div className={s.detailRow}><span className={s.detailKey}>City</span><span className={s.detailVal}>{shipping.city || "—"}</span></div>
          <div className={s.detailRow}><span className={s.detailKey}>State</span><span className={s.detailVal}>{shipping.state || "—"}</span></div>
          <div className={s.detailRow}><span className={s.detailKey}>Pincode</span><span className={`${s.detailVal} ${s.detailValMono}`}>{shipping.pincode || "—"}</span></div>
        </div>

        <div className={s.detailBlock}>
          <p className={s.detailBlockTitle}>Payment Info</p>
          <div className={s.detailRow}><span className={s.detailKey}>Method</span><span className={s.detailVal}>{(order.paymentMethod || "—").toUpperCase()}</span></div>
          {rzp.paymentId && <div className={s.detailRow}><span className={s.detailKey}>Payment ID</span><span className={`${s.detailVal} ${s.detailValMono}`}>{rzp.paymentId}</span></div>}
          {rzp.orderId   && <div className={s.detailRow}><span className={s.detailKey}>RZP Order</span><span className={`${s.detailVal} ${s.detailValMono}`}>{rzp.orderId}</span></div>}
          <div className={s.detailRow}><span className={s.detailKey}>Pay Status</span><span className={s.detailVal}>{(order.paymentStatus || "—").toUpperCase()}</span></div>
        </div>

        <div className={s.detailBlock}>
          <p className={s.detailBlockTitle}>Timeline</p>
          <div className={s.detailRow}><span className={s.detailKey}>Placed</span>    <span className={`${s.detailVal} ${s.detailValMono}`}>{fmtDate(order.createdAt)}</span></div>
          <div className={s.detailRow}><span className={s.detailKey}>Confirmed</span> <span className={`${s.detailVal} ${s.detailValMono}`}>{fmtDate(order.confirmedAt)}</span></div>
          <div className={s.detailRow}><span className={s.detailKey}>Shipped</span>   <span className={`${s.detailVal} ${s.detailValMono}`}>{fmtDate(order.shippedAt)}</span></div>
          <div className={s.detailRow}><span className={s.detailKey}>Delivered</span> <span className={`${s.detailVal} ${s.detailValMono}`}>{fmtDate(order.deliveredAt)}</span></div>
        </div>
      </div>

      {/* Items table */}
      <div className={s.detailBlock} style={{ marginTop: 14 }}>
        <p className={s.detailBlockTitle}>Order Items</p>
        <table className={s.detailTable}>
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>
                  <div className={s.detailItemName}>{item.name}</div>
                  <div className={s.detailItemMeta}>{[item.colourName, item.sizeName || item.size].filter(Boolean).join(" · ")}</div>
                </td>
                <td style={{ textAlign: "center" }}>{item.qty}</td>
                <td style={{ textAlign: "right" }}>₹{Number(item.price).toLocaleString("en-IN")}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>₹{Number(item.lineTotal || item.price * item.qty).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={s.detailFootRow}>
              <td colSpan={3} style={{ textAlign: "right", color: "#64748b", fontWeight: 600 }}>Subtotal</td>
              <td style={{ textAlign: "right", fontWeight: 600 }}>₹{Number(pricing.subtotal || pricing.total || 0).toLocaleString("en-IN")}</td>
            </tr>
            <tr className={s.detailFootRow}>
              <td colSpan={3} style={{ textAlign: "right", color: "#94a3b8" }}>Shipping</td>
              <td style={{ textAlign: "right", color: "#16a34a", fontWeight: 700 }}>FREE</td>
            </tr>
            <tr className={s.detailFootRow}>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: 800, fontSize: 15, color: "#0f172a" }}>TOTAL</td>
              <td style={{ textAlign: "right", fontWeight: 800, fontSize: 18, color: "#0f172a" }}>₹{Number(pricing.total || 0).toLocaleString("en-IN")}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {order.notes && (
        <div className={s.notesBlock}>
          <p className={s.notesLabel}>Customer Note</p>
          {order.notes}
        </div>
      )}
      {order.gstin && <p style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>GSTIN: {order.gstin}</p>}
    </div>
  );
}

// ── Categories ─────────────────────────────────────────────────────────────────

function CategoriesTab() {
  const [cats, setCats] = useState([]);
  const [subs, setSubs] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState("");
  const [newSubCat, setNewSubCat] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const [c, s] = await Promise.all([api("/api/admin/categories"), api("/api/admin/subcategories")]);
    setCats(c.categories || []);
    setSubs(s.subcategories || []);
    if (!newSubCat && c.categories?.length) setNewSubCat(c.categories[0].id);
    setLoading(false);
  }

  useEffect(() => { load().catch((e) => { setError(e.message); setLoading(false); }); }, []);

  async function addCat() {
    if (!newCat.trim()) return;
    try {
      const d = await api("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCat.trim() }) });
      setCats((c) => [...c, d.category]);
      setNewCat("");
    } catch (e) { alert(e.message); }
  }

  async function delCat(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await api(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      setCats((c) => c.filter((x) => x.id !== id));
    } catch (e) { alert(e.message); }
  }

  async function addSub() {
    if (!newSub.trim() || !newSubCat) return;
    try {
      const d = await api("/api/admin/subcategories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newSub.trim(), categoryId: newSubCat }) });
      setSubs((s) => [...s, d.subcategory]);
      setNewSub("");
    } catch (e) { alert(e.message); }
  }

  async function delSub(id) {
    if (!confirm("Delete this subcategory?")) return;
    try {
      await api(`/api/admin/subcategories?id=${id}`, { method: "DELETE" });
      setSubs((s) => s.filter((x) => x.id !== id));
    } catch (e) { alert(e.message); }
  }

  if (loading) return <div className={s.loading}>Loading…</div>;

  return (
    <>
      <div className={s.pageHeader}><h1 className={s.pageTitle}>Categories</h1></div>
      {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}
      <div className={s.catGrid}>
        {/* Categories */}
        <div className={s.catBox}>
          <p className={s.catBoxTitle}>Categories</p>
          {cats.map((c) => (
            <div key={c.id} className={s.catItem}>
              <span className={s.catItemName}>{c.name}</span>
              <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => delCat(c.id)}>Delete</button>
            </div>
          ))}
          {!cats.length && <p style={{ color: "#333", fontSize: 12, padding: "8px 0" }}>No categories yet</p>}
          <div className={s.addRow}>
            <input className={s.input} placeholder="New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCat()} />
            <button className={s.btn} onClick={addCat}>Add</button>
          </div>
        </div>

        {/* Subcategories */}
        <div className={s.catBox}>
          <p className={s.catBoxTitle}>Subcategories</p>
          {subs.map((sc) => (
            <div key={sc.id} className={s.catItem}>
              <span className={s.catItemName}>
                {sc.name}
                <span className={s.catItemSub}>({cats.find((c) => c.id === sc.categoryId)?.name || sc.categoryId})</span>
              </span>
              <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => delSub(sc.id)}>Delete</button>
            </div>
          ))}
          {!subs.length && <p style={{ color: "#333", fontSize: 12, padding: "8px 0" }}>No subcategories yet</p>}
          <div style={{ marginTop: 12 }}>
            <div className={s.formGroup}>
              <label className={s.label}>Under category</label>
              <select className={s.select} value={newSubCat} onChange={(e) => setNewSubCat(e.target.value)}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={s.addRow}>
              <input className={s.input} placeholder="New subcategory name" value={newSub} onChange={(e) => setNewSub(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSub()} />
              <button className={s.btn} onClick={addSub}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Meta (Colours & Sizes) ─────────────────────────────────────────────────────

function MetaTab() {
  const [colours, setColours] = useState({});
  const [sizes, setSizes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New colour form
  const [newColourName, setNewColourName] = useState("");
  const [newColourHex, setNewColourHex] = useState("#000000");
  const [addingColour, setAddingColour] = useState(false);

  // New size form
  const [newSizeName, setNewSizeName] = useState("");
  const [addingSize, setAddingSize] = useState(false);

  useEffect(() => {
    Promise.all([api("/api/admin/colours"), api("/api/admin/sizes")])
      .then(([c, sz]) => {
        setColours(c.colours || {});
        setSizes(sz.sizes || {});
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function addColour() {
    if (!newColourName.trim()) return;
    setAddingColour(true);
    try {
      const data = await api("/api/admin/colours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newColourName.trim(), hex: newColourHex }),
      });
      setColours((c) => ({ ...c, [data.id]: data.colour }));
      setNewColourName("");
      setNewColourHex("#000000");
    } catch (e) { alert(e.message); }
    finally { setAddingColour(false); }
  }

  async function delColour(id) {
    if (!confirm(`Delete colour "${colours[id]?.name}"?`)) return;
    try {
      await api(`/api/admin/colours?id=${id}`, { method: "DELETE" });
      setColours((c) => { const n = { ...c }; delete n[id]; return n; });
    } catch (e) { alert(e.message); }
  }

  async function addSize() {
    if (!newSizeName.trim()) return;
    setAddingSize(true);
    try {
      const data = await api("/api/admin/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSizeName.trim() }),
      });
      setSizes((sz) => ({ ...sz, [data.id]: data.name }));
      setNewSizeName("");
    } catch (e) { alert(e.message); }
    finally { setAddingSize(false); }
  }

  async function delSize(id) {
    if (!confirm(`Delete size "${sizes[id]}"?`)) return;
    try {
      await api(`/api/admin/sizes?id=${id}`, { method: "DELETE" });
      setSizes((sz) => { const n = { ...sz }; delete n[id]; return n; });
    } catch (e) { alert(e.message); }
  }

  if (loading) return <div className={s.loading}>Loading…</div>;

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Meta</h1>
        <span className={s.pageMeta}>Manage colours &amp; sizes used across products</span>
      </div>

      {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}

      <div className={s.catGrid}>
        {/* ── Colours ── */}
        <div className={s.catBox}>
          <p className={s.catBoxTitle}>Colours ({Object.keys(colours).length})</p>
          {Object.entries(colours).map(([id, c]) => (
            <div key={id} className={s.catItem}>
              <span className={s.colorDot} style={{ background: c.hex, width: 18, height: 18, borderRadius: 2, border: "1px solid #e2e8f0", flexShrink: 0 }} />
              <span className={s.catItemName} style={{ marginLeft: 8 }}>
                {c.name}
                <span className={s.catItemSub}>{c.hex}</span>
              </span>
              <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => delColour(id)}>Delete</button>
            </div>
          ))}
          {!Object.keys(colours).length && <p style={{ color: "#94a3b8", fontSize: 12, padding: "8px 0" }}>No colours yet</p>}

          <div className={s.metaAddRow}>
            <input
              type="color"
              className={s.colorPicker}
              value={newColourHex}
              onChange={(e) => setNewColourHex(e.target.value)}
              title="Pick colour"
            />
            <input
              className={s.input}
              placeholder="Colour name (e.g. Jet Black)"
              value={newColourName}
              onChange={(e) => setNewColourName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addColour()}
              style={{ flex: 1 }}
            />
            <button className={s.btn} onClick={addColour} disabled={addingColour}>
              {addingColour ? "…" : "Add"}
            </button>
          </div>
          <p className={s.metaHint}>Hex: <strong>{newColourHex}</strong></p>
        </div>

        {/* ── Sizes ── */}
        <div className={s.catBox}>
          <p className={s.catBoxTitle}>Sizes ({Object.keys(sizes).length})</p>
          {Object.entries(sizes).map(([id, name]) => (
            <div key={id} className={s.catItem}>
              <span className={s.metaSizeChip}>{name}</span>
              <span className={s.catItemName} style={{ marginLeft: 8 }}>{name}</span>
              <span className={s.catItemSub} style={{ marginLeft: 4, flex: 1 }}>{id}</span>
              <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => delSize(id)}>Delete</button>
            </div>
          ))}
          {!Object.keys(sizes).length && <p style={{ color: "#94a3b8", fontSize: 12, padding: "8px 0" }}>No sizes yet</p>}

          <div className={s.addRow} style={{ marginTop: 14 }}>
            <input
              className={s.input}
              placeholder="Size label (e.g. XL or 32)"
              value={newSizeName}
              onChange={(e) => setNewSizeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSize()}
            />
            <button className={s.btn} onClick={addSize} disabled={addingSize}>
              {addingSize ? "…" : "Add"}
            </button>
          </div>
          <p className={s.metaHint}>Sizes appear in product form &amp; on the shop.</p>
        </div>
      </div>
    </>
  );
}

// ── Messages ───────────────────────────────────────────────────────────────────

function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/messages")
      .then((d) => setMessages(d.messages || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={s.loading}>Loading…</div>;

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Contact Messages</h1>
        <span className={s.pageMeta}>{messages.length} messages</span>
      </div>
      {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}
      {messages.length ? messages.map((m) => (
        <div key={m.id} className={s.msgCard}>
          <div className={s.msgMeta}>
            <span className={s.msgMetaItem}><strong style={{ color: "#888" }}>{m.name}</strong></span>
            <span className={s.msgMetaItem}>{m.email}</span>
            <span className={s.msgMetaItem}>{new Date(m.timestamp).toLocaleString("en-IN")}</span>
            <span className={`${s.badge} ${s.badgePending}`} style={{ fontSize: 9 }}>{m.status || "new"}</span>
          </div>
          <p className={s.msgSubject}>{m.subject}</p>
          <p className={s.msgBody}>{m.message}</p>
        </div>
      )) : (
        <div className={s.empty}><p className={s.emptyTitle}>No contact messages yet</p></div>
      )}
    </>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

export default function AdminApp({ initialAuth }) {
  const [isAuth, setIsAuth] = useState(initialAuth);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dk_admin_tab");
      if (saved) setTab(saved);
    } catch {}
  }, []);

  function changeTab(t) {
    setTab(t);
    try { localStorage.setItem("dk_admin_tab", t); } catch {}
  }

  async function logout() {
    await api("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    setIsAuth(false);
    try { localStorage.removeItem("dk_admin_tab"); } catch {}
  }

  if (!isAuth) return <LoginPage onLogin={() => setIsAuth(true)} />;

  return (
    <div className={s.root}>
      <Sidebar active={tab} onChange={changeTab} onLogout={logout} />
      <main className={s.main}>
        {tab === "overview"    && <OverviewTab />}
        {tab === "products"   && <ProductsTab />}
        {tab === "orders"     && <OrdersTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "meta"       && <MetaTab />}
        {tab === "messages"   && <MessagesTab />}
      </main>
    </div>
  );
}
