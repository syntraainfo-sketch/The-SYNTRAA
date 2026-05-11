"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "House" },
  { href: "/contact", label: "Concierge" },
];

export function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const quickLinks = useMemo(
    () => [
      { href: "/products?tag=new", label: "New arrivals", desc: "Fresh edits, luminous finishes." },
      { href: "/products?tag=bestsellers", label: "Bestsellers", desc: "The cult circle of essentials." },
      { href: "/products?tag=sets", label: "Ritual sets", desc: "Curated routines, gift-ready." },
    ],
    []
  );

  if (isAdminRoute) return null;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50",
          "transition-[background,box-shadow,border-color] duration-500",
          scrolled
            ? "border-b border-hairline/80 bg-surface/75 shadow-[0_18px_60px_rgba(0,0,0,0.10)] backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <span className="font-display text-[1.05rem] tracking-[0.36em] text-text">
              SYNTRAA
            </span>
            <span className="hidden text-[0.6rem] uppercase tracking-[0.38em] text-muted md:inline">
              Skincare atelier
            </span>
          </Link>

          <NavigationMenu.Root className="hidden md:block">
            <NavigationMenu.List className="flex items-center gap-7 text-[0.7rem] uppercase tracking-[0.26em] text-muted">
              <NavigationMenu.Item>
                <NavigationMenu.Trigger
                  className={cn(
                    "group relative flex items-center gap-2 outline-none transition-colors hover:text-text",
                    "after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-hairline-2 after:transition-transform after:duration-500 group-hover:after:scale-x-100"
                  )}
                >
                  Shop
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="absolute left-1/2 top-full mt-4 w-[min(860px,calc(100vw-56px))] -translate-x-1/2 rounded-[28px] border border-hairline bg-surface-2/85 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
                  <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="grid gap-4">
                      <p className="text-[0.62rem] uppercase tracking-[0.36em] text-muted">
                        Featured pathways
                      </p>
                      <div className="grid gap-2">
                        {quickLinks.map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            className="group rounded-2xl border border-hairline/0 bg-white/0 px-4 py-3 transition hover:border-hairline hover:bg-white/40"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-text">{l.label}</span>
                              <span className="text-[0.62rem] uppercase tracking-[0.28em] text-muted transition group-hover:text-text">
                                Explore →
                              </span>
                            </div>
                            <p className="mt-1 text-[0.78rem] text-muted">{l.desc}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-hairline bg-[radial-gradient(circle_at_30%_10%,rgba(232,214,200,0.55),transparent_60%)] p-5">
                      <p className="text-[0.62rem] uppercase tracking-[0.36em] text-muted">
                        Signature mood
                      </p>
                      <p className="mt-3 font-display text-2xl leading-tight text-text">
                        Warm light. Clean formulas. Quiet glow.
                      </p>
                      <p className="mt-3 text-sm text-muted">
                        Editorial skincare designed for ritual pacing — luminous textures, soft
                        gradients, and elevated calm.
                      </p>
                    </div>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>

              {links
                .filter((l) => l.href !== "/products")
                .map((l) => (
                  <NavigationMenu.Item key={l.href}>
                    <NavigationMenu.Link asChild>
                      <Link
                        href={l.href}
                        className={cn(
                          "group relative outline-none transition-colors hover:text-text",
                          pathname === l.href ? "text-text" : "text-muted",
                          "after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:bg-hairline-2 after:transition-transform after:duration-500",
                          pathname === l.href ? "after:scale-x-100" : "after:scale-x-0 group-hover:after:scale-x-100"
                        )}
                      >
                        {l.label}
                      </Link>
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                ))}
            </NavigationMenu.List>
            <NavigationMenu.Viewport className="relative z-50 mt-4 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) origin-top overflow-hidden rounded-[28px]" />
          </NavigationMenu.Root>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              aria-label="Search"
              className="hidden rounded-full border border-hairline bg-white/40 p-2 text-muted transition hover:bg-white/70 hover:text-text sm:inline-flex"
            >
              <Search className="h-4 w-4" />
            </Link>
            <motion.div whileHover={{ y: -1 }}>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/55 px-4 py-2 text-[0.7rem] uppercase tracking-[0.26em] text-text transition hover:bg-white/80"
              >
                <ShoppingBag className="h-4 w-4" />
                Cart
              </Link>
            </motion.div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-hairline bg-white/55 p-2 text-text transition hover:bg-white/80 md:hidden"
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
            className="fixed inset-0 z-60 bg-[rgba(11,11,15,0.55)] backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="absolute inset-x-4 top-4 rounded-[28px] border border-hairline bg-surface-2/92 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.22)]"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[1rem] tracking-[0.34em]">SYNTRAA</span>
                <button
                  type="button"
                  className="rounded-full border border-hairline bg-white/50 p-2 text-text"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-5 grid gap-2">
                {[{ href: "/products", label: "Shop" }, ...links.filter((l) => l.href !== "/products")].map(
                  (l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="flex items-center justify-between rounded-2xl border border-hairline bg-white/40 px-4 py-4 text-sm text-text"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="font-display text-lg">{l.label}</span>
                      <span className="text-[0.65rem] uppercase tracking-[0.3em] text-muted">
                        Enter →
                      </span>
                    </Link>
                  )
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/search"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline bg-white/50 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-text"
                  onClick={() => setMobileOpen(false)}
                >
                  <Search className="h-4 w-4" />
                  Search
                </Link>
                <Link
                  href="/cart"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline bg-white/50 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-text"
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Cart
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
