import type { Metadata } from "next";

import { caseStudies } from "@/content/articles";
import { ArticleRoute, articleMetadata } from "@/lib/article-page";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata("case-study", slug);
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  return <ArticleRoute kind="case-study" slug={slug} />;
}
