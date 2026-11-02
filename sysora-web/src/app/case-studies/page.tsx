import { ArticleGrid } from "@/components/content/ArticleGrid";
import { ContentShell, PageCta } from "@/components/content/ContentShell";
import { caseStudies } from "@/content/articles";
import { PAGES_UPDATED, caseStudiesHub as page } from "@/content/pages";
import { itemList, pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const PATH = "/case-studies";

export const metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: PATH,
  og: "case-studies",
});

export default function CaseStudiesPage() {
  const crumbs = [{ name: "Case studies", path: PATH }];

  return (
    <ContentShell
      graph={pageGraph({
        path: PATH,
        name: `${page.meta.title} | Sysora Stack`,
        description: page.meta.description,
        type: "CollectionPage",
        og: "case-studies",
        crumbs,
        extra: [itemList(caseStudies)],
      })}
      trail={crumbs}
      eyebrow={page.eyebrow}
      title={page.title}
      answer={page.answer}
      updated={PAGES_UPDATED}
      wide
    >
      <ArticleGrid items={caseStudies} />
      <PageCta />
    </ContentShell>
  );
}
