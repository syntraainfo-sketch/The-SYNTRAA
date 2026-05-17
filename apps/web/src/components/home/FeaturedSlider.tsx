"use client";

import { useMemo, useState } from "react";
import type { ProductDTO } from "@syntraa/types";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type UiProduct = {
  slug: string;
  title: string;
  descriptionShort?: string;
  fromUSD?: number;
  imagePublicId?: string;
};

function map(p: ProductDTO): UiProduct {
  const prices = p.variants?.map((v) => v.priceUSD).filter(Boolean) ?? [];
  return {
    slug: p.slug,
    title: p.title,
    descriptionShort: p.descriptionShort,
    fromUSD: prices.length ? Math.min(...prices) : undefined,
    imagePublicId: p.gallery?.[0]?.publicId,
  };
}

export function FeaturedSlider({ products }: { products: ProductDTO[] }) {
  const items = useMemo(() => products.map(map), [products]);
  const [active, setActive] = useState(0);

  return (
    <section className="mx-auto mt-16 max-w-7xl px-5 md:mt-24 md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
            Featured products
          </p>
          <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] text-text md:text-[3.2rem]">
            Best sellers in warm light.
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] text-muted hover:text-text"
        >
          View the full shop <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10">
        <Swiper
          spaceBetween={16}
          slidesPerView={1.08}
          onSlideChange={(s) => setActive(s.activeIndex)}
          breakpoints={{
            640: { slidesPerView: 1.6, spaceBetween: 18 },
            900: { slidesPerView: 2.2, spaceBetween: 20 },
            1200: { slidesPerView: 2.8, spaceBetween: 22 },
          }}
        >
          {items.map((p, idx) => (
            <SwiperSlide key={p.slug}>
              <motion.div
                className={cn(
                  "glass-panel group relative h-full overflow-hidden rounded-lg p-5",
                  idx === active ? "shadow-[0_34px_120px_rgba(0,0,0,0.16)]" : "opacity-90"
                )}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -left-28 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(232,214,200,0.75),transparent_60%)] blur-2xl" />
                </div>
                <div className="relative aspect-4/3 overflow-hidden rounded-[calc(var(--radius-lg)-14px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.45))]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(232,214,200,0.55),transparent_60%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(0,0,0,0.08),transparent_56%)]" />
                </div>

                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted">
                      Skincare
                    </p>
                    <p className="mt-2 font-display text-2xl leading-tight text-text">
                      {p.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {p.descriptionShort ?? "A luminous formula tuned for calm."}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-white/65 text-text transition hover:bg-white"
                    whileTap={{ opacity: 0.88 }}
                    aria-label="Add to cart"
                    onClick={() => {
                      // Hook into existing cart flow later (pages-premium → commerce wiring).
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-text">
                    {typeof p.fromUSD === "number" ? `$${p.fromUSD.toFixed(0)}+` : "—"}
                  </span>
                  <Link
                    href={`/products/${p.slug}`}
                    className="text-[0.65rem] uppercase tracking-[0.3em] text-muted hover:text-text"
                  >
                    View details →
                  </Link>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

