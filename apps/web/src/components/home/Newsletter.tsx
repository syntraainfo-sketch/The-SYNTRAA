"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section className="mx-auto mt-28 max-w-7xl px-5 pb-24 md:mt-36 md:px-10">
      <div className="glass-panel relative overflow-hidden rounded-lg p-8 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(232,214,200,0.75),transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_65%,rgba(0,0,0,0.10),transparent_58%)]" />

        <div className="relative grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
              Newsletter
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] text-text md:text-[3.1rem]">
              Private drops & editorial rituals.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Early access, soft-launch sets, and calm formulas — delivered with cinematic restraint.
            </p>
          </div>

          <div className="relative">
            <div className="grid gap-3">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                type="email"
              />
              <motion.div whileTap={{ opacity: 0.92 }}>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setSent(true);
                    setTimeout(() => setSent(false), 2000);
                    setEmail("");
                  }}
                >
                  Join the list
                </Button>
              </motion.div>
              <p className="text-[0.7rem] text-muted">
                No spam. Just warm-white drops and matte-black details.
              </p>
            </div>

            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.65),transparent_62%)] blur-3xl"
              animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        {sent ? (
          <div className="relative mt-8 rounded-2xl border border-hairline bg-white/60 px-5 py-4 text-sm text-text">
            You’re in. Welcome to the atelier.
          </div>
        ) : null}
      </div>
    </section>
  );
}

