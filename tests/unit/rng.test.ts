import { describe, expect, it } from 'vitest';
import { createRng, mulberry32 } from '../../src/engine/rng';

function sample(seed: number, n = 64): number[] {
  const f = mulberry32(seed);
  return Array.from({ length: n }, () => f());
}

describe('rng', () => {
  it('is deterministic for a fixed seed', () => {
    expect(sample(12345)).toEqual(sample(12345));
  });

  it('differs across seeds', () => {
    expect(sample(1)).not.toEqual(sample(2));
  });

  it('int() stays within [min, max] inclusive, integer-only', () => {
    const rng = createRng(42);
    for (let i = 0; i < 10_000; i++) {
      const v = rng.int(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('shuffle is a permutation of the input', () => {
    const rng = createRng(7);
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = rng.shuffle([...arr]);
    expect([...out].sort((a, b) => a - b)).toEqual(arr);
  });

  it('pick returns an element of the array', () => {
    const rng = createRng(9);
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 1000; i++) expect(arr).toContain(rng.pick(arr));
  });

  it('jitter stays within ±amount and is integral', () => {
    const rng = createRng(11);
    for (let i = 0; i < 1000; i++) {
      const v = rng.jitter(4);
      expect(Math.abs(v)).toBeLessThanOrEqual(4);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});
