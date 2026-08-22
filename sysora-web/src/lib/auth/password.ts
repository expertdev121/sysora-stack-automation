import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

import { MIN_PASSWORD_LENGTH } from "./constants";

/** promisify() drops scrypt's options overload, so wrap it by hand. */
function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number; maxmem: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

/**
 * Password hashing with scrypt.
 *
 * scrypt is memory-hard, so a stolen hash is expensive to attack even with
 * a GPU farm. Stored as `scrypt$N$r$p$salt$hash`, all hex — the parameters
 * travel with the hash so they can be raised later without invalidating
 * everyone's password.
 */

const N = 16384; // CPU/memory cost
const r = 8; // block size
const p = 1; // parallelisation
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;



export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scryptAsync(password.normalize("NFKC"), salt, KEY_LENGTH, {
    N,
    r,
    p,
    maxmem: 64 * 1024 * 1024,
  });

  return ["scrypt", N, r, p, salt.toString("hex"), key.toString("hex")].join("$");
}

/** Constant-time verify. Returns false for anything malformed rather than throwing. */
export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;

  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");

  try {
    const key = await scryptAsync(password.normalize("NFKC"), salt, expected.length, {
      N: Number(nRaw),
      r: Number(rRaw),
      p: Number(pRaw),
      maxmem: 64 * 1024 * 1024,
    });

    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/** Rejects the passwords that show up in every breach list. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (/^\d+$/.test(password)) return "Numbers alone are too easy to guess.";
  if (/^(.)\1+$/.test(password)) return "That's the same character over and over.";
  return null;
}
