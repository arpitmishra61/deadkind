"use client";

import { useEffect, useMemo, useState } from "react";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import ProductCard from "@/components/shop/ProductCard";
import { apiGet } from "@/lib/apiClient";
import styles from "./Collection.module.css";

const SORT_OPTIONS = [
  { value: "featured", label: "FEATURED" },
  { value: "price-asc", label: "PRICE: LOW–HIGH" },
  { value: "price-desc", label: "PRICE: HIGH–LOW" },
  { value: "newest", label: "NEWEST" },
  { value: "name-asc", label: "NAME A–Z" },
];

const roundDown50 = (n) => Math.floor(n / 50) * 50;
const roundUp50 = (n) => Math.ceil(n / 50) * 50;

function GridIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="0" width="6" height="6" />
      <rect x="8" y="0" width="6" height="6" />
      <rect x="0" y="8" width="6" height="6" />
      <rect x="8" y="8" width="6" height="6" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor">
      <rect x="0" y="0" width="14" height="3" />
      <rect x="0" y="5.5" width="14" height="3" />
      <rect x="0" y="11" width="14" height="3" />
    </svg>
  );
}

function FilterBlock({ label, open, onToggle, children }) {
  return (
    <div className={styles["filter-block"]}>
      <button type="button" className={`${styles["filter-header"]} ${open ? styles.open : ""}`} onClick={onToggle}>
        {label} <span className={styles["filter-toggle-icon"]}>+</span>
      </button>
      <div className={`${styles["filter-body"]} ${open ? styles.open : ""}`}>{children}</div>
    </div>
  );
}

function PriceRangeSlider({ bounds, value, onChange }) {
  const [boundMin, boundMax] = bounds;
  const [lo, hi] = value;
  const pct = (v) => (boundMax === boundMin ? 0 : ((v - boundMin) / (boundMax - boundMin)) * 100);

  return (
    <div className={styles["price-range-wrap"]}>
      <div className={styles["price-range-labels"]}>
        <span>₹{lo}</span>
        <span>₹{hi}</span>
      </div>
      <div style={{ position: "relative", padding: "0 4px", height: 20 }}>
        <div className={styles["price-slider-track"]} />
        <div
          className={styles["price-slider-fill"]}
          style={{ left: `${pct(lo)}%`, width: `${Math.max(0, pct(hi) - pct(lo))}%` }}
        />
        <input
          type="range"
          className={styles["price-input"]}
          min={boundMin}
          max={boundMax}
          step={50}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        />
        <input
          type="range"
          className={styles["price-input"]}
          min={boundMin}
          max={boundMax}
          step={50}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        />
      </div>
    </div>
  );
}

