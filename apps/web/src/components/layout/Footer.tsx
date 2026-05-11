"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Mail, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/returns", label: "Returns" },
  { href: "/policies/refunds", label: "Refunds" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-24 border-t border-hairline bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.35))] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <p className="font-display text-2xl tracking-[0.18em] text-text">
              SYNTRAA
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A cinematic skincare atelier — warm light, calm textures, and
              editorial restraint designed for daily ritual.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: Sparkles, text: "Cream-beige glow system" },
                { icon: MapPin, text: "Made for slow mornings" },
                { icon: Mail, text: "Concierge support" },
              ].map((b) => (
                <span
                  key={b.text}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/55 px-3 py-2 text-[0.7rem] uppercase tracking-[0.22em] text-muted"
                >
                  <b.icon className="h-4 w-4 text-text" />
                  {b.text}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.36em] text-muted">
              Studio
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted">
              <p>Clean formulas. Quiet glow.</p>
              <p>Mon–Fri · 10:00–18:00</p>
              <Link className="inline-flex items-center gap-2 text-text hover:underline" href="/contact">
                <Mail className="h-4 w-4" />
                Contact concierge
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.36em] text-muted">
              Policies
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              {footerLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn("transition-colors hover:text-text")}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3">
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/55 px-4 py-2 text-[0.7rem] uppercase tracking-[0.26em] text-text transition hover:bg-white/80"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </motion.a>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-hairline pt-7 text-center text-[0.7rem] uppercase tracking-[0.28em] text-muted">
          © {new Date().getFullYear()} SYNTRAA · All rights reserved
        </div>
      </div>
    </footer>
  );
}
