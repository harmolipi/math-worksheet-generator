import { describe, expect, it } from 'vitest';
import { generateSections } from '../../src/engine/generate';
import type { QuestionType } from '../../src/engine/spec';
import { baseSpec, fakeType, fakeTypeMap } from '../helpers/fake-type';

describe('generateSections', () => {
  const types = fakeTypeMap([fakeType()]);

  it('is deterministic for the same spec', () => {
    const spec = baseSpec({ seed: 'same-seed' });
    const a = generateSections(spec, types);
    const b = generateSections(spec, types);
    expect(a).toEqual(b);
  });

  it('varies with the seed', () => {
    const a = generateSections(baseSpec({ seed: 'one' }), types);
    const b = generateSections(baseSpec({ seed: 'two' }), types);
    expect(a).not.toEqual(b);
  });

  it('delivers exactly the requested counts', () => {
    const spec = baseSpec({
      sections: [
        { typeIds: ['fake'], counts: [12] },
        { typeIds: ['fake'], counts: [7] },
      ],
    });
    const sections = generateSections(spec, types);
    expect(sections.map((s) => s.problems.length)).toEqual([12, 7]);
  });

  it('interleaves multiple types round-robin', () => {
    const other = fakeType({ id: 'other' });
    const spec = baseSpec({
      sections: [{ typeIds: ['fake', 'other'], counts: [3, 2] }],
    });
    const sections = generateSections(spec, fakeTypeMap([fakeType(), other]));
    expect(sections[0].problems.map((p) => p.typeId)).toEqual([
      'fake', 'other', 'fake', 'other', 'fake',
    ]);
  });

  it('resolves difficulty relative to the grade band', () => {
    // G3 → base level 4
    const easy = generateSections(
      baseSpec({ gradeBand: 'G3', sections: [{ typeIds: ['fake'], counts: [3], difficulty: 'easy' }] }),
      types,
    );
    expect(easy[0].problems.map((p) => p.gradeLevel)).toEqual([3, 3, 3]);
    const challenge = generateSections(
      baseSpec({ gradeBand: 'G3', sections: [{ typeIds: ['fake'], counts: [3], difficulty: 'challenge' }] }),
      types,
    );
    expect(challenge[0].problems.map((p) => p.gradeLevel)).toEqual([5, 5, 5]);
    const mixed = generateSections(
      baseSpec({ gradeBand: 'G3', sections: [{ typeIds: ['fake'], counts: [10], difficulty: 'mixed' }] }),
      types,
    );
    for (const p of mixed[0].problems) {
      expect(p.gradeLevel).toBeGreaterThanOrEqual(3);
      expect(p.gradeLevel).toBeLessThanOrEqual(5);
    }
  });

  it('dedupes by fingerprint, retrying then accepting', () => {
    // A type whose fingerprint never changes: after retries are exhausted the
    // problem is accepted anyway — generation must never under-deliver.
    const stub: QuestionType = fakeType({
      generate(_rng, _params, ctx) {
        return {
          typeId: 'fake',
          index: 0,
          gradeLevel: ctx.gradeLevel,
          data: { a: 1, b: 1 },
          answer: { value: '2' },
          fingerprint: 'constant',
        };
      },
    });
    const sections = generateSections(baseSpec(), fakeTypeMap([stub]));
    expect(sections[0].problems.length).toBe(5);
  });

  it('rejects unknown type ids loudly', () => {
    const spec = baseSpec({ sections: [{ typeIds: ['ghost'], counts: [2] }] });
    expect(() => generateSections(spec, types)).toThrow(/Unknown question type/);
  });
});
