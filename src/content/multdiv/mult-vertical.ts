// Vertical multiplication: multi-digit × single-digit.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';

interface MultVerticalData extends Record<string, unknown> {
  top: number;
  factor: number;
  product: number;
  digitCount: number;
}

function digitsOf(n: number, count: number): number[] {
  const out = Array.from({ length: count }, () => 0);
  for (let i = 0; i < count && n > 0; i++) {
    out[i] = n % 10;
    n = Math.floor(n / 10);
  }
  return out;
}

export const multVertical: QuestionType = {
  id: 'mult-vertical',
  subject: 'multdiv',
  name: 'Vertical multiplication',
  description: 'Big number on top, single digit below — classic column form.',
  gradeRange: ['G3', 'G5'],
  difficultyPresets: {
    G3: { digits: '2', maxFactor: 5 },
    G4: { digits: '2', maxFactor: 9 },
    G5: { digits: '3', maxFactor: 9 },
  },
  params: [
    {
      key: 'digits',
      label: 'Digit places on top',
      type: 'select',
      options: ['2', '3'],
      default: '2',
    },
    { key: 'maxFactor', label: 'Biggest bottom number', type: 'int', min: 2, max: 9, default: 9 },
  ],

  generate(rng, params): Problem {
    const count = Number(params.digits as string);
    const maxFactor = params.maxFactor as number;
    const top = rng.int(10 ** (count - 1), 10 ** count - 1);
    const factor = rng.int(2, maxFactor);
    const product = top * factor;

    const data: MultVerticalData = { top, factor, product, digitCount: count };
    return {
      typeId: 'mult-vertical',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(product) },
      fingerprint: fingerprintOf(['mult-vertical', data.top, data.factor, data.product]),
    };
  },

  render(p): string {
    const { top, factor, digitCount } = p.data as unknown as MultVerticalData;
    const width = digitCount + 1;
    const cell = (content: string, cls: string) => `<span class="${cls}">${content}</span>`;
    const topCells = [cell('', 'op-cell')]
      .concat(digitsOf(top, digitCount).reverse().map((d) => cell(String(d), 'digit-cell')))
      .join('');
    const bottomCells = [cell('×', 'op-cell')]
      .concat([cell(String(factor), 'digit-cell')])
      .join('');
    const answerCells = Array.from({ length: width + 1 }, () => cell('', 'digit-cell')).join('');
    return (
      `<div class="add-vertical">` +
      `<div class="v-row">${topCells}</div>` +
      `<div class="v-row">${bottomCells}</div>` +
      `<div class="v-line"></div>` +
      `<div class="v-row">${answerCells}</div>` +
      `</div>`
    );
  },

  estHeightPt(data): number {
    return 104 + 18 * ((data as unknown as MultVerticalData).digitCount - 2);
  },
};
