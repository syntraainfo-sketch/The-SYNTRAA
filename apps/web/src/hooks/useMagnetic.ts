"use client";

import { useEffect, useRef } from "react";

export function useMagnetic(strength = 0.28) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.animate(
        [{ transform: `translate(${px * r.width * strength}px, ${py * r.height * strength}px)` }],
        { duration: 220, fill: "forwards", easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    };
    const onLeave = () => {
      el.animate([{ transform: "translate(0px, 0px)" }], {
        duration: 420,
        fill: "forwards",
        easing: "cubic-bezier(.2,.8,.2,1)",
      });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return ref;
}

