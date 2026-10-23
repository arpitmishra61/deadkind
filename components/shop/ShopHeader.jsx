"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import { CART_CHANGED_EVENT, cartCount, getCart } from "@/lib/cart";
import styles from "./ShopHeader.module.css";

const NAV_LINKS = [
  { href: "/", label: "SHOP", key: "shop" },
  { href: "/collection", label: "COLLECTIONS", key: "collections" },
  { href: "/about", label: "ABOUT", key: "about" },
  { href: "/contact", label: "CONTACT", key: "contact" },
];

function activeKeyFor(pathname) {
  if (pathname === "/") return "shop";
  const match = NAV_LINKS.find((link) => link.href !== "/" && pathname.startsWith(link.href));
  return match?.key ?? null;
}

export default function ShopHeader() {
  const pathname = usePathname();
  const active = activeKeyFor(pathname);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(cartCount(getCart()));
    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CART_CHANGED_EVENT, sync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles["nav-logo"]}>
          <ImgWithFallback src="/name.png" alt="DeadKind" className={styles["logo-name"]} />
        </Link>

        <ul className={styles["nav-links"]}>
          {NAV_LINKS.map((link) => (
            <li key={link.key}>
              <Link href={link.href} className={active === link.key ? styles.active : undefined}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles["nav-right"]}>
          <div className={styles["nav-status"]}>
            <span className={styles["status-dot"]} />
            SYSTEM ONLINE
          </div>
          <div className={styles["nav-tag"]}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="5" />
              <line x1="6" y1="3" x2="6" y2="6" />
              <line x1="6" y1="6" x2="8.5" y2="6" />
            </svg>
            DK-2050
          </div>
          <Link href="/cart" className={styles["nav-cart"]}>
            CART [ {count} ]
          </Link>
          <button
            type="button"
            className={`${styles.hamburger} ${open ? styles.open : ""}`}
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`${styles["mobile-nav-menu"]} ${open ? styles.open : ""}`}>
        <Link href="/" className={active === "shop" ? styles.active : undefined} onClick={() => setOpen(false)}>
          SHOP
        </Link>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <Link href="/collection" style={{ fontWeight: 700 }} onClick={() => setOpen(false)}>
            COLLECTIONS
          </Link>
          <div className={styles["mobile-nav-sub"]}>
            <Link href="/collection?subcategory=BEYOND%20THE%20SYSTEM" onClick={() => setOpen(false)}>
              <span className={styles.num}>01</span> BEYOND THE SYSTEM
            </Link>
            <Link href="/collection?subcategory=WHAT%20I%20WANT%20TO%20SAY" onClick={() => setOpen(false)}>
              <span className={styles.num}>02</span> WHAT I WANT TO SAY
            </Link>
            <Link href="/collection" style={{ color: "var(--text)", fontWeight: 600 }} onClick={() => setOpen(false)}>
              VIEW ALL COLLECTIONS →
            </Link>
          </div>
        </div>
        <Link href="/about" className={active === "about" ? styles.active : undefined} onClick={() => setOpen(false)}>
          ABOUT
        </Link>
        <Link href="/contact" className={active === "contact" ? styles.active : undefined} onClick={() => setOpen(false)}>
          CONTACT
        </Link>
        <Link href="/cart" className={styles["mobile-nav-cart"]} onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" width="16" height="16">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          CART [ {count} ]
        </Link>
      </div>
    </>
  );
}
