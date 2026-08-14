import { describe, expect, it } from 'vitest';
import { validateSpec } from '../../src/engine/validate';
import { baseSpec, fakeType, fakeTypeMap } from '../helpers/fake-type';

// Helpers build deliberately-invalid configs without typed spreads
// (so TypeScript doesn't reject the test input itself).
function badLayout(patch: Record<string, unknown>): Record<string, unknown> {
  return {
    pageSize: 'letter',
    columns: 1,
    numbering: 'sequential',
    header: { title: true, name: true, date: true, classLine: false },
    workspace: 'none',
    ...patch,
  };
}

function badOptions(patch: Record<string, unknown>): Record<string, unknown> {
  return {
    answerKey: true,
    answerKeyStyle: 'list',
    inkSaver: false,
    accentColor: null,
    showPageNumbers: true,
    largePrint: false,
    ...patch,
  };
}

function badSection(patch: Record<string, unknown>): Record<string, unknown> {
  return { typeIds: ['fake'], counts: [2], ...patch };
}

describe('validateSpec', () => {
  const types = fakeTypeMap([fakeType()]);

  it('accepts a valid spec', () => {
    expect(validateSpec(baseSpec(), types).ok).toBe(true);
  });

  const cases: [string, unknown][] = [
    ['unknown type id', baseSpec({ sections: [badSection({ typeIds: ['ghost'] })] })],
    ['count over per-type limit', baseSpec({ sections: [badSection({ counts: [61] })] })],
    ['counts mismatch typeIds', baseSpec({ sections: [badSection({ counts: [2, 3] })] })],
    ['non-integer count', baseSpec({ sections: [badSection({ counts: [2.5] })] })],
    ['bad difficulty', baseSpec({ sections: [badSection({ difficulty: 'hard' })] })],
    ['bad page size', baseSpec({ layout: badLayout({ pageSize: 'legal' }) })],
    ['bad columns', baseSpec({ layout: badLayout({ columns: 4 }) })],
    ['bad numbering', baseSpec({ layout: badLayout({ numbering: 'random' }) })],
    ['bad accent color', baseSpec({ options: badOptions({ accentColor: 'red' }) })],
    [
      'too many sections',
      baseSpec({ sections: Array.from({ length: 9 }, () => badSection({})) }),
    ],
    ['no sections', baseSpec({ sections: [] })],
    ['seed too long', baseSpec({ seed: 'x'.repeat(201) })],
    ['title too long', baseSpec({ title: 'x'.repeat(121) })],
    [
      'too many total problems',
      baseSpec({ sections: Array.from({ length: 8 }, () => badSection({ counts: [30] })) }),
    ],
    [
      'param override out of range',
      baseSpec({ sections: [badSection({ params: { fake: { max: 999 } } })] }),
    ],
    [
      'param override for absent type',
      baseSpec({ sections: [badSection({ params: { other: { max: 5 } } })] }),
    ],
    ['bad grade band', baseSpec({ gradeBand: 'G9' })],
    ['bad schema version', baseSpec({ schemaVersion: 99 })],
    ['bad workspace', baseSpec({ layout: badLayout({ workspace: 'lines' }) })],
    ['bad answer key style', baseSpec({ options: badOptions({ answerKeyStyle: 'chart' }) })],
  ];

  it.each(cases)('rejects: %s', (_name, bad) => {
    const result = validateSpec(bad, types);
    expect(result.ok).toBe(false);
  });
});
