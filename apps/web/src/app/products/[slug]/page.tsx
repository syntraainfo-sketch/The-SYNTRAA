import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/types";
import type { ProductDTO } from "@syntraa/types";
import { AddToCart } from "@/features/cart/AddToCart";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/env";
import { cld } from "@/lib/cloudinary";

async function fetchProduct(slug: string) {
  return apiGet<ApiEnvelope<ProductDTO>>(`/products/${slug}`, {
    next: { revalidate: 60, tags: [`product:${slug}`] },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetchProduct(slug);
    const seo = res.data.seo ?? {};
    const title =
      seo.title ?? res.data.title;
    const description =
      seo.description ?? res.data.descriptionShort ?? "Exclusive edition from THE SYNTRAA.";
    const ogImage =
      seo.ogImagePublicId && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${seo.ogImagePublicId}`
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

  const hero = dto.gallery?.[0];
  const price = dto.variants?.[0]?.priceUSD ?? 0;
  const sku = dto.variants?.[0]?.sku ?? dto.slug;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Products", path: "/products" },
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
        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || undefined}
      />
      <main className="mx-auto grid max-w-7xl gap-16 px-5 pb-24 pt-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.9fr)] md:gap-24 md:px-10">
        <div className="space-y-6">
          <div className="relative aspect-4/5 overflow-hidden rounded-[2.4rem] border border-hairline bg-black/35">
            {hero?.publicId && (
              <Image
                src={cld(hero.publicId, 1600)}
                alt={hero.alt ?? dto.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 55vw"
                unoptimized={cld(hero.publicId, 1600).startsWith("http")}
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(255,255,255,0.25),transparent_62%)]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {dto.gallery?.slice(1, 5).map((g) => (
              <div key={g.publicId} className="relative aspect-square overflow-hidden rounded-2xl border border-hairline">
                <Image
                  src={cld(g.publicId, 800)}
                  alt={g.alt ?? dto.title}
                  fill
                  className="object-cover"
                  unoptimized={cld(g.publicId).startsWith("http")}
                  sizes="(max-width:1024px) 33vw, 18vw"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-10 pb-24">
          <header className="space-y-4">
            <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
              Edition · {dto.slug}
            </p>
            <h1 className="font-display text-4xl leading-tight md:text-[2.8rem]">
              {dto.title}
            </h1>
            {dto.descriptionShort && (
              <p className="max-w-xl text-muted">{dto.descriptionShort}</p>
            )}
          </header>
          {dto.richDescription && (
            <article className="prose prose-invert prose-sm max-w-none text-muted">
              <div dangerouslySetInnerHTML={{ __html: dto.richDescription }} />
            </article>
          )}
          <section className="glass-panel rounded-3xl p-8">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-muted">
              Configure
            </p>
            <AddToCart
              title={dto.title}
              slug={dto.slug}
              variants={dto.variants ?? []}
              productMongoId={dto.id ?? dto._id ?? ""}
            />
          </section>
          <details className="group rounded-2xl border border-hairline/70 bg-black/35 p-6 text-sm text-muted transition open:bg-surface/40">
            <summary className="cursor-pointer list-none font-display text-base text-text [&::-webkit-details-marker]:hidden">
              Care · Authenticity · Provenance →
            </summary>
            <p className="mt-6 leading-relaxed">
              Each SYNTRAA object is stewarded through controlled inventory rails,
              signature packaging, and encrypted commerce lanes (Stripe &
              Pakistani wallet rails optional at checkout).
            </p>
            <code className="mt-6 block rounded-xl bg-black/60 p-4 text-[0.7rem] text-muted">
              Canonical URL · {`${SITE_URL}/products/${dto.slug}`}
            </code>
          </details>
        </div>
      </main>
    </>
  );
}
