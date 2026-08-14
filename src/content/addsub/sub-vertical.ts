// Vertical subtraction (column arithmetic) with optional borrowing.
// Digits are generated per column so borrow constraints hold BY CONSTRUCTION:
// - borrow 'none': every column's top digit ≥ bottom digit
// - borrow 'always': the ones column borrows (top ones digit < bottom ones digit)

import { fingerprintOf } from '../../engine/fingerprint';
import { digitRowH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';

interface SubVerticalData extends Record<string, unknown> {
  top: number;
  bottom: number;
  diff: number;
  digitCount: number;
  hasBorrow: boolean;
}

function digitsOf(n: number, count: number): number[] {
  const out = Array.from({ length: count }, () => 0);
  for (let i = 0; i < count && n > 0; i++) {
    out[i] = n % 10;
    n = Math.floor(n / 10);
  }
  return out;
}

export const subVertical: QuestionType = {
  id: 'sub-vertical',
  subject: 'addsub',
  name: 'Vertical subtraction',
  description: 'Column subtraction in neat rows, with borrowing when ready.',
  gradeRange: ['G2', 'G4'],
  difficultyPresets: {
    G2: { digits: '2', borrow: 'none' },
    G3: { digits: '2', borrow: 'always' },
    G4: { digits: '3', borrow: 'mixed' },
  },
  params: [
    {
      key: 'digits',
      label: 'Digit places',
      type: 'select',
      options: ['1', '2', '3'],
      default: '2',
    },
    {
      key: 'borrow',
      label: 'Borrowing',
      type: 'select',
      options: ['none', 'always', 'mixed'],
      default: 'mixed',
    },
  ],

  generate(rng, params): Problem {
    const count = Number(params.digits as string);
    const borrowMode = params.borrow as string;

    const td: number[] = [];
    const bd: number[] = [];
    for (let pos = 0; pos < count; pos++) {
      const isMsd = pos === count - 1;
      let t = rng.int(isMsd ? 1 : 0, 9);
      let b: number;
      if (borrowMode === 'none') {
        b = rng.int(isMsd ? 1 : 0, t);
      } else if (borrowMode === 'always' && pos === 0) {
        // force t < b in the ones column; keep t ≥ 1 so a borrow is possible
        t = rng.int(1, 8);
        b = rng.int(t + 1, 9);
      } else if (borrowMode === 'always' && pos > 0 && !isMsd) {
        b = rng.int(Math.min(9, t + 1), 9); // may borrow mid-columns
      } else {
        b = rng.int(isMsd ? 1 : 0, 9);
      }
      td.push(t);
      bd.push(b);
    }

    let top = td.reduce((acc, d, i) => acc + d * 10 ** i, 0);
    let bottom = bd.reduce((acc, d, i) => acc + d * 10 ** i, 0);
    // Never a negative answer: if a mixed column combo flipped the order, swap.
    if (bottom > top) [top, bottom] = [bottom, top];

    const topDigits = digitsOf(top, count);
    const bottomDigits = digitsOf(bottom, count);
    const diff = top - bottom;
    const data: SubVerticalData = {
      top,
      bottom,
      diff,
      digitCount: count,
      hasBorrow: topDigits.some((d, i) => d < bottomDigits[i]),
    };
    return {
      typeId: 'sub-vertical',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(data.diff) },
      fingerprint: fingerprintOf(['sub-vertical', data.top, data.bottom, data.diff]),
    };
  },

  render(p): string {
    const { top, bottom, digitCount } = p.data as unknown as SubVerticalData;
    const width = digitCount + 1;
    const cell = (content: string, cls: string) => `<span class="${cls}">${content}</span>`;
    const topCells = [cell('', 'op-cell')]
      .concat(digitsOf(top, digitCount).reverse().map((d) => cell(String(d), 'digit-cell')))
      .join('');
    const bottomCells = [cell('-', 'op-cell')]
      .concat(digitsOf(bottom, digitCount).reverse().map((d) => cell(String(d), 'digit-cell')))
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

  estHeightPt(_data, ctx): number {
    return 3 * digitRowH(ctx) + 2; // top/bottom/answer rows + hairline
  },
};
