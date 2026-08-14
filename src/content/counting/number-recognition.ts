// Number recognition: "Circle the number 7" with nearby distractors.

import { fingerprintOf } from '../../engine/fingerprint';
import { chipRowH, chipW, promptH, rowsFor } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { numeralChip, prompt } from '../../render/problem';

interface RecognitionData extends Record<string, unknown> {
  target: number;
  options: number[];
}

export const numberRecognition: QuestionType = {
  id: 'number-recognition',
  subject: 'counting',
  name: 'Circle the number',
  description: 'Find and circle the given numeral among look-alikes.',
  gradeRange: ['preK', 'K'],
  difficultyPresets: {
    preK: { maxNumber: 5, options: 3 },
    K: { maxNumber: 10, options: 4 },
    G1: { maxNumber: 20, options: 5 },
  },
  params: [
    { key: 'maxNumber', label: 'Biggest number', type: 'int', min: 3, max: 20, default: 10 },
    { key: 'options', label: 'Choices', type: 'int', min: 3, max: 6, default: 4 },
  ],

  generate(rng, params): Problem {
    const maxNumber = params.maxNumber as number;
    const optionCount = params.options as number;
    const target = rng.int(1, maxNumber);

    // Distractors close to the target (within ±3), unique, in range.
    const pool: number[] = [];
    for (let d = -3; d <= 3; d++) {
      const v = target + d;
      if (v >= 0 && v <= maxNumber && v !== target) pool.push(v);
    }
    rng.shuffle(pool);
    const options = [target, ...pool.slice(0, optionCount - 1)];
    rng.shuffle(options);

    const data: RecognitionData = { target, options };
    return {
      typeId: 'number-recognition',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(target), detail: 'the number to circle' },
      fingerprint: fingerprintOf(['number-recognition', data.target, data.options.join(',')]),
    };
  },

  render(p): string {
    const { target, options } = p.data as unknown as RecognitionData;
    return (
      `<div class="number-recognition">` +
      prompt(`Circle the number <b>${target}</b>.`) +
      `<div class="chip-row">` +
      options.map((n) => numeralChip(n, 'chip')).join('') +
      `</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { options } = data as unknown as RecognitionData;
    const rows = rowsFor(options.length, chipW(ctx), 8, ctx.contentWidthPt);
    return promptH(ctx) + rows * chipRowH(ctx) + 8 * (rows - 1);
  },
};
