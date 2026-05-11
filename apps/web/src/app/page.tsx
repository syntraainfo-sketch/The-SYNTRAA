import { Suspense } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/types";
import type { ProductDTO } from "@syntraa/types";
import { ProductCard, type UiProductCard } from "@/components/commerce/ProductCard";
import { ScrollReveal } from "@/motion/ScrollReveal";
import { HomeHero } from "@/components/home/Hero";
import { FeaturedSlider } from "@/components/home/FeaturedSlider";
import { StorySection } from "@/components/home/StorySection";
import { IngredientsShowcase } from "@/components/home/Ingredients";
import { CollectionsGrid } from "@/components/home/Collections";
import { ReelsSection } from "@/components/home/Reels";
import { TestimonialsMarquee } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/Newsletter";

function mapProduct(p: ProductDTO): UiProductCard {
  const from = Math.min(...(p.variants?.map((v) => v.priceUSD) ?? [0]));
  return {
    id: p.slug,
    slug: p.slug,
    title: p.title,
    excerpt: p.descriptionShort,
    imagePublicId: p.gallery?.[0]?.publicId,
    fromUSD: Number.isFinite(from) ? from : undefined,
  };
}

async function FeaturedGrid() {
  let products: ProductDTO[] = [];
  try {
    const res = await apiGet<ApiEnvelope<ProductDTO[]>>("/products?featured=true&limit=9", {
      next: { revalidate: 60 },
    });
    products = Array.isArray(res.data) ? res.data : [];
  } catch {
    products = [];
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.slug} product={mapProduct(p)} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="pb-24">
      <HomeHero />

      <ScrollReveal className="mx-auto mt-24 max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted">
              Featured strata
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-[2.65rem]">
              Pieces in cinematic light.
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[0.7rem] uppercase tracking-[0.28em] text-muted hover:text-text"
          >
            View catalogue →
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-8 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[460px] animate-pulse rounded-[1.7rem] bg-surface/50"
                />
              ))}
            </div>
          }
        >
          <FeaturedGrid />
        </Suspense>
      </ScrollReveal>

      <Suspense
        fallback={<div className="mx-auto mt-20 max-w-7xl px-5 md:px-10" />}
      >
        <FeaturedRail />
      </Suspense>

      <ScrollReveal className="mx-auto mt-32 grid max-w-7xl gap-10 px-5 md:grid-cols-[1.05fr_minmax(0,0.95fr)] md:gap-24 md:px-10">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.4em] text-muted">
            Atelier code
          </p>
          <h2 className="mt-6 font-display text-[2rem] md:text-[2.4rem] leading-tight">
            Performance tuned for luminous scroll & tactile discovery.
          </h2>
        </div>
        <div className="glass-panel rounded-4xl px-10 py-10 text-sm leading-relaxed text-muted">
          <ul className="space-y-4">
            <li>• Precision motion orchestration · GSAP ScrollTrigger choreography</li>
            <li>• Lenis smooth momentum · reduced-motion escapes</li>
            <li>• Editorial layout system · premium whitespace discipline</li>
            <li>• Global CDN imagery via Cloudinary · auto format & responsive widths</li>
          </ul>
          <Link
            href="/about"
            className="mt-10 inline-flex text-[0.7rem] uppercase tracking-[0.28em] text-text hover:underline"
          >
            Manifesto
          </Link>
        </div>
      </ScrollReveal>

      <StorySection />
      <IngredientsShowcase />
      <CollectionsGrid />
      <ReelsSection />
      <TestimonialsMarquee />
      <NewsletterSection />
    </main>
  );
}

async function FeaturedRail() {
  let products: ProductDTO[] = [];
  try {
    const res = await apiGet<ApiEnvelope<ProductDTO[]>>(
      "/products?featured=true&limit=8",
      { cache: "no-store" }
    );
    products = Array.isArray(res.data) ? res.data : [];
  } catch {
    products = [];
  }
  return <FeaturedSlider products={products} />;
}
