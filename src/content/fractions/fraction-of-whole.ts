// Fraction of a whole number: "1/3 of 12 = ___" — by construction, the whole
// is a multiple of the denominator, so the answer is always an integer.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { blank } from '../../render/problem';

interface OfWholeData extends Record<string, unknown> {
  numerator: number;
  denominator: number;
  whole: number;
  answer: number;
}

const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10];

export const fractionOfWhole: QuestionType = {
  id: 'fraction-of-whole',
  subject: 'fractions',
  name: 'Fraction of a number',
  description: 'Find a fraction of a whole number — always comes out even.',
  gradeRange: ['G3', 'G5'],
  difficultyPresets: {
    G3: { denominators: '2,3,4', maxAnswer: 6 },
    G4: { denominators: '3,4,5,6', maxAnswer: 10 },
    G5: { denominators: '4,6,8,10', maxAnswer: 12 },
  },
  params: [
    {
      key: 'denominators',
      label: 'Denominators',
      type: 'select',
      options: ['2,3,4', '3,4,5,6', '4,6,8,10'],
      default: '2,3,4',
    },
    { key: 'maxAnswer', label: 'Biggest answer', type: 'int', min: 2, max: 20, default: 10 },
  ],

  generate(rng, params): Problem {
    const allowed = (params.denominators as string).split(',').map(Number);
    const denominator = rng.pick(allowed.filter((d) => DENOMINATORS.includes(d)));
    const maxAnswer = params.maxAnswer as number;
    const unit = rng.int(1, maxAnswer); // whole ÷ denominator
    const numerator = rng.int(1, denominator - 1);
    const whole = unit * denominator;
    // n/d of whole = unit × n — always an integer by construction.
    const answer = unit * numerator;

    const data: OfWholeData = { numerator, denominator, whole, answer };
    return {
      typeId: 'fraction-of-whole',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(answer) },
      fingerprint: fingerprintOf(['fraction-of-whole', data.numerator, data.denominator, data.whole]),
    };
  },

  render(p): string {
    const { numerator, denominator, whole } = p.data as unknown as OfWholeData;
    return (
      `<div class="fact">` +
      `<span class="frac-stack">${numerator}<span class="frac-line">${denominator}</span></span>` +
      `<span class="fact-nums"> of ${whole} =</span>${blank()}` +
      `</div>`
    );
  },

  estHeightPt: () => 64,
};
