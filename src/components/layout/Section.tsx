import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

export function Section({
  children,
  className,
  containerClassName,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-20 lg:py-24", className)}>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p
            className={cn(
              "mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand",
              align === "center" && "justify-center",
            )}
          >
            <span className="rule-brand h-px w-8 rounded-full" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={eyebrow ? 80 : 0}>
        <h2 className="text-shimmer text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {/* Brand hairline that draws in (scaleX) once the title reveals. */}
        <span
          aria-hidden
          className={cn(
            "rule-brand rule-draw mt-5 block h-0.5 w-16 rounded-full",
            align === "center" && "is-centered mx-auto",
          )}
        />
      </Reveal>
      {subtitle && (
        <Reveal delay={eyebrow ? 160 : 80}>
          <p
            className={cn(
              "mt-4 text-base font-light leading-relaxed text-muted-foreground",
              align === "center" && "mx-auto max-w-xl",
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
