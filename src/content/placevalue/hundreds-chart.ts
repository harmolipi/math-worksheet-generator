// Hundreds chart: a 1–100 grid with numbers hidden — child fills them in.
// By construction: pick the hidden positions, the values are index + 1.

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import { promptH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt } from '../../render/problem';

interface HundredsChartData extends Record<string, unknown> {
  missing: { index: number; value: number }[]; // 0-based cell index, ascending
}

const CELLS = 100;

export const hundredsChart: QuestionType = {
  id: 'hundreds-chart',
  subject: 'placevalue',
  name: 'Hundreds chart',
  description: 'Fill in the missing numbers on the 1–100 chart.',
  gradeRange: ['G1', 'G2'],
  difficultyPresets: {
    G1: { missingCount: 10 },
    G2: { missingCount: 16 },
  },
  params: [
    { key: 'missingCount', label: 'Missing numbers', type: 'int', min: 5, max: 40, default: 12 },
  ],

  generate(rng, params): Problem {
    const missingCount = params.missingCount as number;
    const indices: number[] = [];
    while (indices.length < missingCount) {
      const i = rng.int(0, CELLS - 1);
      if (!indices.includes(i)) indices.push(i);
    }
    indices.sort((a, b) => a - b);
    const missing = indices.map((index) => ({ index, value: index + 1 }));

    const data: HundredsChartData = { missing };
    return {
      typeId: 'hundreds-chart',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: missing.map((m) => String(m.value)).join(', ') },
      fingerprint: fingerprintOf(['hundreds-chart', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { missing } = p.data as unknown as HundredsChartData;
    const missingSet = new Set(missing.map((m) => m.index));
    const cells = Array.from({ length: CELLS }, (_, index) => {
      const cellClass = missingSet.has(index) ? 'hundreds-cell missing' : 'hundreds-cell';
      const content = missingSet.has(index) ? '' : String(index + 1);
      return `<span class="${cellClass}">${content}</span>`;
    }).join('');
    return (
      `<div class="hundreds-chart">` +
      prompt('Write the missing numbers.') +
      `<div class="hundreds-grid">${cells}</div>` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    // Prompt + the fixed 10×19pt grid + borders.
    return promptH(ctx) + 198;
  },
};
