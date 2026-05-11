"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const tiles = [
  {
    title: "Nude glow",
    desc: "Soft-focus radiance with matte restraint.",
    href: "/products?collection=nude",
    size: "lg",
  },
  {
    title: "Barrier calm",
    desc: "Ceramide comfort for city air.",
    href: "/products?collection=barrier",
    size: "md",
  },
  {
    title: "Night ritual",
    desc: "Slow hydration, cinematic finish.",
    href: "/products?collection=night",
    size: "md",
  },
  {
    title: "Travel edit",
    desc: "Minimal kit, maximal glow.",
    href: "/products?collection=travel",
    size: "sm",
  },
  {
    title: "Gift sets",
    desc: "Curated routines, premium packing.",
    href: "/products?collection=sets",
    size: "sm",
  },
];

export function CollectionsGrid() {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-5 md:mt-36 md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
            Collections
          </p>
          <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] text-text md:text-[3.1rem]">
            Bento edits with depth.
          </h2>
        </div>
        <Link
          href="/products"
          className="text-[0.7rem] uppercase tracking-[0.28em] text-muted hover:text-text"
        >
          Browse all →
        </Link>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-12">
        {tiles.map((t) => (
          <motion.div
            key={t.title}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className={[
              "glass-panel group relative overflow-hidden rounded-lg p-6",
              t.size === "lg" ? "md:col-span-7 md:row-span-2" : "",
              t.size === "md" ? "md:col-span-5" : "",
              t.size === "sm" ? "md:col-span-6" : "",
            ].join(" ")}
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(232,214,200,0.75),transparent_60%)] blur-2xl" />
            </div>
            <div className="relative">
              <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted">
                Collection
              </p>
              <p className="mt-3 font-display text-2xl text-text md:text-3xl">
                {t.title}
              </p>
              <p className="mt-3 max-w-104 text-sm text-muted">{t.desc}</p>
              <Link
                href={t.href}
                className="mt-6 inline-flex text-[0.65rem] uppercase tracking-[0.3em] text-text hover:underline"
              >
                Enter →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

