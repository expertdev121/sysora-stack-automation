import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { packs, DEFAULT_PACK, faq, refund, hero, checkout } from "@/content/landing/sales";

/**
 * The offer itself, and the promises made about it.
 *
 * Prices are quoted in several places that nothing links together: the
 * pack table, the hero, the FAQ, the terms. The cancellation terms were
 * contradictory across four of them once, which is the failure this
 * guards against.
 */

describe("the pack table", () => {
  it("is the seven published sizes", () => {
    expect(packs.map((p) => p.hours)).toEqual([5, 10, 25, 50, 75, 100, 150]);
  });

  it("prices every pack at its stated hourly rate", () => {
    for (const pack of packs) {
      expect(pack.price, `${pack.hours}h`).toBe(pack.hours * pack.rate);
    }
  });

  it("gets cheaper per hour as the pack grows, never dearer", () => {
    const rates = packs.map((p) => p.rate);
    expect(rates).toEqual([...rates].sort((a, b) => b - a));
  });

  it("runs from the advertised $19 down to the advertised $13", () => {
    expect(packs[0].rate).toBe(19);
    expect(packs[packs.length - 1].rate).toBe(13);
  });

  it("opens the calculator on a pack that exists", () => {
    expect(packs[DEFAULT_PACK]).toBeDefined();
  });
});

describe("cancellation terms agree everywhere", () => {
  // The terms require 24 hours notice. Any place that describes
  // cancelling has to say so, or the site contradicts its own contract.
  const NOTICE = /24 hours/;

  it("the hero bullet says it", () => {
    const bullet = hero.bullets.find((b: string) => /cancel/i.test(b));
    expect(bullet, "no cancellation bullet in the hero").toBeTruthy();
    expect(bullet).toMatch(NOTICE);
  });

  it("the checkout summary says it", () => {
    const line = checkout.summary.bullets.find((t: string) => /cancel/i.test(t));
    expect(line, "no cancellation line in the checkout summary").toBeTruthy();
    expect(line).toMatch(NOTICE);
  });

  it("the cancellation FAQ says it", () => {
    const entry = faq.items.find((i) => /cancel a monthly plan/i.test(i.q));
    expect(entry, "the cancellation FAQ is gone").toBeTruthy();
    expect(entry!.a).toMatch(NOTICE);
  });

  it("the refund rule for monthly plans says it", () => {
    const rule = refund.rules.find((r) => /cancelling a monthly plan/i.test(r.label));
    expect(rule, "the monthly cancellation rule is gone").toBeTruthy();
    expect(rule!.body).toMatch(NOTICE);
  });
});

describe("claims we cannot make", () => {
  /**
   * Marketing copy only. The privacy policy states statutory response
   * windows, "we respond within 45 days" and similar, because data
   * protection law requires them to be published. Those are obligations
   * we are under, not service promises we are making.
   */
  const CONTENT = path.resolve(__dirname, "../src/content/landing");

  function files(dir = CONTENT): string[] {
    return readdirSync(dir).flatMap((e) => {
      const full = path.join(dir, e);
      if (statSync(full).isDirectory()) return files(full);
      return full.endsWith(".ts") ? [full] : [];
    });
  }

  it("promises no response time or business-day window", () => {
    // A response-time promise is the one claim the business has
    // explicitly refused to make, because none has been operationalised.
    const BAD = [
      /within \d+ (minutes|hours|business days)/i,
      /respond within/i,
      /\b\d+\s*(?:to|-)\s*\d+\s*business days\b/i,
      /guaranteed response/i,
    ];
    const hits: string[] = [];
    for (const file of files()) {
      const text = readFileSync(file, "utf8");
      text.split("\n").forEach((line, i) => {
        if (line.trim().startsWith("*") || line.trim().startsWith("//")) return;
        for (const re of BAD) {
          if (re.test(line)) hits.push(`${path.basename(file)}:${i + 1}: ${line.trim().slice(0, 90)}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });

  it("keeps the 60-day pack validity consistent", () => {
    const entry = faq.items.find((i) => /roll over/i.test(i.q));
    expect(entry!.a).toMatch(/60 days/);
  });
});

describe("the FAQ", () => {
  it("has no empty entries", () => {
    for (const item of faq.items) {
      expect(item.q.trim().length, item.q).toBeGreaterThan(5);
      expect(item.a.trim().length, item.q).toBeGreaterThan(20);
    }
  });

  it("asks each question once", () => {
    const seen = faq.items.map((i) => i.q.toLowerCase().trim());
    expect(new Set(seen).size).toBe(seen.length);
  });
});
