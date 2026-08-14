// Multiples of 10: 30 × 4 = ___ — the friendly first step toward big products.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { blank } from '../../render/problem';

interface MultOf10Data extends Record<string, unknown> {
  a: number;
  b: number;
  product: number;
}

export const multOf10: QuestionType = {
  id: 'mult-of-10',
  subject: 'multdiv',
  name: 'Multiples of 10',
  description: 'Multiply tens like 30 × 4 — nice round products.',
  gradeRange: ['G3', 'G4'],
  difficultyPresets: {
    G3: { maxTens: 9, maxFactor: 5 },
    G4: { maxTens: 90, maxFactor: 9 },
  },
  params: [
    { key: 'maxTens', label: 'Biggest multiple of 10', type: 'int', min: 20, max: 90, default: 90 },
    { key: 'maxFactor', label: 'Biggest other number', type: 'int', min: 2, max: 9, default: 9 },
  ],

  generate(rng, params): Problem {
    const maxTens = params.maxTens as number;
    const maxFactor = params.maxFactor as number;
    const a = rng.int(2, maxTens / 10) * 10;
    const b = rng.int(2, maxFactor);
    const product = a * b;

    const data: MultOf10Data = { a, b, product };
    return {
      typeId: 'mult-of-10',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(product) },
      fingerprint: fingerprintOf(['mult-of-10', data.a, data.b, data.product]),
    };
  },

  render(p): string {
    const { a, b } = p.data as unknown as MultOf10Data;
    return (
      `<div class="fact">` +
      `<span class="fact-nums">${a} × ${b} =</span>${blank()}` +
      `</div>`
    );
  },

  estHeightPt: () => 52,
};
