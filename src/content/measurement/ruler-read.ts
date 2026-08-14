// Read the ruler: an arrow spans start..end inches on a drawn ruler, child
// writes the length. By construction: pick the start and the length, derive
// the end. Integer inches only.

import { fingerprintOf } from '../../engine/fingerprint';
import { answerH, promptH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt, writeBox } from '../../render/problem';
import { rulerSvg } from '../../render/svg';

interface RulerReadData extends Record<string, unknown> {
  start: number;
  end: number;
  length: number;
  maxInches: number;
}

export const rulerRead: QuestionType = {
  id: 'ruler-read',
  subject: 'measurement',
  name: 'Read the ruler',
  description: 'How long is the arrow on the ruler? Write the inches.',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {
    G1: { maxInches: 6 },
    G2: { maxInches: 8 },
    G3: { maxInches: 12 },
  },
  params: [
    { key: 'maxInches', label: 'Ruler length (inches)', type: 'int', min: 4, max: 12, default: 6 },
  ],

  generate(rng, params): Problem {
    const maxInches = params.maxInches as number;
    const start = rng.int(0, maxInches - 1);
    const length = rng.int(1, maxInches - start);
    const end = start + length;

    const data: RulerReadData = { start, end, length, maxInches };
    return {
      typeId: 'ruler-read',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: `${length} in` },
      fingerprint: fingerprintOf(['ruler-read', data.start, data.end, data.maxInches]),
    };
  },

  render(p): string {
    const { start, end, maxInches } = p.data as unknown as RulerReadData;
    return (
      `<div class="ruler-read">` +
      prompt('How long is the arrow?') +
      rulerSvg(start, end, maxInches) +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { maxInches } = data as unknown as RulerReadData;
    const maxW = ctx.largePrint ? 240 : 220; // CSS max-width
    const svgW = Math.min(ctx.contentWidthPt, maxW);
    const svgH = Math.ceil((92 * svgW) / (maxInches * 40 + 30)) + 2; // viewBox aspect
    return promptH(ctx) + svgH + answerH(ctx);
  },
};
