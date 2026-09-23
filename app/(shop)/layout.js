import ShopHeader from "@/components/shop/ShopHeader";
import { bebasNeue, rajdhani, shareTechMono } from "@/lib/fonts";
import "@/styles/shop-theme.css";
import styles from "./layout.module.css";

export default function ShopLayout({ children }) {
  return (
    <div className={`shop-theme ${bebasNeue.variable} ${rajdhani.variable} ${shareTechMono.variable}`}>
      <div className={styles.scanline} />
      <ShopHeader />
      {children}
    </div>
  );
}
