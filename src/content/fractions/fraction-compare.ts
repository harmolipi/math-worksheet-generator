// Compare fractions: write >, <, or =. By construction the two fractions
// are never equal, and denominators stay within the chosen set.

import { fingerprintOf } from '../../engine/fingerprint';
import { factH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { writeBox } from '../../render/problem';

interface CompareFractionData extends Record<string, unknown> {
  n1: number;
  d1: number;
  n2: number;
  d2: number;
  relation: '>' | '<';
}

const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10];

export const fractionCompare: QuestionType = {
  id: 'fraction-compare',
  subject: 'fractions',
  name: 'Compare fractions',
  description: 'Write the right sign between two fractions.',
  gradeRange: ['G3', 'G5'],
  difficultyPresets: {
    G3: { denominators: '2,3,4' },
    G4: { denominators: '3,4,5,6' },
    G5: { denominators: '5,6,8,10' },
  },
  params: [
    {
      key: 'denominators',
      label: 'Denominators',
      type: 'select',
      options: ['2,3,4', '3,4,5,6', '5,6,8,10'],
      default: '2,3,4',
    },
  ],

  generate(rng, params): Problem {
    const allowed = (params.denominators as string).split(',').map(Number).filter((d) => DENOMINATORS.includes(d));
    const d1 = rng.pick(allowed);
    const d2 = rng.pick(allowed);
    const n1 = rng.int(1, d1 - 1);
    const n2 = rng.int(1, d2 - 1);
    // Retry deterministically until the fractions differ (bounded).
    let a = n1;
    let b = n2;
    for (let i = 0; i < 10 && a * d2 === b * d1; i++) {
      a = rng.int(1, d1 - 1);
      b = rng.int(1, d2 - 1);
    }
    const relation = a * d2 > b * d1 ? '>' : '<';

    const data: CompareFractionData = { n1: a, d1, n2: b, d2, relation };
    return {
      typeId: 'fraction-compare',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: relation },
      fingerprint: fingerprintOf(['fraction-compare', data.n1, data.d1, data.n2, data.d2]),
    };
  },

  render(p): string {
    const { n1, d1, n2, d2 } = p.data as unknown as CompareFractionData;
    const frac = (n: number, d: number) =>
      `<span class="frac-stack">${n}<span class="frac-line">${d}</span></span>`;
    return (
      `<div class="fact">` +
      frac(n1, d1) +
      writeBox() +
      frac(n2, d2) +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    return factH(ctx);
  },
};
