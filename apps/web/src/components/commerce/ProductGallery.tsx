"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryImage } from "@syntraa/types";
import { cld } from "@/lib/cloudinary";

export function ProductGallery({
  title,
  gallery,
}: {
  title: string;
  gallery: GalleryImage[];
}) {
  const [active, setActive] = useState(0);
  const images = gallery?.length ? gallery : [];
  const hero = images[active] ?? images[0];

  if (!hero?.publicId) {
    return (
      <div className="relative aspect-4/5 overflow-hidden rounded-[1.75rem] bg-[#F5EFE6]">
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          No image
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-4/5 overflow-hidden rounded-[1.75rem] bg-[#F5EFE6] p-6 md:p-10">
        <Image
          src={cld(hero.publicId, 1600)}
          alt={hero.alt ?? title}
          fill
          className="object-contain"
          priority
          sizes="(max-width:1024px) 100vw, 52vw"
          unoptimized={cld(hero.publicId).startsWith("http")}
        />
      </div>
      {images.length > 1 ? (
        <div className="flex flex-wrap gap-3">
          {images.map((g, idx) => (
            <button
              key={g.publicId}
              type="button"
              onClick={() => setActive(idx)}
              className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-[#F5EFE6] transition ${
                idx === active ? "border-[#2d2d2d]" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={cld(g.publicId, 200)}
                alt=""
                fill
                className="object-contain"
                sizes="80px"
                unoptimized={cld(g.publicId).startsWith("http")}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
