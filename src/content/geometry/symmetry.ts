// Line of symmetry: a shape with a dotted vertical line — would the two
// halves match? By construction: pick from symmetric icon shapes (Yes) or
// custom asymmetric drawings (No).

import { fingerprintOf } from '../../engine/fingerprint';
import { chipRowH, lineH, promptH, promptLines } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { ICONS } from '../../render/icons';
import { prompt } from '../../render/problem';
import { VERTICALLY_SYMMETRIC } from './shapes';

interface SymmetryData extends Record<string, unknown> {
  shape: string; // icon id, or 'scalene' / 'lshape' (custom asymmetric)
  symmetric: boolean;
}

/** Custom asymmetric shapes (no vertical mirror), drawn in 100-space. */
const CUSTOM: Record<string, string> = {
  scalene: '<polygon points="28,8 76,16 32,88"/>',
  lshape: '<polygon points="24,8 60,8 60,32 80,32 80,88 24,88"/>',
};

const ASYMMETRIC = ['scalene', 'lshape'];

export const symmetry: QuestionType = {
  id: 'symmetry',
  subject: 'geometry',
  name: 'Line of symmetry',
  description: 'Does the dotted line split the shape in half? Yes or no.',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {},
  params: [],

  generate(rng): Problem {
    const symmetric = rng.int(0, 1) === 0;
    const shape = symmetric ? rng.pick(VERTICALLY_SYMMETRIC) : rng.pick(ASYMMETRIC);

    const data: SymmetryData = { shape, symmetric };
    return {
      typeId: 'symmetry',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: symmetric ? 'Yes' : 'No' },
      fingerprint: fingerprintOf(['symmetry', data.shape]),
    };
  },

  render(p): string {
    const { shape } = p.data as unknown as SymmetryData;
    const inner = ICONS[shape]
      ? `<g transform="translate(18,18) scale(2)">${ICONS[shape]}</g>`
      : CUSTOM[shape];
    return (
      `<div class="symmetry">` +
      prompt('Is the dotted line a line of symmetry?') +
      `<div>` +
      `<svg class="sym-svg" viewBox="0 0 100 100" aria-hidden="true" fill="none" ` +
      `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
      inner +
      `<line x1="50" y1="5" x2="50" y2="95" class="sym-axis" stroke-dasharray="5 5"/>` +
      `</svg>` +
      `</div>` +
      `<div class="chip-row sym-choice"><span class="chip">Yes</span><span class="chip">No</span></div>` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    // Prompt + fixed shape svg + Yes/No chip row; the prompt wraps in
    // narrow columns.
    const wrap = (promptLines('Is the dotted line a line of symmetry?', ctx) - 1) * lineH(ctx);
    return promptH(ctx) + wrap + (ctx.largePrint ? 90 : 76) + chipRowH(ctx) + 9;
  },
};
