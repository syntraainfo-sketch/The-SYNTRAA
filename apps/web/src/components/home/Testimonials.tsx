"use client";

import { motion } from "framer-motion";

const quotes = [
  { name: "Lina", text: "The glow is subtle — like film grain, not glitter." },
  { name: "Amna", text: "Packaging is immaculate. The scroll feels expensive." },
  { name: "Hira", text: "Barrier calm is real. My skin feels quiet." },
  { name: "Nadia", text: "Editorial layouts + buttery motion. obsessed." },
  { name: "Sana", text: "A luxe minimal vibe that still feels immersive." },
];

export function TestimonialsMarquee() {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-5 md:mt-36 md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
            Testimonials
          </p>
          <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] text-text md:text-[3.1rem]">
            Quiet praise, loud glow.
          </h2>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-lg border border-hairline bg-white/50">
        <motion.div
          className="flex gap-4 py-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
        >
          {[...quotes, ...quotes].map((q, idx) => (
            <div
              key={`${q.name}-${idx}`}
              className="glass-panel w-[min(520px,86vw)] shrink-0 rounded-3xl px-6 py-5"
            >
              <p className="font-display text-xl leading-snug text-text">“{q.text}”</p>
              <p className="mt-3 text-[0.65rem] uppercase tracking-[0.3em] text-muted">
                {q.name}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

