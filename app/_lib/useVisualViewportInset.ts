"use client";

import { useEffect, useState } from "react";

/**
 * Approximates keyboard overlap above the visual viewport (mobile Safari / Chrome).
 * Use to lift fixed bottom sheets so the composer stays visible while typing.
 */
export function useVisualViewportInset(): number {
  const [insetPx, setInsetPx] = useState(0);

  useEffect(() => {
    function compute(): number {
      if (typeof window === "undefined") return 0;
      const vv = window.visualViewport;
      if (!vv) return 0;
      const overlap = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop,
      );
      return Math.round(overlap);
    }

    function update() {
      setInsetPx(compute());
    }

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
    }
    window.addEventListener("resize", update);
    update();

    return () => {
      if (vv) {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, []);

  return insetPx;
}
