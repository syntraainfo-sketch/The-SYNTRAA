"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cld } from "@/lib/cloudinary";

export interface UiProductCard {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  imagePublicId?: string;
  fromUSD?: number;
  variantSizes?: string[];
}

export function ProductCard({ product }: { product: UiProductCard }) {
  const src = product.imagePublicId ? cld(product.imagePublicId, 900) : "/next.svg";
  const sizes = [...new Set((product.variantSizes ?? []).filter(Boolean))];

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      data-cursor="card"
      className="group flex flex-col overflow-hidden rounded-[1.65rem] border border-hairline/60 bg-surface/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur"
    >
      <Link
        href={`/products/${product.slug}`}
        data-cursor="link"
        className="relative block aspect-4/5 bg-black/40"
      >
        <Image
          src={src}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-95 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
          unoptimized={src.startsWith("http")}
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-void via-transparent to-transparent opacity-85" />
        <span className="absolute bottom-5 left-5 text-[0.6rem] uppercase tracking-[0.32em] text-white/85">
          View details
        </span>
      </Link>
      <div className="flex flex-col gap-2 px-5 py-6">
        <h3 className="font-display text-lg tracking-[0.04em] text-text">
          {product.title}
        </h3>
        {product.excerpt && (
          <p className="line-clamp-2 text-sm text-muted">{product.excerpt}</p>
        )}
        {typeof product.fromUSD === "number" && (
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            From <span className="text-text">{`$${product.fromUSD}`}</span> USD
          </p>
        )}
        {sizes.length > 0 ? (
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted">
            {sizes.join(" / ")}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}
