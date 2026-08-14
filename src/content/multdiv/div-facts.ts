// Division facts: a ÷ b = ___ — by construction, b is a real divisor of a
// so the quotient is always a whole number.

import { fingerprintOf } from '../../engine/fingerprint';
import { factH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { blank } from '../../render/problem';

interface DivFactsData extends Record<string, unknown> {
  dividend: number;
  divisor: number;
  quotient: number;
}

export const divFacts: QuestionType = {
  id: 'div-facts',
  subject: 'multdiv',
  name: 'Division facts',
  description: 'Division that comes out even — no remainders here.',
  gradeRange: ['G3', 'G4'],
  difficultyPresets: {
    G3: { maxQuotient: 9, maxDivisor: 5 },
    G4: { maxQuotient: 12, maxDivisor: 9 },
  },
  params: [
    { key: 'maxQuotient', label: 'Biggest quotient', type: 'int', min: 2, max: 12, default: 9 },
    { key: 'maxDivisor', label: 'Biggest divisor', type: 'int', min: 2, max: 9, default: 5 },
  ],

  generate(rng, params): Problem {
    // Build the division backwards: pick the quotient and divisor, then the
    // dividend follows — never a remainder, never a fraction.
    const maxQuotient = params.maxQuotient as number;
    const maxDivisor = params.maxDivisor as number;
    const quotient = rng.int(2, maxQuotient);
    const divisor = rng.int(2, maxDivisor);
    const dividend = quotient * divisor;

    const data: DivFactsData = { dividend, divisor, quotient };
    return {
      typeId: 'div-facts',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(quotient) },
      fingerprint: fingerprintOf(['div-facts', data.dividend, data.divisor, data.quotient]),
    };
  },

  render(p): string {
    const { dividend, divisor } = p.data as unknown as DivFactsData;
    return (
      `<div class="fact">` +
      `<span class="fact-nums">${dividend} ÷ ${divisor} =</span>${blank()}` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    return factH(ctx);
  },
};
