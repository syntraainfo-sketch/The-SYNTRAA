import Link from "next/link";

const faqs = [
  {
    q: "Are your formulas fragrance-free?",
    a: "We keep scent minimal and modern. If a formula contains fragrance, it’s balanced for a clean finish — never loud.",
  },
  {
    q: "Can I layer products?",
    a: "Yes — each piece is designed to stack like editorial styling: light-to-rich, calm-to-glow. Patch test if sensitive.",
  },
  {
    q: "How fast is shipping?",
    a: "Dispatch is typically 24–48 hours. Delivery timing depends on your region and carrier lane.",
  },
  {
    q: "Do you offer returns?",
    a: "We offer returns on unopened items per policy. See the Returns page for eligibility windows and conditions.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-28 pt-12 md:px-10">
      <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">FAQ</p>
      <h1 className="mt-4 font-display text-4xl leading-tight text-text md:text-[3.2rem]">
        Answers, softly lit.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        A calm quick-read for shipping, routines, and product layering.
      </p>

      <div className="mt-10 grid gap-4">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="glass-panel group rounded-3xl px-6 py-5 text-sm text-muted open:bg-white/85"
          >
            <summary className="cursor-pointer list-none font-display text-xl text-text [&::-webkit-details-marker]:hidden">
              {f.q}
            </summary>
            <p className="mt-4 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4 text-[0.7rem] uppercase tracking-[0.28em]">
        <Link href="/contact" className="rounded-full border border-hairline bg-white/70 px-6 py-3 text-text hover:bg-white">
          Contact concierge
        </Link>
        <Link href="/policies/privacy" className="px-2 py-3 text-muted hover:text-text">
          Privacy policy →
        </Link>
      </div>
    </main>
  );
}

