import { useTranslations } from "next-intl";
import { Boxes, Ruler, ShieldCheck, BadgeCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const ICONS: LucideIcon[] = [Boxes, Ruler, ShieldCheck, BadgeCheck];

export function FeatureGrid() {
  const t = useTranslations("home.features");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <Reveal key={i} delay={i * 70} className="h-full">
          <div
            className="floats group h-full rounded-2xl p-6 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_0_44px_-14px_rgba(43, 164, 214,0.6)]"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-[0_8px_26px_-8px_rgba(43,164,214,0.85)] transition-transform duration-300 group-hover:scale-105">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-5 font-heading text-base font-semibold tracking-tight text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
              {item.desc}
            </p>
          </div>
          </Reveal>
        );
      })}
    </div>
  );
}
