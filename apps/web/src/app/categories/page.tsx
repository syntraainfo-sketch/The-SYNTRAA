import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/types";
import type { CategoryDTO } from "@syntraa/types";

export const revalidate = 120;

export default async function CategoriesPage() {
  let categories: CategoryDTO[] = [];
  try {
    const res = await apiGet<ApiEnvelope<CategoryDTO[]>>("/categories", {
      next: { revalidate: 120 },
    });
    categories = Array.isArray(res.data) ? res.data : [];
  } catch {
    categories = [];
  }

  return (
    <main className="mx-auto max-w-5xl px-5 pb-28 pt-14 md:px-10">
      <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
        Taxonomy
      </p>
      <h1 className="font-display mt-6 text-4xl md:text-[3rem] leading-tight">
        Curated layers.
      </h1>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="group flex items-center justify-between rounded-3xl border border-hairline bg-surface/40 px-8 py-10 transition hover:border-white/20"
          >
            <div>
              <p className="font-display text-2xl">{c.name}</p>
              <p className="mt-2 text-sm text-muted">{c.slug}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-muted group-hover:text-text">
              Enter →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
