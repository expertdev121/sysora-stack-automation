import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * The house style, enforced rather than remembered.
 *
 * These rules were swept by hand once and the sweep found violations in
 * places nobody thinks to look, including a title template that put an
 * em-dash on every page in the site. A rule that lives only in a
 * document comes back.
 *
 * Scope is the customer-facing copy under src/content, not the whole
 * tree: an em-dash in a code comment is fine and a semicolon in
 * TypeScript is syntax.
 */

const CONTENT = path.resolve(__dirname, "../src/content");
const EM_DASH = "—";

const BANNED = [
  "genuinely", "honestly", "actually", "really", "truly", "delve", "robust",
  "seamless", "holistic", "nuanced", "resonate", "journey", "foster",
  "comprehensive", "meticulous", "furthermore", "moreover", "synergy",
  "ecosystem", "revolutionary", "game-changing", "cutting-edge",
  "best-in-class", "digital transformation", "unpack", "deep dive", "utilize",
];

function contentFiles(dir = CONTENT): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return contentFiles(full);
    return full.endsWith(".ts") ? [full] : [];
  });
}

/**
 * Prose inside double quotes, long enough to be copy rather than a key.
 *
 * `quoted` marks a literal that is itself wrapped in quotation marks in
 * the source, as in `quote: '"Genuinely top notch work"'`. That is a
 * client speaking, and a client's own words are reproduced verbatim or
 * not at all, so the style rules do not apply to them.
 */
function stringLiterals(source: string): { line: number; text: string; quoted: boolean }[] {
  const out: { line: number; text: string; quoted: boolean }[] = [];
  source.split("\n").forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("*") || trimmed.startsWith("//")) return;
    for (const m of line.matchAll(/"((?:[^"\\]|\\.){12,})"/g)) {
      const before = line[m.index! - 1];
      const after = line[m.index! + m[0].length];
      out.push({
        line: i + 1,
        text: m[1],
        quoted: (before === "'" && after === "'") || m[1].trimStart().startsWith("“"),
      });
    }
  });
  return out;
}

const files = contentFiles();

describe("customer-facing copy", () => {
  it("finds content files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const rel = path.relative(path.resolve(__dirname, ".."), file);
    const literals = stringLiterals(readFileSync(file, "utf8"));

    it(`${rel} has no em-dashes`, () => {
      const hits = literals
        .filter((l) => l.text.includes(EM_DASH))
        .map((h) => `line ${h.line}: ${h.text.slice(0, 80)}`);
      expect(hits).toEqual([]);
    });

    it(`${rel} has no semicolons in prose`, () => {
      const hits = literals
        .filter((l) => l.text.includes(";") && !l.text.includes("&"))
        .map((h) => `line ${h.line}: ${h.text.slice(0, 80)}`);
      expect(hits).toEqual([]);
    });

    it(`${rel} uses no banned words`, () => {
      const hits: string[] = [];
      for (const { line, text, quoted } of literals) {
        if (quoted) continue;
        for (const word of BANNED) {
          if (new RegExp(`(?<![a-z])${word}(?![a-z])`, "i").test(text)) {
            hits.push(`line ${line}: [${word}] ${text.slice(0, 70)}`);
          }
        }
      }
      expect(hits).toEqual([]);
    });
  }
});
