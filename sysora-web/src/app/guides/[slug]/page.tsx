import type { Metadata } from "next";

import { guides } from "@/content/articles";
import { ArticleRoute, articleMetadata } from "@/lib/article-page";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata("guide", slug);
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleRoute kind="guide" slug={slug} />;
}
