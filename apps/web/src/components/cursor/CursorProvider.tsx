"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type CursorVariant = "default" | "button" | "link" | "card" | "image" | "drag";

export type CursorState = {
  enabled: boolean;
  variant: CursorVariant;
  dragging: boolean;
  setVariant: (v: CursorVariant) => void;
  setDragging: (v: boolean) => void;
};

const CursorContext = createContext<CursorState | null>(null);

function isAnyPointerCapable(): boolean {
  if (typeof window === "undefined") return false;
  if (!("PointerEvent" in window)) return false;
  // Enable on mobile too (touch/pen), not only fine mouse pointers.
  const anyPointer =
    window.matchMedia?.("(any-pointer: fine)").matches ||
    window.matchMedia?.("(any-pointer: coarse)").matches ||
    false;
  return Boolean(anyPointer);
}

function inferVariant(el: Element | null): CursorVariant {
  if (!el) return "default";
  const nearest = (el as HTMLElement).closest?.("[data-cursor]") as HTMLElement | null;
  const explicit = nearest?.getAttribute?.("data-cursor");
  if (
    explicit === "default" ||
    explicit === "button" ||
    explicit === "link" ||
    explicit === "card" ||
    explicit === "image" ||
    explicit === "drag"
  ) {
    return explicit;
  }

  const tag = (el as HTMLElement).tagName?.toLowerCase?.() ?? "";
  if (tag === "a") return "link";
  if (tag === "button") return "button";
  if (tag === "img" || tag === "picture") return "image";

  const role = (el as HTMLElement).getAttribute?.("role");
  if (role === "button") return "button";

  if ((el as HTMLElement).closest?.(".swiper")) return "drag";

  return "default";
}

export function CursorProvider({ children }: { children: ReactNode }) {
  const [enabled] = useState(() => isAnyPointerCapable());
  const [variant, setVariantState] = useState<CursorVariant>("default");
  const [dragging, setDraggingState] = useState(false);

  const variantRef = useRef<CursorVariant>("default");
  const draggingRef = useRef(false);

  const setVariant = useCallback((v: CursorVariant) => {
    variantRef.current = v;
    setVariantState(v);
  }, []);

  const setDragging = useCallback((v: boolean) => {
    draggingRef.current = v;
    setDraggingState(v);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onOver = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return;
      setVariant(inferVariant(e.target));
    };
    const onOut = (e: PointerEvent) => {
      const next = e.relatedTarget;
      if (next instanceof Element) {
        setVariant(inferVariant(next));
        return;
      }
      setVariant("default");
    };

    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return;
      const v = inferVariant(e.target);
      if (v === "drag") setDragging(true);
    };
    const onUp = () => setDragging(false);

    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerout", onOut, true);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerout", onOut, true);
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, setDragging, setVariant]);

  const value = useMemo<CursorState>(
    () => ({ enabled, variant, dragging, setVariant, setDragging }),
    [enabled, variant, dragging, setVariant, setDragging]
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export function useCursor(): CursorState {
  const ctx = useContext(CursorContext);
  if (!ctx) {
    return {
      enabled: false,
      variant: "default",
      dragging: false,
      setVariant: () => {},
      setDragging: () => {},
    };
  }
  return ctx;
}

