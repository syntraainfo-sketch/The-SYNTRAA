"use client";

import { useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useLayoutEffect, useRef } from "react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 240, damping: 40 });
  const barRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const v = smooth.get();
    el.style.width = `${Math.max(0, Math.min(1, v)) * 100}%`;
  }, [smooth]);

  useMotionValueEvent(smooth, "change", (latest) => {
    const el = barRef.current;
    if (!el) return;
    const pct = Math.max(0, Math.min(1, latest)) * 100;
    el.style.width = `${pct}%`;
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 top-0 z-55 h-[2px]"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-[linear-gradient(90deg,rgba(11,11,15,0),rgba(11,11,15,0.6),rgba(11,11,15,0))]"
        style={{ width: "0%", transformOrigin: "0% 50%" }}
      />
    </div>
  );
}
