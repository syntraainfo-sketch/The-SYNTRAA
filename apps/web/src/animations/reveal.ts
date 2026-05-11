"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ensureGsap } from "./gsap";

export type RevealPreset = "fade-up" | "mask-up" | "fade";

export function useRevealOnScroll(
  el: Element | null,
  opts?: {
    preset?: RevealPreset;
    start?: string;
    once?: boolean;
    delay?: number;
  }
) {
  useEffect(() => {
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    ensureGsap();

    const preset = opts?.preset ?? "fade-up";
    const start = opts?.start ?? "top 86%";
    const once = opts?.once ?? true;
    const delay = opts?.delay ?? 0;

    const ctx = gsap.context(() => {
      if (preset === "fade") {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            delay,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start, once },
          }
        );
        return;
      }

      if (preset === "mask-up") {
        gsap.fromTo(
          el,
          { opacity: 0, yPercent: 16, filter: "blur(8px)" },
          {
            opacity: 1,
            yPercent: 0,
            filter: "blur(0px)",
            delay,
            duration: 1.05,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start, once },
          }
        );
        return;
      }

      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          delay,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start, once },
        }
      );
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [el, opts?.preset, opts?.start, opts?.once, opts?.delay]);
}

