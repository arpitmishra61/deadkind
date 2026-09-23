"use client";

import { useState } from "react";
import Link from "next/link";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import styles from "./Dashboard.module.css";

const SKULL_FALLBACK_SVG = (
  <svg viewBox="0 0 40 40" fill="none" style={{ display: "block" }}>
    <ellipse cx="20" cy="17" rx="13" ry="12" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
    <ellipse cx="20" cy="17" rx="11" ry="10" fill="#222" />
    <ellipse cx="15" cy="16" rx="3.5" ry="3.5" fill="#080808" />
    <ellipse cx="25" cy="16" rx="3.5" ry="3.5" fill="#080808" />
  </svg>
);

export default function DashboardHeader({ cartCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles["header-left"]}>
        <Link href="/" className={styles["skull-logo"]}>
          <ImgWithFallback src="/skull3.png" alt="DeadKind Skull" fallback={SKULL_FALLBACK_SVG} />
        </Link>
        <div className={styles["header-status"]}>
          <div className={styles["status-online"]}>
            <span className={styles["status-dot"]} />
            SYSTEM ONLINE &nbsp;&middot;&nbsp; DK-2050
          </div>
          <div>LOCATION &nbsp;&middot;&nbsp; EARTH (TEMP)</div>
          <div>STATUS &nbsp;&middot;&nbsp; FOR THOSE WHO DONT FIT</div>
        </div>
      </div>

      <div className={styles["header-center"]}>
        <ImgWithFallback
          src="/name.png"
          alt="DeadKind"
          className={styles["brand-name-img"]}
          fallback={<span className={styles["brand-name-fallback"]}>DeadKind</span>}
        />
      </div>

      <div className={styles["header-right"]}>
        <nav className={styles.nav}>
          <Link href="/">SHOP</Link>
          <div className={styles["nav-dropdown-wrap"]}>
            <Link href="/collection">COLLECTIONS ▾</Link>
            <div className={styles["nav-dropdown-menu"]}>
              <Link href="/collection?subcategory=BEYOND%20THE%20SYSTEM">
                <span className={styles["drop-num"]}>01</span> BEYOND THE SYSTEM
              </Link>
              <Link href="/collection?subcategory=WHAT%20I%20WANT%20TO%20SAY">
                <span className={styles["drop-num"]}>02</span> WHAT I WANT TO SAY
              </Link>
              <div className={styles["drop-divider"]} />
              <Link href="/collection" className={styles["drop-all"]}>
                VIEW ALL COLLECTIONS →
              </Link>
            </div>
          </div>
          <Link href="/archive">ARCHIVE</Link>
          <Link href="/about">ABOUT</Link>
          <Link href="/contact">CONTACT</Link>
        </nav>
        <div className={styles["header-divider"]} />
        <Link href="/cart" className={styles["cart-btn"]}>
          CART [ {cartCount} ]
        </Link>
        <div className={styles["header-plus-btn"]}>+</div>
      </div>

      <Link href="/cart" className={styles["cart-btn-mob"]}>
        [ {cartCount} ]
      </Link>
      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`${styles["mob-nav"]} ${mobileOpen ? styles.open : ""}`}>
        <Link href="/" onClick={() => setMobileOpen(false)}>
          SHOP
        </Link>
        <div className={styles["mob-nav-group"]}>
          <Link href="/collection" className={styles["mob-nav-parent"]} onClick={() => setMobileOpen(false)}>
            COLLECTIONS
          </Link>
          <div className={styles["mob-nav-sub"]}>
            <Link href="/collection?subcategory=BEYOND%20THE%20SYSTEM" className={styles["mob-sub-item"]} onClick={() => setMobileOpen(false)}>
              <span className={styles["sub-num"]}>01</span> BEYOND THE SYSTEM
            </Link>
            <Link href="/collection?subcategory=WHAT%20I%20WANT%20TO%20SAY" className={styles["mob-sub-item"]} onClick={() => setMobileOpen(false)}>
              <span className={styles["sub-num"]}>02</span> WHAT I WANT TO SAY
            </Link>
            <Link href="/collection" className={`${styles["mob-sub-item"]} ${styles["mob-sub-all"]}`} onClick={() => setMobileOpen(false)}>
              VIEW ALL COLLECTIONS →
            </Link>
          </div>
        </div>
        <Link href="/archive" onClick={() => setMobileOpen(false)}>
          ARCHIVE
        </Link>
        <Link href="/about" onClick={() => setMobileOpen(false)}>
          ABOUT
        </Link>
        <Link href="/contact" onClick={() => setMobileOpen(false)}>
          CONTACT
        </Link>
      </div>
    </header>
  );
}
