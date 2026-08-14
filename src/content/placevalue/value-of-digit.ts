// Value of a digit: "What is the 4 worth in 3,470?" — the underlined digit.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { prompt, writeBox } from '../../render/problem';

interface ValueOfDigitData extends Record<string, unknown> {
  number: number;
  digit: number;
  place: number; // 1, 10, 100, 1000
  targetIndex: number; // index of the underlined digit from the left
}

function digitsOf(n: number): number[] {
  if (n === 0) return [0];
  const out: number[] = [];
  while (n > 0) {
    out.unshift(n % 10);
    n = Math.floor(n / 10);
  }
  return out;
}

export const valueOfDigit: QuestionType = {
  id: 'value-of-digit',
  subject: 'placevalue',
  name: 'What is the digit worth?',
  description: 'Find the value of the underlined digit.',
  gradeRange: ['G1', 'G4'],
  difficultyPresets: {
    G1: { digits: '2' },
    G2: { digits: '3' },
    G3: { digits: '3' },
    G4: { digits: '4' },
  },
  params: [
    { key: 'digits', label: 'Digit places', type: 'select', options: ['2', '3', '4'], default: '3' },
  ],

  generate(rng, params): Problem {
    const count = Number(params.digits as string);
    const number = rng.int(10 ** (count - 1), 10 ** count - 1);
    const ds = digitsOf(number);
    // Prefer a non-zero, non-leading digit to underline
    const candidates = ds.map((d, i) => ({ d, i })).filter(({ d, i }) => d !== 0 && i > 0);
    const pick = candidates.length > 0 ? rng.pick(candidates) : { d: ds[0], i: 0 };
    const place = 10 ** (count - 1 - pick.i);

    const data: ValueOfDigitData = {
      number,
      digit: pick.d,
      place,
      targetIndex: pick.i,
    };
    return {
      typeId: 'value-of-digit',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(pick.d * place) },
      fingerprint: fingerprintOf(['value-of-digit', data.number, data.digit, data.place]),
    };
  },

  render(p): string {
    const { number, digit, targetIndex } = p.data as unknown as ValueOfDigitData;
    const ds = digitsOf(number);
    const shown = ds
      .map((d, i) => (i === targetIndex ? `<u class="digit-underlined">${d}</u>` : String(d)))
      .join('');
    return (
      `<div class="value-of-digit">` +
      prompt(`What is the <b>${digit}</b> worth in <b>${shown}</b>?`) +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 72,
};
