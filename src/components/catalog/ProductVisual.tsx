import type { CategoryId } from "@/data/catalog";
import { cn } from "@/lib/utils";

/** Relative luminance of a #rrggbb color (0–1). */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Stylized SVG placeholder of a fitting plate rendered in the selected finish.
 * Reacts to the chosen colour so it doubles as a live preview. Replace with
 * real product photography later.
 */
export function ProductVisual({
  category,
  hex,
  gang = 1,
  className,
}: {
  category: CategoryId;
  hex: string;
  gang?: number;
  className?: string;
}) {
  const lum = luminance(hex);
  const dark = lum < 0.5;
  // Glyph / detail color that contrasts with the finish.
  const ink = dark ? "rgba(255,255,255,0.82)" : "rgba(15,23,42,0.62)";
  const edge = dark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.12)";
  const inner = dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)";

  const modules = Math.min(Math.max(gang, 1), 5);
  const plateW = 120;
  const totalW = plateW * modules + 8 * (modules - 1);
  const viewW = Math.max(totalW + 80, 200);
  const viewH = 200;
  const startX = (viewW - totalW) / 2;

  return (
    <div
      className={cn(
        "relative isolate flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl",
        className,
      )}
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, #f1f5f9 0%, #e2e8f0 60%, #cbd5e1 100%)",
      }}
    >
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="h-[78%] w-[88%] drop-shadow-[0_18px_28px_rgba(15,23,42,0.22)]"
        role="img"
      >
        {Array.from({ length: modules }).map((_, i) => {
          const x = startX + i * (plateW + 8);
          const cy = viewH / 2;
          const cx = x + plateW / 2;
          return (
            <g key={i}>
              {/* plate */}
              <rect
                x={x}
                y={40}
                width={plateW}
                height={120}
                rx={12}
                fill={hex}
                stroke={edge}
                strokeWidth={1.5}
              />
              {/* inner panel */}
              <rect
                x={x + 12}
                y={52}
                width={plateW - 24}
                height={96}
                rx={8}
                fill={inner}
                stroke={edge}
                strokeWidth={1}
              />
              <Glyph category={category} cx={cx} cy={cy} ink={ink} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Glyph({
  category,
  cx,
  cy,
  ink,
}: {
  category: CategoryId;
  cx: number;
  cy: number;
  ink: string;
}) {
  switch (category) {
    case "switches":
      return (
        <g stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none">
          <line x1={cx} y1={66} x2={cx} y2={134} opacity={0.5} />
          <line x1={cx - 22} y1={88} x2={cx + 22} y2={88} />
        </g>
      );
    case "sockets":
      return (
        <g stroke={ink} strokeWidth={3} fill="none">
          <circle cx={cx} cy={cy} r={26} opacity={0.55} />
          <circle cx={cx - 11} cy={cy} r={3.5} fill={ink} stroke="none" />
          <circle cx={cx + 11} cy={cy} r={3.5} fill={ink} stroke="none" />
          <line x1={cx} y1={cy - 30} x2={cx} y2={cy - 22} strokeLinecap="round" />
          <line x1={cx} y1={cy + 22} x2={cx} y2={cy + 30} strokeLinecap="round" />
        </g>
      );
    case "usb-charging":
      return (
        <g stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round">
          <rect x={cx - 9} y={cy - 22} width={18} height={44} rx={4} opacity={0.6} />
          <line x1={cx} y1={cy - 22} x2={cx} y2={cy + 22} opacity={0.4} />
        </g>
      );
    case "data-media":
      return (
        <g stroke={ink} strokeWidth={3} fill="none">
          <rect x={cx - 18} y={cy - 12} width={36} height={24} rx={4} opacity={0.6} />
          <line x1={cx - 8} y1={cy + 12} x2={cx - 8} y2={cy + 18} strokeLinecap="round" />
          <line x1={cx + 8} y1={cy + 12} x2={cx + 8} y2={cy + 18} strokeLinecap="round" />
        </g>
      );
    case "dimmers":
      return (
        <g stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round">
          <circle cx={cx} cy={cy} r={24} opacity={0.55} />
          <line x1={cx} y1={cy} x2={cx + 15} y2={cy - 15} />
        </g>
      );
    case "climate":
      return (
        <g stroke={ink} strokeWidth={3} fill="none" strokeLinecap="round">
          <circle cx={cx} cy={cy} r={24} opacity={0.55} />
          <line x1={cx} y1={cy - 12} x2={cx} y2={cy} />
          <line x1={cx} y1={cy} x2={cx + 9} y2={cy + 6} />
        </g>
      );
    case "accessories":
      return (
        <line
          x1={cx}
          y1={70}
          x2={cx}
          y2={130}
          stroke={ink}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.35}
        />
      );
    case "frames":
    default:
      return (
        <rect
          x={cx - 30}
          y={cy - 30}
          width={60}
          height={60}
          rx={8}
          fill="none"
          stroke={ink}
          strokeWidth={2.5}
          opacity={0.5}
        />
      );
  }
}
