// Frozen RNG contract: mulberry32 is the ONLY random algorithm in the engine.
// Changing it changes every generated sheet, which breaks the determinism
// guarantee (same spec + seed => same sheet, forever). Never edit the algorithm.
//
// Rules:
// - RNG is consumed in generate() only; render() is pure and receives no RNG.
// - Engine math is integer-only (no floats) so output is identical across machines.

export interface Rng {
  /** Uniform float in [0, 1) — internal; prefer the integer helpers below. */
  next(): number;
  /** Integer in [min, max] inclusive. min/max must be integers. */
  int(min: number, max: number): number;
  /** Uniform random element of a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** In-place Fisher–Yates shuffle; returns the same array. */
  shuffle<T>(arr: T[]): T[];
  /** Integer offset in [-amount, amount] — icon scatter, jitter, etc. */
  jitter(amount: number): number;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: number): Rng {
  const nextFloat = mulberry32(seed);
  return {
    next: nextFloat,
    int(min: number, max: number): number {
      const span = max - min + 1;
      return min + Math.floor(nextFloat() * span);
    },
    pick<T>(arr: readonly T[]): T {
      if (arr.length === 0) throw new Error('rng.pick of empty array');
      return arr[Math.floor(nextFloat() * arr.length)];
    },
    shuffle<T>(arr: T[]): T[] {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(nextFloat() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    jitter(amount: number): number {
      return -amount + Math.floor(nextFloat() * (2 * amount + 1));
    },
  };
}
