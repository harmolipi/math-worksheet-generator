// Compare lengths: two bars A and B of different lengths, child circles the
// longer (or shorter). By construction: pick two distinct lengths, the
// question determines the winner.

import { fingerprintOf } from '../../engine/fingerprint';
import { promptH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt } from '../../render/problem';

interface CompareLengthsData extends Record<string, unknown> {
  a: number; // bar A length in units
  b: number; // bar B length in units
  question: 'longer' | 'shorter';
  side: 'A' | 'B'; // the correct side
}

const BAR_W = 8; // svg units per length unit
const BAR_H = 10;

export const compareLengths: QuestionType = {
  id: 'compare-lengths',
  subject: 'measurement',
  name: 'Longer or shorter?',
  description: 'Two bars — circle the longer (or shorter) one.',
  gradeRange: ['K', 'G2'],
  difficultyPresets: {
    K: { maxLength: 5 },
    G1: { maxLength: 8 },
    G2: { maxLength: 12 },
  },
  params: [
    { key: 'maxLength', label: 'Biggest bar', type: 'int', min: 3, max: 12, default: 8 },
    {
      key: 'question',
      label: 'Circle the…',
      type: 'select',
      options: ['longer', 'shorter', 'random'],
      default: 'random',
    },
  ],

  generate(rng, params): Problem {
    const maxLength = params.maxLength as number;
    const a = rng.int(2, maxLength);
    let b = rng.int(2, maxLength);
    while (b === a) b = rng.int(2, maxLength);
    const questionParam = params.question as string;
    const question: 'longer' | 'shorter' =
      questionParam === 'random'
        ? rng.int(0, 1) === 0
          ? 'longer'
          : 'shorter'
        : (questionParam as 'longer' | 'shorter');
    const side: 'A' | 'B' =
      (question === 'longer') === (a > b) ? 'A' : 'B';

    const data: CompareLengthsData = { a, b, question, side };
    return {
      typeId: 'compare-lengths',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: side },
      fingerprint: fingerprintOf(['compare-lengths', data.a, data.b, data.question]),
    };
  },

  render(p): string {
    const { a, b, question } = p.data as unknown as CompareLengthsData;
    const bar = (n: number, cls: string): string =>
      `<svg class="bar-svg" viewBox="0 0 ${BAR_W * 12} 20" aria-hidden="true">` +
      `<rect x="0" y="5" width="${BAR_W * n}" height="${BAR_H}" class="${cls}"/>` +
      `</svg>`;
    return (
      `<div class="compare-lengths">` +
      prompt(`Circle the <b>${question}</b> one.`) +
      `<div class="bar-list">` +
      `<div class="bar-row"><span class="compare-tag">A</span>${bar(a, 'bar-rect')}</div>` +
      `<div class="bar-row"><span class="compare-tag">B</span>${bar(b, 'bar-rect')}</div>` +
      `</div>` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    // Prompt + two fixed bar rows (15pt bars + 8pt gaps).
    return promptH(ctx) + 2 * 23 + 2;
  },
};
