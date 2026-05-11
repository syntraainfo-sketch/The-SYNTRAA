import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 font-display text-3xl tracking-[-0.01em] text-text md:text-[3.2rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

