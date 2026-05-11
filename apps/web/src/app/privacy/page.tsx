import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-28 pt-12 md:px-10">
      <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
        Privacy
      </p>
      <h1 className="mt-4 font-display text-4xl leading-tight text-text md:text-[3.2rem]">
        Privacy policy.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        This is a simplified privacy statement for the demo experience. For a full
        legal version, use the CMS policy pages.
      </p>

      <div className="mt-10 grid gap-4 text-sm text-muted">
        {[
          ["Data", "We store only what’s needed to provide account and order experiences."],
          ["Cookies", "Session cookies keep you signed in and preserve cart context."],
          ["Payments", "Payment processors handle sensitive payment details; we store order metadata."],
        ].map(([k, v]) => (
          <div key={k} className="glass-panel rounded-3xl px-6 py-5">
            <p className="font-display text-xl text-text">{k}</p>
            <p className="mt-3 leading-relaxed">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4 text-[0.7rem] uppercase tracking-[0.28em]">
        <Link
          href="/policies/privacy"
          className="rounded-full border border-hairline bg-white/70 px-6 py-3 text-text hover:bg-white"
        >
          View full policy (CMS)
        </Link>
        <Link href="/contact" className="px-2 py-3 text-muted hover:text-text">
          Questions → Concierge
        </Link>
      </div>
    </main>
  );
}

