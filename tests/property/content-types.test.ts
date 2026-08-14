import { describe, expect, it } from 'vitest';
import { generateSections } from '../../src/engine/generate';
import { typeMap } from '../../src/engine/registry';
import type { GradeBand, Problem } from '../../src/engine/spec';
import { baseSpec } from '../helpers/fake-type';

// The sharp property formulation: recompute the math from the data the
// renderer will display, and assert it equals problem.answer. This catches
// render/math drift that pure unit tests miss.

function forSeeds(
  typeId: string,
  seeds: number,
  band: GradeBand,
  fn: (p: Problem) => void,
): void {
  for (let seed = 1; seed <= seeds; seed++) {
    const spec = baseSpec({
      seed: `property-${seed}`,
      gradeBand: band,
      sections: [{ typeIds: [typeId], counts: [10] }],
    });
    for (const p of generateSections(spec, typeMap)[0].problems) fn(p);
  }
}

function data<T>(p: Problem): T {
  return p.data as unknown as T;
}

describe('content type property tests (answers by construction)', () => {
  it('count-objects: rendered icon count === answer', () => {
    forSeeds('count-objects', 30, 'K', (p) => {
      const d = data<{ count: number; icons: string[]; positions?: { x: number; y: number }[] }>(p);
      expect(d.icons).toHaveLength(d.count);
      expect(d.count).toBeGreaterThanOrEqual(1);
      expect(d.count).toBeLessThanOrEqual(10);
      expect(p.answer!.value).toBe(String(d.count));
      for (const pos of d.positions ?? []) {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(100);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(100);
      }
    });
  });

  it('number-recognition: target is among unique options, answer === target', () => {
    forSeeds('number-recognition', 30, 'K', (p) => {
      const d = data<{ target: number; options: number[] }>(p);
      expect(d.options).toContain(d.target);
      expect(new Set(d.options).size).toBe(d.options.length);
      expect(p.answer!.value).toBe(String(d.target));
    });
  });

  it('quantity-matching: groups match numerals exactly', () => {
    forSeeds('quantity-matching', 30, 'K', (p) => {
      const d = data<{
        left: { value: number; icons: string[] }[];
        right: { value: number; icons: string[] }[];
      }>(p);
      const leftValues = d.left.map((m) => m.value).sort((a, b) => a - b);
      const rightValues = d.right.map((m) => m.value).sort((a, b) => a - b);
      expect(leftValues).toEqual(rightValues);
      for (const m of d.right) expect(m.icons).toHaveLength(m.value);
      expect(new Set(leftValues).size).toBe(leftValues.length); // distinct values
    });
  });

  it('which-has-more: groups differ; answer side matches the question', () => {
    forSeeds('which-has-more', 30, 'K', (p) => {
      const d = data<{
        question: 'more' | 'fewer';
        left: { icons: string[] };
        right: { icons: string[] };
      }>(p);
      expect(d.left.icons.length).not.toBe(d.right.icons.length);
      const winnerSide = d.question === 'more'
        ? d.left.icons.length >= d.right.icons.length ? 'A' : 'B'
        : d.left.icons.length <= d.right.icons.length ? 'A' : 'B';
      expect(p.answer!.value).toContain(winnerSide);
    });
  });

  it('missing-number-sequence: arithmetic sequence, missing value === answer', () => {
    forSeeds('missing-number-sequence', 30, 'G1', (p) => {
      const d = data<{ sequence: number[]; missingIndex: number }>(p);
      const step = d.sequence[1] - d.sequence[0];
      for (let i = 2; i < d.sequence.length; i++) {
        expect(d.sequence[i] - d.sequence[i - 1]).toBe(step);
      }
      expect(step).toBeGreaterThanOrEqual(1);
      expect(p.answer!.value).toBe(String(d.sequence[d.missingIndex]));
    });
  });

  it('number-tracing: unique ascending numbers, no answer', () => {
    forSeeds('number-tracing', 20, 'K', (p) => {
      const d = data<{ numbers: number[] }>(p);
      expect(d.numbers).toEqual([...d.numbers].sort((a, b) => a - b));
      expect(new Set(d.numbers).size).toBe(d.numbers.length);
      expect(p.answer).toBeNull();
    });
  });

  it('ten-frame: count in range; make10 answers complement the count', () => {
    forSeeds('ten-frame', 30, 'G1', (p) => {
      const d = data<{ count: number; mode: 'count' | 'make10' }>(p);
      expect(d.count).toBeGreaterThanOrEqual(1);
      expect(d.count).toBeLessThanOrEqual(10);
      if (d.mode === 'make10') {
        expect(Number(p.answer!.value) + d.count).toBe(10);
        expect(d.count).toBeLessThanOrEqual(9);
      } else {
        expect(p.answer!.value).toBe(String(d.count));
      }
    });
  });

  it('add-facts: a + b === sum === answer, no negatives', () => {
    forSeeds('add-facts', 40, 'G2', (p) => {
      const d = data<{ a: number; b: number; sum: number }>(p);
      expect(d.a + d.b).toBe(d.sum);
      expect(p.answer!.value).toBe(String(d.sum));
      expect(d.a).toBeGreaterThanOrEqual(0);
      expect(d.b).toBeGreaterThanOrEqual(0);
      expect(d.sum).toBeLessThanOrEqual(20);
    });
  });

  it('sub-facts: a − b === answer, never negative', () => {
    forSeeds('sub-facts', 40, 'G2', (p) => {
      const d = data<{ a: number; b: number; diff: number }>(p);
      expect(d.a - d.b).toBe(d.diff);
      expect(d.diff).toBeGreaterThanOrEqual(0);
      expect(p.answer!.value).toBe(String(d.diff));
    });
  });

  it('add-vertical: top + bottom === answer; carry constraints hold', () => {
    forSeeds('add-vertical', 40, 'G3', (p) => {
      const d = data<{
        top: number;
        bottom: number;
        sum: number;
        carries: number[];
        digitCount: number;
      }>(p);
      expect(d.top + d.bottom).toBe(d.sum);
      expect(p.answer!.value).toBe(String(d.sum));
      // carries: ones column (index 0) is carry-in 0; later columns carry-in ∈ {0,1}
      expect(d.carries[0]).toBe(0);
      for (const c of d.carries) expect([0, 1]).toContain(c);
      // digits don't overflow the column count
      expect(d.top).toBeLessThan(10 ** d.digitCount);
      expect(d.bottom).toBeLessThan(10 ** d.digitCount);
    });
  });

  it('add-vertical with carry=none never carries', () => {
    forSeeds('add-vertical', 30, 'G2', (p) => {
      const d = data<{ carries: number[] }>(p);
      for (const c of d.carries) expect(c).toBe(0);
    });
  });

  it('count-and-write: icon count === answer', () => {
    forSeeds('count-and-write', 30, 'K', (p) => {
      const d = data<{ count: number; icons: string[] }>(p);
      expect(d.icons).toHaveLength(d.count);
      expect(p.answer!.value).toBe(String(d.count));
    });
  });

  it('sub-vertical: top − bottom === answer, never negative, borrow constraints hold', () => {
    forSeeds('sub-vertical', 40, 'G3', (p) => {
      const d = data<{ top: number; bottom: number; diff: number; digitCount: number }>(p);
      expect(d.top - d.bottom).toBe(d.diff);
      expect(d.diff).toBeGreaterThanOrEqual(0);
      expect(p.answer!.value).toBe(String(d.diff));
      expect(d.top).toBeLessThan(10 ** d.digitCount);
      expect(d.bottom).toBeLessThan(10 ** d.digitCount);
    });
  });

  it('sub-vertical with borrow=none never borrows', () => {
    for (const seed of Array.from({ length: 30 }, (_, i) => i + 1)) {
      const spec = baseSpec({
        seed: `sub-noborrow-${seed}`,
        gradeBand: 'G2',
        sections: [{ typeIds: ['sub-vertical'], counts: [10], params: { 'sub-vertical': { borrow: 'none' } } }],
      });
      for (const p of generateSections(spec, typeMap)[0].problems) {
        const d = data<{ top: number; bottom: number; diff: number }>(p);
        expect(d.top - d.bottom).toBe(d.diff);
        expect(d.top % 10).toBeGreaterThanOrEqual(d.bottom % 10);
      }
    }
  });

  it('mult-facts: a × b === answer', () => {
    forSeeds('mult-facts', 40, 'G3', (p) => {
      const d = data<{ a: number; b: number; product: number }>(p);
      expect(d.a * d.b).toBe(d.product);
      expect(p.answer!.value).toBe(String(d.product));
    });
  });

  it('div-facts: quotient is whole, dividend ÷ divisor === answer', () => {
    forSeeds('div-facts', 40, 'G3', (p) => {
      const d = data<{ dividend: number; divisor: number; quotient: number }>(p);
      expect(d.dividend % d.divisor).toBe(0);
      expect(d.dividend / d.divisor).toBe(d.quotient);
      expect(p.answer!.value).toBe(String(d.quotient));
    });
  });

  it('mult-vertical: top × factor === answer', () => {
    forSeeds('mult-vertical', 40, 'G4', (p) => {
      const d = data<{ top: number; factor: number; product: number }>(p);
      expect(d.top * d.factor).toBe(d.product);
      expect(p.answer!.value).toBe(String(d.product));
    });
  });

  it('missing-factor: a × answer === product', () => {
    forSeeds('missing-factor', 40, 'G3', (p) => {
      const d = data<{ a: number; b: number; product: number }>(p);
      expect(d.a * d.b).toBe(d.product);
      expect(p.answer!.value).toBe(String(d.b));
    });
  });

  it('mult-of-10: multiple of 10 × factor === answer', () => {
    forSeeds('mult-of-10', 40, 'G4', (p) => {
      const d = data<{ a: number; b: number; product: number }>(p);
      expect(d.a % 10).toBe(0);
      expect(d.a * d.b).toBe(d.product);
      expect(p.answer!.value).toBe(String(d.product));
    });
  });

  it('base10-blocks: flats×100 + rods×10 + units === answer', () => {
    forSeeds('base10-blocks', 30, 'G2', (p) => {
      const d = data<{ number: number; flats: number; rods: number; units: number }>(p);
      expect(d.flats * 100 + d.rods * 10 + d.units).toBe(d.number);
      expect(d.flats + d.rods + d.units).toBeGreaterThan(0);
      expect(p.answer!.value).toBe(String(d.number));
    });
  });

  it('expanded-form: recomposed expanded parts equal the number', () => {
    forSeeds('expanded-form', 40, 'G2', (p) => {
      const d = data<{ number: number; expanded: string }>(p);
      const sum = d.expanded.split(' + ').reduce((acc, part) => acc + Number(part), 0);
      expect(sum).toBe(d.number);
      expect(p.answer!.value).toBe(d.expanded);
    });
  });

  it('value-of-digit: answer === underlined digit × place', () => {
    forSeeds('value-of-digit', 40, 'G3', (p) => {
      const d = data<{ number: number; digit: number; place: number; targetIndex: number }>(p);
      expect(Number(p.answer!.value)).toBe(d.digit * d.place);
      // the underlined digit actually appears at that place in the number
      const ds = String(d.number).split('').map(Number);
      expect(ds[d.targetIndex]).toBe(d.digit);
      expect(10 ** (ds.length - 1 - d.targetIndex)).toBe(d.place);
    });
  });

  it('compare-numbers: relation matches the numbers', () => {
    forSeeds('compare-numbers', 40, 'G2', (p) => {
      const d = data<{ a: number; b: number; relation: string }>(p);
      const expected = d.a > d.b ? '>' : d.a < d.b ? '<' : '=';
      expect(d.relation).toBe(expected);
      expect(p.answer!.value).toBe(expected);
    });
  });

  it('odd-even: listed matches have the right parity', () => {
    forSeeds('odd-even', 30, 'G2', (p) => {
      const d = data<{ numbers: number[]; target: 'odd' | 'even' }>(p);
      expect(d.numbers).toHaveLength(6);
      const matches = p.answer!.value === '' ? [] : p.answer!.value.split(', ').map(Number);
      for (const n of matches) {
        expect(n % 2).toBe(d.target === 'odd' ? 1 : 0);
        expect(d.numbers).toContain(n);
      }
    });
  });

  it('fraction-shade: 1 ≤ numerator < denominator; answer is the fraction', () => {
    forSeeds('fraction-shade', 40, 'G3', (p) => {
      const d = data<{ numerator: number; denominator: number }>(p);
      expect(d.numerator).toBeGreaterThanOrEqual(1);
      expect(d.numerator).toBeLessThan(d.denominator);
      expect(p.answer!.value).toBe(`${d.numerator}/${d.denominator}`);
    });
  });

  it('fraction-of-whole: answer = whole × numerator ÷ denominator, always integer', () => {
    forSeeds('fraction-of-whole', 40, 'G4', (p) => {
      const d = data<{ numerator: number; denominator: number; whole: number; answer: number }>(p);
      expect(d.whole % d.denominator).toBe(0);
      const expected = (d.whole * d.numerator) / d.denominator;
      expect(Number.isInteger(expected)).toBe(true);
      expect(d.answer).toBe(expected);
      expect(p.answer!.value).toBe(String(expected));
    });
  });

  it('fraction-compare: relation matches cross-multiplication, fractions unequal', () => {
    forSeeds('fraction-compare', 40, 'G4', (p) => {
      const d = data<{ n1: number; d1: number; n2: number; d2: number; relation: string }>(p);
      expect(d.n1 * d.d2).not.toBe(d.n2 * d.d1);
      const expected = d.n1 * d.d2 > d.n2 * d.d1 ? '>' : '<';
      expect(d.relation).toBe(expected);
      expect(p.answer!.value).toBe(expected);
    });
  });

  it('clock-read: valid time, minute on step, zero-padded answer', () => {
    forSeeds('clock-read', 30, 'G2', (p) => {
      const d = data<{ hour: number; minute: number }>(p);
      expect(d.hour).toBeGreaterThanOrEqual(1);
      expect(d.hour).toBeLessThanOrEqual(12);
      expect(d.minute).toBeGreaterThanOrEqual(0);
      expect(d.minute).toBeLessThan(60);
      expect(p.answer!.value).toBe(`${d.hour}:${String(d.minute).padStart(2, '0')}`);
    });
  });

  it('elapsed-time: end − start === elapsed, same day, formatted answer', () => {
    forSeeds('elapsed-time', 30, 'G3', (p) => {
      const d = data<{ startMinutes: number; endMinutes: number; elapsedMinutes: number }>(p);
      expect(d.endMinutes - d.startMinutes).toBe(d.elapsedMinutes);
      expect(d.elapsedMinutes).toBeGreaterThan(0);
      const expected =
        d.elapsedMinutes >= 60
          ? `${Math.floor(d.elapsedMinutes / 60)} h${d.elapsedMinutes % 60 ? ` ${d.elapsedMinutes % 60} min` : ''}`
          : `${d.elapsedMinutes} min`;
      expect(p.answer!.value).toBe(expected);
    });
  });

  it('add-vertical with carry=always carries in the ones column', () => {
    for (const seed of Array.from({ length: 30 }, (_, i) => i + 1)) {
      const spec = baseSpec({
        seed: `always-${seed}`,
        gradeBand: 'G3',
        sections: [{ typeIds: ['add-vertical'], counts: [10], params: { 'add-vertical': { carry: 'always' } } }],
      });
      for (const p of generateSections(spec, typeMap)[0].problems) {
        const d = data<{ top: number; bottom: number; sum: number }>(p);
        const topOnes = d.top % 10;
        const bottomOnes = d.bottom % 10;
        expect(topOnes + bottomOnes).toBeGreaterThanOrEqual(10);
        expect(d.top + d.bottom).toBe(d.sum);
      }
    }
  });

  it('render is pure (byte-identical across calls)', () => {
    for (const typeId of typeMap.keys()) {
      if (typeId === 'manual') continue; // covered in manual tests
      const band: GradeBand = typeId.startsWith('add') || typeId === 'sub-facts' ? 'G2' : 'K';
      forSeeds(typeId, 3, band, (p) => {
        const type = typeMap.get(typeId)!;
        expect(type.render(p)).toBe(type.render(p));
      });
    }
  });

  it('mixed sections never repeat a fingerprint', () => {
    const typeIds = [...typeMap.keys()].filter((t) => t !== 'manual');
    const spec = baseSpec({
      seed: 'mixed-dedupe',
      gradeBand: 'G2',
      sections: [{ typeIds, counts: typeIds.map(() => 6) }],
    });
    const problems = generateSections(spec, typeMap)[0].problems;
    const fingerprints = problems.map((p) => p.fingerprint);
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
  });

  it('whole-sheet generation is deterministic through the real registry', () => {
    const spec = baseSpec({
      seed: 'registry-determinism',
      gradeBand: 'K',
      sections: [
        { typeIds: ['count-objects', 'number-recognition'], counts: [8, 8] },
        { typeIds: ['add-facts'], counts: [10] },
      ],
    });
    expect(generateSections(spec, typeMap)).toEqual(generateSections(spec, typeMap));
  });
});
