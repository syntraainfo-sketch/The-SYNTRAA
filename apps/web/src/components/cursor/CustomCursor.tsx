"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useCursor } from "./CursorProvider";

type Vec2 = { x: number; y: number };

const BASE_DOT_PX = 7;
const BASE_RING_PX = 48;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/** Cursor DOM is created imperatively so React never reconciles `style` on these nodes (avoids rAF vs commit races). */
function mountCursorElements(): {
  root: HTMLDivElement;
  dotWrap: HTMLDivElement;
  ringWrap: HTMLDivElement;
  ringGlow: HTMLDivElement;
} {
  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("data-syntraa-cursor-root", "");
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9999",
    userSelect: "none",
    visibility: "hidden",
    opacity: "0",
    willChange: "opacity",
    transition: "opacity 180ms ease-out, visibility 180ms step-end",
  });

  const dotWrap = document.createElement("div");
  Object.assign(dotWrap.style, { position: "absolute", left: "0", top: "0" });

  const dotInner = document.createElement("div");
  Object.assign(dotInner.style, {
    width: "100%",
    height: "100%",
    borderRadius: "9999px",
    backgroundColor: "#000",
    boxShadow: "0 0 18px rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.4)",
  });
  dotWrap.appendChild(dotInner);

  const ringWrap = document.createElement("div");
  Object.assign(ringWrap.style, {
    position: "absolute",
    left: "0",
    top: "0",
    overflow: "visible",
    mixBlendMode: "overlay",
  });

  const ringFace = document.createElement("div");
  Object.assign(ringFace.style, {
    width: "100%",
    height: "100%",
    borderRadius: "9999px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 62%)",
    boxShadow: "0 0 45px rgba(255,255,255,0.18)",
    backdropFilter: "blur(4px)",
  });
  ringWrap.appendChild(ringFace);

  const ringGlow = document.createElement("div");
  Object.assign(ringGlow.style, {
    position: "absolute",
    pointerEvents: "none",
    borderRadius: "9999px",
    background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 62%)",
    filter: "blur(24px)",
    opacity: "0.8",
  });
  ringWrap.appendChild(ringGlow);

  root.appendChild(dotWrap);
  root.appendChild(ringWrap);
  document.body.appendChild(root);

  return { root, dotWrap, ringWrap, ringGlow };
}

