import Barcode from "./Barcode";
import styles from "./StaticFooter.module.css";

export default function StaticFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles["footer-left"]}>
        <span>DK-2050</span>
        <span style={{ color: "var(--border-mid)" }}>+</span>
        <Barcode className={styles.barcode} />
        <span>UNKNOWN SIGNAL</span>
      </div>
      <div className={styles["footer-center"]}>DEAD INSIDE. ALIVE ANYWAY.</div>
      <div className={styles["footer-right"]}>
        <span>© DEADKIND 2050</span>
        <span>ALL RIGHTS REBELLED.</span>
      </div>
    </footer>
  );
}
