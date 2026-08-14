// Missing number in a sequence: 3, 4, ___, 6 — write the missing number.

import { fingerprintOf } from '../../engine/fingerprint';
import { chipRowH, chipW, promptH, rowsFor } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { numeralChip, prompt, writeBox } from '../../render/problem';

interface SequenceData extends Record<string, unknown> {
  sequence: number[];
  missingIndex: number;
}

export const missingNumberSequence: QuestionType = {
  id: 'missing-number-sequence',
  subject: 'counting',
  name: 'Missing number',
  description: 'A counting sequence with one number missing — fill it in.',
  gradeRange: ['K', 'G1'],
  difficultyPresets: {
    K: { maxNumber: 10, step: 1, length: 6 },
    G1: { maxNumber: 20, step: 1, length: 8 },
  },
  params: [
    { key: 'maxNumber', label: 'Biggest number', type: 'int', min: 10, max: 100, default: 20 },
    {
      key: 'step',
      label: 'Count by',
      type: 'select',
      options: ['1', '2', '5', '10'],
      default: '1',
    },
    { key: 'length', label: 'Numbers shown', type: 'int', min: 5, max: 10, default: 8 },
  ],

  generate(rng, params): Problem {
    const maxNumber = params.maxNumber as number;
    const step = Number(params.step as string);
    const length = params.length as number;

    const maxStart = maxNumber - step * (length - 1);
    const start = rng.int(1, Math.max(1, maxStart));
    const sequence = Array.from({ length }, (_, i) => start + step * i);
    const missingIndex = rng.int(1, length - 2);

    const data: SequenceData = { sequence, missingIndex };
    return {
      typeId: 'missing-number-sequence',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(sequence[missingIndex]) },
      fingerprint: fingerprintOf(['missing-number-sequence', data.sequence.join(','), data.missingIndex]),
    };
  },

  render(p): string {
    const { sequence, missingIndex } = p.data as unknown as SequenceData;
    const chips = sequence
      .map((n, i) =>
        i === missingIndex
          ? `<span class="chip missing-chip">${writeBox()}</span>`
          : numeralChip(n, 'chip'),
      )
      .join('');
    return (
      `<div class="missing-number-sequence">` +
      prompt('Write the missing number.') +
      `<div class="chip-row">${chips}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { sequence } = data as unknown as SequenceData;
    const rows = rowsFor(sequence.length, chipW(ctx), 8, ctx.contentWidthPt);
    return promptH(ctx) + rows * chipRowH(ctx) + 8 * (rows - 1);
  },
};
