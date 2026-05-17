"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMagnetic } from "@/hooks/useMagnetic";

export function HomeHero() {
  const primaryRef = useMagnetic(0.18);
  const secondaryRef = useMagnetic(0.12);

  return (
    <section className="relative overflow-hidden pb-18 pt-6 md:pb-24 md:pt-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(232,214,200,0.65),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_15%,rgba(0,0,0,0.10),transparent_58%)]" />

      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14 md:px-10">
        <div className="relative z-10">
          <motion.p
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/55 px-4 py-2 text-[0.65rem] uppercase tracking-[0.34em] text-muted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Sparkles className="h-4 w-4 text-text" />
            Natural beauty
          </motion.p>

          <motion.h1
            className="mt-6 font-display text-[2.9rem] leading-[0.98] tracking-[-0.02em] text-text md:text-[4.2rem]"
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
          >
            Where natural beauty begins
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
          >
            Clean formulas, soft light, and daily rituals designed for skin that feels as good as
            it looks.
          </motion.p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <motion.div whileTap={{ opacity: 0.9 }}>
              <Link
                href="/products"
                ref={primaryRef as unknown as React.Ref<HTMLAnchorElement>}
                className="group inline-flex items-center gap-3 rounded-full border border-hairline-2 bg-[#2d2d2d] px-7 py-3.5 text-[0.72rem] uppercase tracking-[0.22em] text-white shadow-sm transition hover:bg-black"
              >
                Shop now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <div className="font-sans text-sm text-muted">
              <p className="text-2xl font-semibold tracking-tight text-text">100K+</p>
              <p className="text-[0.72rem] uppercase tracking-[0.14em]">Happy customers</p>
            </div>
            <motion.div whileTap={{ opacity: 0.9 }}>
              <Link
                href="/about"
                ref={secondaryRef as unknown as React.Ref<HTMLAnchorElement>}
                className="inline-flex items-center gap-3 rounded-full border border-hairline bg-white/60 px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-text transition hover:bg-white/85"
              >
                About us
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="glass-panel relative rounded-lg p-5 md:p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-[calc(var(--radius-lg)-10px)] bg-[radial-gradient(circle_at_40%_20%,rgba(232,214,200,0.85),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(0,0,0,0.12),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.55))]">
            <motion.div
              className="absolute left-1/2 top-1/2 h-[min(52vw,360px)] w-[min(52vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.65),rgba(232,214,200,0.58)_40%,rgba(0,0,0,0.08)_100%)] shadow-[0_0_100px_rgba(232,214,200,0.55)]"
              animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-6 left-6 right-6 rounded-[22px] border border-hairline bg-white/70 p-4 backdrop-blur-xl"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted">
                Limited ritual
              </p>
              <p className="mt-2 font-display text-xl leading-tight text-text">
                Nude glow serum
              </p>
              <p className="mt-1 text-sm text-muted">
                Weightless luminosity with a matte-black finish.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

