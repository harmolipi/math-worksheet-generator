// Number tracing: dotted digits to trace, then write it yourself.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt, traceDigit, writeBox } from '../../render/problem';

interface TracingData extends Record<string, unknown> {
  numbers: number[];
  style: 'dashed' | 'outline';
}

export const numberTracing: QuestionType = {
  id: 'number-tracing',
  subject: 'counting',
  name: 'Trace the numbers',
  description: 'Trace the dotted number, then write it on the line.',
  gradeRange: ['preK', 'K'],
  difficultyPresets: {
    preK: { maxNumber: 5, count: 3 },
    K: { maxNumber: 10, count: 5 },
    G1: { maxNumber: 20, count: 6 },
  },
  params: [
    { key: 'maxNumber', label: 'Numbers up to', type: 'int', min: 5, max: 20, default: 10 },
    { key: 'count', label: 'How many to trace', type: 'int', min: 1, max: 10, default: 5 },
    {
      key: 'style',
      label: 'Tracing style',
      type: 'select',
      options: ['dashed', 'outline'],
      default: 'dashed',
    },
  ],

  generate(rng, params): Problem {
    const maxNumber = params.maxNumber as number;
    const count = params.count as number;
    const style = params.style as TracingData['style'];

    const pool = Array.from({ length: maxNumber + 1 }, (_, i) => i);
    rng.shuffle(pool);
    const numbers = pool.slice(0, count).sort((a, b) => a - b);

    const data: TracingData = { numbers, style };
    return {
      typeId: 'number-tracing',
      index: 0,
      gradeLevel: 0,
      data,
      answer: null,
      fingerprint: fingerprintOf(['number-tracing', data.numbers.join(','), data.style]),
    };
  },

  render(p): string {
    const { numbers, style } = p.data as unknown as TracingData;
    const pairs = numbers
      .map(
        (n) =>
          `<div class="trace-pair">` +
          traceDigit(String(n), { style, width: 72, height: 84 }) +
          `<span class="trace-write">${writeBox()}</span>` +
          `</div>`,
      )
      .join('');
    return (
      `<div class="number-tracing">` +
      prompt('Trace each number, then write it again.') +
      `<div class="trace-grid">${pairs}</div>` +
      `</div>`
    );
  },

  estHeightPt(data): number {
    const count = (data as unknown as TracingData).numbers.length;
    return 100 + 96 * Math.ceil(count / 3);
  },
};
