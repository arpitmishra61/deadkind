"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import ShopFooter from "@/components/shop/ShopFooter";
import { apiGet } from "@/lib/apiClient";
import { clearCart, getCart, removeItem, setCart, updateQty } from "@/lib/cart";
import { formatPriceINR } from "@/lib/format";
import styles from "./Cart.module.css";

function getStockStatus(maxStock) {
  if (maxStock === 0) return "out";
  if (maxStock <= 5) return "low";
  return "in";
}
function getStockLabel(maxStock) {
  if (maxStock === 0) return "OUT OF STOCK";
  if (maxStock <= 5) return `ONLY ${maxStock} LEFT`;
  return "IN STOCK";
}

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const cart = getCart();
        const [{ sizes }, { colours }] = await Promise.all([apiGet("/api/sizes"), apiGet("/api/colours")]);

        const uniqueIds = [...new Set(cart.map((i) => i.id))];
        const stockCache = {};
        await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const { product } = await apiGet(`/api/products/${id}`);
              stockCache[id] = product;
            } catch {
              stockCache[id] = null;
            }
          })
        );

        let firstWarning = null;
        const enriched = cart.map((item) => {
          const next = { ...item };
          if (next.colour && colours[next.colour]) {
            next.colourName = colours[next.colour].name;
            next.colourHex = colours[next.colour].hex;
          }
          if (next.size && sizes[next.size]) {
            next.sizeName = sizes[next.size];
          }
          const info = stockCache[next.id];
          if (info) {
            const key = `${next.colour}_${next.size}`;
            const available = info.stock?.[key] || 0;
            next.maxStock = available;
            if (available === 0) {
              firstWarning = firstWarning || `${next.name} (${next.sizeName}) is OUT OF STOCK`;
            } else if (next.qty > available) {
              firstWarning = firstWarning || `${next.name} (${next.sizeName}): QTY reduced to ${available}`;
              next.qty = available;
            }
          }
          return next;
        });

        if (cancelled) return;
        setCart(enriched);
        setItems(enriched);
        if (firstWarning) showToast(`⚠ STOCK UPDATE: ${firstWarning}`);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleQtyChange(idx, delta) {
    const item = items[idx];
    if (!item) return;
    const maxStock = typeof item.maxStock === "number" ? item.maxStock : Infinity;
    if (maxStock === 0) {
      showToast("⚠ OUT OF STOCK");
      return;
    }
    if (item.qty + delta > maxStock) {
      showToast(`⚠ ONLY ${maxStock} UNITS AVAILABLE IN STOCK`);
    }
    const updated = updateQty(idx, delta);
    setItems(updated);
  }

  function handleRemove(idx) {
    const item = items[idx];
    if (!item) return;
    const updated = removeItem(idx);
    setItems(updated);
    showToast(`✕ ${item.name} REMOVED`);
  }

  function handleClearCart() {
    setItems(clearCart());
    setConfirmOpen(false);
    showToast("// CART CLEARED");
  }

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items]);
  const total = subtotal;
  const count = items.reduce((s, it) => s + it.qty, 0);

  if (loading) {
    return (
      <div className={styles["page-wrap"]}>
        <div className={styles["cart-empty"]}>
          <div className={styles.big}>LOADING CART...</div>
        </div>
        <ShopFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["page-wrap"]}>
        <div className={styles["cart-empty"]}>
          <div className={styles.big}>[ SYSTEM ERROR ]</div>
          <p>{error}</p>
          <Link href="/">← BACK TO SHOP</Link>
        </div>
        <ShopFooter />
      </div>
    );
  }

  return (
    <div className={styles["page-wrap"]}>
      <div className={styles["cart-header-bar"]}>
        <Link href="/">SHOP</Link>
        <span className={styles.sep}>/</span>
        <span className={styles.current}>CART</span>
      </div>

      <div className={styles["cart-heading-section"]}>
        <div className={styles["cart-heading-tag"]}>// CART_</div>
        <div className={styles["cart-title"]}>YOUR CART.</div>
        <div className={styles["cart-subtitle"]}>
          {count === 0 ? "0 ITEMS IN YOUR SIGNAL." : `${count} ITEM${count > 1 ? "S" : ""} IN YOUR SIGNAL.`}
        </div>
      </div>

      <div className={styles["cart-main"]}>
        <div className={styles["cart-items-section"]}>
          {items.length === 0 ? (
            <div className={styles["cart-empty"]}>
              <div className={styles.big}>[ CART EMPTY ]</div>
              <p>YOUR SIGNAL CARRIES NOTHING YET.</p>
              <Link href="/">← CONTINUE SHOPPING</Link>
            </div>
          ) : (
            <>
              <div className={styles["cart-table-head"]}>
                <div>PRODUCT</div>
                <div>SIZE</div>
                <div>QTY</div>
                <div>PRICE</div>
                <div>TOTAL</div>
                <div />
              </div>
              <div>
                {items.map((item, idx) => {
                  const maxStock = typeof item.maxStock === "number" ? item.maxStock : 99;
                  const stockStatus = getStockStatus(maxStock);
                  const stockLabel = getStockLabel(maxStock);
                  const qtyDisplay = String(item.qty).padStart(2, "0");
                  return (
                    <div className={styles["cart-item"]} key={`${item.id}-${item.size}-${item.colour}-${idx}`}>
                      <div className={styles["item-product"]}>
                        <div className={styles["item-img"]}>
                          <span className={`${styles["item-img-corner"]} ${styles.tl}`} />
                          <span className={`${styles["item-img-corner"]} ${styles.br}`} />
                          {item.images?.[0] ? (
                            <ImgWithFallback src={item.images[0]} alt={item.name} loading="lazy" />
                          ) : (
                            <div className={styles["item-img-placeholder"]}>{(item.name || "").slice(0, 6)}</div>
                          )}
                        </div>
                        <div className={styles["item-info"]}>
                          <div className={styles["item-name"]}>{item.name}</div>
                          <div className={styles["item-collection"]}>{item.collection || ""}</div>
                          <div className={styles["item-stock-badge"]}>
                            <span className={`${styles["item-stock-dot"]} ${styles[stockStatus]}`} />
                            <span className={`${styles["item-stock-text"]} ${styles[stockStatus]}`}>{stockLabel}</span>
                          </div>
                          {item.colour && (
                            <div className={styles["colour-dot-row"]}>
                              <div className={styles["colour-dot-sq"]} style={{ background: item.colourHex || "#888" }} />
                              <span className={styles["colour-dot-label"]}>{item.colourName || ""}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles["item-size-cell-desktop"]}>
                        <span className={styles["size-pill"]}>{item.sizeName || item.size || "—"}</span>
                      </div>
                      <div className={styles["item-qty-cell-desktop"]}>
                        <div className={styles["qty-ctrl-cart"]}>
                          <button type="button" className={styles["qty-btn-cart"]} onClick={() => handleQtyChange(idx, -1)}>
                            −
                          </button>
                          <div className={styles["qty-display-cart"]}>{qtyDisplay}</div>
                          <button type="button" className={styles["qty-btn-cart"]} onClick={() => handleQtyChange(idx, 1)}>
                            +
                          </button>
                        </div>
                      </div>
                      <div className={`${styles["item-price-cell"]} ${styles["item-price-cell-desktop"]}`}>
                        {formatPriceINR(item.price)}
                      </div>
                      <div className={`${styles["item-total-cell"]} ${styles["item-total-cell-desktop"]}`}>
                        {formatPriceINR(item.price * item.qty)}
                      </div>
                      <div className={styles["item-remove-desktop"]}>
                        <button type="button" className={styles["item-remove-btn"]} onClick={() => handleRemove(idx)} title="Remove">
                          ✕
                        </button>
                      </div>

                      <div className={styles["mobile-item-bottom"]}>
                        <div className={styles["mobile-item-meta"]}>
                          <span className={styles["size-pill"]}>{item.sizeName || item.size || "—"}</span>
                          <div className={styles["qty-ctrl-cart"]}>
                            <button type="button" className={styles["qty-btn-cart"]} onClick={() => handleQtyChange(idx, -1)}>
                              −
                            </button>
                            <div className={styles["qty-display-cart"]}>{qtyDisplay}</div>
                            <button type="button" className={styles["qty-btn-cart"]} onClick={() => handleQtyChange(idx, 1)}>
                              +
                            </button>
                          </div>
                        </div>
                        <div className={styles["mobile-price-remove"]}>
                          <div className={styles["item-total-cell"]}>{formatPriceINR(item.price * item.qty)}</div>
                          <button type="button" className={styles["item-remove-btn"]} onClick={() => handleRemove(idx)} title="Remove">
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles["cart-bottom-actions"]}>
                <Link href="/" className={styles["btn-continue"]}>
                  <svg viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span className="label-text">CONTINUE SHOPPING</span>
                </Link>
                <button type="button" className={styles["btn-clear"]} onClick={() => setConfirmOpen(true)}>
                  <svg viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  <span className="label-text">CLEAR CART</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className={styles["cart-summary-section"]}>
          <div className={styles["summary-title"]}>ORDER SUMMARY</div>
          <div className={styles["summary-row"]}>
            <span className={styles.label}>SUBTOTAL</span>
            <span className={styles.val}>{formatPriceINR(subtotal)}</span>
          </div>
          <div className={styles["summary-row"]}>
            <span className={styles.label}>SHIPPING</span>
            <span className={`${styles.val} ${styles.free}`}>FREE</span>
          </div>

          <div className={styles["summary-row"]} style={{ marginTop: 12 }}>
            <span className={styles.label}>DISCOUNT</span>
            <span className={`${styles.val} ${styles.dash}`}>—</span>
          </div>
          <div className={styles["summary-divider"]} />
          <div className={styles["summary-total-row"]}>
            <span className={styles["summary-total-label"]}>TOTAL</span>
            <span className={styles["summary-total-val"]}>{formatPriceINR(total)}</span>
          </div>

          {items.length > 0 ? (
            <Link href="/checkout" className={styles["btn-checkout"]}>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              PROCEED TO CHECKOUT →
            </Link>
          ) : (
            <button type="button" className={styles["btn-checkout"]} disabled onClick={() => showToast("⚠ CART IS EMPTY")}>
              PROCEED TO CHECKOUT →
            </button>
          )}

          <div className={styles["payment-methods"]}>
            <div className={styles["pay-badge"]}>
              <svg viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="3" fill="#1A1F36" stroke="#333" strokeWidth="0.5" />
                <text x="19" y="16" fontFamily="monospace" fontSize="8" fill="#fff" textAnchor="middle">
                  Apple Pay
                </text>
              </svg>
            </div>
            <div className={styles["pay-badge"]}>
              <svg viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="3" fill="#1A1F36" stroke="#333" strokeWidth="0.5" />
                <text x="19" y="16" fontFamily="monospace" fontSize="8" fill="#fff" textAnchor="middle">
                  G Pay
                </text>
              </svg>
            </div>
            <div className={styles["pay-badge"]}>
              <svg viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="3" fill="#1A1F36" stroke="#333" strokeWidth="0.5" />
                <text x="19" y="16" fontFamily="monospace" fontSize="8" fill="#00BAF2" textAnchor="middle">
                  Paytm
                </text>
              </svg>
            </div>
            <div className={styles["pay-badge"]}>
              <svg viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="3" fill="#1A1F36" stroke="#333" strokeWidth="0.5" />
                <text x="19" y="16" fontFamily="monospace" fontSize="8" fill="#1565C0" textAnchor="middle">
                  VISA
                </text>
              </svg>
            </div>
            <div className={styles["pay-badge"]}>
              <svg viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="3" fill="#1A1F36" stroke="#333" strokeWidth="0.5" />
                <circle cx="15" cy="12" r="7" fill="#EB001B" opacity="0.8" />
                <circle cx="23" cy="12" r="7" fill="#F79E1B" opacity="0.8" />
              </svg>
            </div>
          </div>

          <div className={styles["trust-mini"]}>
            <div className={styles["trust-mini-item"]}>
              <div className={styles["trust-mini-icon"]}>
                <svg viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className={styles["trust-mini-text"]}>
                <div className={styles.ttitle}>SHIPPING ONLY IN INDIA</div>
                <div className={styles.tsub}>5-7 WORKING DAYS</div>
              </div>
            </div>
            <div className={styles["trust-mini-item"]}>
              <div className={styles["trust-mini-icon"]}>
                <svg viewBox="0 0 24 24">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.55" />
                </svg>
              </div>
              <div className={styles["trust-mini-text"]}>
                <div className={styles.ttitle}>EASY RETURNS</div>
                <div className={styles.tsub}>NOT SATISFIED? WE FIX IT.</div>
              </div>
            </div>
            <div className={styles["trust-mini-item"]}>
              <div className={styles["trust-mini-icon"]}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className={styles["trust-mini-text"]}>
                <div className={styles.ttitle}>SECURE CHECKOUT</div>
                <div className={styles.tsub}>ENCRYPTED. ALWAYS.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShopFooter />

      <div className={`${styles["confirm-overlay"]} ${confirmOpen ? styles.show : ""}`} onClick={(e) => e.target === e.currentTarget && setConfirmOpen(false)}>
        <div className={styles["confirm-box"]}>
          <div className={styles["confirm-title"]}>
            CLEAR<span>_</span>CART
          </div>
          <div className={styles["confirm-msg"]}>
            // THIS WILL REMOVE ALL ITEMS FROM YOUR CART.
            <br />
            THIS ACTION CANNOT BE UNDONE.
          </div>
          <div className={styles["confirm-btns"]}>
            <button type="button" className={styles["confirm-btn"]} onClick={() => setConfirmOpen(false)}>
              CANCEL
            </button>
            <button type="button" className={`${styles["confirm-btn"]} ${styles.danger}`} onClick={handleClearCart}>
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>

      <div className={`${styles["cart-toast"]} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
