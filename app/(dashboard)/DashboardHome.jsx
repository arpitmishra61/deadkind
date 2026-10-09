"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import { apiGet } from "@/lib/apiClient";
import DashboardHeader from "./DashboardHeader";
import OrbitCanvas from "./OrbitCanvas";
import styles from "./Dashboard.module.css";

const THEMES = {
  rebel: {
    theme: "rebel",
    label: "01ST COLLECTION",
    t1: "BEYOND THE",
    t2: "SYSTEM",
    subcategoryName: "BEYOND THE SYSTEM",
    planet: "/p1.png",
    planetClass: "planet-rebel",
    des: "A world beyond conformity <br/>This imagines a place beyond trends beyond expectations and beyond the rules written by society Designs in it: civilised chaos, Rebel on Mars, heavy on smoke "
  },
  lineup: {
    theme: "lineup",
    label: "02ND COLLECTION",
    t1: "WHAT I",
    t2: "WANT TO SAY",
    subcategoryName: "WHAT I WANT TO SAY",
    planet: "/p3.png",
    planetClass: "planet-lineup",
    des: "The thoughts we don't usually say out loud <br/> A collection of thoughts and everyday truths that often stay unspoken"
  },
};


function findSubIdByName(subcategories, name) {
  const target = (name || "").toUpperCase().trim();
  return subcategories.find((s) => (s.name || "").toUpperCase().trim() === target)?.id || null;
}

