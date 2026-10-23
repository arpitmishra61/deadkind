import StaticFooter from "@/components/static/StaticFooter";
import StaticHeader from "@/components/static/StaticHeader";
import { bebasNeue, rajdhani, shareTechMono } from "@/lib/fonts";
import "@/styles/shop-theme.css";
import styles from "./layout.module.css";

export default function StaticLayout({ children }) {
  return (
    <div className={`shop-theme ${bebasNeue.variable} ${rajdhani.variable} ${shareTechMono.variable}`}>
      <div className={styles.scanline} />
      <StaticHeader />
      <div className={styles.outer}>
        <div className={styles["main-content"]}>{children}</div>
      </div>
      <StaticFooter />
    </div>
  );
}
