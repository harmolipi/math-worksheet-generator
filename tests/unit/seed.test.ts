import { describe, expect, it } from 'vitest';
import { deriveVariantSeed, fnv1a, normalizeSeed, splitmix32 } from '../../src/engine/seed';

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
});
