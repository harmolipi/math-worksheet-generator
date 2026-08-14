// Seed handling: arbitrary strings → uint32 seeds; variant-seed derivation.
// Determinism: no crypto, no Date, no Math.random — pure integer math only.

export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Any string → a uint32 seed. Empty/whitespace → 0 (a fixed, valid seed). */
export function normalizeSeed(seed: string): number {
  const s = seed.trim();
  return s === '' ? 0 : fnv1a(s);
}

/** SplitMix32 — mixes an integer into a well-distributed 32-bit value. */
export function splitmix32(a: number): number {
  let z = (a + 0x9e3779b9) >>> 0;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
  return (z ^ (z >>> 15)) >>> 0;
}

/**
 * Variant seed for anti-cheating sets. NOT base + k — adjacent seeds from
 * mulberry32 are correlated, so variant seeds must be mixed through splitmix32.
 */
export function deriveVariantSeed(baseSeed: number, k: number): number {
  return splitmix32(baseSeed ^ fnv1a('variant:' + k));
}

/**
 * Variant seed as a spec `seed` string (Sets A–F). Seeds travel as strings
 * in the spec, so the splitmix32-mixed value is decimal-encoded here; the
 * engine re-hashes it through normalizeSeed — deterministic and nowhere
 * near adjacent mulberry32 seeds.
 */
export function variantSeedString(base: string, k: number): string {
  return String(deriveVariantSeed(normalizeSeed(base), k));
}
