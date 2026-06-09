import Image from "next/image";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { locales, type Locale } from "@/i18n/routing";
import { getSlideImages } from "@/lib/slideshow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "../../_components/SubmitButton";
import { uploadSlideImage, saveSlideText } from "./actions";
import enMessages from "@/messages/en.json";
import skMessages from "@/messages/sk.json";
import csMessages from "@/messages/cs.json";

const SLOTS = [1, 2, 3] as const;
const FIELDS = ["title", "caption"] as const;

interface SlideText {
  title: string;
  caption: string;
}

// JSON message files are the structural defaults / fallback for the copy.
const DEFAULTS: Record<Locale, SlideText[]> = {
  sk: (skMessages as { home: { switchShowcase: { items: SlideText[] } } }).home
    .switchShowcase.items,
  en: (enMessages as { home: { switchShowcase: { items: SlideText[] } } }).home
    .switchShowcase.items,
  cs: (csMessages as { home: { switchShowcase: { items: SlideText[] } } }).home
    .switchShowcase.items,
};

const keyFor = (i: number, field: string) =>
  `home.switchShowcase.items.${i}.${field}`;

export default async function SlideshowPage() {
  const supabase = await createClient();

  // Current images (uploaded or static fallback) and DB copy overrides.
  const [images, { data: copyRows }] = await Promise.all([
    getSlideImages(),
    supabase
      .from("marketing_copy")
      .select("key, locale, value")
      .like("key", "home.switchShowcase.items.%"),
  ]);

  // key -> locale -> value
  const dbValue = new Map<string, Record<string, string>>();
  for (const r of (copyRows ?? []) as {
    key: string;
    locale: string;
    value: string;
  }[]) {
    const entry = dbValue.get(r.key) ?? {};
    entry[r.locale] = r.value;
    dbValue.set(r.key, entry);
  }

  const valueFor = (i: number, field: (typeof FIELDS)[number], locale: Locale) =>
    dbValue.get(keyFor(i, field))?.[locale] ??
    DEFAULTS[locale]?.[i]?.[field] ??
    "";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Slideshow</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        The three “switch” slides shown at the bottom of the homepage. Replace a
        picture or edit its title and caption (in all three languages); changes
        go live immediately.
      </p>

      {/* Images ------------------------------------------------------------ */}
      <h2 className="mb-4 font-heading text-base font-semibold">Pictures</h2>
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {SLOTS.map((slot, i) => (
          <div
            key={slot}
            className="space-y-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Slide {slot}</span>
              <span className="text-xs text-muted-foreground">
                {i % 2 === 1 ? "image right" : "image left"}
              </span>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
              <Image
                src={images[i]}
                alt={`Slide ${slot}`}
                fill
                sizes="300px"
                className="object-cover"
              />
            </div>
            <form
              action={uploadSlideImage.bind(null, slot)}
              className="space-y-2"
            >
              <Label htmlFor={`file-${slot}`} className="sr-only">
                Replace image
              </Label>
              <Input
                id={`file-${slot}`}
                type="file"
                name="file"
                accept="image/*"
                required
              />
              <SubmitButton className="w-full">
                <Upload className="size-4" />
                Replace
              </SubmitButton>
            </form>
          </div>
        ))}
      </div>

      {/* Text -------------------------------------------------------------- */}
      <h2 className="mb-4 font-heading text-base font-semibold">Title & caption</h2>
      <form action={saveSlideText} className="space-y-6">
        {SLOTS.map((slot, i) => (
          <div key={slot} className="rounded-xl border border-border bg-card p-4">
            <p className="mb-4 text-sm font-medium">Slide {slot}</p>
            {FIELDS.map((field) => (
              <div key={field} className="mb-4 last:mb-0">
                <p className="mb-2 font-mono text-xs capitalize text-muted-foreground">
                  {field}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {locales.map((locale) => (
                    <label key={locale} className="space-y-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {locale.toUpperCase()}
                      </span>
                      <Textarea
                        name={`v:${locale}:${keyFor(i, field)}`}
                        defaultValue={valueFor(i, field, locale)}
                        rows={field === "caption" ? 3 : 1}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="sticky bottom-4 flex justify-end">
          <SubmitButton className="shadow-lg">Save changes</SubmitButton>
        </div>
      </form>
    </div>
  );
}
