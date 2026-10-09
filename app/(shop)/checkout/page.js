"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import ShopFooter from "@/components/shop/ShopFooter";
import { apiPost } from "@/lib/apiClient";
import { clearCart, getCart } from "@/lib/cart";
import { formatPriceINR } from "@/lib/format";
import styles from "./Checkout.module.css";

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
  "Chandigarh", "Puducherry", "Lakshadweep", "Andaman & Nicobar", "Daman & Diu", "Dadra & Nagar Haveli",
];

const PAYMENT_METHODS = [
  { id: "upi", icon: "⚡", name: "UPI / GPAY / PHONEPE / PAYTM", desc: "INSTANT PAYMENT · ZERO CHARGES · MOST POPULAR IN INDIA", badge: "RECOMMENDED", badgeClass: "recommended", payLabel: "PAY VIA UPI" },
  { id: "card", icon: "💳", name: "CREDIT / DEBIT CARD", desc: "VISA · MASTERCARD · RUPAY · AMEX", badge: "FAST", badgeClass: "fast", payLabel: "PAY WITH CARD" },
  { id: "netbanking", icon: "🏦", name: "NET BANKING", desc: "ALL MAJOR BANKS SUPPORTED", payLabel: "PAY VIA NET BANKING" },
  { id: "wallet", icon: "👜", name: "WALLETS", desc: "PAYTM · AMAZON PAY · MOBIKWIK · FREECHARGE", payLabel: "PAY WITH WALLET" },
];

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phone: "",
  address1: "", address2: "", city: "", state: "", pincode: "",
  notes: "", gstin: "",
};

function SummaryItems({ items }) {
  return (
    <div className={styles["summary-items"]}>
      {items.map((item, i) => (
        <div className={styles["summary-item"]} key={i}>
          <div className={styles["summary-item-img"]}>
            <span className={styles["summary-item-qty-badge"]}>{item.qty}</span>
            {item.images?.[0] ? (
              <ImgWithFallback src={item.images[0]} alt={item.name} loading="lazy" />
            ) : (
              <div className={styles["summary-item-img-placeholder"]}>{(item.name || "").slice(0, 6)}</div>
            )}
          </div>
          <div className={styles["summary-item-info"]}>
            <div className={styles["summary-item-name"]}>{item.name}</div>
            <div className={styles["summary-item-meta"]}>
              {item.sizeName || item.size || ""} {item.colourName ? `· ${item.colourName}` : ""}
            </div>
          </div>
          <div className={styles["summary-item-price"]}>{formatPriceINR(item.price * item.qty)}</div>
        </div>
      ))}
    </div>
  );
}

function SummaryTotals({ items, subtotal, extra }) {
  return (
    <>
      <SummaryItems items={items} />
      <div className={styles["summary-row"]}>
        <span className={styles.label}>SUBTOTAL</span>
        <span className={styles.val}>{formatPriceINR(subtotal)}</span>
      </div>
      <div className={styles["summary-row"]}>
        <span className={styles.label}>SHIPPING</span>
        <span className={`${styles.val} ${styles.free}`}>FREE</span>
      </div>
      <div className={styles["summary-row"]}>
        <span className={styles.label}>TAXES (GST)</span>
        <span className={styles.val}>INCL.</span>
      </div>
      <div className={styles["summary-divider"]} />
      <div className={styles["summary-total-row"]}>
        <span className={styles["summary-total-label"]}>TOTAL</span>
        <span className={styles["summary-total-val"]}>{formatPriceINR(subtotal)}</span>
      </div>
      {extra}
    </>
  );
}

