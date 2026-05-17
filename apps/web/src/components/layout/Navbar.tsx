"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartItemCount } from "@/hooks/useCartItemCount";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const cartCount = useCartItemCount();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isAdminRoute) return null;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50",
          "transition-[background,box-shadow,border-color] duration-500",
          scrolled
            ? "border-b border-black/10 bg-white/90 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:gap-8 md:px-10">
          <Link
            href="/"
            className="shrink-0 font-display text-[1.15rem] tracking-[0.12em] text-[#111] md:text-[1.25rem]"
          >
            Syntraa
          </Link>

          <nav className="hidden flex-1 justify-center md:flex">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[0.72rem] font-sans uppercase tracking-[0.18em] text-[#333]">
              {navLinks.map((l) => {
                const active =
                  l.href === "/"
                    ? pathname === "/"
                    : pathname === l.href || pathname?.startsWith(`${l.href}/`);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={cn(
                        "transition hover:text-black",
                        active ? "font-semibold text-black" : "text-[#444]"
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <Link
              href="/search"
              aria-label="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-[#111] transition hover:bg-white"
            >
              <Search className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-[#111] transition hover:bg-white"
            >
              <ShoppingBag className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2d2d2d] px-1 text-[0.65rem] font-medium text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-[#111] md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="absolute inset-x-4 top-4 max-h-[85vh] overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 shadow-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <span className="font-display text-lg tracking-[0.15em]">Syntraa</span>
                <button
                  type="button"
                  className="rounded-full p-2 text-[#111]"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="mt-4 grid gap-1">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="block rounded-xl px-3 py-3 font-sans text-sm uppercase tracking-[0.12em] text-[#222]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2 border-t border-black/10 pt-4">
                <Link
                  href="/search"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-black/15 py-3 text-xs uppercase tracking-[0.15em]"
                  onClick={() => setMobileOpen(false)}
                >
                  <Search className="h-4 w-4" />
                  Search
                </Link>
                <Link
                  href="/cart"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-black/15 py-3 text-xs uppercase tracking-[0.15em]"
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Cart ({cartCount})
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
