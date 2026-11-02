import { homeGraph } from "@/lib/schema";

/**
 * Renders a JSON-LD graph.
 *
 * `<` is escaped as the Next.js guide recommends. Everything here comes
 * from our own constants, but a stray `</script>` in copy would otherwise
 * end the tag and spill the rest of the graph into the page.
 */
export function JsonLd({ graph }: { graph: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}

export function HomeStructuredData() {
  return <JsonLd graph={homeGraph()} />;
}
