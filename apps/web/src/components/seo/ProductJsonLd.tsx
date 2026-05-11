import { SITE_URL } from "@/lib/env";

export interface ProductJsonLdProps {
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  priceUsd: number;
  imagePublicIds?: string[];
  cloudName?: string;
}

export function ProductJsonLd({
  name,
  slug,
  description,
  sku,
  priceUsd,
  imagePublicIds,
  cloudName,
}: ProductJsonLdProps) {
  const images =
    imagePublicIds?.map((id) =>
      cloudName
        ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1600/${id}`
        : undefined
    ) ?? [];

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    url: `${SITE_URL}/products/${slug}`,
    image: images.filter(Boolean),
    brand: {
      "@type": "Brand",
      name: "THE SYNTRAA",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: priceUsd.toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
