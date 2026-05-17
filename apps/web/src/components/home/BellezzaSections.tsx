import Image from "next/image";
import Link from "next/link";
import { Clock, Heart, Truck } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/types";
import type { CategoryDTO, ProductDTO } from "@syntraa/types";
import { CatalogProductCard } from "@/components/commerce/CatalogProductCard";
import { cld } from "@/lib/cloudinary";

export async function HomeCategoryCircles() {
  let categories: CategoryDTO[] = [];
  try {
    const res = await apiGet<ApiEnvelope<CategoryDTO[]>>("/categories");
    categories = Array.isArray(res.data) ? res.data : [];
  } catch {
    categories = [];
  }
  const slice = categories.slice(0, 4);
  if (!slice.length) return null;

  return (
    <section className="bg-[#F9F6F1] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <p className="text-center font-sans text-[0.68rem] uppercase tracking-[0.38em] text-[#666]">
          Categories
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-12 md:gap-16">
          {slice.map((c) => (
            <Link
              key={c.slug}
              href={`/products?categorySlug=${encodeURIComponent(c.slug)}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative h-36 w-36 overflow-hidden rounded-full border border-black/5 bg-[#ebe3d8] shadow-sm transition group-hover:shadow-md md:h-40 md:w-40">
                {c.heroImagePublicId ? (
                  <Image
                    src={cld(c.heroImagePublicId, 400)}
                    alt={c.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized={cld(c.heroImagePublicId).startsWith("http")}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-sm text-[#666]">
                    {c.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <span className="mt-4 font-display text-base text-[#111]">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function fetchProducts(qs: string): Promise<ProductDTO[]> {
  try {
    const res = await apiGet<ApiEnvelope<ProductDTO[]>>(`/products?${qs}`, {
      next: { revalidate: 60 },
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function HomeBestSellers() {
  const products = await fetchProducts("featured=true&limit=4");
  if (!products.length) return null;

  let categories: CategoryDTO[] = [];
  try {
    const res = await apiGet<ApiEnvelope<CategoryDTO[]>>("/categories", {
      next: { revalidate: 120 },
    });
    categories = Array.isArray(res.data) ? res.data : [];
  } catch {
    categories = [];
  }
  const catMap = new Map(categories.map((c) => [c.id ?? c._id ?? "", c.name]));

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
      <h2 className="text-center font-display text-3xl tracking-tight text-[#111] md:text-4xl">
        Best sellers
      </h2>
      <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => {
          const prices = p.variants?.map((v) => v.priceUSD).filter(Boolean) ?? [];
          const from = prices.length ? Math.min(...prices) : undefined;
          const cid = p.categories?.[0];
          return (
            <CatalogProductCard
              key={p.slug}
              slug={p.slug}
              title={p.title}
              imagePublicId={p.gallery?.[0]?.publicId}
              fromUSD={from}
              categoryLabel={cid ? catMap.get(cid) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}

export function HomeBenefits() {
  const items = [
    {
      icon: Truck,
      title: "Free delivery",
      text: "Complimentary shipping on qualifying orders so your ritual arrives safely.",
    },
    {
      icon: Clock,
      title: "24/7 support",
      text: "Concierge care for product questions, exchanges, and order updates.",
    },
    {
      icon: Heart,
      title: "Satisfaction",
      text: "Formulas curated for comfort — transparent ingredients and honest guidance.",
    },
  ];
  return (
    <section className="border-y border-black/5 bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <h2 className="text-center font-display text-3xl text-[#111] md:text-4xl">Our key benefits</h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {items.map((b) => (
            <div key={b.title} className="text-center">
              <b.icon className="mx-auto h-10 w-10 text-[#2d2d2d]" strokeWidth={1.25} />
              <h3 className="mt-5 font-display text-xl text-[#111]">{b.title}</h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-[#555]">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePromoSplit() {
  return (
    <section className="bg-[#F9F6F1] py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-0 overflow-hidden rounded-4xl border border-black/5 bg-white shadow-sm md:grid-cols-2">
        <div className="relative min-h-[280px] bg-[linear-gradient(145deg,#dfe6d8,#c9d4c0)] md:min-h-[360px]" />
        <div className="flex flex-col justify-center px-8 py-12 md:px-14 md:py-16">
          <h2 className="font-display text-2xl leading-snug text-[#111] md:text-[2.1rem]">
            Make you look and feel glowy and healthy
          </h2>
          <Link
            href="/products"
            className="mt-8 inline-flex w-max rounded-full bg-[#2d2d2d] px-8 py-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-white"
          >
            Shop now
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function HomeEverydayBeauty() {
  const products = await fetchProducts("limit=4");
  if (!products.length) return null;

  let categories: CategoryDTO[] = [];
  try {
    const res = await apiGet<ApiEnvelope<CategoryDTO[]>>("/categories", {
      next: { revalidate: 120 },
    });
    categories = Array.isArray(res.data) ? res.data : [];
  } catch {
    categories = [];
  }
  const catMap = new Map(categories.map((c) => [c.id ?? c._id ?? "", c.name]));

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <h2 className="font-display text-3xl text-[#111] md:text-4xl">Every day beauty</h2>
        <Link
          href="/products"
          className="rounded-full border border-black/15 px-6 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-[#222]"
        >
          Shop now
        </Link>
      </div>
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => {
          const prices = p.variants?.map((v) => v.priceUSD).filter(Boolean) ?? [];
          const from = prices.length ? Math.min(...prices) : undefined;
          const cid = p.categories?.[0];
          return (
            <CatalogProductCard
              key={p.slug}
              slug={p.slug}
              title={p.title}
              imagePublicId={p.gallery?.[0]?.publicId}
              fromUSD={from}
              categoryLabel={cid ? catMap.get(cid) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}

export function HomeArticlesTeaser() {
  const stubs = [
    { title: "The quiet ritual of evening skincare", date: "May 2026" },
    { title: "Why texture matters in daily SPF", date: "April 2026" },
    { title: "Building a capsule shelf", date: "March 2026" },
    { title: "Notes on humectants and barrier care", date: "March 2026" },
  ];
  return (
    <section className="bg-[#F9F6F1] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="font-display text-3xl text-[#111] md:text-4xl">Recent articles</h2>
          <Link
            href="/articles"
            className="rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.16em]"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stubs.map((a) => (
            <Link
              key={a.title}
              href="/articles"
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-4/3 bg-[#e8e0d6] transition group-hover:opacity-95" />
              <div className="p-5">
                <p className="font-sans text-[0.72rem] uppercase tracking-[0.12em] text-[#888]">
                  {a.date}
                </p>
                <p className="mt-2 font-display text-lg leading-snug text-[#111]">{a.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeInstaStrip() {
  return (
    <section className="border-t border-black/5 bg-white py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-10">
        <p className="font-display text-lg tracking-[0.2em] text-[#111]">Syntraa</p>
        <p className="max-w-md text-center font-sans text-sm text-[#666] md:text-left">
          Join the list for launches and ritual notes.
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-3 gap-2 px-5 md:gap-3 md:px-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-[#ede6de]" />
        ))}
      </div>
    </section>
  );
}
