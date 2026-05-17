import Link from "next/link";
import type { CSSProperties } from "react";

/** Dark admin shell: override global light-theme ink tokens so `text-text` / `text-muted` are readable. */
const adminTheme: CSSProperties = {
  ["--ink" as string]: "#f4f4f8",
  ["--ink-2" as string]: "rgba(244, 244, 248, 0.7)",
  ["--color-text" as string]: "#f4f4f8",
  ["--color-muted" as string]: "rgba(244, 244, 248, 0.7)",
  ["--hairline" as string]: "rgba(255, 255, 255, 0.14)",
  ["--hairline-2" as string]: "rgba(255, 255, 255, 0.22)",
  ["--color-hairline" as string]: "rgba(255, 255, 255, 0.14)",
  ["--color-hairline-2" as string]: "rgba(255, 255, 255, 0.22)",
};

const nav = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Payments" },
  { href: "/admin/cms", label: "CMS" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="-mt-24 min-h-screen bg-[#07070d] pb-24 text-text antialiased scheme-dark"
      style={adminTheme}
    >
      <div className="mx-auto flex max-w-7xl gap-12 px-5 pt-10 md:px-10">
        <aside className="hidden w-56 shrink-0 flex-col gap-4 border-r border-hairline/60 pr-6 text-xs uppercase tracking-[0.26em] text-muted md:flex">
          <p className="pb-6 text-[0.6rem] text-text">THE SYNTRAA / Admin</p>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-text">
              {n.label}
            </Link>
          ))}
          <Link href="/admin/login" className="mt-12 text-muted hover:text-red-300">
            Secure session
          </Link>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
