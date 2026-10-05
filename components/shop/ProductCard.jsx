"use client";

import { useState } from "react";
import Link from "next/link";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import { addToCart } from "@/lib/cart";
import { formatPriceINR } from "@/lib/format";
import styles from "./ProductCard.module.css";

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

function getDisplayImage(product) {
  if (product.images?.length) return product.images[0];
  const firstGroup = Object.values(product.colourImages || {}).find((urls) => urls?.length);
  return firstGroup ? firstGroup[0] : null;
}

export default function ProductCard({ product, collectionName, coloursMap = {}, wished = false, onToggleWish }) {
  const [added, setAdded] = useState(false);
  const image = getDisplayImage(product);
  const hasSale = product.comparePrice && product.comparePrice > product.price;
  const swatchHexes = (product.colours || []).slice(0, 5).map((id) => coloursMap[id]?.hex || "#888");

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name || "UNNAMED",
      price: product.price || 0,
      images: image ? [image] : [],
      collection: collectionName || null,
      colour: product.colours?.[0] || null,
      colourName: coloursMap[product.colours?.[0]]?.name || null,
      colourHex: coloursMap[product.colours?.[0]]?.hex || null,
      size: product.sizes?.[0] || null,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 300);
  }

  function handleWish(e) {
    e.preventDefault();
    e.stopPropagation();
    onToggleWish?.(product.id);
  }

  return (
    <Link href={`/product/${product.id}`} className={styles["product-card"]}>
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      <div className={styles["card-image"]}>
        {product.isNew && <span className={styles["card-badge"]}>NEW</span>}
        {hasSale && (
          <span className={`${styles["card-badge"]} ${styles.sale}`} style={{ left: product.isNew ? 52 : 8 }}>
            SALE
          </span>
        )}
        <button type="button" className={`${styles["card-wish"]} ${wished ? styles.active : ""}`} onClick={handleWish}>
          <HeartIcon />
        </button>
        {image ? (
          <ImgWithFallback
            src={image}
            alt={product.name}
            loading="lazy"
            fallback={<div className={styles["card-image-placeholder"]}>{product.name}</div>}
          />
        ) : (
          <div className={styles["card-image-placeholder"]}>{product.name}</div>
        )}
      </div>

      <div className={styles["card-body"]}>
        <div className={styles["card-name"]}>{product.name}</div>
        <div className={styles["card-price"]}>
          {formatPriceINR(product.price)}.00
          {hasSale && <span className={styles["card-compare-price"]}>{formatPriceINR(product.comparePrice)}</span>}
        </div>
        <div className={styles["card-collection"]}>{collectionName || "—"}</div>
        <div className={styles["card-footer"]}>
          <div className={styles["card-swatches"]}>
            {swatchHexes.map((hex, i) => (
              <span key={i} className={styles.swatch} style={{ background: hex }} />
            ))}
          </div>
          <button type="button" className={`${styles["card-add-btn"]} ${added ? styles.added : ""}`} onClick={handleAdd}>
            <CartIcon />
          </button>
        </div>
      </div>
    </Link>
  );
}
