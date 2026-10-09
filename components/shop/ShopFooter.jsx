import styles from "./ShopFooter.module.css";

export default function ShopFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles["footer-coords"]}>DEAD&apos;KIND — DK-2050</div>
      <div className={styles["footer-right"]}>
        <div className={styles["footer-tagline"]}>DEAD INSIDE. ALIVE ANYWAY.</div>

      </div>
    </footer>
  );
}
