import Image from "next/image";
import Link from "next/link";
import { cld } from "@/lib/cloudinary";

export interface CatalogProductCardProps {
  slug: string;
  title: string;
  imagePublicId?: string;
  fromUSD?: number;
  categoryLabel?: string;
  variantSizes?: string[];
}

export function CatalogProductCard({
  slug,
  title,
  imagePublicId,
  fromUSD,
  categoryLabel,
  variantSizes,
}: CatalogProductCardProps) {
  const src = imagePublicId ? cld(imagePublicId, 900) : "/globe.svg";
  const sizes = [...new Set((variantSizes ?? []).filter(Boolean))];

  return (
    <article className="flex flex-col">
      <Link
        href={`/products/${slug}`}
        className="group relative block aspect-3/4 overflow-hidden rounded-[1.35rem] bg-[#F5EFE6] p-6 transition hover:shadow-[0_24px_80px_rgba(0,0,0,0.08)]"
      >
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain transition duration-500 group-hover:scale-[1.03]"
            unoptimized={src.startsWith("http")}
          />
        </div>
      </Link>
      <div className="mt-5 flex flex-col gap-1 px-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug tracking-tight text-[#111]">{title}</h3>
          {typeof fromUSD === "number" && fromUSD > 0 ? (
            <span className="shrink-0 font-sans text-sm font-semibold text-[#111]">
              ${fromUSD.toFixed(2)}
            </span>
          ) : null}
        </div>
        {categoryLabel ? (
          <p className="font-sans text-[0.8rem] text-[#666]">{categoryLabel}</p>
        ) : null}
        {sizes.length > 0 ? (
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.14em] text-[#777]">
            {sizes.join(" / ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
