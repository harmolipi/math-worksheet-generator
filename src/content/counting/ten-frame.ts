// Ten frames: count the dots, or how many more make 10.

import { fingerprintOf } from '../../engine/fingerprint';
import { answerH, promptH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt, writeBox } from '../../render/problem';

interface TenFrameData extends Record<string, unknown> {
  count: number;
  mode: 'count' | 'make10';
}

const CELL = 30;
const GAP = 4;
const W = 5 * CELL + 4 * GAP;
const H = 2 * CELL + GAP;

function tenFrameSvg(count: number): string {
  let cells = '';
  for (let i = 0; i < 10; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = col * (CELL + GAP);
    const y = row * (CELL + GAP);
    cells +=
      `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="3" class="frame-cell"/>` +
      (i < count
        ? `<circle cx="${x + CELL / 2}" cy="${y + CELL / 2}" r="9" class="frame-dot"/>`
        : '');
  }
  return `<svg class="ten-frame" viewBox="0 0 ${W} ${H}" aria-hidden="true">${cells}</svg>`;
}

export const tenFrame: QuestionType = {
  id: 'ten-frame',
  subject: 'counting',
  name: 'Ten frames',
  description: 'Count the dots in a ten frame — or how many more make ten.',
  gradeRange: ['K', 'G1'],
  difficultyPresets: {
    K: { mode: 'count', maxCount: 10 },
    G1: { mode: 'make10', maxCount: 10 },
  },
  params: [
    {
      key: 'mode',
      label: 'Question',
      type: 'select',
      options: ['count', 'make10'],
      default: 'count',
    },
    { key: 'maxCount', label: 'Most dots', type: 'int', min: 1, max: 10, default: 10 },
  ],

  generate(rng, params): Problem {
    const mode = params.mode as TenFrameData['mode'];
    const maxCount = params.maxCount as number;
    const count = rng.int(1, mode === 'make10' ? 9 : maxCount);

    const data: TenFrameData = { count, mode };
    return {
      typeId: 'ten-frame',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(mode === 'make10' ? 10 - count : count) },
      fingerprint: fingerprintOf(['ten-frame', data.count, data.mode]),
    };
  },

  render(p): string {
    const { count, mode } = p.data as unknown as TenFrameData;
    const question = mode === 'make10' ? 'How many more dots make 10?' : 'How many dots?';
    return (
      `<div class="ten-frame-problem">` +
      prompt(question) +
      tenFrameSvg(count) +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    // Prompt + fixed 48pt frame + answer line.
    return promptH(ctx) + 50 + answerH(ctx);
  },
};
