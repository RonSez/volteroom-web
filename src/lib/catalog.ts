import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/routing";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Product,
  Category,
  Finish,
  FinishId,
  CategoryId,
  Localized,
  ProductKind,
  ProductSpecs,
  ProductView,
} from "@/data/catalog";

/**
 * Catalog accessors — the ONLY place the UI reads catalog data from.
 *
 * Data lives in Supabase (the single source of truth). The whole catalog is
 * small, so it's loaded once per request-cache window via `unstable_cache`
 * under the `catalog` tag; admin mutations call `revalidateTag("catalog")` to
 * make edits go live immediately. Per-function derivations run in memory, so
 * the function names/signatures match the old synchronous API — callers only
 * needed to add `await`.
 */

export const CATALOG_TAG = "catalog";

/* ------------------------------------------------------------------ */
/* DB row shapes + mapping to the app's TS types                       */
/* ------------------------------------------------------------------ */

interface FinishRow {
  id: FinishId;
  name: Localized;
  code: string | null;
  hex: string;
  light: boolean;
  sort_order: number;
}

interface CategoryRow {
  id: CategoryId;
  name: Localized;
  tagline: Localized;
  sort_order: number;
}

interface ProductRow {
  id: string;
  slug: string;
  category_id: CategoryId;
  kind: ProductKind;
  name: Localized;
  description: Localized;
  base_price: number | string;
  sku: string | null;
  variant_skus: Record<string, string> | null;
  specs: ProductSpecs | null;
  gangs: number[] | null;
  featured: boolean;
  sort_order: number;
}

interface ProductFinishRow {
  product_id: string;
  finish_id: FinishId;
}

interface ProductImageRow {
  product_id: string;
  storage_path: string;
  view: ProductView | null;
  finish_id: FinishId | null;
  is_primary: boolean;
  sort_order: number;
}

const IMAGE_BUCKET = "product-images";

interface Catalog {
  categories: Category[];
  finishes: Finish[];
  products: Product[];
}

const loadCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const sb = createPublicClient();
    const [catRes, finRes, prodRes, pfRes, imgRes] = await Promise.all([
      sb.from("categories").select("*").order("sort_order"),
      sb.from("finishes").select("*").order("sort_order"),
      sb.from("products").select("*").order("sort_order"),
      sb.from("product_finishes").select("*"),
      sb
        .from("product_images")
        .select("product_id, storage_path, view, finish_id, is_primary, sort_order")
        .order("is_primary", { ascending: false })
        .order("sort_order"),
    ]);

    const firstError =
      catRes.error || finRes.error || prodRes.error || pfRes.error || imgRes.error;
    if (firstError) {
      throw new Error(`Failed to load catalog: ${firstError.message}`);
    }

    // All images per product (primary first, then sort order) → public URLs,
    // keeping the view + finish so the product gallery can swap front photos.
    const imagesByProduct = new Map<string, Product["images"]>();
    for (const row of imgRes.data as ProductImageRow[]) {
      const { data } = sb.storage.from(IMAGE_BUCKET).getPublicUrl(row.storage_path);
      const list = imagesByProduct.get(row.product_id) ?? [];
      list!.push({
        url: data.publicUrl,
        view: row.view ?? undefined,
        finishId: row.finish_id ?? undefined,
        isPrimary: row.is_primary || undefined,
      });
      imagesByProduct.set(row.product_id, list);
    }

    const finishes: Finish[] = (finRes.data as FinishRow[]).map((f) => ({
      id: f.id,
      name: f.name,
      code: f.code ?? "",
      hex: f.hex,
      light: f.light || undefined,
    }));

    const categories: Category[] = (catRes.data as CategoryRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      tagline: c.tagline,
    }));

    // Group explicit finish subsets by product. No rows => "all finishes"
    // (modelled as an undefined `finishes` on the Product, matching the old data).
    const finishesByProduct = new Map<string, FinishId[]>();
    for (const row of pfRes.data as ProductFinishRow[]) {
      const list = finishesByProduct.get(row.product_id) ?? [];
      list.push(row.finish_id);
      finishesByProduct.set(row.product_id, list);
    }
    // Keep explicit subsets in the canonical finish order.
    const finishOrder = new Map(finishes.map((f, i) => [f.id, i]));

    const products: Product[] = (prodRes.data as ProductRow[]).map((p) => {
      const explicit = finishesByProduct.get(p.id);
      const images = imagesByProduct.get(p.id);
      return {
        slug: p.slug,
        category: p.category_id,
        kind: p.kind,
        name: p.name,
        description: p.description,
        basePrice: Number(p.base_price),
        sku: p.sku ?? undefined,
        variantSkus: p.variant_skus ?? undefined,
        specs: p.specs ?? undefined,
        gangs: p.gangs ?? undefined,
        finishes: explicit
          ? [...explicit].sort(
              (a, b) => (finishOrder.get(a) ?? 0) - (finishOrder.get(b) ?? 0),
            )
          : undefined,
        featured: p.featured || undefined,
        imageUrl: images?.[0]?.url,
        images: images && images.length ? images : undefined,
      };
    });

    return { categories, finishes, products };
  },
  ["catalog-all"],
  { tags: [CATALOG_TAG] },
);

/* ------------------------------------------------------------------ */
/* Accessors (same names/signatures as before, now async)              */
/* ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  return (await loadCatalog()).categories;
}

export async function getCategory(id: CategoryId): Promise<Category | undefined> {
  return (await loadCatalog()).categories.find((c) => c.id === id);
}

export async function getFinishes(): Promise<Finish[]> {
  return (await loadCatalog()).finishes;
}

export async function getFinish(id: FinishId): Promise<Finish | undefined> {
  return (await loadCatalog()).finishes.find((f) => f.id === id);
}

/** Finishes available for a product (defaults to all). Mechanisms have none. */
export async function getProductFinishes(product: Product): Promise<Finish[]> {
  if (product.kind === "mechanism") return [];
  const { finishes } = await loadCatalog();
  if (!product.finishes) return finishes;
  return finishes.filter((f) => product.finishes!.includes(f.id));
}

export interface ProductFilter {
  category?: CategoryId;
  finish?: FinishId;
  gang?: number;
  kind?: ProductKind;
}

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const { products, finishes } = await loadCatalog();
  return products.filter((p) => {
    if (filter.category && p.category !== filter.category) return false;
    if (filter.kind && p.kind !== filter.kind) return false;
    if (p.kind === "mechanism" && filter.finish) return false;
    if (filter.finish) {
      const allowed = p.finishes ?? finishes.map((f) => f.id);
      if (!allowed.includes(filter.finish)) return false;
    }
    if (filter.gang) {
      if (!p.gangs || !p.gangs.includes(filter.gang)) return false;
    }
    return true;
  });
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await loadCatalog()).products.find((p) => p.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await loadCatalog()).products.filter((p) => p.featured);
}

export async function getAllProductSlugs(): Promise<string[]> {
  return (await loadCatalog()).products.map((p) => p.slug);
}

/** Distinct gang counts present across the catalog (for filters). */
export async function getAllGangs(): Promise<number[]> {
  const { products } = await loadCatalog();
  const set = new Set<number>();
  for (const p of products) p.gangs?.forEach((g) => set.add(g));
  return [...set].sort((a, b) => a - b);
}

export type { Product, Category, Finish, FinishId, CategoryId, ProductKind };
export type { Locale };
