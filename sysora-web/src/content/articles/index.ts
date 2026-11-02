import { caseStudies } from "./case-studies";
import { guidesA } from "./guides-a";
import { guidesB } from "./guides-b";
import { services } from "./services";
import { articlePath, type Article, type ArticleKind } from "./types";

export { caseStudies, services };
export * from "./types";

export const guides: readonly Article[] = [...guidesA, ...guidesB];

export const allArticles: readonly Article[] = [...services, ...guides, ...caseStudies];

export function findArticle(kind: ArticleKind, slug: string): Article | undefined {
  return allArticles.find((a) => a.kind === kind && a.slug === slug);
}

export function findByPath(path: string): Article | undefined {
  return allArticles.find((a) => articlePath(a) === path);
}