export default function CollectionBrowser({
  initialProducts,
  categories,
  initialSubcategories,
  colours,
  sizes,
  initialCategory,
  initialCollections,
}) {
  const [products] = useState(initialProducts);
  const [subcategories, setSubcategories] = useState(initialSubcategories);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedCollections, setSelectedCollections] = useState(initialCollections);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColours, setSelectedColours] = useState([]);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState("grid");
  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [openBlocks, setOpenBlocks] = useState({ collection: true, size: false, color: false, price: false });

  const priceBounds = useMemo(() => {
    if (!products.length) return [0, 10000];
    const prices = products.map((p) => p.price || 0);
    return [roundDown50(Math.min(...prices)), roundUp50(Math.max(...prices))];
  }, [products]);

  const [priceRange, setPriceRange] = useState(priceBounds);
  const [priceRangeTouched, setPriceRangeTouched] = useState(false);

  useEffect(() => {
    if (!priceRangeTouched) setPriceRange(priceBounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceBounds[0], priceBounds[1]]);

  const [skipCategoryEffect, setSkipCategoryEffect] = useState(true);
  useEffect(() => {
    if (skipCategoryEffect) {
      setSkipCategoryEffect(false);
      return;
    }
    apiGet(`/api/subcategories${activeCategory !== "all" ? `?categoryId=${activeCategory}` : ""}`)
      .then((data) => setSubcategories(data.subcategories || []))
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  function subcategoryName(id) {
    return subcategories.find((c) => c.id === id)?.name || "—";
  }

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "all") list = list.filter((p) => p.categoryId === activeCategory);
    if (selectedCollections.length) list = list.filter((p) => selectedCollections.includes(p.subcategoryId));
    if (selectedSizes.length) list = list.filter((p) => (p.sizes || []).some((id) => selectedSizes.includes(id)));
    if (selectedColours.length) list = list.filter((p) => (p.colours || []).some((id) => selectedColours.includes(id)));
    list = list.filter((p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]);

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "newest") sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else if (sort === "name-asc") sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else sorted.sort((a, b) => (b.hero ? 1 : 0) - (a.hero ? 1 : 0));
    return sorted;
  }, [products, activeCategory, selectedCollections, selectedSizes, selectedColours, priceRange, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageProducts = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const categoryCounts = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.id === "all" ? products.length : products.filter((p) => p.categoryId === cat.id).length;
    });
    return map;
  }, [categories, products]);

  const collectionCounts = useMemo(() => {
    const map = {};
    subcategories.forEach((col) => {
      map[col.id] = products.filter((p) => p.subcategoryId === col.id).length;
    });
    return map;
  }, [subcategories, products]);

  function selectCategory(id) {
    setActiveCategory(id);
    setSelectedCollections([]);
    setCurrentPage(1);
  }
  function toggleCollection(id) {
    setCurrentPage(1);
    setSelectedCollections((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleSize(id) {
    setCurrentPage(1);
    setSelectedSizes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleColour(id) {
    setCurrentPage(1);
    setSelectedColours((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleWish(id) {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleBlock(key) {
    setOpenBlocks((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function handlePriceChange(range) {
    setPriceRangeTouched(true);
    setCurrentPage(1);
    setPriceRange(range);
  }
  function resetPrice() {
    setPriceRangeTouched(false);
    setPriceRange(priceBounds);
    setCurrentPage(1);
  }

  const activeFilterPills = [
    ...selectedCollections.map((id) => ({ type: "collection", id, label: subcategoryName(id) })),
    ...selectedSizes.map((id) => ({ type: "size", id, label: `SIZE: ${sizes[id] || id}` })),
    ...selectedColours.map((id) => ({
      type: "colour",
      id,
      label: (colours[id]?.name || id).toUpperCase(),
      hex: colours[id]?.hex,
    })),
  ];
  const priceIsFiltered = priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1];

  function removePill(pill) {
    if (pill.type === "collection") toggleCollection(pill.id);
    else if (pill.type === "size") toggleSize(pill.id);
    else if (pill.type === "colour") toggleColour(pill.id);
  }

  const pageList = useMemo(() => {
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) range.push(i);
      else if (range[range.length - 1] !== "…") range.push("…");
    }
    return range;
  }, [totalPages, safePage]);

  const sidebarContent = (
    <>
      <div className={styles["sidebar-section-title"]}>/// SHOP SYSTEM_</div>
      <div className={styles["sidebar-cats"]}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles["sidebar-cat"]} ${activeCategory === cat.id ? styles.active : ""}`}
            onClick={() => selectCategory(cat.id)}
          >
            {cat.name}
            <span className={styles.count}>{String(categoryCounts[cat.id] || 0).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
      <div className={styles["sidebar-section-title"]}>/// FILTERS_</div>
      <FilterBlock label="COLLECTION" open={openBlocks.collection} onToggle={() => toggleBlock("collection")}>
        {subcategories.length === 0 ? (
          <div className={styles["no-collections"]}>NO COLLECTIONS</div>
        ) : (
          subcategories.map((col) => (
            <label key={col.id} className={styles["filter-check-item"]}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(col.id)}
                  onChange={() => toggleCollection(col.id)}
                />
                {col.name}
              </span>
              <span className={styles["filter-count"]}>{String(collectionCounts[col.id] || 0).padStart(2, "0")}</span>
            </label>
          ))
        )}
      </FilterBlock>
      <FilterBlock label="SIZE" open={openBlocks.size} onToggle={() => toggleBlock("size")}>
        <div className={styles["size-grid"]}>
          {Object.entries(sizes).map(([id, name]) => (
            <button
              key={id}
              type="button"
              className={`${styles["size-btn"]} ${selectedSizes.includes(id) ? styles.active : ""}`}
              onClick={() => toggleSize(id)}
            >
              {name}
            </button>
          ))}
        </div>
      </FilterBlock>
      <FilterBlock label="COLOR" open={openBlocks.color} onToggle={() => toggleBlock("color")}>
        <div className={styles["color-filter-grid"]}>
          {Object.entries(colours).map(([id, c]) => (
            <div
              key={id}
              title={c.name}
              className={`${styles["color-dot"]} ${selectedColours.includes(id) ? styles.active : ""}`}
              style={{ background: c.hex || "#888" }}
              onClick={() => toggleColour(id)}
            />
          ))}
        </div>
      </FilterBlock>
      <FilterBlock label="PRICE" open={openBlocks.price} onToggle={() => toggleBlock("price")}>
        <PriceRangeSlider bounds={priceBounds} value={priceRange} onChange={handlePriceChange} />
      </FilterBlock>

      <div className={styles["sidebar-join"]}>
        <ImgWithFallback src="/planet.png" alt="Planet" className={styles["join-planet"]} />
        <div className={styles["join-msg-title"]}>
          SYSTEM MESSAGE_ <span>+</span>
        </div>
        <div className={styles["join-msg-text"]}>
          NEW DROP INCOMING.
          <br />
          STAY CONNECTED.
        </div>
        <button type="button" className={styles["join-btn"]}>
          JOIN THE SYSTEM <span>+</span>
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.layout}>
      <div className={`${styles["mobile-filter-drawer"]} ${mobileFilterOpen ? styles.open : ""}`}>
        {sidebarContent}
        <div style={{ padding: 16 }}>
          <button type="button" className={styles["apply-filters-btn"]} onClick={() => setMobileFilterOpen(false)}>
            APPLY FILTERS →
          </button>
        </div>
      </div>

      <aside className={styles.sidebar}>{sidebarContent}</aside>

      <main className={styles.content}>
        <div className={styles["mobile-filter-bar"]}>
          <button
            type="button"
            className={`${styles["mobile-filter-btn"]} ${mobileFilterOpen ? styles.active : ""}`}
            onClick={() => setMobileFilterOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            FILTERS
          </button>
          <div className={styles["mobile-sort-wrap"]}>
            SORT:
            <select className={styles["mobile-sort-select"]} value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles["view-btns"]}>
            <button
              type="button"
              className={`${styles["view-btn"]} ${view === "grid" ? styles.active : ""}`}
              onClick={() => setView("grid")}
            >
              <GridIcon />
            </button>
            <button
              type="button"
              className={`${styles["view-btn"]} ${view === "list" ? styles.active : ""}`}
              onClick={() => setView("list")}
            >
              <ListIcon />
            </button>
          </div>
        </div>

        <div className={styles["content-header"]}>
          <div>
            <div className={styles["content-title"]}>
              SHOP ALL<span>_</span>
            </div>
            <div className={styles["product-count"]}>
              {filtered.length} PRODUCT{filtered.length !== 1 ? "S" : ""} FOUND
            </div>
          </div>
          <div className={styles.toolbar}>
            <div className={styles["sort-wrap"]}>
              <span className={styles["sort-label"]}>SORT BY:</span>
              <select className={styles["sort-select"]} value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <span className={styles["sort-label"]}>VIEW:</span>
            <div className={styles["view-btns"]}>
              <button
                type="button"
                className={`${styles["view-btn"]} ${view === "grid" ? styles.active : ""}`}
                onClick={() => setView("grid")}
              >
                <GridIcon />
              </button>
              <button
                type="button"
                className={`${styles["view-btn"]} ${view === "list" ? styles.active : ""}`}
                onClick={() => setView("list")}
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </div>

        {(activeFilterPills.length > 0 || priceIsFiltered) && (
          <div className={styles["active-filters"]}>
            {activeFilterPills.map((pill) => (
              <div key={`${pill.type}-${pill.id}`} className={styles["filter-tag"]} onClick={() => removePill(pill)}>
                {pill.hex && (
                  <span
                    style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: pill.hex }}
                  />
                )}
                {pill.label} <span className={styles.x}>×</span>
              </div>
            ))}
            {priceIsFiltered && (
              <div className={styles["filter-tag"]} onClick={resetPrice}>
                ₹{priceRange[0]}–₹{priceRange[1]} <span className={styles.x}>×</span>
              </div>
            )}
          </div>
        )}

        <div className={`${styles["product-grid"]} ${view === "list" ? styles["list-view"] : ""}`}>
          {pageProducts.length === 0 ? (
            <div className={styles["empty-state"]}>
              <div className={styles.big}>[ NO PRODUCTS ]</div>
              <div>ADJUST FILTERS TO SEE RESULTS</div>
            </div>
          ) : (
            pageProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                collectionName={subcategoryName(p.subcategoryId)}
                coloursMap={colours}
                wished={wishlist.includes(p.id)}
                onToggleWish={toggleWish}
              />
            ))
          )}
        </div>

        <footer className={styles.footer}>
        <div className={styles["footer-coords"]}>DEAD&apos;KIND — DK-2050</div>
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={`${styles["page-btn"]} ${styles.arrow}`}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {pageList.map((p, i) =>
              p === "…" ? (
                <button key={`e-${i}`} type="button" className={`${styles["page-btn"]} ${styles.arrow}`} disabled>
                  …
                </button>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`${styles["page-btn"]} ${p === safePage ? styles.active : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {String(p).padStart(2, "0")}
                </button>
              )
            )}
            <button
              type="button"
              className={`${styles["page-btn"]} ${styles.arrow}`}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        )}
        <div className={styles["footer-right"]}>
          <div className={styles["show-per-page"]}>
            SHOW:
            <select
              className={styles["show-select"]}
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
          <div className={styles["footer-tagline"]}>DEAD INSIDE. ALIVE ANYWAY.</div>
          <ImgWithFallback src="/skull.png" alt="DeadKind Skull" className={styles["footer-skull"]} />
        </div>
      </footer>
      </main>
    </div>
  );
}
