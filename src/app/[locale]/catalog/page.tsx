import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/layout/Section";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getProducts, getCategories, getFinishes, getAllGangs } from "@/lib/catalog";
import type {
  CategoryId,
  FinishId,
  ProductKind,
  Product,
  Category,
  Finish,
} from "@/data/catalog";

const KINDS: ProductKind[] = ["mechanism", "cover", "frame"];

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const [categories, finishes, allGangs] = await Promise.all([
    getCategories(),
    getFinishes(),
    getAllGangs(),
  ]);
  const categoryIds = new Set(categories.map((c) => c.id));
  const finishIds = new Set(finishes.map((f) => f.id));
  const gangs = new Set(allGangs.map(String));

  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const categoryRaw = first(sp.category);
  const kindRaw = first(sp.kind);
  const finishRaw = first(sp.finish);
  const gangRaw = first(sp.gang);

  const category =
    categoryRaw && categoryIds.has(categoryRaw as CategoryId)
      ? (categoryRaw as CategoryId)
      : undefined;
  const kind =
    kindRaw && KINDS.includes(kindRaw as ProductKind)
      ? (kindRaw as ProductKind)
      : undefined;
  const finish =
    finishRaw && finishIds.has(finishRaw as FinishId)
      ? (finishRaw as FinishId)
      : undefined;
  const gang = gangRaw && gangs.has(gangRaw) ? Number(gangRaw) : undefined;

  const products = await getProducts({ category, kind, finish, gang });

  return (
    <CatalogContent
      count={products.length}
      products={products}
      categories={categories}
      finishes={finishes}
      gangs={allGangs}
    />
  );
}

function CatalogContent({
  count,
  products,
  categories,
  finishes,
  gangs,
}: {
  count: number;
  products: Product[];
  categories: Category[];
  finishes: Finish[];
  gangs: number[];
}) {
  const t = useTranslations("catalog");

  return (
    <Section className="py-10 sm:py-12">
      <header className="border-b border-border pb-8">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <CatalogFilters
          categories={categories}
          finishes={finishes}
          gangs={gangs}
        />

        <div>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("results", { count })}
            </p>
          </div>

          {count === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
