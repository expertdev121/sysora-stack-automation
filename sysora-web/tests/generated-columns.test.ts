import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * No insert may supply a generated column.
 *
 * Postgres computes these and rejects any insert that provides one,
 * with 428C9. The failure is quiet in a Supabase client: the error
 * comes back in the result rather than thrown, so code that only logs
 * it carries on and the row is never written.
 *
 * This has happened twice. `requests.reference` failed loudly in a
 * seed script, and `users.email_normalized` broke every portal account
 * for two days without anybody noticing, because the webhook that
 * followed still reported success.
 *
 * The list is maintained by hand. A new generated column belongs here
 * the day it is added, which this comment is the reminder for. The
 * query that produced it:
 *
 *   select table_name, column_name from information_schema.columns
 *    where table_schema = 'sales' and is_generated = 'ALWAYS';
 */
const GENERATED = ["email_normalized", "reference"];

const SRC = path.resolve(__dirname, "../src");

function sourceFiles(dir = SRC): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

/** The body of every `.insert({ ... })` call, roughly. */
function insertBodies(source: string): { line: number; body: string }[] {
  const out: { line: number; body: string }[] = [];
  const re = /\.insert\(\s*\{/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(source))) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < source.length && depth > 0) {
      if (source[i] === "{") depth += 1;
      if (source[i] === "}") depth -= 1;
      i += 1;
    }
    out.push({
      line: source.slice(0, m.index).split("\n").length,
      body: source.slice(m.index, i),
    });
  }
  return out;
}

describe("generated columns", () => {
  it("are never supplied to an insert", () => {
    const offences: string[] = [];

    for (const file of sourceFiles()) {
      const source = readFileSync(file, "utf8");
      if (!source.includes(".insert(")) continue;

      for (const { line, body } of insertBodies(source)) {
        for (const column of GENERATED) {
          // A key, not a mention: `email_normalized:` assigns it,
          // `.eq("email_normalized", x)` reads it and is fine.
          if (new RegExp(`(^|[\\s,{])${column}\\s*:`).test(body)) {
            offences.push(
              `${path.relative(SRC, file)}:${line} inserts the generated column "${column}"`,
            );
          }
        }
      }
    }

    expect(offences).toEqual([]);
  });
});
