import ImgWithFallback from "@/components/common/ImgWithFallback";
import ContactForm from "./ContactForm";
import styles from "./Contact.module.css";

export const metadata = {
  title: "Dead'Kind — Contact",
};

const SKULL_FALLBACK = (
  <svg viewBox="0 0 100 110" style={{ width: "70%", height: "70%", position: "relative", zIndex: 2 }}>
    <ellipse cx="50" cy="44" rx="34" ry="36" fill="none" stroke="#c45486" />
    <ellipse cx="37" cy="44" rx="9" ry="10" fill="none" stroke="#c45486" />
    <ellipse cx="63" cy="44" rx="9" ry="10" fill="none" stroke="#c45486" />
  </svg>
);

export default function ContactPage() {
  return (
    <>
      <div className={styles.noise} />
      <div className={styles["content-area"]}>
        <div className={styles["left-panel"]}>
          <div className={styles["panel-tag"]}>// CONTACT_</div>
          <div className={styles["left-headline"]}>
            <span>LEAVE A SIGNAL.</span>
            <span className={styles["accent-line"]}>WE&apos;LL FIND IT.</span>
          </div>
          <div className={styles["left-body"]}>
            <p>We don&apos;t do inboxes.</p>
            <p>We pick up frequencies.</p>
            <br />
            <p>
              Send your signal and
              <br />
              we&apos;ll get back if it&apos;s real.
            </p>
            <br />
            <p>Just humans and chaos.</p>
          </div>

          <div className={styles["skull-art-wrap"]}>
            <div className={styles["skull-art-grid"]}>
              <div className={styles["skull-grid-lines"]} />
              <ImgWithFallback src="/skull.png" alt="Skull" className={styles["skull-art-img"]} fallback={SKULL_FALLBACK} />
              <div className={`${styles["skull-corner"]} ${styles.tl}`} />
              <div className={`${styles["skull-corner"]} ${styles.tr}`} />
              <div className={`${styles["skull-corner"]} ${styles.bl}`} />
              <div className={`${styles["skull-corner"]} ${styles.br}`} />
              <div className={styles["skull-scan"]} />
            </div>
          </div>
        </div>

        <ContactForm />

        <div className={styles["right-panel"]}>
          <div>
            <div className={styles["right-section-title"]}>OTHER WAYS TO CONNECT_</div>
            <div className={styles["contact-list"]}>
              <div className={styles["contact-item"]}>
                <div className={styles["contact-icon-wrap"]}>
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                </div>
                <div>
                  <div className={styles["contact-info-label"]}>GENERAL ENQUIRIES</div>
                  <a href="mailto:contact@deadkind.in" className={styles["contact-info-val"]}>
                    contact@deadkind.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className={styles["map-box"]}>
            <div className={styles["map-box-header"]}>// SIGNAL ORIGIN_</div>
            <div className={styles["map-inner"]}>
              <div className={styles["map-crosshair"]} />
              <div className={styles["map-ping"]} />
            </div>
            <div className={styles["map-box-footer"]}>
              <div className={styles["map-stat"]}>
                <div className={styles["map-stat-key"]}>LAT</div>
                <div className={styles["map-stat-val"]}>33.6883° N</div>
              </div>
              <div className={styles["map-stat"]}>
                <div className={styles["map-stat-key"]}>LONG</div>
                <div className={styles["map-stat-val"]}>73.0479° E</div>
              </div>
              <div className={styles["map-stat"]}>
                <div className={styles["map-stat-key"]}>ORIGIN</div>
                <div className={styles["map-stat-val"]}>EARTH (TEMP)</div>
              </div>
              <div className={styles["map-stat"]}>
                <div className={styles["map-stat-key"]}>STATUS</div>
                <div className={styles["map-stat-val"]}>OUTSIDER</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
