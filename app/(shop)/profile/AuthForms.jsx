"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import styles from "./Profile.module.css";

const EMPTY_LOGIN = { email: "", password: "" };
const EMPTY_SIGNUP = { email: "", phone: "", password: "", password2: "" };

export default function AuthForms() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState(EMPTY_LOGIN);
  const [signup, setSignup] = useState(EMPTY_SIGNUP);
  const [signupErrors, setSignupErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  function switchTab(next) {
    setTab(next);
    setMsg(null);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await apiPost("/api/auth/login", login);
      router.refresh();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!login.email.trim()) {
      setMsg({ type: "error", text: "ENTER YOUR EMAIL FIRST." });
      return;
    }
    try {
      await apiPost("/api/auth/reset-password", { email: login.email.trim() });
      setMsg({ type: "success", text: `RESET LINK SENT TO ${login.email.trim()}` });
    } catch {
      setMsg({ type: "error", text: "COULD NOT SEND RESET EMAIL." });
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setMsg(null);

    const errs = {};
    if (!/^\d{10}$/.test(signup.phone.trim())) errs.phone = "ENTER VALID 10-DIGIT NUMBER";
    if (signup.password.length < 6) errs.password = "MINIMUM 6 CHARACTERS";
    if (signup.password !== signup.password2) errs.password2 = "PASSWORDS DO NOT MATCH";
    setSignupErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await apiPost("/api/auth/signup", { email: signup.email.trim(), password: signup.password, phone: signup.phone.trim() });
      router.refresh();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles["auth-screen"]}>
      <div className={styles["auth-wrap"]}>
        <div className={styles["auth-tag"]}>// IDENTITY_</div>
        <div className={styles["auth-title"]}>
          ACCESS
          <br />
          <span>PORTAL.</span>
        </div>
        <div className={styles["auth-subtitle"]}>AUTHENTICATE TO CONTINUE_</div>

        <div className={styles["auth-tabs"]}>
          <button type="button" className={`${styles["auth-tab"]} ${tab === "login" ? styles.active : ""}`} onClick={() => switchTab("login")}>
            LOGIN
          </button>
          <button type="button" className={`${styles["auth-tab"]} ${tab === "signup" ? styles.active : ""}`} onClick={() => switchTab("signup")}>
            SIGN UP
          </button>
        </div>

        {msg && <div className={`${styles["auth-msg"]} ${styles[msg.type]}`}>{msg.text}</div>}

        {tab === "login" ? (
          <form className={styles["auth-form"]} onSubmit={handleLogin}>
            <div className={styles["f-group"]}>
              <label className={styles["f-label"]}>
                EMAIL ADDRESS <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                className={styles["f-input"]}
                type="email"
                placeholder="DEAD@KIND.COM"
                autoComplete="email"
                required
                value={login.email}
                onChange={(e) => setLogin((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className={styles["f-group"]}>
              <label className={styles["f-label"]}>
                PASSWORD <span style={{ color: "var(--accent)" }}>*</span>
                <button type="button" className={styles["forgot-btn"]} onClick={handleForgot}>
                  FORGOT?
                </button>
              </label>
              <input
                className={styles["f-input"]}
                type="password"
                placeholder="••••••••••"
                autoComplete="current-password"
                required
                value={login.password}
                onChange={(e) => setLogin((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button type="submit" className={styles["btn-auth"]} disabled={loading}>
              {loading ? "PLEASE WAIT..." : "LOGIN_"}
            </button>
            <div className={styles["auth-switch"]}>
              NEW HERE?{" "}
              <button type="button" onClick={() => switchTab("signup")}>
                CREATE ACCOUNT →
              </button>
            </div>
          </form>
        ) : (
          <form className={styles["auth-form"]} onSubmit={handleSignup}>
            <div className={styles["f-group"]}>
              <label className={styles["f-label"]}>
                EMAIL ADDRESS <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                className={styles["f-input"]}
                type="email"
                placeholder="DEAD@KIND.COM"
                autoComplete="email"
                required
                value={signup.email}
                onChange={(e) => setSignup((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className={styles["f-group"]}>
              <label className={styles["f-label"]}>
                MOBILE NUMBER <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <div className={styles["phone-row"]}>
                <span className={styles["phone-code"]}>+91</span>
                <input
                  className={`${styles["f-input"]} ${signupErrors.phone ? styles.err : ""}`}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  autoComplete="tel"
                  required
                  value={signup.phone}
                  onChange={(e) => setSignup((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              {signupErrors.phone && <span className={`${styles["f-err"]} ${styles.show}`}>{signupErrors.phone}</span>}
            </div>
            <div className={styles["f-group"]}>
              <label className={styles["f-label"]}>
                PASSWORD <span style={{ color: "var(--accent)" }}>*</span>
                <span style={{ color: "var(--text-muted)", fontSize: 8 }}>MIN 6 CHARS</span>
              </label>
              <input
                className={`${styles["f-input"]} ${signupErrors.password ? styles.err : ""}`}
                type="password"
                placeholder="CREATE PASSWORD"
                autoComplete="new-password"
                required
                value={signup.password}
                onChange={(e) => setSignup((f) => ({ ...f, password: e.target.value }))}
              />
              {signupErrors.password && <span className={`${styles["f-err"]} ${styles.show}`}>{signupErrors.password}</span>}
            </div>
            <div className={styles["f-group"]}>
              <label className={styles["f-label"]}>
                CONFIRM PASSWORD <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                className={`${styles["f-input"]} ${signupErrors.password2 ? styles.err : ""}`}
                type="password"
                placeholder="CONFIRM PASSWORD"
                autoComplete="new-password"
                required
                value={signup.password2}
                onChange={(e) => setSignup((f) => ({ ...f, password2: e.target.value }))}
              />
              {signupErrors.password2 && <span className={`${styles["f-err"]} ${styles.show}`}>{signupErrors.password2}</span>}
            </div>
            <button type="submit" className={styles["btn-auth"]} disabled={loading}>
              {loading ? "PLEASE WAIT..." : "CREATE ACCOUNT_"}
            </button>
            <div className={styles["auth-switch"]}>
              ALREADY REGISTERED?{" "}
              <button type="button" onClick={() => switchTab("login")}>
                LOGIN →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