export function CustomCursor() {
  const { enabled, variant, dragging } = useCursor();

  const variantRef = useRef(variant);
  const draggingRef = useRef(dragging);
  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    if (!enabled) return;

    const mqReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mqReduce?.matches) return;

    const { root, dotWrap, ringWrap, ringGlow } = mountCursorElements();

    // #region agent log
    {
      const g = (typeof window !== "undefined"
        ? (window as unknown as { gsap?: { globalTimeline?: { getChildren?: () => unknown[] } } }).gsap
        : undefined) as { globalTimeline?: { getChildren?: () => unknown[] } } | undefined;
      const n = (el: Element) => ({
        tag: el.tagName,
        ns: el.namespaceURI,
        isSvg: el instanceof SVGElement,
        connected: el.isConnected,
        parentTag: el.parentElement?.tagName ?? null,
      });
      fetch("http://127.0.0.1:7360/ingest/a2cebb30-c8e6-4208-95e0-cced3930ff38", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "16174d" },
        body: JSON.stringify({
          sessionId: "16174d",
          runId: "imperative-cursor-dom",
          hypothesisId: "H10",
          location: "CustomCursor.tsx:effect-init",
          message: "Imperative cursor mount (no React portal on animated nodes)",
          data: {
            hasGsap: Boolean(g),
            timelineChildren: g?.globalTimeline?.getChildren?.()?.length ?? null,
            dotWrap: n(dotWrap),
            ringWrap: n(ringWrap),
            ringGlow: n(ringGlow),
            root: n(root),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion agent log

    const cursorNodes: HTMLElement[] = [root, dotWrap, ringWrap, ringGlow];
    try {
      gsap.killTweensOf(cursorNodes);
    } catch {
      /* ignore */
    }
    for (const el of cursorNodes) {
      el.style.removeProperty("transform");
    }

    const target: Vec2 = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pullTarget: Vec2 = { ...target };
    const dotPos: Vec2 = { ...target };
    const ringPos: Vec2 = { ...target };

    const computePullTarget = (px: number, py: number) => {
      let tx = px;
      let ty = py;
      if (variantRef.current === "link") {
        const hit = document.elementFromPoint(px, py);
        const link = hit?.closest?.("a,[data-cursor='link']") as HTMLElement | null;
        if (link) {
          const r = link.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = cx - px;
          const dy = cy - py;
          const dist = Math.hypot(dx, dy);
          const strength = clamp(1 - dist / 180, 0, 1);
          tx = px + dx * 0.16 * strength;
          ty = py + dy * 0.16 * strength;
        }
      }
      pullTarget.x = tx;
      pullTarget.y = ty;
    };

    const dotFollow = 0.22;
    const ringFollow = 0.12;

    let visible = false;
    const show = () => {
      if (visible) return;
      visible = true;
      root.style.visibility = "visible";
      root.style.opacity = "1";
    };
    const hide = () => {
      if (!visible) return;
      visible = false;
      root.style.opacity = "0";
      root.style.visibility = "hidden";
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      show();
    };

    const onLeave = () => hide();
    let hideT = 0;
    const scheduleHide = () => {
      window.clearTimeout(hideT);
      hideT = window.setTimeout(() => hide(), 420);
    };

    const onDown = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      show();
    };
    const onUp = () => scheduleHide();

    let loggedWindowErr = false;
    const onWindowError = (ev: ErrorEvent) => {
      const msg = String(ev.message ?? "");
      if (!msg.includes("scaleX") && !msg.includes("setAttribute")) return;
      if (loggedWindowErr) return;
      loggedWindowErr = true;
      const errObj = ev.error instanceof Error ? ev.error : null;
      const payload = {
        msg,
        filename: ev.filename,
        lineno: ev.lineno,
        colno: ev.colno,
        errorName: errObj?.name ?? null,
        stack: errObj?.stack ?? null,
      };
      try {
        sessionStorage.setItem("syntraa-debug-last-dom-err", JSON.stringify({ ...payload, t: Date.now() }));
      } catch {
        /* ignore */
      }
      console.error("[syntraa-debug] scaleX/setAttribute", payload);
      fetch("http://127.0.0.1:7360/ingest/a2cebb30-c8e6-4208-95e0-cced3930ff38", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "16174d" },
        body: JSON.stringify({
          sessionId: "16174d",
          runId: "imperative-cursor-dom",
          hypothesisId: "H4",
          location: "CustomCursor.tsx:window-error",
          message: "Global error (scaleX/setAttribute)",
          data: payload,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };
    window.addEventListener("error", onWindowError);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("mouseleave", onLeave);

    let tickCount = 0;
    let loggedTickErr = false;
    const logTickErr = (step: string, err: unknown) => {
      if (loggedTickErr) return;
      loggedTickErr = true;
      const e = err as { name?: string; message?: string; stack?: string };
      fetch("http://127.0.0.1:7360/ingest/a2cebb30-c8e6-4208-95e0-cced3930ff38", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "16174d" },
        body: JSON.stringify({
          sessionId: "16174d",
          runId: "imperative-cursor-dom",
          hypothesisId: "H2",
          location: "CustomCursor.tsx:cursorFrame",
          message: "cursorFrame threw",
          data: {
            step,
            name: e?.name,
            msg: e?.message,
            tickCount,
            dotConnected: dotWrap.isConnected,
            ringConnected: ringWrap.isConnected,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };

    let loggedDisconnected = false;
    const cursorFrame = () => {
      tickCount += 1;
      if (!dotWrap.isConnected || !ringWrap.isConnected || !ringGlow.isConnected) {
        if (!loggedDisconnected) {
          loggedDisconnected = true;
          fetch("http://127.0.0.1:7360/ingest/a2cebb30-c8e6-4208-95e0-cced3930ff38", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "16174d" },
            body: JSON.stringify({
              sessionId: "16174d",
              runId: "imperative-cursor-dom",
              hypothesisId: "H3",
              location: "CustomCursor.tsx:cursorFrame",
              message: "cursor nodes not connected; skipping writes",
              data: {
                dot: dotWrap.isConnected,
                ring: ringWrap.isConnected,
                glow: ringGlow.isConnected,
                tickCount,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
        }
        return;
      }

      if (variantRef.current === "link") {
        computePullTarget(target.x, target.y);
      } else {
        pullTarget.x = target.x;
        pullTarget.y = target.y;
      }

      const v = variantRef.current;
      const isDrag = draggingRef.current;

      const tx = pullTarget.x;
      const ty = pullTarget.y;

      dotPos.x += (tx - dotPos.x) * dotFollow;
      dotPos.y += (ty - dotPos.y) * dotFollow;
      ringPos.x += (tx - ringPos.x) * ringFollow;
      ringPos.y += (ty - ringPos.y) * ringFollow;

      let dScale = 1;
      let rScale = 1;
      let dOp = 1;
      let rOp = 1;

      if (v === "button") {
        dScale = 1.2;
        rScale = 1.45;
        rOp = 0.95;
      } else if (v === "link") {
        dScale = 1.05;
        rScale = 1.2;
        dOp = 0.9;
        rOp = 0.65;
      } else if (v === "card") {
        dScale = 1.0;
        rScale = 1.7;
        rOp = 0.92;
      } else if (v === "image") {
        dScale = 0.9;
        rScale = 1.55;
        rOp = 0.75;
      } else if (v === "drag" || isDrag) {
        dScale = 1.1;
        rScale = 1.9;
        rOp = 0.95;
      }

      const dotPx = BASE_DOT_PX * dScale;
      const ringPx = BASE_RING_PX * rScale;
      const glowExtra = 36 * rScale;

      try {
        dotWrap.style.removeProperty("transform");
        dotWrap.style.left = `${dotPos.x - dotPx / 2}px`;
        dotWrap.style.top = `${dotPos.y - dotPx / 2}px`;
        dotWrap.style.width = `${dotPx}px`;
        dotWrap.style.height = `${dotPx}px`;
        dotWrap.style.opacity = String(dOp);
      } catch (e) {
        logTickErr("dotWrap.layout", e);
        throw e;
      }

      try {
        ringWrap.style.removeProperty("transform");
        ringWrap.style.left = `${ringPos.x - ringPx / 2}px`;
        ringWrap.style.top = `${ringPos.y - ringPx / 2}px`;
        ringWrap.style.width = `${ringPx}px`;
        ringWrap.style.height = `${ringPx}px`;
        ringWrap.style.opacity = String(rOp);
      } catch (e) {
        logTickErr("ringWrap.layout", e);
        throw e;
      }

      try {
        ringGlow.style.removeProperty("transform");
        ringGlow.style.width = `${ringPx + glowExtra}px`;
        ringGlow.style.height = `${ringPx + glowExtra}px`;
        ringGlow.style.left = `${-glowExtra / 2}px`;
        ringGlow.style.top = `${-glowExtra / 2}px`;
      } catch (e) {
        logTickErr("ringGlow.layout", e);
        throw e;
      }
    };

    let raf = 0;
    const loop = () => {
      cursorFrame();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("error", onWindowError);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", hide);
      document.removeEventListener("mouseleave", onLeave);
      try {
        gsap.killTweensOf(cursorNodes);
      } catch {
        /* ignore */
      }
      window.clearTimeout(hideT);
      root.remove();
    };
  }, [enabled]);

  return null;
}
