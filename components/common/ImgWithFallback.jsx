"use client";

import { useEffect, useState } from "react";

// Replaces every onerror="this.style.display='none'" / onerror="this.src='...'"
// pattern from the original site with one small component:
//   - omit swapSrc/fallback -> hides on error (nav logo pattern)
//   - pass swapSrc         -> swaps to another image once, then hides if that fails too
//   - pass fallback        -> renders that node instead of the <img> on error (SVG placeholder pattern)
export default function ImgWithFallback({ src, swapSrc, fallback = null, alt = "", className, style, ...rest }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [triedSwap, setTriedSwap] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
    setTriedSwap(false);
  }, [src]);

  if (failed) return fallback;

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (swapSrc && !triedSwap) {
          setTriedSwap(true);
          setCurrentSrc(swapSrc);
        } else {
          setFailed(true);
        }
      }}
      {...rest}
    />
  );
}
