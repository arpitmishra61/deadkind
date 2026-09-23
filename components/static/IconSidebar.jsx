import styles from "./IconSidebar.module.css";

export default function IconSidebar() {
  return (
    <aside className={styles["icon-sidebar"]}>
      <button className={`${styles["icon-btn"]} ${styles.active}`} title="Target">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
        </svg>
      </button>
      <button className={styles["icon-btn"]} title="Close">
        <svg viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <button className={styles["icon-btn"]} title="Square">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="1" />
        </svg>
      </button>
      <button className={styles["icon-btn"]} title="Copy">
        <svg viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button className={styles["icon-btn"]} title="Signal">
        <svg viewBox="0 0 24 24">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <button className={styles["icon-btn"]} title="Skull">
        <svg viewBox="0 0 24 24">
          <path d="M12 2a9 9 0 0 1 9 9c0 3.5-2 6.5-5 8v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2c-3-1.5-5-4.5-5-8a9 9 0 0 1 9-9z" />
          <line x1="9" y1="17" x2="9" y2="21" />
          <line x1="15" y1="17" x2="15" y2="21" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <button className={styles["icon-btn"]} title="Settings">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      <div className={styles["scroll-label-wrap"]}>
        <div className={styles["scroll-label"]}>SCROLL TO EXPLORE</div>
        <div className={styles["scroll-arrow"]} />
        <button className={styles["icon-btn"]} title="Alert" style={{ marginTop: 4 }}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
