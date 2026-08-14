import {
  SCHEMA_VERSION,
  type QuestionType,
  type WorksheetSpec,
} from '../../src/engine/spec';

/**
 * Minimal valid spec builder for tests. Overrides are untyped on purpose so
 * validation-rejection tests can pass deliberately invalid values.
 */
export function baseSpec(overrides: Record<string, unknown> = {}): WorksheetSpec {
  return {
    schemaVersion: SCHEMA_VERSION,
    seed: 'test-seed',
    gradeBand: 'G1',
    sections: [{ typeIds: ['fake'], counts: [5] }],
    layout: {
      pageSize: 'letter',
      columns: 1,
      numbering: 'sequential',
      header: { title: true, name: true, date: true, classLine: false },
      workspace: 'none',
    },
    options: {
      answerKey: true,
      answerKeyStyle: 'list',
      inkSaver: false,
      accentColor: null,
      showPageNumbers: true,
      largePrint: false,
    },
    ...overrides,
  } as WorksheetSpec;
}

/**
 * Deterministic fake type: answers by construction (pick sum, derive addends).
 * `estHeightPt` is a fixed 100pt so packing arithmetic is predictable.
 */
export function fakeType(overrides: Partial<QuestionType> = {}): QuestionType {
  const id = overrides.id ?? 'fake';
  return {
    id,
    subject: 'test',
    name: 'Fake Addition',
    description: 'Test type: a + b = sum, answers by construction.',
    gradeRange: ['preK', 'G5'],
    difficultyPresets: {},
    params: [
      { key: 'max', label: 'Max', type: 'int', min: 1, max: 100, default: 10 },
    ],
    generate(rng, params) {
      const max = params.max as number;
      const sum = rng.int(1, max);
      const a = rng.int(1, sum);
      const b = sum - a;
      return {
        typeId: id,
        index: 0,
        gradeLevel: 0,
        data: { a, b },
        answer: { value: String(sum) },
        fingerprint: `${id}:${a}:${b}`,
      };
    },
    render(p) {
      const { a, b } = p.data as { a: number; b: number };
      return `<span>${a} + ${b} = ___</span>`;
    },
    estHeightPt: () => 100,
    ...overrides,
  };
}

export function fakeTypeMap(types: QuestionType[]): Map<string, QuestionType> {
  return new Map(types.map((t) => [t.id, t]));
}
