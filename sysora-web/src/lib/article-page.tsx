import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/content/ArticleBody";
import { ContentShell } from "@/components/content/ContentShell";
import { articlePath, findArticle, type ArticleKind } from "@/content/articles";
import { articleCrumbs, articleGraph, articleOg } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

/**
 * What the three [slug] routes have in common, so that a service, a guide
 * and a case study cannot end up with different metadata or schema.
 */

export function articleMetadata(kind: ArticleKind, slug: string): Metadata {
  const article = findArticle(kind, slug);
  if (!article) return {};

  return pageMetadata({
    title: article.metaTitle,
    description: article.description,
    path: articlePath(article),
    og: articleOg(article),
    type: article.kind === "service" ? "website" : "article",
    publishedTime: article.published,
    modifiedTime: article.modified,
  });
}

export function ArticleRoute({ kind, slug }: { kind: ArticleKind; slug: string }) {
  const article = findArticle(kind, slug);
  if (!article) notFound();

  return (
    <ContentShell
      graph={articleGraph(article)}
      trail={articleCrumbs(article)}
      eyebrow={article.eyebrow}
      title={article.title}
      answer={article.answer}
      updated={article.modified}
    >
      <ArticleBody article={article} />
    </ContentShell>
  );
}
