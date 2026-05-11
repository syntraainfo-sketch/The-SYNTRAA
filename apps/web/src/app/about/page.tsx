import { ScrollReveal } from "@/motion/ScrollReveal";

export const metadata = {
  title: "House",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-28 pt-16 md:px-10">
      <ScrollReveal>
        <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
          Atelier
        </p>
        <h1 className="font-display mt-6 text-4xl md:text-[3.1rem] leading-tight">
          The architecture of quiet excess.
        </h1>
        <p className="mt-10 text-lg leading-relaxed text-muted">
          THE SYNTRAA choreographs luxury as a sequence of matte surfaces, silver
          refraction, and cinematic motion. Our stack treats performance as a design
          material — never decoration for its own sake.
        </p>
      </ScrollReveal>
    </main>
  );
}
