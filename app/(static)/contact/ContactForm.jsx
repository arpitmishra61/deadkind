"use client";

import { useState } from "react";
import { apiPost } from "@/lib/apiClient";
import styles from "./Contact.module.css";

const TransmitIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const SpinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={styles.spin}
    style={{ width: 16, height: 16 }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", company: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [phase, setPhase] = useState("idle"); // idle | loading | success
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ type: "error", message: "⚠ FILL IN ALL REQUIRED FIELDS BEFORE TRANSMITTING." });
      return;
    }

    setPhase("loading");
    setStatus(null);

    try {
      await apiPost("/api/contact", form);
      setPhase("success");
      setStatus({ type: "success", message: "✓ SIGNAL TRANSMITTED. WE'LL DECODE IT AND GET BACK TO YOU." });
      setForm(EMPTY_FORM);
      showToast("+ SIGNAL SENT TO DEADKIND HQ");
      setTimeout(() => {
        setPhase("idle");
        setStatus(null);
      }, 6000);
    } catch (err) {
      setPhase("idle");
      setStatus({ type: "error", message: `⚠ TRANSMISSION FAILED: ${err.message}` });
    }
  }

  return (
    <div className={styles["mid-panel"]}>
      <div className={styles["form-panel-title"]}>SEND A SIGNAL_</div>
      <form className={styles["contact-form"]} onSubmit={handleSubmit}>
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={update("company")}
          className={styles.honeypot}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className={styles["form-row"]}>
          <div className={styles["form-field"]}>
            <label className={styles["field-label"]} htmlFor="fieldName">
              NAME / ALIAS
            </label>
            <input
              id="fieldName"
              type="text"
              placeholder="Who are you?"
              required
              autoComplete="off"
              value={form.name}
              onChange={update("name")}
            />
          </div>
          <div className={styles["form-field"]}>
            <label className={styles["field-label"]} htmlFor="fieldEmail">
              EMAIL
            </label>
            <input
              id="fieldEmail"
              type="email"
              placeholder="Your frequency"
              required
              autoComplete="off"
              value={form.email}
              onChange={update("email")}
            />
          </div>
        </div>

        <div className={styles["form-field"]}>
          <label className={styles["field-label"]} htmlFor="fieldSubject">
            SUBJECT
          </label>
          <input
            id="fieldSubject"
            type="text"
            placeholder="What's this about?"
            autoComplete="off"
            value={form.subject}
            onChange={update("subject")}
          />
        </div>

        <div className={styles["form-field"]}>
          <label className={styles["field-label"]} htmlFor="fieldMessage">
            MESSAGE
          </label>
          <textarea
            id="fieldMessage"
            placeholder="Type your signal here..."
            required
            value={form.message}
            onChange={update("message")}
          />
        </div>

        <div className={styles["submit-row"]}>
          <button
            type="submit"
            className={`${styles["btn-transmit"]} ${phase === "loading" ? styles.loading : ""} ${
              phase === "success" ? styles.success : ""
            }`}
          >
            {phase === "loading" ? (
              <>
                TRANSMITTING... <SpinIcon />
              </>
            ) : phase === "success" ? (
              <>
                SIGNAL RECEIVED ✓ <CheckIcon />
              </>
            ) : (
              <>
                TRANSMIT SIGNAL <TransmitIcon />
              </>
            )}
          </button>
          <div className={styles["transmit-note"]}>
            <svg viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Your signal is <span className={styles.enc}>&nbsp;encrypted</span>
            <br />
            end to end.
          </div>
        </div>

        {status && <div className={`${styles["form-status"]} ${styles[status.type]}`}>{status.message}</div>}
      </form>

      <div className={`${styles.toast} ${toast ? styles.show : ""}`}>{toast}</div>
    </div>
  );
}
