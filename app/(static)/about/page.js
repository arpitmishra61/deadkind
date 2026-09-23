import Link from "next/link";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import styles from "./About.module.css";

export const metadata = {
  title: "Dead'Kind — About",
};

const SKULL_FALLBACK = (
  <div className={styles["skull-svg-placeholder"]}>
    <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="44" rx="34" ry="36" />
      <ellipse cx="37" cy="44" rx="9" ry="10" />
      <ellipse cx="63" cy="44" rx="9" ry="10" />
      <rect x="38" y="78" width="8" height="14" rx="1" />
      <rect x="54" y="78" width="8" height="14" rx="1" />
      <path d="M32 78 Q50 72 68 78" />
      <path d="M44 78 L44 92" />
      <path d="M56 78 L56 92" />
      <path d="M30 58 Q50 65 70 58" />
      <line x1="50" y1="8" x2="50" y2="2" />
      <line x1="26" y1="16" x2="22" y2="11" />
      <line x1="74" y1="16" x2="78" y2="11" />
    </svg>
  </div>
);

const MANIFESTO = [
  {
    title: "QUESTION EVERYTHING.",
    sub: "Truth is a construct.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 6.5-5 8v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2c-3-1.5-5-4.5-5-8a9 9 0 0 1 9-9z" />
        <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "SEE BEYOND THE NOISE.",
    sub: "Clarity is rebellion.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "BUILT FOR OUTSIDERS.",
    sub: "Not for everyone.",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "CREATE. DESTROY. REBUILD.",
    sub: "That's the only cycle that matters.",
    icon: (
      <svg viewBox="0 0 24 24">
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
    ),
  },
  {
    title: "STAY OFF FREQUENCY.",
    sub: "Stay DeadKind.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const SYSTEM_INFO = [
  ["FOUNDED", "DK-2050"],
  ["ORIGIN", "EARTH (TEMP)"],
  ["STATUS", "OUTSIDER"],
  ["AFFILIATION", "NONE"],
  ["MOTIVE", "EXPRESSION"],
  ["MISSION", "LEAVE A SIGNAL"],
];

export default function AboutPage() {
  return (
    <>
      <div className={styles["top-section"]}>
        <div className={styles["about-left"]}>
          <div className={styles["about-title"]}>
            ABOUT<span style={{ color: "var(--accent)" }}>_</span>
          </div>
          <div className={styles["about-tagline"]}>FOR THOSE WHO DON&apos;T FIT</div>
          <div className={styles["about-body"]}>
            <p>DeadKind is not just a brand.</p>
            <p>It&apos;s a signal.</p>
            <p>A frequency for the misfits, the outcasts,</p>
            <p>the ones who see through the noise.</p>
            <p>We don&apos;t follow culture.</p>
            <p>We build our own.</p>
          </div>
          <div className={styles["about-cta"]}>
            <p>WE ARE DEADKIND.</p>
            <p>AND THIS IS OUR TRANSMISSION.</p>
          </div>
        </div>

        <div className={styles["about-center"]}>
          <div className={styles["radar-wrap"]}>
            <div className={styles["radar-circle"]} />
            <div className={styles["radar-circle"]} />
            <div className={styles["radar-circle"]} />
            <div className={styles["radar-line-h"]} />
            <div className={styles["radar-line-v"]} />
            <div className={styles["radar-sweep"]} />
            <div className={`${styles["radar-dot"]} ${styles["radar-dot-1"]}`} />
            <div className={`${styles["radar-dot"]} ${styles["radar-dot-2"]}`} />
            <div className={`${styles["radar-dot"]} ${styles["radar-dot-3"]}`} />
            <div className={styles["crosshair-h"]} />
            <div className={styles["crosshair-v"]} />
            <div className={`${styles["crosshair-corner"]} ${styles["cc-tl"]}`} />
            <div className={`${styles["crosshair-corner"]} ${styles["cc-tr"]}`} />
            <div className={`${styles["crosshair-corner"]} ${styles["cc-bl"]}`} />
            <div className={`${styles["crosshair-corner"]} ${styles["cc-br"]}`} />
            <ImgWithFallback src="/skull2.png" alt="Skull" className={styles["skull-img"]} fallback={SKULL_FALLBACK} />
          </div>
        </div>

        <div className={styles["about-right"]}>
          <div className={styles["manifesto-box"]}>
            <div className={styles["manifesto-title"]}>OUR MANIFESTO_</div>
            {MANIFESTO.map((item) => (
              <div className={styles["manifesto-item"]} key={item.title}>
                <div className={styles["manifesto-icon"]}>{item.icon}</div>
                <div>
                  <div className={styles["manifesto-item-title"]}>{item.title}</div>
                  <div className={styles["manifesto-item-sub"]}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles["sysinfo-box"]}>
            <div className={styles["sysinfo-title"]}>SYSTEM INFO_</div>
            {SYSTEM_INFO.map(([key, val]) => (
              <div className={styles["sysinfo-row"]} key={key}>
                <span className={styles["sysinfo-key"]}>{key}</span>
                <span className={styles["sysinfo-val"]}>{val}</span>
              </div>
            ))}
            <Link href="/contact">
              <button type="button" className={styles["join-freq-btn"]}>
                JOIN THE FREQUENCY.
                <svg viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles["collections-section"]}>
        <div className={styles["collections-section-title"]}>OUR COLLECTIONS_</div>
        <div className={styles["collections-grid"]}>
          <Link href="/collection?subcategory=BEYOND%20THE%20SYSTEM" className={styles["col-card"]}>
            <div className={styles["col-card-num"]}>01</div>
            <div className={styles["col-card-img"]}>
              <ImgWithFallback
                src="/planet.png"
                alt="Beyond the System"
                fallback={
                  <div className={styles["col-card-img-placeholder"]}>
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" />
                      <ellipse cx="50" cy="50" rx="48" ry="12" fill="none" stroke="currentColor" />
                    </svg>
                  </div>
                }
              />
            </div>
            <div className={styles["col-card-body"]}>
              <div className={styles["col-card-name"]}>BEYOND THE SYSTEM</div>
              <div className={styles["col-card-sub"]}>A world beyond conformity</div>
              <div className={`${styles["col-card-status"]} ${styles.released}`}>RELEASED</div>
              <div className={styles["col-card-date"]}>02.11.24</div>
            </div>
          </Link>

          <Link href="/collection?subcategory=WHAT%20I%20WANT%20TO%20SAY" className={`${styles["col-card"]} ${styles.active}`}>
            <div className={styles["col-card-num"]}>02</div>
            <div className={styles["col-active-dot"]} />
            <div className={styles["col-card-img"]}>
              <ImgWithFallback
                src="/skull2.png"
                alt="What I Want to Say"
                style={{ filter: "drop-shadow(0 0 12px rgba(196,84,134,0.6)) sepia(0.4) saturate(2) hue-rotate(290deg)" }}
                fallback={
                  <div className={styles["col-card-img-placeholder"]}>
                    <svg viewBox="0 0 100 100">
                      <circle cx="38" cy="44" r="26" fill="none" stroke="#c45486" />
                      <circle cx="62" cy="44" r="26" fill="none" stroke="#c45486" />
                      <circle cx="38" cy="38" r="8" fill="#c45486" opacity="0.8" />
                      <circle cx="62" cy="38" r="8" fill="#c45486" opacity="0.8" />
                    </svg>
                  </div>
                }
              />
            </div>
            <div className={styles["col-card-body"]}>
              <div className={styles["col-card-name"]}>WHAT I WANT TO SAY</div>
              <div className={styles["col-card-sub"]}>The thoughts we don&apos;t usually say out loud</div>
              <div className={`${styles["col-card-status"]} ${styles["active-status"]}`}>ACTIVE</div>
              <div className={styles["col-card-date"]} style={{ color: "var(--accent)" }}>
                05.24.25
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
