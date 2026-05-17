import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Articles",
  description: "Editorial notes and rituals from THE SYNTRAA.",
};

export default function ArticlesPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 md:px-10">
      <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">Journal</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-text md:text-5xl">Articles</h1>
      <p className="mt-6 text-lg text-muted">
        Stories, ingredient deep-dives, and care rituals are coming soon. For now, explore the shop
        or reach the concierge.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/products"
          className="rounded-full border border-hairline bg-[#2d2d2d] px-6 py-3 text-[0.72rem] uppercase tracking-[0.2em] text-white"
        >
          Shop
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-hairline px-6 py-3 text-[0.72rem] uppercase tracking-[0.2em] text-text"
        >
          Contact
        </Link>
      </div>
    </main>
  );
}
