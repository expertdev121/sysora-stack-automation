import { ArticleGrid } from "@/components/content/ArticleGrid";
import { ContentShell, PageCta } from "@/components/content/ContentShell";
import { services } from "@/content/articles";
import { PAGES_UPDATED, servicesHub as page } from "@/content/pages";
import { itemList, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const PATH = "/services";

export const metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: PATH,
  og: "services",
});

/**
 * The services hub. This was a 308 to the homepage after the fixed-price
 * catalogue was retired. It is a real page again, but not the same page:
 * it lists the work and sells it by the hour, with no prices of its own.
 */
export default function ServicesPage() {
  const crumbs = [{ name: "Services", path: PATH }];

  return (
    <ContentShell
      graph={pageGraph({
        path: PATH,
        name: `${page.meta.title} | Sysora Stack`,
        description: page.meta.description,
        type: "CollectionPage",
        og: "services",
        crumbs,
        extra: [itemList(services)],
      })}
      trail={crumbs}
      eyebrow={page.eyebrow}
      title={page.title}
      answer={page.answer}
      updated={PAGES_UPDATED}
      wide
    >
      <ArticleGrid items={services} />
      <PageCta />
    </ContentShell>
  );
}
