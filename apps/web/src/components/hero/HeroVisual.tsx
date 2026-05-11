/**
 * Static markup only (Server Component — no JS bundle for hero, no WebGL/CDN/HDR).
 */
export function HeroVisual() {
  return (
    <div
      className="relative h-[min(70vh,640px)] w-full overflow-hidden rounded-3xl bg-linear-to-b from-zinc-900/95 via-black to-zinc-950"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.12),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen bg-[conic-gradient(from_200deg_at_50%_50%,transparent,rgba(200,204,212,0.06),transparent)] motion-safe:animate-spin [animation-duration:22s]" />
      <div className="absolute left-1/2 top-1/2 h-[min(48vw,400px)] w-[min(48vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(220,224,232,0.45),rgba(40,42,48,0.85)_42%,rgba(0,0,0,0.65)_100%)] shadow-[0_0_100px_rgba(200,204,212,0.12)] ring-1 ring-white/15" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}
