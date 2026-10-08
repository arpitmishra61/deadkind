import Link from "next/link";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import { formatPriceINR } from "@/lib/format";
import { getArchivedProductsBySubcategoryId } from "@/lib/data/products";
import { findSubcategoryByName } from "@/lib/data/subcategories";
import ArchiveTabs from "./ArchiveTabs";
import styles from "./Archive.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dead'Kind — Signal Archive",
};

const COLLECTIONS = [
  {
    id: "01",
    subcategoryName: "BEYOND THE SYSTEM",
    badge: "01ST COLLECTION",
    signal: "SIGNAL 01",
    name: "BEYOND THE SYSTEM",
    desc: "A world beyond conformity. Imagining a place beyond trends, expectations, and society's rules.",
    signalId: "BTS-001",
    release: "05.24.25",
    coverSrc: "/p1.png",
    coverFallback: "/planet.png",
  },
  {
    id: "02",
    subcategoryName: "WHAT I WANT TO SAY",
    badge: "02ND COLLECTION",
    signal: "SIGNAL 02",
    name: "WHAT I WANT TO SAY",
    desc: "Expressions when words fail. Raw, unrefined, and unfiltered emotions translated into heavy silhouettes.",
    signalId: "WWS-002",
    release: "05.24.25",
    coverSrc: "/p3.png",
    coverFallback: "/skull2.png",
    coverStyle: { filter: "drop-shadow(0 0 8px rgba(196,84,134,0.4))" },
  },
];

function ArchiveCard({ config, products }) {
  return (
    <div className={styles["archive-card"]} data-collection={config.id}>
      <span className={`${styles["card-corner"]} ${styles.tl}`} />
      <span className={`${styles["card-corner"]} ${styles.tr}`} />
      <span className={`${styles["card-corner"]} ${styles.bl}`} />
      <span className={`${styles["card-corner"]} ${styles.br}`} />

      <div className={styles["card-img-wrap"]}>
        <ImgWithFallback
          src={config.coverSrc}
          swapSrc={config.coverFallback}
          alt={config.name}
          style={config.coverStyle}
        />
        <div className={styles["card-badge"]}>{config.badge}</div>
      </div>

      <div>
        <span className={styles["card-num"]}>{config.signal}</span>
        <h2 className={styles["card-name"]}>{config.name}</h2>
        <p className={styles["card-desc"]}>{config.desc}</p>
      </div>

      <div className={styles["stat-grid"]}>
        <div className={styles["stat-item"]}>
          <span className={styles["stat-key"]}>SIGNAL ID</span>
          <span className={styles["stat-val"]}>{config.signalId}</span>
        </div>
        <div className={styles["stat-item"]}>
          <span className={styles["stat-key"]}>RELEASE</span>
          <span className={styles["stat-val"]}>{config.release}</span>
        </div>
        <div className={styles["stat-item"]}>
          <span className={styles["stat-key"]}>STATUS</span>
          <span className={`${styles["stat-val"]} ${styles.completed}`}>ACTIVE</span>
        </div>
        <div className={styles["stat-item"]}>
          <span className={styles["stat-key"]}>PIECES</span>
          <span className={styles["stat-val"]}>{products.length}</span>
        </div>
      </div>

      <div className={styles["card-products-section"]}>
        <div className={styles["section-label"]}>// ARCHIVED PRODUCTS [ {products.length} ]</div>
        <div className={styles["archive-products-grid"]}>
          {products.length === 0 ? (
            <div className={styles["empty-note"]}>NO PRODUCTS IN THIS ARCHIVE YET</div>
          ) : (
            products.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className={styles["archived-prod-card"]}>
                <ImgWithFallback
                  src={p.imageUrl || p.image || "/p1.png"}
                  swapSrc="/skull2.png"
                  alt={p.name || "Product"}
                  className={styles["archived-prod-img"]}
                />
                <div className={styles["archived-prod-title"]} title={p.name || ""}>
                  {p.name || "UNNAMED PIECE"}
                </div>
                <div className={styles["archived-prod-price"]}>{formatPriceINR(p.price)}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      <Link
        href={`/collection?subcategory=${encodeURIComponent(config.subcategoryName)}`}
        className={styles["view-archive-btn"]}
      >
        VIEW FULL COLLECTION PRODUCTS →
      </Link>
    </div>
  );
}

export default async function ArchivePage() {
  const cards = await Promise.all(
    COLLECTIONS.map(async (config) => {
      const sub = await findSubcategoryByName(config.subcategoryName);
      const products = sub ? await getArchivedProductsBySubcategoryId(sub.id) : [];
      return { id: config.id, node: <ArchiveCard key={config.id} config={config} products={products} /> };
    })
  );

  return (
    <div className={styles.content}>
      <div className={styles["page-header"]}>
        <div className={styles["page-title"]}>
          SIGNAL ARCHIVE<span style={{ color: "var(--accent)" }}>_</span>
        </div>
        <div className={styles["page-sub"]}>
          <p>Signals that have been transmitted across our collections.</p>
          <p>Civilisations and frequencies that have been left behind.</p>
        </div>
      </div>
      <ArchiveTabs cards={cards} />
    </div>
  );
}
