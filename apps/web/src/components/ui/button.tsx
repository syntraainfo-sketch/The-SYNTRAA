"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      {...props}
      data-cursor="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] transition active:scale-[0.99] disabled:opacity-50",
        variant === "primary" &&
          "border border-hairline-2 bg-black text-white shadow-[0_20px_70px_rgba(0,0,0,0.18)] hover:shadow-[0_24px_90px_rgba(0,0,0,0.22)]",
        variant === "secondary" &&
          "border border-hairline bg-white/70 text-text hover:bg-white",
        variant === "ghost" && "border border-transparent bg-transparent text-text hover:bg-white/60",
        className
      )}
    />
  );
}

