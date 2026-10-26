"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import { addToCart as addToCartLib } from "@/lib/cart";
import { formatPriceINR } from "@/lib/format";
import styles from "./Product.module.css";

const SIZE_GUIDE_ROWS = [
  ["XS", "34-36", "28-30", "36-38", "27"],
  ["S", "36-38", "30-32", "38-40", "28"],
  ["M", "38-40", "32-34", "40-42", "29"],
  ["L", "40-42", "34-36", "42-44", "30"],
  ["XL", "42-44", "36-38", "44-46", "31"],
  ["XXL", "44-46", "38-40", "46-48", "32"],
];

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

function getActiveImages(product, colours, selectedColour) {
  const colourName = colours[selectedColour]?.name;
  if (colourName && product.colourImages?.[colourName]?.length) return product.colourImages[colourName];
  if (product.images?.length) return product.images;
  const firstGroup = Object.values(product.colourImages || {}).find((urls) => urls?.length);
  return firstGroup || [];
}

export default function ProductInteractive({ product, colours, sizes, breadcrumbCategory, related }) {
  const router = useRouter();
  const [selectedColour, setSelectedColour] = useState(product.colours?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [imageIdx, setImageIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [openAcc, setOpenAcc] = useState({ desc: true, details: false, shipping: false, returns: false, care: false });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const addBtnRef = useRef(null);

  const activeImages = useMemo(
    () => getActiveImages(product, colours, selectedColour),
    [product, colours, selectedColour]
  );

  useEffect(() => {
    setImageIdx(0);
  }, [selectedColour]);

  useEffect(() => {
    const btn = addBtnRef.current;
    if (!btn || window.innerWidth > 900) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(btn);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowLeft") changeImage(-1);
      if (e.key === "ArrowRight") changeImage(1);
      if (e.key === "Escape") setSizeGuideOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeImages]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function changeImage(dir) {
    if (activeImages.length <= 1) return;
    let next = imageIdx + dir;
    if (next < 0) next = activeImages.length - 1;
    if (next >= activeImages.length) next = 0;
    setImageIdx(next);
    setZoomed(false);
  }

  function selectColour(id) {
    setSelectedColour(id);
    setSelectedSize(null);
    setQty(1);
  }

  const stockKey = `${selectedColour}_${selectedSize}`;
  const availableStock = product.stock?.[stockKey] || 0;

  function selectSize(id, stockQty) {
    if (stockQty === 0) return;
    setSelectedSize(id);
    setQty(1);
  }

  function changeQty(delta) {
    if (product.colours?.length && !selectedColour) {
      showToast("⚠ SELECT A COLOUR");
      return;
    }
    if (product.sizes?.length && !selectedSize) {
      showToast("⚠ SELECT A SIZE");
      return;
    }
    if (availableStock === 0) {
      showToast("⚠ OUT OF STOCK");
      return;
    }
    let next = qty + delta;
    if (next < 1) next = 1;
    if (next > availableStock) {
      next = availableStock;
      showToast(`⚠ ONLY ${availableStock} ITEMS AVAILABLE`);
    }
    setQty(next);
  }

  function handleAddToCart() {
    if (product.colours?.length && !selectedColour) {
      showToast("⚠ SELECT A COLOUR FIRST");
      return false;
    }
    if (product.sizes?.length && !selectedSize) {
      showToast("⚠ SELECT A SIZE FIRST");
      return false;
    }
    if (availableStock === 0) {
      showToast("⚠ OUT OF STOCK");
      return false;
    }
    if (qty > availableStock) {
      showToast(`⚠ ONLY ${availableStock} ITEMS AVAILABLE`);
      return false;
    }

    addToCartLib({
      id: product.id,
      name: product.name,
      qty,
      size: selectedSize,
      sizeName: sizes[selectedSize] || null,
      colour: selectedColour,
      colourName: colours[selectedColour]?.name || null,
      colourHex: colours[selectedColour]?.hex || null,
      price: product.price,
      images: activeImages,
      collection: breadcrumbCategory || "",
      maxStock: availableStock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    showToast(`+ ${product.name} × ${qty} ADDED TO CART`);
    return true;
  }

  function handleBuyNow() {
    if (handleAddToCart()) router.push("/checkout");
  }

  function toggleAccordion(key) {
    setOpenAcc((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const hasSale = product.comparePrice && product.comparePrice > product.price;
  const discount = hasSale ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const nameWords = (product.name || "").split(" ");
  const nameLast = nameWords[nameWords.length - 1];
  const nameRest = nameWords.slice(0, -1).join(" ");

  let stockDisplayQty;
  if (selectedSize) stockDisplayQty = availableStock;
  else if (product.sizes?.length) stockDisplayQty = Object.values(product.stock || {}).reduce((s, v) => s + v, 0);
  else stockDisplayQty = 99;
  const stockState = stockDisplayQty === 0 ? "out" : stockDisplayQty <= 5 ? "low" : "in";
  const stockLabel = stockState === "out" ? "OUT OF STOCK" : stockState === "low" ? `ONLY ${stockDisplayQty} LEFT` : "IN STOCK";

  const details = [
    ...(product.details || []),
    product.material ? `MATERIAL: ${product.material}` : null,
    product.fit ? `FIT: ${product.fit}` : null,
    product.weight ? `WEIGHT: ${product.weight}` : null,
    `SKU: ${product.sku}`,
  ].filter(Boolean);

  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">SHOP</Link>
        <span className={styles.sep}>/</span>
        <span>{breadcrumbCategory || "—"}</span>
        <span className={styles.sep}>/</span>
        <span className={styles.current}>{product.name}</span>
      </div>

      <div className={styles["product-layout"]}>
        <div className={styles["gallery-section"]}>
          <div className={styles["gallery-main"]}>
            <span className={`${styles["gallery-corner"]} ${styles.tl}`} />
            <span className={`${styles["gallery-corner"]} ${styles.tr}`} />
            <span className={`${styles["gallery-corner"]} ${styles.bl}`} />
            <span className={`${styles["gallery-corner"]} ${styles.br}`} />
            <div className={styles["scan-anim"]} />

            {product.isNew && (
              <span className={styles["gallery-badge"]} style={{ top: 12, left: 12 }}>
                NEW DROP
              </span>
            )}
            {hasSale && (
              <span
                className={`${styles["gallery-badge"]} ${styles.sale}`}
                style={{ top: 12, left: product.isNew ? 110 : 12 }}
              >
                SALE
              </span>
            )}

            <button type="button" className={`${styles["gallery-nav-btn"]} ${styles["gallery-prev"]}`} onClick={() => changeImage(-1)}>
              ‹
            </button>
            <button type="button" className={`${styles["gallery-nav-btn"]} ${styles["gallery-next"]}`} onClick={() => changeImage(1)}>
              ›
            </button>
            {activeImages.length > 0 && (
              <div className={styles["gallery-index"]}>
                {String(imageIdx + 1).padStart(2, "0")} / {String(activeImages.length).padStart(2, "0")}
              </div>
            )}

            {activeImages.length > 0 ? (
              <ImgWithFallback
                src={activeImages[imageIdx]}
                alt={product.name}
                className={zoomed ? styles.zoomed : undefined}
                onClick={() => setZoomed((z) => !z)}
                fallback={<div className={styles["gallery-placeholder"]}>NO IMAGE</div>}
              />
            ) : (
              <div className={styles["gallery-placeholder"]}>NO IMAGE</div>
            )}
          </div>

          <div className={styles["gallery-thumbs"]}>
            {activeImages.map((src, i) => (
              <div
                key={src + i}
                className={`${styles["gallery-thumb"]} ${i === imageIdx ? styles.active : ""}`}
                onClick={() => {
                  setImageIdx(i);
                  setZoomed(false);
                }}
              >
                <ImgWithFallback src={src} alt={`Image ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div className={styles["info-section"]}>
          <div className={styles["product-category-tag"]}>{breadcrumbCategory || "COLLECTION"}</div>
          <div className={styles["product-name"]}>
            {nameRest}
            {nameRest ? " " : ""}
            <span>{nameLast}</span>
          </div>
          <div className={styles["product-price-row"]}>
            <div className={styles["product-price"]}>{formatPriceINR(product.price)}</div>
            {hasSale && (
              <>
                <div className={styles["product-compare-price"]}>{formatPriceINR(product.comparePrice)}</div>
                <div className={styles["product-discount-badge"]}>−{discount}%</div>
              </>
            )}
          </div>
          <div className={styles["product-tax-note"]}>INCL. OF ALL TAXES. FREE SHIPPING ON ALL ORDERS.</div>
          <div className={styles.divider} />

          {product.colours?.length > 0 && (
            <div>
              <div className={styles["selector-label"]}>
                COLOUR: <span className={styles["selected-val"]}>{(colours[selectedColour]?.name || "—").toUpperCase()}</span>
              </div>
              <div className={styles["colour-options"]}>
                {product.colours.map((cid) => {
                  const c = colours[cid] || { hex: "#888", name: cid };
                  return (
                    <div
                      key={cid}
                      title={c.name}
                      className={`${styles["colour-option"]} ${selectedColour === cid ? styles.active : ""}`}
                      onClick={() => selectColour(cid)}
                    >
                      <div className={styles["colour-swatch"]} style={{ background: c.hex }} />
                      <div className={styles["colour-check"]}>
                        <svg viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div>
              <div className={styles["selector-label"]}>
                SIZE: <span className={styles["selected-val"]}>{selectedSize ? sizes[selectedSize] : "SELECT SIZE"}</span>
                <button type="button" className={styles["size-guide-link"]} onClick={() => setSizeGuideOpen(true)}>
                  SIZE GUIDE
                </button>
              </div>
              <div className={styles["size-options"]}>
                {product.sizes.map((sid) => {
                  const stockQty = product.stock?.[`${selectedColour}_${sid}`] || 0;
                  return (
                    <button
                      key={sid}
                      type="button"
                      disabled={stockQty === 0}
                      className={`${styles["size-option"]} ${stockQty === 0 ? styles["out-of-stock"] : ""} ${selectedSize === sid ? styles.active : ""
                        }`}
                      onClick={() => selectSize(sid, stockQty)}
                    >
                      {sizes[sid] || sid}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles["qty-row"]}>
            <span className={styles["qty-label"]}>QTY:</span>
            <div className={styles["qty-ctrl"]}>
              <button type="button" className={styles["qty-btn"]} onClick={() => changeQty(-1)}>
                −
              </button>
              <div className={styles["qty-display"]}>{String(qty).padStart(2, "0")}</div>
              <button type="button" className={styles["qty-btn"]} onClick={() => changeQty(1)}>
                +
              </button>
            </div>
          </div>

          <div className={styles["stock-indicator"]}>
            <div className={`${styles["stock-dot"]} ${styles[stockState]}`} />
            <div className={`${styles["stock-text"]} ${styles[stockState]}`}>{stockLabel}</div>
          </div>

          <div className={styles["cta-row"]}>
            <button
              type="button"
              ref={addBtnRef}
              className={`${styles["btn-add-cart"]} ${added ? styles.added : ""}`}
              onClick={handleAddToCart}
            >
              {added ? (
                "✓ ADDED"
              ) : (
                <>
                  <CartIcon /> ADD TO CART
                </>
              )}
            </button>
            <button type="button" className={styles["btn-buy-now"]} onClick={handleBuyNow}>
              BUY NOW →
            </button>
            <button
              type="button"
              className={`${styles["btn-wishlist"]} ${wished ? styles.active : ""}`}
              onClick={() => {
                setWished((w) => !w);
                showToast(wished ? "♡ REMOVED FROM WISHLIST" : "♥ ADDED TO WISHLIST");
              }}
            >
              <HeartIcon />
            </button>
          </div>

          <div className={styles["trust-row"]}>
            <div className={styles["trust-item"]}>
              <svg className={styles["trust-icon"]} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div className={styles["trust-text"]}>
                SECURE
                <br />
                CHECKOUT
              </div>
            </div>
            <div className={styles["trust-item"]}>
              <svg className={styles["trust-icon"]} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <div className={styles["trust-text"]}>
                FREE
                <br />
                RETURNS
              </div>
            </div>
            <div className={styles["trust-item"]}>
              <svg className={styles["trust-icon"]} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div className={styles["trust-text"]}>
                SHIPS IN
                <br />
                5-7 DAYS
              </div>
            </div>
            <div className={styles["trust-item"]}>
              <svg className={styles["trust-icon"]} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <div className={styles["trust-text"]}>
                MADE WITH
                <br />
                INTENT
              </div>
            </div>
          </div>

          <div className={styles.accordion}>
            <AccordionItem label="DESCRIPTION" open={openAcc.desc} onToggle={() => toggleAccordion("desc")}>
              <p>{product.description || "No description available."}</p>
            </AccordionItem>
            <AccordionItem label="PRODUCT DETAILS" open={openAcc.details} onToggle={() => toggleAccordion("details")}>
              <ul>
                {(details.length ? details : ["DETAILS NOT AVAILABLE"]).map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </AccordionItem>
            <AccordionItem label="SHIPPING" open={openAcc.shipping} onToggle={() => toggleAccordion("shipping")}>
              <ul>
                <li>STANDARD DELIVERY: 5-7 WORKING DAYS</li>
                <li>FREE SHIPPING ON ALL ORDERS</li>
              </ul>
            </AccordionItem>
            <AccordionItem label="RETURNS" open={openAcc.returns} onToggle={() => toggleAccordion("returns")}>
              <ul>
                <li>
                  <span>
                    TO RETURN, MAIL US FIRST AT <a href="mailto:contact@deadkind.in?subject=Return request - [order id]">CONTACT@DEADKIND.IN</a>
                  </span>
                </li>
              </ul>
              <p>
                Use the subject &quot;Return request - [order id]&quot;. All communication regarding your return will
                happen in that same mail chain, so please mention the reason for the return and any other details in
                your first mail.
              </p>
              <ul>
                <li>RETURNS ACCEPTED WITHIN 6 DAYS OF DELIVERY</li>
                <li>ITEMS MUST BE UNWORN &amp; IN ORIGINAL PACKAGING</li>
              </ul>
            </AccordionItem>
            <AccordionItem label="CARE INSTRUCTIONS" open={openAcc.care} onToggle={() => toggleAccordion("care")}>
              <ul>
                <li>WASH INSIDE OUT</li>
                <li>MACHINE WASH COLD AT 30°C</li>
                <li>AIR DRY FLAT</li>
                <li>DO NOT IRON ON PRINT DIRECTLY</li>
                <li>DO NOT BLEACH</li>
              </ul>
            </AccordionItem>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className={styles["related-section"]}>
          <div className={styles["related-header"]}>
            YOU MAY ALSO LIKE<span>_</span>
          </div>
          <div className={styles["related-grid"]}>
            {related.map((p) => {
              const hexes = (p.colours || []).map((cid) => colours[cid]?.hex || "#888");
              const imgUrl = p.images?.[0] || Object.values(p.colourImages || {}).find((urls) => urls?.length)?.[0];
              return (
                <Link key={p.id} href={`/product/${p.id}`} className={styles["mini-card"]}>
                  <span className={`${styles["mc-corner"]} ${styles.tl}`} />
                  <span className={`${styles["mc-corner"]} ${styles.tr}`} />
                  <span className={`${styles["mc-corner"]} ${styles.bl}`} />
                  <span className={`${styles["mc-corner"]} ${styles.br}`} />
                  <div className={styles["mc-img"]}>
                    {imgUrl ? (
                      <ImgWithFallback src={imgUrl} alt={p.name} loading="lazy" />
                    ) : (
                      <div className={styles["mc-placeholder"]}>{p.name}</div>
                    )}
                  </div>
                  <div className={styles["mc-body"]}>
                    <div className={styles["mc-name"]}>{p.name}</div>
                    <div className={styles["mc-price"]}>{formatPriceINR(p.price)}</div>
                    <div className={styles["mc-swatches"]}>
                      {hexes.slice(0, 5).map((h, i) => (
                        <div key={i} className={styles["mc-swatch"]} style={{ background: h }} />
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className={`${styles["sticky-buy-bar"]} ${stickyVisible ? styles.visible : ""}`}>
        <div className={styles["sticky-buy-bar-price"]}>{formatPriceINR(product.price)}</div>
        <button type="button" className={styles["sticky-buy-bar-btn"]} onClick={handleAddToCart}>
          ADD TO CART
        </button>
        <button
          type="button"
          className={styles["sticky-buy-bar-btn"]}
          style={{ flex: 0.7, background: "none", border: "1px solid var(--accent)", color: "var(--accent)" }}
          onClick={handleBuyNow}
        >
          BUY NOW
        </button>
      </div>

      <div className={`${styles["modal-overlay"]} ${sizeGuideOpen ? styles.show : ""}`} onClick={(e) => e.target === e.currentTarget && setSizeGuideOpen(false)}>
        <div className={styles.modal}>
          <div className={styles["modal-title"]}>
            SIZE<span>_</span>GUIDE
          </div>
          <button type="button" className={styles["modal-close"]} onClick={() => setSizeGuideOpen(false)}>
            ✕
          </button>
          <table className={styles["size-table"]}>
            <thead>
              <tr>
                <th>SIZE</th>
                <th>CHEST (IN)</th>
                <th>WAIST (IN)</th>
                <th>HIP (IN)</th>
                <th>LENGTH (IN)</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE_ROWS.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.06em", marginTop: 14, lineHeight: 1.6 }}>
            // MEASUREMENTS ARE APPROXIMATE. FOR BEST FIT, MEASURE YOUR BODY &amp; COMPARE.
          </p>
        </div>
      </div>

      <div className={`${styles["cart-toast"]} ${toast ? styles.show : ""}`}>{toast}</div>
    </>
  );
}

function AccordionItem({ label, open, onToggle, children }) {
  return (
    <div className={`${styles["accordion-item"]} ${open ? styles.open : ""}`}>
      <button type="button" className={styles["accordion-header"]} onClick={onToggle}>
        {label} <span className={styles["accordion-icon"]}>+</span>
      </button>
      <div className={styles["accordion-body"]}>{children}</div>
    </div>
  );
}
