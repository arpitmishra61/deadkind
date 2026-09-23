"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ImgWithFallback from "@/components/common/ImgWithFallback";
import { CART_CHANGED_EVENT, cartCount, getCart } from "@/lib/cart";
import styles from "./StaticHeader.module.css";

const NAV_LINKS = [
  { href: "/", label: "SHOP", key: "shop" },
  { href: "/collection", label: "COLLECTIONS", key: "collections" },
  { href: "/archive", label: "ARCHIVE", key: "archive" },
  { href: "/about", label: "ABOUT", key: "about" },
  { href: "/contact", label: "CONTACT", key: "contact" },
];

function activeKeyFor(pathname) {
  if (pathname === "/") return "shop";
  const match = NAV_LINKS.find((link) => link.href !== "/" && pathname.startsWith(link.href));
  return match?.key ?? null;
}

const CartIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export default function StaticHeader() {
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
        <div className={styles["nav-left"]}>
          <Link href="/" className={styles["nav-logo"]}>
            <ImgWithFallback src="/skull3.png" alt="Skull" className={styles["logo-skull"]} />
            <ImgWithFallback src="/name.png" alt="DeadKind" className={styles["logo-name"]} />
          </Link>
          <div className={styles["nav-status-row"]}>
            <span className={styles["status-dot"]} />
            SYSTEM ONLINE
            <span style={{ color: "var(--text-muted)", margin: "0 5px" }}>•</span>
            <span style={{ color: "var(--text-muted)" }}>DK-2050</span>
          </div>
        </div>

        <ul className={styles["nav-right-links"]}>
          {NAV_LINKS.map((link) => (
            <li key={link.key}>
              <Link href={link.href} className={active === link.key ? styles.active : undefined}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/cart" className={styles["nav-cart"]}>
              CART [ {count} ]
              <CartIcon />
            </Link>
          </li>
        </ul>

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
      </nav>

      <div className={`${styles["mobile-menu"]} ${open ? styles.open : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={active === link.key ? styles.active : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/cart" className={styles["mobile-menu-cart"]} onClick={() => setOpen(false)}>
          <CartIcon />
          CART [ {count} ]
        </Link>
      </div>
    </>
  );
}
