"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRevealOnScroll } from "@/animations/reveal";

export function StorySection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  useRevealOnScroll(el, { preset: "mask-up", start: "top 82%" });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 24 });
  const sy = useSpring(my, { stiffness: 120, damping: 24 });

  return (
    <section className="mx-auto mt-28 max-w-7xl px-5 md:mt-36 md:px-10">
      <div
        ref={(n) => {
          ref.current = n;
          setEl(n);
        }}
        className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-16"
      >
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
            House story
          </p>
          <h2 className="mt-5 font-display text-3xl tracking-[-0.01em] text-text md:text-[3.1rem]">
            Editorial ritual, engineered calm.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
            We design skincare the way a director grades film: warm whites, nude
            highlights, matte blacks — everything softened into a quiet glow.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-muted">
            {[
              ["Texture", "Soft focus finishes. No harsh edges."],
              ["Pacing", "Scroll feels like breath: slow, deliberate, precise."],
              ["Detail", "Microinteractions tuned like a premium product click."],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-start justify-between gap-5 rounded-2xl border border-hairline bg-white/55 px-5 py-4"
              >
                <span className="font-display text-lg text-text">{k}</span>
                <span className="max-w-88 text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          className="glass-panel relative overflow-hidden rounded-lg p-5 md:p-6"
          onPointerMove={(e) => {
            const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            mx.set(((e.clientX - r.left) / r.width - 0.5) * 14);
            my.set(((e.clientY - r.top) / r.height - 0.5) * 14);
          }}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
          style={{ x: sx, y: sy }}
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-[calc(var(--radius-lg)-10px)] bg-[radial-gradient(circle_at_30%_15%,rgba(232,214,200,0.75),transparent_58%),radial-gradient(circle_at_70%_85%,rgba(0,0,0,0.10),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.52))]">
            <motion.div
              className="absolute left-1/2 top-[44%] h-[min(55vw,420px)] w-[min(55vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.62),rgba(232,214,200,0.55)_40%,rgba(0,0,0,0.06)_100%)] shadow-[0_0_110px_rgba(232,214,200,0.6)]"
              animate={{ rotate: [0, 3, 0], y: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

