import type { JsonLd as JsonLdData } from "@/lib/seo";

/**
 * Renders structured data as a JSON-LD script tag.
 *
 * Accepts an array so a page can emit its whole graph (product + breadcrumb,
 * say) in a single tag. `<` is escaped because a stray `</script` inside any
 * catalogue string would otherwise close the tag early.
 */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  const json = JSON.stringify(data).replace(/</g, "\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
