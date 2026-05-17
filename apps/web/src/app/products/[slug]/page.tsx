import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/types";
import type { CategoryDTO, ProductDTO } from "@syntraa/types";
import { AddToCart } from "@/features/cart/AddToCart";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/env";
import { publicCloudinaryCloudName } from "@/lib/cloudinary";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { CatalogProductCard } from "@/components/commerce/CatalogProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check } from "lucide-react";

async function fetchProduct(slug: string) {
  return apiGet<ApiEnvelope<ProductDTO>>(`/products/${slug}`);
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetchProduct(slug);
    const seo = res.data.seo ?? {};
    const title = seo.title ?? res.data.title;
    const description =
      seo.description ?? res.data.descriptionShort ?? "Exclusive edition from THE SYNTRAA.";
    const cloud = publicCloudinaryCloudName();
    const ogImage =
      seo.ogImagePublicId && cloud
        ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/${seo.ogImagePublicId}`
        : undefined;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/products/${slug}`,
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      alternates: {
        canonical: `/products/${slug}`,
      },
    };
  } catch {
    return { title: slug };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let dto: ProductDTO;
  try {
    const res = await fetchProduct(slug);
    dto = res.data;
  } catch {
    notFound();
  }

  const price = dto.variants?.[0]?.priceUSD ?? 0;
  const sku = dto.variants?.[0]?.sku ?? dto.slug;

  let categories: CategoryDTO[] = [];
  let similar: ProductDTO[] = [];
  try {
    const [cRes, pRes] = await Promise.all([
      apiGet<ApiEnvelope<CategoryDTO[]>>("/categories"),
      apiGet<ApiEnvelope<ProductDTO[]>>("/products?limit=16"),
    ]);
    categories = Array.isArray(cRes.data) ? cRes.data : [];
    const all = Array.isArray(pRes.data) ? pRes.data : [];
    similar = all.filter((p) => p.slug !== dto.slug).slice(0, 3);
  } catch {
    categories = [];
    similar = [];
  }

  const catMap = new Map(categories.map((c) => [c.id ?? c._id ?? "", c.name]));
  const firstCatId = dto.categories?.[0];
  const categoryName = firstCatId ? catMap.get(firstCatId) : undefined;
  const highlights = dto.highlights?.filter(Boolean) ?? [];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Shop", path: "/products" },
          { name: dto.title, path: `/products/${dto.slug}` },
        ]}
      />
      <ProductJsonLd
        name={dto.title}
        slug={dto.slug}
        description={dto.descriptionShort}
        sku={sku}
        priceUsd={price}
        imagePublicIds={dto.gallery?.map((g) => g.publicId)}
        cloudName={publicCloudinaryCloudName() || undefined}
      />
      <main className="min-h-screen bg-white pb-24 pt-8 md:pt-12">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <nav className="font-sans text-[0.8rem] text-[#666]">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-black">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#111]">{dto.title}</span>
          </nav>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <ProductGallery title={dto.title} gallery={dto.gallery ?? []} />

            <div className="flex flex-col gap-8">
              {categoryName ? (
                <p className="font-sans text-sm uppercase tracking-[0.12em] text-[#666]">
                  {categoryName}
                </p>
              ) : null}
              <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight text-[#111] md:text-[2.85rem]">
                {dto.title}
              </h1>
              {dto.reviewsCount != null &&
              dto.reviewsCount > 0 &&
              dto.aggregateRating != null &&
              dto.aggregateRating > 0 ? (
                <p className="font-sans text-sm text-[#444]">
                  <span className="text-amber-600">★</span> {dto.aggregateRating.toFixed(1)} (
                  {dto.reviewsCount} reviews)
                </p>
              ) : null}
              {highlights.length > 0 ? (
                <ul className="grid gap-3 font-sans text-[0.95rem] text-[#333]">
                  {highlights.map((line) => (
                    <li key={line} className="flex gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#2d2d2d]" strokeWidth={2} />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <AddToCart
                title={dto.title}
                slug={dto.slug}
                variants={dto.variants ?? []}
                productMongoId={dto.id ?? dto._id ?? ""}
              />

              <Accordion type="single" collapsible className="w-full border-t border-black/10 pt-2">
                <AccordionItem value="desc">
                  <AccordionTrigger>Description</AccordionTrigger>
                  <AccordionContent>
                    {dto.richDescription ? (
                      <div
                        className="prose prose-sm max-w-none font-sans text-[#444] prose-p:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: dto.richDescription }}
                      />
                    ) : dto.descriptionShort ? (
                      <p className="font-sans text-[#444]">{dto.descriptionShort}</p>
                    ) : (
                      <p className="font-sans text-muted">No description yet.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="ingredients">
                  <AccordionTrigger>Ingredients</AccordionTrigger>
                  <AccordionContent>
                    {dto.ingredients ? (
                      <p className="whitespace-pre-line font-sans text-[#555]">{dto.ingredients}</p>
                    ) : (
                      <p className="font-sans text-muted">No ingredients listed yet.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="how">
                  <AccordionTrigger>How to Use</AccordionTrigger>
                  <AccordionContent>
                    {dto.howToUse ? (
                      <p className="whitespace-pre-line font-sans text-[#555]">{dto.howToUse}</p>
                    ) : (
                      <p className="font-sans text-muted">Usage instructions coming soon.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="benefits">
                  <AccordionTrigger>Benefits</AccordionTrigger>
                  <AccordionContent>
                    {dto.benefits ? (
                      <p className="whitespace-pre-line font-sans text-[#555]">{dto.benefits}</p>
                    ) : highlights.length > 0 ? (
                      <p className="font-sans text-[#555]">See highlights above for key benefits.</p>
                    ) : (
                      <p className="font-sans text-muted">No benefits listed yet.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sustainability">
                  <AccordionTrigger>Sustainability and ethics</AccordionTrigger>
                  <AccordionContent>
                    {dto.sustainability ? (
                      <p className="whitespace-pre-line font-sans text-[#555]">{dto.sustainability}</p>
                    ) : (
                      <p className="font-sans text-muted">Sustainability details coming soon.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {similar.length > 0 ? (
            <section className="mt-24 border-t border-black/10 pt-16">
              <h2 className="font-display text-2xl tracking-tight text-[#111] md:text-3xl">
                Similar products
              </h2>
              <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((p) => {
                  const prices = p.variants?.map((v) => v.priceUSD).filter(Boolean) ?? [];
                  const from = prices.length ? Math.min(...prices) : undefined;
                  const catId = p.categories?.[0];
                  const catLabel = catId ? catMap.get(catId) : undefined;
                  return (
                    <CatalogProductCard
                      key={p.slug}
                      slug={p.slug}
                      title={p.title}
                      imagePublicId={p.gallery?.[0]?.publicId}
                      fromUSD={from}
                      categoryLabel={catLabel}
                      variantSizes={p.variants?.map((v) => v.size || v.label || "")}
                    />
                  );
                })}
              </div>
              <div className="mt-10 flex justify-center">
                <Link
                  href="/products"
                  className="rounded-full bg-[#2d2d2d] px-8 py-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-white transition hover:bg-black"
                >
                  Show more →
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
