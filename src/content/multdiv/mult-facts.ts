// Multiplication facts: a × b = ___ — answers by construction.

import { fingerprintOf } from '../../engine/fingerprint';
import { factH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { blank } from '../../render/problem';

interface MultFactsData extends Record<string, unknown> {
  a: number;
  b: number;
  product: number;
}

export const multFacts: QuestionType = {
  id: 'mult-facts',
  subject: 'multdiv',
  name: 'Multiplication facts',
  description: 'Times-table practice with clean whole-number products.',
  gradeRange: ['G2', 'G4'],
  difficultyPresets: {
    G2: { maxFactor: 5 },
    G3: { maxFactor: 9 },
    G4: { maxFactor: 12 },
  },
  params: [
    { key: 'maxFactor', label: 'Biggest factor', type: 'int', min: 2, max: 12, default: 9 },
  ],

  generate(rng, params): Problem {
    const maxFactor = params.maxFactor as number;
    const a = rng.int(2, maxFactor);
    const b = rng.int(2, maxFactor);
    const product = a * b;

    const data: MultFactsData = { a, b, product };
    return {
      typeId: 'mult-facts',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(product) },
      fingerprint: fingerprintOf(['mult-facts', data.a, data.b, data.product]),
    };
  },

  render(p): string {
    const { a, b } = p.data as unknown as MultFactsData;
    return (
      `<div class="fact">` +
      `<span class="fact-nums">${a} × ${b} =</span>${blank()}` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    return factH(ctx);
  },
};
