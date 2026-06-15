"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// A single photo in the stack. `name` is optional — when omitted the card is
// rendered as a clean image with no caption.
export interface PhotoStackItem {
  src: string;
  name?: string;
}

export interface InteractivePhotoStackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  items: PhotoStackItem[];
  /** Optional caption rendered below the stack. */
  title?: React.ReactNode;
  /**
   * Called with the item index when a card is clicked. When provided, this
   * replaces the built-in "bring to front" behaviour — use it to, e.g., open
   * a full-size lightbox.
   */
  onItemClick?: (index: number) => void;
}

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Scatter the cards across the area on hover, trying to avoid heavy overlap.
// Works for any number of cards (collisions are tolerated once retries run out).
const generateSpreadTransforms = (count: number) => {
  const positions: { x: number; y: number; r: number }[] = [];
  const cardWidthVW = 22; // landscape card footprint, roughly
  const cardHeightVH = 22;
  const maxRetries = 100;

  for (let i = 0; i < count; i++) {
    let newPos = { x: 0, y: 0, r: 0 };
    let collision: boolean;
    let retries = 0;

    do {
      collision = false;
      newPos = { x: random(-38, 38), y: random(-20, 20), r: random(-22, 22) };
      for (const pos of positions) {
        if (
          Math.abs(newPos.x - pos.x) < cardWidthVW &&
          Math.abs(newPos.y - pos.y) < cardHeightVH
        ) {
          collision = true;
          break;
        }
      }
      retries++;
    } while (collision && retries < maxRetries);

    positions.push(newPos);
  }

  return positions.map(
    (p) => `translate(${p.x}vw, ${p.y}vh) rotate(${p.r}deg)`,
  );
};

// Resting-stack tilts, cycled by depth so any number of cards stays varied.
const baseRotations = [
  "rotate-2",
  "-rotate-2",
  "rotate-4",
  "-rotate-4",
  "rotate-6",
  "-rotate-6",
];

const InteractivePhotoStack = React.forwardRef<
  HTMLDivElement,
  InteractivePhotoStackProps
>(({ items, title, onItemClick, className, ...props }, ref) => {
  const [topCardIndex, setTopCardIndex] = React.useState(0);
  const [isGroupHovered, setIsGroupHovered] = React.useState(false);
  const [clickedIndex, setClickedIndex] = React.useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [spreadTransforms, setSpreadTransforms] = React.useState<string[]>([]);

  const numItems = items.length;

  const handleMouseEnter = () => {
    // Fresh random scatter each time the pointer enters.
    setSpreadTransforms(generateSpreadTransforms(numItems));
    setIsGroupHovered(true);
  };

  const handleCardClick = (index: number) => {
    if (onItemClick) {
      onItemClick(index);
      return;
    }
    if (isGroupHovered) {
      setClickedIndex(index);
      setTimeout(() => {
        setIsGroupHovered(false);
        setTopCardIndex(index);
        setClickedIndex(null);
      }, 700);
    } else {
      setTopCardIndex(index);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-12",
        className,
      )}
      {...props}
    >
      <div
        className="relative h-[26rem] w-full overflow-hidden [perspective:1200px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          setHoveredIndex(null);
          if (clickedIndex === null) setIsGroupHovered(false);
        }}
      >
        <div className="relative left-1/2 top-1/2 h-48 w-80 -translate-x-1/2 -translate-y-1/2">
          {items.map((item, index) => {
            const isTopCard = index === topCardIndex;
            let stackPosition = index - topCardIndex;
            if (stackPosition < 0) stackPosition += numItems;
            const isClicked = index === clickedIndex;
            const transform = isGroupHovered
              ? spreadTransforms[index]
              : `translateY(${stackPosition * 0.4}rem) scale(${Math.max(
                  1 - stackPosition * 0.04,
                  0.55,
                )})`;

            return (
              <div
                key={item.src}
                onClick={() => handleCardClick(index)}
                onMouseEnter={() => isGroupHovered && setHoveredIndex(index)}
                className={cn(
                  // Transition only transform-related props — NOT `all`.
                  // `transition-all` also animates `z-index` (an integer-
                  // interpolated property), so on every hover/spread the
                  // stacking order would slide through intermediate values and
                  // cards would cross each other mid-animation — the "blink".
                  // Scoping to transform keeps movement smooth while z-index
                  // switches instantly.
                  "absolute inset-0 h-48 w-80 cursor-pointer rounded-xl bg-card p-2 shadow-lg transition-transform duration-500 ease-in-out",
                  {
                    "rotate-0": isGroupHovered,
                    [baseRotations[stackPosition % baseRotations.length]]:
                      !isGroupHovered && !isTopCard,
                    "hover:scale-110": isGroupHovered && !isClicked,
                    "animate-spin-y": isClicked,
                  },
                )}
                style={{
                  transform,
                  zIndex: isClicked
                    ? 200
                    : isGroupHovered
                      ? // Lift the hovered card above the flat spread plane so
                        // the scaled-up card never dips behind an overlapping
                        // neighbour (the source of the stacking "blink").
                        index === hoveredIndex
                        ? 150
                        : 100
                      : isTopCard
                        ? numItems
                        : numItems - stackPosition,
                }}
              >
                <div className="flex h-full w-full flex-col items-center justify-start">
                  <div className="relative w-full flex-grow overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.name ?? ""}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {item.name && (
                    <div className="flex h-9 shrink-0 items-center justify-center">
                      <p className="font-serif text-lg italic text-foreground">
                        {item.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {title && (
        <h3 className="text-center text-2xl font-bold text-foreground">
          {title}
        </h3>
      )}
    </div>
  );
});

InteractivePhotoStack.displayName = "InteractivePhotoStack";

export { InteractivePhotoStack };
