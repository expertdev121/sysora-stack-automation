import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Links point at routes that exist.
 *
 * Next resolves a route from the directory tree, so a link to a page
 * that was deleted or renamed compiles, builds, deploys and 404s. The
 * services catalogue was deleted and its links had to be found by
 * crawling production. This finds them before the push instead.
 */

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "src/app");

/** Every route the app directory defines, as a URL path. */
function routes(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        // Route groups and private folders are not path segments.
        if (entry.startsWith("_")) continue;
        walk(full);
      } else if (entry === "page.tsx" || entry === "route.ts") {
        const rel = path.relative(APP, path.dirname(full));
        const url = "/" + rel.split(path.sep).filter((s) => !s.startsWith("(")).join("/");
        out.push(url === "/" ? "/" : url.replace(/\/$/, ""));
      }
    }
  };
  walk(APP);
  return out;
}

const ROUTES = routes();

function stripQuery(href: string): string {
  return href.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
}

function matches(href: string): boolean {
  const target = stripQuery(href);
  return ROUTES.some((route) => {
    if (route === target) return true;
    const r = route.split("/");
    const t = target.split("/");
    if (r.length !== t.length) return false;
    return r.every((seg, i) => (seg.startsWith("[") && seg.endsWith("]")) || seg === t[i]);
  });
}

/** Internal hrefs written anywhere in src, excluding comments. */
function internalLinks(): { file: string; line: number; href: string }[] {
  const found: { file: string; line: number; href: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(entry)) continue;
      readFileSync(full, "utf8").split("\n").forEach((line, i) => {
        const t = line.trim();
        if (t.startsWith("*") || t.startsWith("//")) return;
        for (const m of line.matchAll(/href[=:]\s*["'`](\/[^"'`${}]*)["'`]/g)) {
          found.push({ file: path.relative(ROOT, full), line: i + 1, href: m[1] });
        }
      });
    }
  };
  walk(path.join(ROOT, "src"));
  return found;
}

describe("routes", () => {
  it("the app directory defines the pages we expect", () => {
    for (const expected of ["/", "/checkout/hours", "/terms", "/privacy-policy", "/contact", "/portal", "/admin"]) {
      expect(ROUTES, `${expected} is missing`).toContain(expected);
    }
  });

  it("every internal link resolves to a route", () => {
    const broken = internalLinks()
      .filter((l) => !l.href.startsWith("/_next") && !/\.(svg|png|jpg|ico|webmanifest|xml|txt)$/.test(l.href))
      .filter((l) => !matches(l.href))
      .map((l) => `${l.file}:${l.line} -> ${l.href}`);
    expect([...new Set(broken)]).toEqual([]);
  });

  it("uses only the published checkout URL shape", () => {
    const ALLOWED = /^\/checkout\/hours$/;
    const bad = internalLinks()
      .filter((l) => l.href.startsWith("/checkout/"))
      .filter((l) => !ALLOWED.test(stripQuery(l.href)))
      .map((l) => `${l.file}:${l.line} -> ${l.href}`);
    // /checkout/[reference] is reached by redirect from the server, not
    // by a link, so a hard-coded one is a mistake.
    expect([...new Set(bad)]).toEqual([]);
  });

  it("links to no page that was deleted", () => {
    const GONE = ["/services", "/about", "/systems-review", "/systems-team", "/build-request"];
    const resurrected = internalLinks()
      .filter((l) => GONE.some((g) => stripQuery(l.href) === g || stripQuery(l.href).startsWith(g + "/")))
      .map((l) => `${l.file}:${l.line} -> ${l.href}`);
    expect([...new Set(resurrected)]).toEqual([]);
  });
});

describe("migrations", () => {
  it("are committed alongside the code", () => {
    const dir = path.resolve(ROOT, "../supabase/migrations");
    expect(existsSync(dir)).toBe(true);
    const files = readdirSync(dir).filter((f) => f.endsWith(".sql"));
    expect(files.length).toBeGreaterThan(0);
    // A timestamp prefix is what orders them, so one without is a file
    // that will apply in an undefined position.
    for (const f of files) expect(f, f).toMatch(/^\d{14}_/);
  });
});
