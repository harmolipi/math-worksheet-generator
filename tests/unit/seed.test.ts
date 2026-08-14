import { describe, expect, it } from 'vitest';
import {
  deriveVariantSeed,
  fnv1a,
  normalizeSeed,
  splitmix32,
  variantSeedString,
} from '../../src/engine/seed';

describe('seed', () => {
  it('normalizeSeed is deterministic and stable', () => {
    expect(normalizeSeed('hello')).toBe(normalizeSeed('hello'));
    expect(normalizeSeed('hello')).not.toBe(normalizeSeed('world'));
  });

  it('empty seed maps to the fixed zero seed', () => {
    expect(normalizeSeed('')).toBe(0);
    expect(normalizeSeed('   ')).toBe(0);
  });

  it('fnv1a matches known vectors', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
  });

  it('splitmix32 spreads adjacent inputs', () => {
    const a = splitmix32(1);
    const b = splitmix32(2);
    expect(a).not.toBe(b);
    // no simple low-bit pattern
    expect(a & 0xff).not.toBe((b & 0xff) + 1);
  });

  it('variant seeds differ from base and from each other', () => {
    const base = normalizeSeed('sheet-abc');
    const v1 = deriveVariantSeed(base, 0);
    const v2 = deriveVariantSeed(base, 1);
    const v3 = deriveVariantSeed(base, 2);
    expect(new Set([base, v1, v2, v3]).size).toBe(4);
    expect(deriveVariantSeed(base, 1)).toBe(v2); // deterministic
  });

  it('variantSeedString is deterministic, distinct, and uncorrelated across sets', () => {
    const base = 'sheet-abc';
    const seeds = ['A', 'B', 'C', 'D', 'E', 'F'].map((_, k) => variantSeedString(base, k));
    // Deterministic and distinct across sets, and never the base seed itself.
    expect(new Set(seeds).size).toBe(6);
    expect(seeds.every((s) => s !== base)).toBe(true);
    expect(variantSeedString(base, 2)).toBe(seeds[2]);
    // After normalizeSeed, adjacent sets must not be adjacent integers
    // (mulberry32 adjacent-seed correlation is the thing to avoid).
    const norms = seeds.map((s) => normalizeSeed(s));
    expect(new Set(norms).size).toBe(6);
    for (let i = 1; i < norms.length; i++) {
      expect(Math.abs(norms[i] - norms[i - 1])).toBeGreaterThan(1);
    }
  });
});