export default function DashboardHome({ subcategories, initialTheme, initialProducts }) {
  const [activeTheme, setActiveTheme] = useState(initialTheme);
  const [cartCount, setCartCount] = useState(0);
  const stageRef = useRef(null);

  const theme = THEMES[activeTheme];

  async function switchTheme(themeKey) {
    if (themeKey === activeTheme) return;
    setActiveTheme(themeKey);
    try {
      const subId = findSubIdByName(subcategories, THEMES[themeKey].subcategoryName);
      subId ? await apiGet(`/api/products?subcategoryId=${subId}`) : null;
    } catch {
      // no-op
    }
  }

  const piecesCount = initialProducts.length;

  return (
    <div className={`dashboard-theme theme-${activeTheme}`}>
      <div className={`${styles.corner} ${styles["corner-tl"]}`} />
      <div className={`${styles.corner} ${styles["corner-tr"]}`} />
      <div className={`${styles.corner} ${styles["corner-bl"]}`} />
      <div className={`${styles.corner} ${styles["corner-br"]}`} />
      <div className={styles["scroll-label"]}>SCROLL TO EXPLORE</div>

      <DashboardHeader cartCount={cartCount} />

      <div className={styles.main}>
        {/* LEFT PANEL */}
        <div className={styles["left-panel"]}>
          {Object.values(THEMES).map((t) => (
            <div key={t.theme} className={styles["collection-entry"]}>
              <div className={styles["collection-label"]}>{t.label}</div>
              <div className={styles["hero-title"]}>
                {t.t1}
                <span className={styles.accent}>{t.t2}</span>
              </div>
              <div className={styles["hero-tagline"]}>
                {t.des.split("<br/>").map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
              <Link
                href={`/collection?subcategory=${encodeURIComponent(t.subcategoryName)}`}
                className={styles["explore-btn"]}
              >
                EXPLORE COLLECTION
              </Link>
            </div>
          ))}
          <div className={styles["system-status"]}>
            <div className={styles["sys-header"]}>SYSTEM STATUS_</div>
            <div className={styles["sys-body"]}>
              <div className={styles["sys-skull-box"]}>
                <svg viewBox="0 0 50 55" fill="none">
                  <ellipse cx="25" cy="22" rx="17" ry="15" fill="none" stroke="#555" strokeWidth="0.7" />
                  <ellipse cx="18" cy="21" rx="4.5" ry="4.5" fill="none" stroke="#666" strokeWidth="0.8" />
                  <ellipse cx="32" cy="21" rx="4.5" ry="4.5" fill="none" stroke="#666" strokeWidth="0.8" />
                  <rect x="15" y="36" width="20" height="9" rx="1" fill="none" stroke="#555" strokeWidth="0.7" />
                </svg>
              </div>
              <div className={styles["sys-info"]}>
                EMOTIONAL
                <br />
                SYSTEM
                <br />
                <span className={styles.highlight}>ACTIVE</span>
              </div>
            </div>
            <div className={styles["progress-label"]}>
              <span>EMOTIONAL SYSTEM</span>
              <span className={styles.pval}>86%</span>
            </div>
            <div className={styles["progress-bar"]}>
              <div className={styles["progress-fill"]} />
            </div>
            <div className={styles["sys-coords"]}>
              <div>
                33.6883° N
                <br />
                73.0479° E
              </div>
              <div>
                VER. 2.0.5
                <br />
                BUILD 0424
              </div>
            </div>
          </div>
        </div>

        {/* CENTER STAGE */}
        <div className={styles["center-stage"]} ref={stageRef}>
          <OrbitCanvas stageRef={stageRef} />
          <div className={styles["floor-glow"]} />
          <div className={styles["floor-reflect"]} />
          <div className={styles["model-wrap"]}>
            <ImgWithFallback src="/model.png" alt="model" className={styles["model-img"]} />
          </div>

          <div className={styles["mob-hero-label"]}>
            <div className={styles["mob-hero-coll-tag"]}>{theme.label}</div>
            <div className={styles["mob-hero-title-overlay"]}>
              {theme.t1}
              <span className={styles.accent}>{theme.t2}</span>
            </div>
          </div>
          <div className={styles["mob-banner-bar"]}>
            <div className={styles["mob-pieces-info"]}>
              RELEASE: <span>05.24.25</span> &nbsp;&middot;&nbsp; STATUS: <span>FOR THOSE WHO DONT FIT</span>
            </div>
            <Link href="/collection" className={styles["mob-explore-pill"]}>
              SHOP NOW
            </Link>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className={styles["right-panel"]}>
          <div className={styles["panel-box"]}>
            <div className={styles["panel-hdr"]}>
              <span>COLLECTION DATA</span>
              <span className={styles["panel-num"]}>02</span>
            </div>
            <div className={styles["data-row"]}>
              <span>PIECES</span>
              <span className={styles["data-val"]}>{piecesCount || "—"}</span>
            </div>
            <div className={styles["data-row"]}>
              <span>RELEASE DATE</span>
              <span className={`${styles["data-val"]} ${styles.acc}`}>05.24.25</span>
            </div>
            <div className={styles["data-row"]}>
              <span>LOCATION</span>
              <span className={styles["data-val"]}>EARTH (TEMP)</span>
            </div>
            <div className={styles["data-row"]}>
              <span>STATUS</span>
              <span className={styles["data-val"]}>FOR THOSE WHO DONT FIT</span>
            </div>
            <Link href="/collection" className={styles["view-link"]}>
              VIEW ALL PRODUCTS <span style={{ color: "var(--acid-yellow)" }}>→</span>
            </Link>
          </div>
          {/* <div className={styles["panel-box"]}>
            <div className={styles["join-title"]}>JOIN THE FREQUENCY_</div>
            <div className={styles["join-text"]}>
              Get early access, secret drops
              <br />
              and exclusive chaos.
            </div>
            <div className={styles["email-row"]}>
              <input type="email" placeholder="ENTER EMAIL" />
              <button type="button" className={styles["email-sub"]}>
                →
              </button>
            </div>
          </div> */}
        </div>
      </div>

      {/* <div className={styles["float-actions"]}>
        <button type="button" className={styles["float-btn"]}>
          +
        </button>
        <div className={styles["float-barcode"]}>DK-2050</div>
        <button type="button" className={styles["float-skull-btn"]}>
          💀
        </button>
      </div> */}

      {/* BOTTOM BAR */}
      <div className={styles["bottom-bar"]}>
        <div className={styles["bottom-status"]}>
          <div>DK-2050 &nbsp;+&nbsp; ▌▌▌▌▌▌▌▌ &nbsp;UNKNOWN SIGNAL</div>
          <div className={styles["bs-center"]}>DEAD INSIDE. ALIVE ANYWAY.</div>
          <div>© DEADKIND 2050 &nbsp; ALL RIGHTS REBELLED.</div>
        </div>
      </div>
    </div>
  );
}
