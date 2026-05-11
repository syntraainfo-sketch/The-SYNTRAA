"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ingredients = [
  {
    name: "Ceramide veil",
    note: "Barrier comfort, soft-focus finish.",
    detail:
      "A restorative layer that reduces the look of dryness and keeps texture calm under city air.",
  },
  {
    name: "Nude peptides",
    note: "Firming feel, weightless glow.",
    detail:
      "A modern peptide blend designed to support smoother-looking skin without heavy shine.",
  },
  {
    name: "Rosewater micro-mist",
    note: "Hydration without residue.",
    detail:
      "A delicate mist layer that refreshes immediately and disappears like film grain.",
  },
  {
    name: "Niacinamide tone",
    note: "Evenness, clarity, restraint.",
    detail:
      "Supports a more uniform appearance while staying gentle on daily routines.",
  },
];

export function IngredientsShowcase() {
  const [open, setOpen] = useState(ingredients[0].name);
  const active = useMemo(
    () => ingredients.find((i) => i.name === open) ?? ingredients[0],
    [open]
  );

  return (
    <section className="mx-auto mt-28 max-w-7xl px-5 md:mt-36 md:px-10">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
            Ingredients
          </p>
          <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] text-text md:text-[3.1rem]">
            Active calm, curated glow.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Interactive formula notes — hover and expand like editorial footnotes.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-3">
          {ingredients.map((i) => {
            const isOpen = i.name === open;
            return (
              <button
                key={i.name}
                type="button"
                onClick={() => setOpen(i.name)}
                className="text-left"
              >
                <div className="glass-panel group relative overflow-hidden rounded-3xl px-5 py-5">
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute -left-24 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(232,214,200,0.7),transparent_60%)] blur-2xl" />
                  </div>
                  <div className="relative flex items-start justify-between gap-6">
                    <div>
                      <p className="font-display text-xl text-text">{i.name}</p>
                      <p className="mt-2 text-sm text-muted">{i.note}</p>
                    </div>
                    <span className="mt-1 text-[0.65rem] uppercase tracking-[0.28em] text-muted">
                      {isOpen ? "Open" : "Expand"}
                    </span>
                  </div>
                  <AnimatePresence>
                    {isOpen ? (
                      <motion.p
                        className="relative mt-4 text-sm leading-relaxed text-muted"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                      >
                        {i.detail}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>

        <div className="glass-panel relative overflow-hidden rounded-lg p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(232,214,200,0.7),transparent_60%)]" />
          <div className="relative">
            <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
              Focus
            </p>
            <h3 className="mt-4 font-display text-3xl leading-tight text-text">
              {active.name}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
              {active.detail}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Clean formula", "Sensitive-safe", "No harsh fragrance", "Layer-friendly"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-hairline bg-white/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.28em] text-muted"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

