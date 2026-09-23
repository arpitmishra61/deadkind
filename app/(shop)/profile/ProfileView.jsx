"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/apiClient";
import styles from "./Profile.module.css";

function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
}
function fmtDateShort(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function getStatusClass(status) {
  const map = {
    delivered: "status-delivered",
    shipped: "status-shipped",
    confirmed: "status-confirmed",
    paid: "status-confirmed",
    pending: "status-pending",
    cancelled: "status-cancelled",
  };
  return map[(status || "").toLowerCase()] || "status-pending";
}

function OrderCard({ order, onOpen }) {
  const itemNames = (order.items || []).map((i) => i.name).slice(0, 3);
  const moreCount = (order.items || []).length - 3;
  const statusLabel = (order.status || "PENDING").toUpperCase();
  const statusCls = getStatusClass(order.status);

  return (
    <div className={styles["order-card"]} onClick={onOpen}>
      <div className={styles["order-card-header"]}>
        <span className={styles["order-id"]}>#{order.orderId || order.id.slice(0, 10).toUpperCase()}</span>
        <span className={styles["order-name"]}>{(order.items || [])[0]?.name || "ORDER"}</span>
        <span className={styles["order-date"]}>{fmtDateShort(order.createdAt)}</span>
        <span className={`${styles["order-status"]} ${styles[statusCls]}`}>{statusLabel}</span>
        <span className={styles["order-price"]}>₹{Number(order.pricing?.total || 0).toLocaleString("en-IN")}</span>
        <span className={styles["order-arrow"]}>→</span>
      </div>
      {itemNames.length > 0 && (
        <div className={styles["order-items-preview"]}>
          {itemNames.map((n, i) => (
            <span className={styles["order-item-chip"]} key={i}>
              {n}
            </span>
          ))}
          {moreCount > 0 && <span className={styles["order-item-chip"]}>+{moreCount} MORE</span>}
        </div>
      )}
    </div>
  );
}

function OrderModal({ order, onClose }) {
  if (!order) return null;

  const status = (order.status || "pending").toLowerCase();
  const statusFlow = ["confirmed", "shipped", "delivered"];
  const steps = [
    { key: "confirmed", label: "ORDER CONFIRMED", ts: order.createdAt },
    { key: "shipped", label: "SHIPPED / DISPATCHED", ts: order.shippedAt || null },
    { key: "delivered", label: "DELIVERED", ts: order.deliveredAt || null },
  ];
  const statusIdx = statusFlow.indexOf(status === "paid" ? "confirmed" : status);
  const p = order.pricing || {};
  const s = order.shipping || {};

  return (
    <div className={`${styles["modal-overlay"]} ${styles.open}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles["modal-head"]}>
          <div>
            <div className={styles["modal-head-tag"]}>// ORDER_DETAILS</div>
            <div className={styles["modal-head-title"]}>ORDER #{order.orderId || order.id.slice(0, 10).toUpperCase()}</div>
          </div>
          <button type="button" className={styles["modal-close"]} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles["modal-body"]}>
          <div className={styles.timeline}>
            <div className={styles["timeline-title"]}>// ORDER_TIMELINE</div>
            <div className={styles["timeline-items"]}>
              {steps.map((step, i) => {
                const cls = i < statusIdx ? "done" : i === statusIdx ? "active" : "pending";
                const timeStr = step.ts ? fmtDate(step.ts) : cls === "pending" ? "AWAITING..." : "—";
                return (
                  <div className={`${styles["tl-item"]} ${styles[cls]}`} key={step.key}>
                    <div className={styles["tl-dot"]} />
                    {i < steps.length - 1 && <div className={styles["tl-line"]} />}
                    <div className={styles["tl-content"]}>
                      <div className={styles["tl-step"]}>{step.label}</div>
                      <div className={styles["tl-time"]}>{timeStr}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles["od-section"]}>
            <div className={styles["od-label"]}>ITEMS ORDERED</div>
            <div className={styles["od-items"]}>
              {(order.items || []).map((item, i) => (
                <div className={styles["od-item"]} key={i}>
                  {item.images?.[0] ? (
                    <img className={styles["od-item-img"]} src={item.images[0]} alt={item.name} loading="lazy" />
                  ) : (
                    <div className={styles["od-item-img"]}>👕</div>
                  )}
                  <div className={styles["od-item-info"]}>
                    <div className={styles["od-item-name"]}>{item.name}</div>
                    <div className={styles["od-item-meta"]}>
                      {item.sizeName || item.size || "—"} {item.colourName ? `· ${item.colourName}` : ""} · QTY: {item.qty}
                    </div>
                  </div>
                  <div className={styles["od-item-price"]}>
                    ₹{Number(item.lineTotal || item.price * item.qty || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles["od-section"]}>
            <div className={styles["od-label"]}>PRICING</div>
            <div className={styles["od-row"]}>
              <span className={styles.lbl}>SUBTOTAL</span>
              <span>₹{Number(p.subtotal || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className={styles["od-row"]}>
              <span className={styles.lbl}>SHIPPING</span>
              <span style={{ color: "var(--green)" }}>{p.shipping === 0 ? "FREE" : `₹${p.shipping}`}</span>
            </div>
            {p.discount > 0 && (
              <div className={styles["od-row"]}>
                <span className={styles.lbl}>DISCOUNT</span>
                <span style={{ color: "var(--green)" }}>-₹{Number(p.discount).toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className={`${styles["od-row"]} ${styles.total}`}>
              <span className={styles.lbl}>TOTAL</span>
              <span className={styles.val}>₹{Number(p.total || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className={styles["od-section"]}>
            <div className={styles["od-label"]}>SHIPPING ADDRESS</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-dim)", lineHeight: 1.8, letterSpacing: "0.04em" }}>
              {order.customer?.fullName || ""}
              <br />
              {s.address1 || ""}
              {s.address2 ? `, ${s.address2}` : ""}
              <br />
              {s.city || ""}, {s.state || ""} — {s.pincode || ""}
              <br />
              {s.country || "India"}
              <br />
              {order.customer?.phone || ""}
            </div>
          </div>

          <div className={styles["od-section"]}>
            <div className={styles["od-label"]}>PAYMENT</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em" }}>
                {(order.paymentMethod || "—").toUpperCase()}
              </span>
              {order.razorpay?.paymentId && (
                <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--text-muted)" }}>{order.razorpay.paymentId}</span>
              )}
              <span className={`${styles["order-status"]} ${styles[getStatusClass(order.paymentStatus || "pending")]}`}>
                {(order.paymentStatus || "PENDING").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileView({ user, profile, orders, stats }) {
  const router = useRouter();
  const [tab, setTab] = useState("orders");
  const [openOrder, setOpenOrder] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  async function handleLogout() {
    await apiPost("/api/auth/logout", {});
    showToast("LOGGED OUT.");
    router.refresh();
  }

  const namePart = (user.email || "").split("@")[0].toUpperCase();
  const phone = profile?.phone || "—";
  const since = profile?.createdAt ? fmtDateShort(profile.createdAt) : "—";

  return (
    <div className={styles["profile-wrap"]}>
      <div className={styles["profile-header"]}>
        <div className={styles["profile-avatar"]}>
          <div className={styles["avatar-ring"]} />
          <span>{namePart.charAt(0) || "?"}</span>
        </div>
        <div>
          <div className={styles["profile-name"]}>{namePart}</div>
          <div className={styles["profile-email"]}>{user.email || "—"}</div>
          <div className={styles["profile-meta"]}>
            <div className={styles["profile-meta-item"]}>
              PHONE: <span>{phone}</span>
            </div>
            <div className={styles["profile-meta-item"]}>
              STATUS: <span style={{ color: "var(--green)" }}>OUTSIDER</span>
            </div>
            <div className={styles["profile-meta-item"]}>
              MEMBER SINCE: <span>{since}</span>
            </div>
          </div>
        </div>
        <div className={styles["profile-stats"]}>
          <div className={styles["profile-stat"]}>
            <div className={styles["stat-num"]}>{stats.orders}</div>
            <div className={styles["stat-lbl"]}>ORDERS</div>
          </div>
          <div className={styles["profile-stat"]}>
            <div className={styles["stat-num"]}>{stats.delivered}</div>
            <div className={styles["stat-lbl"]}>DELIVERED</div>
          </div>
          <div className={styles["profile-stat"]}>
            <div className={styles["stat-num"]}>{stats.inTransit}</div>
            <div className={styles["stat-lbl"]}>IN TRANSIT</div>
          </div>
        </div>
      </div>

      <div className={styles["profile-tabs"]}>
        <button type="button" className={`${styles.ptab} ${tab === "orders" ? styles.active : ""}`} onClick={() => setTab("orders")}>
          ORDERS
        </button>
        <button type="button" className={`${styles.ptab} ${tab === "account" ? styles.active : ""}`} onClick={() => setTab("account")}>
          ACCOUNT
        </button>
      </div>

      {tab === "orders" ? (
        <div>
          <div className={styles["section-tag"]}>// ORDER_HISTORY</div>
          <div className={styles["section-title"]}>YOUR ORDERS</div>
          {orders.length === 0 ? (
            <div className={styles["empty-state"]}>
              <div className={styles["empty-icon"]}>[ NO ORDERS ]</div>
              <div className={styles["empty-msg"]}>
                YOUR ORDER HISTORY IS EMPTY.
                <br />
                TIME TO CHANGE THAT.
              </div>
              <Link href="/" className={styles["empty-cta"]}>
                ← BROWSE SHOP
              </Link>
            </div>
          ) : (
            <div className={styles["orders-list"]}>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onOpen={() => setOpenOrder(order)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className={styles["section-tag"]}>// ACCOUNT_DETAILS</div>
          <div className={styles["section-title"]}>ACCOUNT</div>
          <div className={styles["account-box"]}>
            <div>
              <div className={styles["od-label"]}>EMAIL</div>
              <div className={styles["account-val"]}>{user.email || "—"}</div>
            </div>
            <div>
              <div className={styles["od-label"]}>MOBILE</div>
              <div className={styles["account-val"]}>{phone}</div>
            </div>
            <div>
              <div className={styles["od-label"]}>ACCOUNT ID</div>
              <div className={`${styles["account-val"]} ${styles.muted}`}>{user.uid}</div>
            </div>
            <div>
              <button type="button" className={styles["btn-logout"]} style={{ width: "100%", padding: 12, fontSize: 11, letterSpacing: "0.12em" }} onClick={handleLogout}>
                LOGOUT →
              </button>
            </div>
          </div>
        </div>
      )}

      <OrderModal order={openOrder} onClose={() => setOpenOrder(null)} />
      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
