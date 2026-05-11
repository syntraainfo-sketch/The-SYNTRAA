"use client";

import { useState } from "react";
import { ScrollReveal } from "@/motion/ScrollReveal";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <main className="mx-auto max-w-3xl px-5 pb-28 pt-16 md:px-10">
      <ScrollReveal>
        <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
          Concierge
        </p>
        <h1 className="font-display mt-6 text-4xl leading-tight">
          White-glove dialogue.
        </h1>
        <p className="mt-6 text-muted">
          For placement, appointments, and bespoke procurement — leave a note. This
          wireframe routes to your CRM in the next integration pass.
        </p>
        <form
          className="mt-12 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <label className="block text-sm text-muted">
            Email
            <input
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-hairline bg-black/40 px-4 py-3 text-text"
            />
          </label>
          <label className="block text-sm text-muted">
            Inquiry
            <textarea
              required
              rows={5}
              className="mt-2 w-full rounded-2xl border border-hairline bg-black/40 px-4 py-3 text-text"
            />
          </label>
          <button
            type="submit"
            className="rounded-full border border-hairline px-8 py-3 text-[0.7rem] uppercase tracking-[0.28em]"
          >
            {sent ? "Received" : "Dispatch"}
          </button>
        </form>
      </ScrollReveal>
    </main>
  );
}
