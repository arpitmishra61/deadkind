"use client";

import { useState } from "react";
import styles from "./Archive.module.css";

const TABS = [
  { id: "all", label: "ALL COLLECTIONS [ 02 ]" },
  { id: "01", label: "01. BEYOND THE SYSTEM" },
  { id: "02", label: "02. WHAT I WANT TO SAY" },
];

export default function ArchiveTabs({ cards }) {
  const [active, setActive] = useState("all");

  return (
    <>
      <div className={styles["filter-bar"]}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles["filter-tab"]} ${active === tab.id ? styles.active : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`${styles["archive-grid"]} ${active !== "all" ? styles.single : ""}`}>
        {cards.filter((card) => active === "all" || card.id === active).map((card) => card.node)}
      </div>
    </>
  );
}
