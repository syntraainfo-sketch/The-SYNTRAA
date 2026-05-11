"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-hairline bg-white/75 px-4 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-hairline-2 focus:bg-white",
        className
      )}
    />
  );
}

