import type { Metadata } from "next";

import { services } from "@/content/articles";
import { ArticleRoute, articleMetadata } from "@/lib/article-page";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata("service", slug);
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleRoute kind="service" slug={slug} />;
}
