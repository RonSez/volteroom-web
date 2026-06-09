"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { FinishId } from "@/data/catalog";

export interface BasketItem {
  /** Stable line id: slug + finish + gang. */
  id: string;
  slug: string;
  /** Selected finish — omitted for mechanisms (colour-independent). */
  finishId?: FinishId;
  gang?: number;
  qty: number;
}

interface BasketState {
  items: BasketItem[];
  addItem: (item: Omit<BasketItem, "id" | "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

function lineId(slug: string, finishId?: FinishId, gang?: number) {
  return `${slug}__${finishId ?? "_"}__${gang ?? 0}`;
}

export const useBasket = create<BasketState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, qty = 1) =>
        set((state) => {
          const id = lineId(item.slug, item.finishId, item.gang);
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, id, qty }] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "volteroom-basket" },
  ),
);

/** Total quantity across all lines. */
export function useBasketCount(): number {
  return useBasket((s) => s.items.reduce((n, i) => n + i.qty, 0));
}

const emptySubscribe = () => () => {};

/**
 * Avoids hydration mismatches for persisted state: returns false on the server
 * and during hydration, true once running on the client.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
