// Addition facts: a + b = ___ — answers by construction (sum first, then split).

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { blank } from '../../render/problem';

interface AddFactsData extends Record<string, unknown> {
  a: number;
  b: number;
  sum: number;
  format: 'horizontal' | 'vertical';
}

export const addFacts: QuestionType = {
  id: 'add-facts',
  subject: 'addsub',
  name: 'Addition facts',
  description: 'Single-step addition with numbers that add cleanly.',
  gradeRange: ['K', 'G2'],
  difficultyPresets: {
    K: { maxSum: 10 },
    G1: { maxSum: 20 },
    G2: { maxSum: 20 },
  },
  params: [
    { key: 'maxSum', label: 'Biggest sum', type: 'int', min: 2, max: 20, default: 20 },
    {
      key: 'format',
      label: 'Layout',
      type: 'select',
      options: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
    { key: 'includeZero', label: 'Include 0', type: 'bool', default: false },
  ],

  generate(rng, params): Problem {
    const maxSum = params.maxSum as number;
    const includeZero = params.includeZero as boolean;
    const sum = rng.int(2, maxSum);
    const a = includeZero ? rng.int(0, sum) : rng.int(1, sum - 1);
    const b = sum - a;

    const data: AddFactsData = {
      a,
      b,
      sum,
      format: params.format as AddFactsData['format'],
    };
    return {
      typeId: 'add-facts',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(sum) },
      fingerprint: fingerprintOf(['add-facts', data.a, data.b, data.sum]),
    };
  },

  render(p): string {
    const { a, b, format } = p.data as unknown as AddFactsData;
    if (format === 'vertical') {
      return (
        `<div class="fact-vertical">` +
        `<div class="v-row">${a}</div>` +
        `<div class="v-row op">+ ${b}</div>` +
        `<div class="v-answer-row"></div>` +
        `</div>`
      );
    }
    return (
      `<div class="fact">` +
      `<span class="fact-nums">${a} + ${b} =</span>${blank()}` +
      `</div>`
    );
  },

  estHeightPt(data): number {
    return (data as unknown as AddFactsData).format === 'vertical' ? 96 : 52;
  },
};