export default function CheckoutPage() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | processing | success
  const [processingText, setProcessingText] = useState("");
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("");
  const razorpayReady = useRef(false);
  const formTopRef = useRef(null);

  useEffect(() => {
    setItems(getCart());
  }, []);

  function showToast(msg, type = "") {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 3000);
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "REQUIRED FIELD";
    if (!form.lastName.trim()) next.lastName = "REQUIRED FIELD";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "VALID EMAIL REQUIRED";
    if (!/^\d{10}$/.test(form.phone.trim())) next.phone = "VALID 10-DIGIT NUMBER REQUIRED";
    if (!form.address1.trim()) next.address1 = "REQUIRED FIELD";
    if (!form.city.trim()) next.city = "REQUIRED";
    if (!form.state.trim()) next.state = "REQUIRED";
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = "6-DIGIT PINCODE REQUIRED";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function verifyUpi() {
    const val = upiId.trim();
    if (!val) {
      showToast("⚠ ENTER YOUR UPI ID FIRST");
      return;
    }
    if (!/^[\w.-]+@[\w]+$/.test(val) && !/^\d{10}@\w+$/.test(val)) {
      showToast("⚠ INVALID UPI ID FORMAT");
      return;
    }
    showToast("✓ UPI ID LOOKS VALID", "success");
  }

  async function handlePay() {
    if (!validate()) {
      showToast("⚠ PLEASE FILL ALL REQUIRED FIELDS");
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!items.length) {
      showToast("⚠ CART IS EMPTY");
      return;
    }

    setPhase("processing");
    setProcessingText("INITIATING SECURE PAYMENT...");

    let order;
    try {
      order = await apiPost("/api/razorpay/create-order", {
        items,
        customer: { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim() },
        shipping: { address1: form.address1.trim(), address2: form.address2.trim(), city: form.city.trim(), state: form.state, pincode: form.pincode.trim() },
        paymentMethod: selectedMethod,
        upiId: selectedMethod === "upi" ? upiId.trim() : "",
        notes: form.notes.trim(),
        gstin: form.gstin.trim().toUpperCase(),
      });
    } catch (err) {
      setPhase("idle");
      showToast(`⚠ ${err.message}`);
      return;
    }

    if (!razorpayReady.current || !window.Razorpay) {
      setPhase("idle");
      showToast("⚠ PAYMENT SYSTEM STILL LOADING — TRY AGAIN IN A MOMENT");
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpayOrderId,
      name: "Dead'Kind",
      description: `Order ${order.orderId} — ${items.length} item(s)`,
      image: "/skull.png",
      prefill: {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        contact: `+91${form.phone}`,
        ...(selectedMethod === "upi" && upiId ? { vpa: upiId } : {}),
      },
      notes: { orderId: order.orderId, address: form.address1 },
      theme: { color: "#c45486" },
      modal: {
        ondismiss: () => {
          setPhase("idle");
          showToast("⚠ PAYMENT CANCELLED");
        },
      },
      handler: async (response) => {
        setPhase("processing");
        setProcessingText("CONFIRMING ORDER...");
        try {
          await apiPost("/api/razorpay/verify-payment", {
            firestoreOrderId: order.firestoreOrderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          clearCart();
          setPhase("success");
          setSuccessOrderId(order.orderId);
        } catch (err) {
          setPhase("idle");
          showToast(`✕ VERIFICATION FAILED: ${err.message}`);
        }
      },
    };

    setPhase("idle");
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", async (resp) => {
      setPhase("idle");
      showToast(`✕ PAYMENT FAILED: ${resp.error?.description || "UNKNOWN ERROR"}`);
      try {
        await apiPost("/api/razorpay/fail-order", {
          firestoreOrderId: order.firestoreOrderId,
          reason: resp.error?.description || resp.error?.reason || "payment_failed",
        });
      } catch (e) {
        console.error("Failed to mark order as failed:", e);
      }
    });
    rzp.open();
  }

  if (items === null) return null;

  if (items.length === 0 && phase !== "success") {
    return (
      <div className={styles["page-wrap"]}>
        <div className={styles["empty-redirect"]}>
          <div className={styles.big}>[ CART EMPTY ]</div>
          <p>NOTHING TO CHECKOUT. GO GRAB SOMETHING.</p>
          <Link href="/">← BACK TO SHOP</Link>
        </div>
        <ShopFooter />
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const selectedMethodMeta = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          razorpayReady.current = true;
        }}
      />

      <div className={styles["page-wrap"]}>
        <div className={styles["cart-header-bar"]}>
          <Link href="/">SHOP</Link>
          <span className={styles.sep}>/</span>
          <Link href="/cart">CART</Link>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>CHECKOUT</span>
        </div>

        <div className={styles["steps-bar"]}>
          <div className={styles["step-item"]}>
            <div className={`${styles["step-num"]} ${phase === "success" ? styles.done : styles.done}`}>✓</div>
            <span className={styles["step-label"]}>CART</span>
          </div>
          <div className={styles["step-connector"]} />
          <div className={styles["step-item"]}>
            <div className={`${styles["step-num"]} ${phase === "success" ? styles.done : styles.active}`}>
              {phase === "success" ? "✓" : "02"}
            </div>
            <span className={`${styles["step-label"]} ${styles.active}`}>DETAILS</span>
          </div>
          <div className={styles["step-connector"]} />
          <div className={styles["step-item"]}>
            <div className={`${styles["step-num"]} ${phase === "success" ? styles.done : ""}`}>{phase === "success" ? "✓" : "03"}</div>
            <span className={styles["step-label"]}>PAYMENT</span>
          </div>
          <div className={styles["step-connector"]} />
          <div className={styles["step-item"]}>
            <div className={`${styles["step-num"]} ${phase === "success" ? styles.done : ""}`}>{phase === "success" ? "✓" : "04"}</div>
            <span className={styles["step-label"]}>CONFIRM</span>
          </div>
        </div>

        <div className={styles["checkout-heading"]} ref={formTopRef}>
          <div className={styles["checkout-heading-tag"]}>// CHECKOUT_</div>
          <div className={styles["checkout-title"]}>ENTER DETAILS.</div>
          <div className={styles["checkout-subtitle"]}>SECURE • ENCRYPTED • DEAD SERIOUS</div>
        </div>

        <div className={styles["checkout-main"]}>
          <div className={styles["checkout-form-section"]}>
            <div className={styles["form-block"]}>
              <div className={styles["form-block-tag"]}>// 01 — CONTACT_INFO</div>
              <div className={styles["form-block-title"]}>CONTACT INFORMATION</div>
              <div className={styles["form-row"]}>
                <div className={`${styles.field} ${errors.firstName ? styles["has-error"] : ""}`}>
                  <label>
                    FIRST NAME <span className={styles.req}>*</span>
                  </label>
                  <input type="text" placeholder="JOHN" autoComplete="given-name" value={form.firstName} onChange={update("firstName")} />
                  <span className={styles["field-error"]}>{errors.firstName}</span>
                </div>
                <div className={`${styles.field} ${errors.lastName ? styles["has-error"] : ""}`}>
                  <label>
                    LAST NAME <span className={styles.req}>*</span>
                  </label>
                  <input type="text" placeholder="DOE" autoComplete="family-name" value={form.lastName} onChange={update("lastName")} />
                  <span className={styles["field-error"]}>{errors.lastName}</span>
                </div>
              </div>
              <div className={`${styles["form-row"]} ${styles.full}`}>
                <div className={`${styles.field} ${errors.email ? styles["has-error"] : ""}`}>
                  <label>
                    EMAIL ADDRESS <span className={styles.req}>*</span>
                  </label>
                  <input type="email" placeholder="DEAD@KIND.COM" autoComplete="email" value={form.email} onChange={update("email")} />
                  <span className={styles["field-error"]}>{errors.email}</span>
                </div>
              </div>
              <div className={`${styles["form-row"]} ${styles.full}`}>
                <div className={`${styles.field} ${errors.phone ? styles["has-error"] : ""}`}>
                  <label>
                    PHONE NUMBER <span className={styles.req}>*</span>
                  </label>
                  <div className={styles["phone-row"]}>
                    <span className={styles["phone-code"]}>+91</span>
                    <input type="tel" placeholder="9876543210" maxLength={10} autoComplete="tel" value={form.phone} onChange={update("phone")} />
                  </div>
                  <span className={styles["field-error"]}>{errors.phone}</span>
                </div>
              </div>
            </div>

            <div className={styles["form-block"]}>
              <div className={styles["form-block-tag"]}>// 02 — SHIPPING_ADDRESS</div>
              <div className={styles["form-block-title"]}>SHIPPING ADDRESS</div>
              <div className={`${styles["form-row"]} ${styles.full}`}>
                <div className={`${styles.field} ${errors.address1 ? styles["has-error"] : ""}`}>
                  <label>
                    ADDRESS LINE 1 <span className={styles.req}>*</span>
                  </label>
                  <input type="text" placeholder="HOUSE / FLAT NO, STREET NAME" autoComplete="address-line1" value={form.address1} onChange={update("address1")} />
                  <span className={styles["field-error"]}>{errors.address1}</span>
                </div>
              </div>
              <div className={`${styles["form-row"]} ${styles.full}`}>
                <div className={styles.field}>
                  <label>
                    ADDRESS LINE 2 <span style={{ color: "var(--text-muted)", fontSize: 8 }}>(OPTIONAL)</span>
                  </label>
                  <input type="text" placeholder="LANDMARK, AREA, LOCALITY" autoComplete="address-line2" value={form.address2} onChange={update("address2")} />
                </div>
              </div>
              <div className={`${styles["form-row"]} ${styles.triple}`}>
                <div className={`${styles.field} ${errors.city ? styles["has-error"] : ""}`}>
                  <label>
                    CITY <span className={styles.req}>*</span>
                  </label>
                  <input type="text" placeholder="MUMBAI" autoComplete="address-level2" value={form.city} onChange={update("city")} />
                  <span className={styles["field-error"]}>{errors.city}</span>
                </div>
                <div className={`${styles.field} ${errors.state ? styles["has-error"] : ""}`}>
                  <label>
                    STATE <span className={styles.req}>*</span>
                  </label>
                  <div className={styles["select-wrap"]}>
                    <select autoComplete="address-level1" value={form.state} onChange={update("state")}>
                      <option value="">SELECT STATE</option>
                      {INDIA_STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <span className={styles["field-error"]}>{errors.state}</span>
                </div>
                <div className={`${styles.field} ${errors.pincode ? styles["has-error"] : ""}`}>
                  <label>
                    PINCODE <span className={styles.req}>*</span>
                  </label>
                  <input type="text" placeholder="400001" maxLength={6} autoComplete="postal-code" value={form.pincode} onChange={update("pincode")} />
                  <span className={styles["field-error"]}>{errors.pincode}</span>
                </div>
              </div>
              <div className={`${styles["form-row"]} ${styles.full}`}>
                <div className={styles.field}>
                  <label>COUNTRY</label>
                  <div className={styles["select-wrap"]}>
                    <select disabled value="India">
                      <option value="India">INDIA</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles["payment-method-block"]}>
              <div className={styles["form-block-tag"]}>// 03 — PAYMENT_METHOD</div>
              <div className={styles["form-block-title"]} style={{ marginBottom: 0 }}>
                SELECT PAYMENT METHOD
              </div>
              <div className={styles["pm-options"]}>
                {PAYMENT_METHODS.map((m) => (
                  <div key={m.id}>
                    <div
                      className={`${styles["pm-option"]} ${selectedMethod === m.id ? styles.selected : ""}`}
                      onClick={() => setSelectedMethod(m.id)}
                    >
                      <div className={styles["pm-radio"]}>
                        <div className={styles["pm-radio-dot"]} />
                      </div>
                      <div className={styles["pm-icon"]}>{m.icon}</div>
                      <div className={styles["pm-info"]}>
                        <div className={styles["pm-name"]}>{m.name}</div>
                        <div className={styles["pm-desc"]}>{m.desc}</div>
                      </div>
                      {m.badge && <div className={`${styles["pm-badge"]} ${styles[m.badgeClass]}`}>{m.badge}</div>}
                    </div>
                    {m.id === "upi" && (
                      <div className={`${styles["upi-inline"]} ${selectedMethod === "upi" ? styles.show : ""}`}>
                        <input
                          type="text"
                          placeholder="YOURNAME@UPI / 9876543210@UPI"
                          autoComplete="off"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                        <button type="button" className={styles["upi-verify-btn"]} onClick={verifyUpi}>
                          VERIFY
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles["form-block"]}>
              <div className={styles["form-block-tag"]}>// 04 — ADDITIONAL_INFO</div>
              <div className={styles["form-block-title"]}>ADDITIONAL INFO</div>
              <div className={`${styles["form-row"]} ${styles.full}`}>
                <div className={styles.field}>
                  <label>
                    ORDER NOTES <span style={{ color: "var(--text-muted)", fontSize: 8 }}>(OPTIONAL)</span>
                  </label>
                  <textarea placeholder="ANY SPECIAL INSTRUCTIONS FOR YOUR ORDER..." value={form.notes} onChange={update("notes")} />
                </div>
              </div>
              <div className={`${styles["form-row"]} ${styles.full}`}>
                <div className={styles.field}>
                  <label>
                    GSTIN <span style={{ color: "var(--text-muted)", fontSize: 8 }}>(OPTIONAL — FOR BUSINESS ORDERS)</span>
                  </label>
                  <input type="text" placeholder="22AAAAA0000A1Z5" maxLength={15} style={{ textTransform: "uppercase" }} value={form.gstin} onChange={update("gstin")} />
                </div>
              </div>
            </div>

            <div className={styles["checkout-submit-area"]}>
              <Link href="/cart" className={styles["btn-back"]}>
                <svg viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                BACK TO CART
              </Link>
              <button type="button" className={styles["btn-pay"]} onClick={handlePay} disabled={phase === "processing"}>
                <div className={styles["btn-shimmer"]} />
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>{selectedMethodMeta?.payLabel || "PAY WITH RAZORPAY"}</span>
              </button>
            </div>
          </div>

          <div className={styles["checkout-summary-section"]}>
            <button
              type="button"
              className={`${styles["summary-toggle"]} ${summaryOpen ? styles.open : ""}`}
              onClick={() => setSummaryOpen((o) => !o)}
            >
              <span>ORDER SUMMARY</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 11 }}>{formatPriceINR(subtotal)}</span>
                <svg viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            <div className={`${styles["summary-body"]} ${summaryOpen ? styles.open : ""}`}>
              <div style={{ paddingTop: 14 }}>
                <SummaryTotals
                  items={items}
                  subtotal={subtotal}
                  extra={
                    <>
                      <div className={styles["secure-badge"]}>
                        <svg viewBox="0 0 24 24">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>SSL ENCRYPTED · RAZORPAY · PCI DSS</span>
                      </div>
                      <div className={styles["payment-methods"]}>
                        <div className={`${styles["pay-badge"]} ${styles["upi-highlight"]}`}>UPI</div>
                        <div className={styles["pay-badge"]}>CARD</div>
                        <div className={styles["pay-badge"]}>NET BANKING</div>
                        <div className={styles["pay-badge"]}>WALLET</div>
                      </div>
                    </>
                  }
                />
              </div>
            </div>

            <div className={styles["summary-desktop"]}>
              <div className={styles["summary-title"]}>ORDER SUMMARY</div>
              <SummaryTotals
                items={items}
                subtotal={subtotal}
                extra={
                  <>
                    <div className={styles["secure-badge"]}>
                      <svg viewBox="0 0 24 24">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>SSL ENCRYPTED · POWERED BY RAZORPAY · PCI DSS COMPLIANT</span>
                    </div>
                    <div className={styles["payment-methods"]}>
                      <div className={`${styles["pay-badge"]} ${styles["upi-highlight"]}`}>⚡ UPI</div>
                      <div className={styles["pay-badge"]}>CARD</div>
                      <div className={styles["pay-badge"]}>NET BANKING</div>
                      <div className={styles["pay-badge"]}>WALLET</div>
                    </div>
                  </>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <ShopFooter />

      <div className={`${styles["processing-overlay"]} ${phase === "processing" ? styles.show : ""}`}>
        <div className={styles["processing-spinner"]} />
        <div className={styles["processing-text"]}>{processingText}</div>
      </div>

      <div className={`${styles["success-overlay"]} ${phase === "success" ? styles.show : ""}`}>
        <div className={styles["success-tag"]}>// ORDER_CONFIRMED_</div>
        <div className={styles["success-icon"]}>
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className={styles["success-title"]}>
          ORDER
          <br />
          <span>PLACED.</span>
        </div>
        <div className={styles["success-ordid"]}>ORDER #{successOrderId}</div>
        <div className={styles["success-msg"]}>
          YOUR SIGNAL HAS BEEN RECEIVED.
          <br />
          A CONFIRMATION WILL BE TRANSMITTED TO YOUR EMAIL.
        </div>
        <div className={styles["success-btns"]}>
          <Link href="/" className={`${styles["success-btn"]} ${styles.primary}`}>
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>

      <div className={`${styles["cart-toast"]} ${toastType ? styles[toastType] : ""} ${toast ? styles.show : ""}`}>{toast}</div>
    </>
  );
}
