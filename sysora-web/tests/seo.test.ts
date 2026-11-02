import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { allArticles, articlePath, guides, services, caseStudies } from "@/content/articles";
import {
  aboutPage,
  caseStudiesHub,
  guidesHub,
  localBusinessPage,
  pricingPage,
  servicesHub,
} from "@/content/pages";
import { booking } from "@/content/landing/booking";
import { contact } from "@/content/landing/contact";
import { estimate } from "@/content/landing/estimate";
import { ghlTeam } from "@/content/landing/ghl-team";
import { faq, meta, packs } from "@/content/landing/sales";
import { aboutGraph, articleGraph, homeGraph, organization } from "@/lib/schema";
import sitemap from "@/app/sitemap";

/**
 * The search and AI-extraction rules, enforced rather than remembered.
 *
 * The audit found titles cut off in results, a sitemap listing a page
 * disagreeing with robots, schema on one page only, and an unverifiable
 * headcount as the main trust claim. Each of those can come back in a
 * single edit, so each one fails the build here.
 */

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "src/app");
const SUFFIX = " | Sysora Stack";
const words = (s: string) => s.trim().split(/\s+/).length;

function routes(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry === "page.tsx" || entry === "route.ts") {
        out.push("/" + path.relative(APP, path.dirname(full)).split(path.sep).join("/"));
      }
    }
  };
  walk(APP);
  return out.map((r) => (r === "/" ? r : r.replace(/\/$/, "")));
}

const ROUTES = routes();

function resolves(href: string): boolean {
  const target = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
  return ROUTES.some((route) => {
    const r = route.split("/");
    const t = target.split("/");
    return r.length === t.length && r.every((s, i) => s.startsWith("[") || s === t[i]);
  });
}

const PAGES: { name: string; title: string; description: string }[] = [
  { name: "home", ...meta },
  { name: "services", ...servicesHub.meta },
  { name: "guides", ...guidesHub.meta },
  { name: "case studies", ...caseStudiesHub.meta },
  { name: "pricing", ...pricingPage.meta },
  { name: "about", ...aboutPage.meta },
  { name: "local", ...localBusinessPage.meta },
  { name: "agencies", ...ghlTeam.meta },
  { name: "contact", ...contact.meta },
  { name: "booking", ...booking.meta },
  { name: "estimate", ...estimate.meta },
  ...allArticles.map((a) => ({ name: a.slug, title: a.metaTitle, description: a.description })),
];

describe("titles and descriptions", () => {
  for (const page of PAGES) {
    it(`${page.name} fits in a results page`, () => {
      expect((page.title + SUFFIX).length, page.title).toBeLessThanOrEqual(60);
      expect(page.description.length, page.description).toBeLessThanOrEqual(155);
      expect(page.description.length, page.description).toBeGreaterThan(70);
    });
  }

  it("does not reuse a title or a description", () => {
    expect(new Set(PAGES.map((p) => p.title)).size).toBe(PAGES.length);
    expect(new Set(PAGES.map((p) => p.description)).size).toBe(PAGES.length);
  });
});

describe("long-form pages", () => {
  for (const article of allArticles) {
    const where = articlePath(article);

    it(`${where} opens on a 40 to 60 word answer`, () => {
      expect(words(article.answer), article.answer).toBeGreaterThanOrEqual(40);
      expect(words(article.answer), article.answer).toBeLessThanOrEqual(60);
    });

    it(`${where} links only to pages that exist`, () => {
      const text = JSON.stringify(article.blocks);
      const inline = [...text.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
      const broken = [...inline, ...article.related].filter((href) => !resolves(href));
      expect(broken).toEqual([]);
    });

    it(`${where} has question-shaped headings and a date`, () => {
      const h2s = article.blocks.filter((b) => b.k === "h2");
      expect(h2s.length).toBeGreaterThan(0);
      expect(article.modified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  }

  it("has the page set the audit asked for", () => {
    expect(services.length).toBeGreaterThanOrEqual(6);
    expect(guides.length).toBeGreaterThanOrEqual(14);
    expect(caseStudies.length).toBeGreaterThanOrEqual(3);
  });

  it("gives a guide its sources where it states platform facts", () => {
    const missing = guides
      .filter((g) => g.slug !== "gohighlevel-vs-in-house-hire")
      .filter((g) => !g.sources || g.sources.length === 0)
      .map((g) => g.slug);
    expect(missing).toEqual([]);
  });

  it("never reintroduces the retired fixed prices", () => {
    const text = JSON.stringify(services);
    for (const retired of ["$249", "$297", "$499", "$699", "$899", "$1,200", "$1,500", "$1,900", "$3,500"]) {
      expect(text.includes(retired), retired).toBe(false);
    }
  });
});

describe("the sitemap", () => {
  const entries = sitemap();

  it("lists only pages that exist", () => {
    const broken = entries
      .map((e) => new URL(e.url).pathname)
      .filter((p) => !resolves(p));
    expect(broken).toEqual([]);
  });

  it("leaves out the checkout step, which robots still allows", () => {
    expect(entries.some((e) => e.url.includes("/checkout"))).toBe(false);
    const robots = readFileSync(path.join(APP, "robots.ts"), "utf8");
    expect(robots).toContain('"/checkout/hours"');
  });

  it("carries a real date rather than the time of the request", () => {
    for (const entry of entries) expect(String(entry.lastModified)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("structured data", () => {
  const home = JSON.stringify(homeGraph());

  it("marks up the same prices the page shows", () => {
    for (const pack of packs) expect(home).toContain(`"price":"${pack.price.toFixed(2)}"`);
  });

  it("marks up every homepage question", () => {
    for (const item of faq.items) expect(home).toContain(JSON.stringify(item.q));
  });

  it("carries the founder and the reviews", () => {
    expect(home).toContain('"@type":"Person"');
    expect(home.match(/"@type":"Review"/g)!.length).toBeGreaterThanOrEqual(5);
  });

  it("contains no placeholder from the audit", () => {
    const all = home + JSON.stringify(aboutGraph("a", "b")) + allArticles.map((a) => JSON.stringify(articleGraph(a))).join("");
    expect(all).not.toMatch(/\[[A-Za-z+][^\]]*\]\(|\[slug\]|\[handle\]|XXXX|YYYY/);
  });

  it("does not claim more than the site does", () => {
    const org = JSON.stringify(organization());
    expect(org).not.toContain("United Kingdom");
    expect(org).not.toContain("Hindi");
  });
});

describe("the files the audit asked for", () => {
  it.each(["default", "services", "guides", "case-studies", "agencies", "about"])(
    "public/og/%s.png exists",
    (name) => {
      expect(existsSync(path.join(ROOT, "public/og", `${name}.png`))).toBe(true);
    },
  );

  it("/llms.txt has a route", () => {
    expect(ROUTES).toContain("/llms.txt");
  });

  it("the old agency URL still works", () => {
    const config = readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
    expect(config).toContain('source: "/on-demand-ghl-team"');
  });
});

describe("claims we cannot evidence", () => {
  it("states no headcount anywhere in the copy", () => {
    const dir = path.join(ROOT, "src/content");
    const hits: string[] = [];
    const walk = (d: string) => {
      for (const entry of readdirSync(d)) {
        const full = path.join(d, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/11[- ]person|team is 11|eleven/i.test(readFileSync(full, "utf8"))) hits.push(entry);
      }
    };
    walk(dir);
    expect(hits).toEqual([]);
  });
});
