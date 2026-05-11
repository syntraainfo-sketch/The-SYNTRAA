"use client";

import { motion } from "framer-motion";

const reels = [
  { title: "Morning mist", note: "Rosewater micro-mist · 7s" },
  { title: "Barrier veil", note: "Ceramide comfort · 9s" },
  { title: "Nude glow", note: "Peptide serum · 11s" },
];

export function ReelsSection() {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-5 md:mt-36 md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
            Reels
          </p>
          <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] text-text md:text-[3.1rem]">
            Vertical moments, cinematic pacing.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-muted">
          Hover for motion cues — video slots are ready to swap in real assets.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {reels.map((r, idx) => (
          <motion.div
            key={r.title}
            className="glass-panel group relative overflow-hidden rounded-lg p-5"
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          >
            <div className="relative aspect-9/16 overflow-hidden rounded-[calc(var(--radius-lg)-12px)] bg-[radial-gradient(circle_at_30%_15%,rgba(232,214,200,0.7),transparent_58%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.12),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.48))]">
              <motion.div
                className="absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                initial={false}
              >
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.0),rgba(11,11,15,0.08),rgba(232,214,200,0.35),rgba(255,255,255,0.0))] blur-2xl"
                  animate={{ rotate: [0, 12, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-hairline bg-white/70 px-4 py-3 backdrop-blur-xl">
                <p className="font-display text-xl leading-tight text-text">{r.title}</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
                  {r.note}
                </p>
              </div>
            </div>

            <p className="mt-5 text-[0.62rem] uppercase tracking-[0.34em] text-muted">
              Reel {idx + 1}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

