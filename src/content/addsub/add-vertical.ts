// Vertical addition (column arithmetic) with optional carrying.
// Digits are generated per column so carry constraints hold BY CONSTRUCTION:
// - carry 'none': every column sums below 10
// - carry 'always': the ones column carries at least once
// - carry 'mixed': no constraint

import { fingerprintOf } from '../../engine/fingerprint';
import { digitRowH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';

interface AddVerticalData extends Record<string, unknown> {
  top: number;
  bottom: number;
  sum: number;
  digitCount: number;
  carries: number[]; // carry-in value per column, index 0 = ones column
}

function digitsOf(n: number, count: number): number[] {
  const out = Array.from({ length: count }, () => 0);
  for (let i = 0; i < count && n > 0; i++) {
    out[i] = n % 10;
    n = Math.floor(n / 10);
  }
  return out;
}

function carriesOf(td: number[], bd: number[]): number[] {
  const carries: number[] = [];
  let carry = 0;
  for (let i = 0; i < td.length; i++) {
    carries.push(carry);
    carry = td[i] + bd[i] + carry >= 10 ? 1 : 0;
  }
  return carries;
}

export const addVertical: QuestionType = {
  id: 'add-vertical',
  subject: 'addsub',
  name: 'Vertical addition',
  description: 'Column addition in neat rows, with carrying when ready.',
  gradeRange: ['G2', 'G4'],
  difficultyPresets: {
    G2: { digits: '2', carry: 'none' },
    G3: { digits: '2', carry: 'always' },
    G4: { digits: '3', carry: 'mixed' },
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
      key: 'carry',
      label: 'Carrying',
      type: 'select',
      options: ['none', 'always', 'mixed'],
      default: 'mixed',
    },
  ],

  generate(rng, params): Problem {
    const count = Number(params.digits as string);
    const carryMode = params.carry as string;

    const td: number[] = [];
    const bd: number[] = [];
    for (let pos = 0; pos < count; pos++) {
      const isMsd = pos === count - 1;
      // carry 'always' needs a ones-column top digit ≥ 1, else no bottom
      // digit can push the column sum to 10.
      const t =
        carryMode === 'always' && pos === 0
          ? rng.int(1, 9)
          : rng.int(isMsd ? 1 : 0, 9);
      let b: number;
      if (carryMode === 'none') {
        b = rng.int(isMsd ? 1 : 0, 9 - t);
      } else if (carryMode === 'always' && pos === 0) {
        b = rng.int(10 - t, 9);
      } else {
        b = rng.int(isMsd ? 1 : 0, 9);
      }
      td.push(t);
      bd.push(b);
    }

    const top = td.reduce((acc, d, i) => acc + d * 10 ** i, 0);
    const bottom = bd.reduce((acc, d, i) => acc + d * 10 ** i, 0);
    const sum = top + bottom;

    const data: AddVerticalData = {
      top,
      bottom,
      sum,
      digitCount: count,
      carries: carriesOf(td, bd),
    };
    return {
      typeId: 'add-vertical',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(sum) },
      fingerprint: fingerprintOf(['add-vertical', data.top, data.bottom, data.sum]),
    };
  },

  render(p): string {
    const { top, bottom, digitCount, carries } = p.data as unknown as AddVerticalData;
    const width = digitCount + 1; // room for the operator
    const cell = (content: string, cls: string) => `<span class="${cls}">${content}</span>`;

    // Carry row: small digits above the top number's columns.
    const carryCells = Array.from({ length: width }, (_, col) => {
      const pos = width - 1 - col; // position from the right; 0 = operator column
      const carry = pos - 1 >= 0 && pos - 1 < digitCount ? carries[pos - 1] : 0;
      return cell(carry > 0 ? String(carry) : '', 'carry-cell');
    }).join('');

    const topCells = [cell('', 'op-cell')]
      .concat(digitsOf(top, digitCount).reverse().map((d) => cell(String(d), 'digit-cell')))
      .join('');
    const bottomCells = [cell('+', 'op-cell')]
      .concat(digitsOf(bottom, digitCount).reverse().map((d) => cell(String(d), 'digit-cell')))
      .join('');
    const answerCells = Array.from({ length: width + 1 }, () => cell('', 'digit-cell')).join('');

    return (
      `<div class="add-vertical">` +
      `<div class="v-row carry-row">${carryCells}</div>` +
      `<div class="v-row">${topCells}</div>` +
      `<div class="v-row">${bottomCells}</div>` +
      `<div class="v-line"></div>` +
      `<div class="v-row">${answerCells}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { carries } = data as unknown as AddVerticalData;
    const rows = 3 + (carries.some((c) => c > 0) ? 1 : 0);
    return rows * digitRowH(ctx) + 2; // digit rows + hairline + borders
  },
};
