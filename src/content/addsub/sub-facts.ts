// Subtraction facts: a − b = ___ — by construction, the difference is never
// negative (b ≤ a), and never zero unless includeZero is on.

import { fingerprintOf } from '../../engine/fingerprint';
import { factH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { blank } from '../../render/problem';

interface SubFactsData extends Record<string, unknown> {
  a: number;
  b: number;
  diff: number;
}

export const subFacts: QuestionType = {
  id: 'sub-facts',
  subject: 'addsub',
  name: 'Subtraction facts',
  description: 'Single-step subtraction that never goes below zero.',
  gradeRange: ['G1', 'G2'],
  difficultyPresets: {
    G1: { maxMinuend: 10 },
    G2: { maxMinuend: 20 },
  },
  params: [
    { key: 'maxMinuend', label: 'Biggest number', type: 'int', min: 2, max: 20, default: 20 },
    { key: 'includeZero', label: 'Include answers of 0', type: 'bool', default: false },
  ],

  generate(rng, params): Problem {
    const maxMinuend = params.maxMinuend as number;
    const includeZero = params.includeZero as boolean;
    const a = rng.int(2, maxMinuend);
    const b = includeZero ? rng.int(0, a) : rng.int(1, a - 1);
    const diff = a - b;

    const data: SubFactsData = { a, b, diff };
    return {
      typeId: 'sub-facts',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(diff) },
      fingerprint: fingerprintOf(['sub-facts', data.a, data.b, data.diff]),
    };
  },

  render(p): string {
    const { a, b } = p.data as unknown as SubFactsData;
    return (
      `<div class="fact">` +
      `<span class="fact-nums">${a} - ${b} =</span>${blank()}` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    return factH(ctx);
  },
};
