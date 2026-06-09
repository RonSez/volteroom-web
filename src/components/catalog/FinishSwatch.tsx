import { Check } from "lucide-react";
import type { Finish } from "@/data/catalog";
import { cn } from "@/lib/utils";

export function FinishSwatch({
  finish,
  selected = false,
  size = "md",
  onClick,
  title,
}: {
  finish: Pick<Finish, "hex" | "light">;
  selected?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
  title?: string;
}) {
  const dim = size === "sm" ? "size-5" : "size-9";
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={onClick ? selected : undefined}
      className={cn(
        "relative grid place-items-center rounded-full transition-[box-shadow,transform]",
        dim,
        onClick && "cursor-pointer hover:scale-105",
        selected
          ? "ring-2 ring-brand ring-offset-2 ring-offset-background"
          : finish.light
            ? "ring-1 ring-border"
            : "ring-1 ring-black/10",
      )}
      style={{ backgroundColor: finish.hex }}
    >
      {selected && (
        <Check
          className={cn(
            "size-4",
            finish.light ? "text-slate-900" : "text-white",
          )}
        />
      )}
    </Comp>
  );
}
