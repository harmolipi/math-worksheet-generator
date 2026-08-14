// Compare numbers: write >, <, or = between two numbers.

import { fingerprintOf } from '../../engine/fingerprint';
import { factH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { writeBox } from '../../render/problem';

interface CompareData extends Record<string, unknown> {
  a: number;
  b: number;
  relation: '>' | '<' | '=';
}

export const compareNumbers: QuestionType = {
  id: 'compare-numbers',
  subject: 'placevalue',
  name: 'Greater, less, or equal',
  description: 'Write the correct sign between two numbers.',
  gradeRange: ['G1', 'G4'],
  difficultyPresets: {
    G1: { digits: '1-2' },
    G2: { digits: '2' },
    G3: { digits: '3' },
    G4: { digits: '4' },
  },
  params: [
    { key: 'digits', label: 'Digit places', type: 'select', options: ['1-2', '2', '3', '4'], default: '2' },
  ],

  generate(rng, params): Problem {
    const spec = params.digits as string;
    const [loStr, hiStr] = spec.split('-');
    const lo = Number(loStr);
    const hi = Number(hiStr || loStr);
    const a = rng.int(10 ** (lo - 1), 10 ** hi - 1);
    const b = rng.int(10 ** (lo - 1), 10 ** hi - 1);
    const relation = a > b ? '>' : a < b ? '<' : '=';

    const data: CompareData = { a, b, relation };
    return {
      typeId: 'compare-numbers',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: relation },
      fingerprint: fingerprintOf(['compare-numbers', data.a, data.b, data.relation]),
    };
  },

  render(p): string {
    const { a, b } = p.data as unknown as CompareData;
    return (
      `<div class="fact">` +
      `<span class="fact-nums">${a}</span>${writeBox()}<span class="fact-nums">${b}</span>` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    return factH(ctx);
  },
};
