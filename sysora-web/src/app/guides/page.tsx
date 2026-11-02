import { ArticleGrid } from "@/components/content/ArticleGrid";
import { ContentShell, PageCta } from "@/components/content/ContentShell";
import { guides } from "@/content/articles";
import { PAGES_UPDATED, guidesHub as page } from "@/content/pages";
import { itemList, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const PATH = "/guides";

export const metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: PATH,
  og: "guides",
});

export default function GuidesPage() {
  const crumbs = [{ name: "Guides", path: PATH }];

  return (
    <ContentShell
      graph={pageGraph({
        path: PATH,
        name: `${page.meta.title} | Sysora Stack`,
        description: page.meta.description,
        type: "CollectionPage",
        og: "guides",
        crumbs,
        extra: [itemList(guides)],
      })}
      trail={crumbs}
      eyebrow={page.eyebrow}
      title={page.title}
      answer={page.answer}
      updated={PAGES_UPDATED}
      wide
    >
      <ArticleGrid items={guides} />
      <PageCta />
    </ContentShell>
  );
}
