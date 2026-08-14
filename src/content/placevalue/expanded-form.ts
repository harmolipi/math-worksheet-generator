// Expanded form: 347 = 300 + 40 + 7.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { blank } from '../../render/problem';

interface ExpandedData extends Record<string, unknown> {
  number: number;
  expanded: string;
}

export const expandedForm: QuestionType = {
  id: 'expanded-form',
  subject: 'placevalue',
  name: 'Expanded form',
  description: 'Break a number into hundreds + tens + ones.',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {
    G1: { digits: '2' },
    G2: { digits: '3' },
    G3: { digits: '4' },
  },
  params: [
    { key: 'digits', label: 'Digit places', type: 'select', options: ['2', '3', '4'], default: '3' },
  ],

  generate(rng, params): Problem {
    const count = Number(params.digits as string);
    const number = rng.int(10 ** (count - 1), 10 ** count - 1);
    const parts: string[] = [];
    let rest = number;
    for (let place = 10 ** (count - 1); place >= 1; place = Math.floor(place / 10)) {
      const digit = Math.floor(rest / place);
      rest -= digit * place;
      if (digit > 0) parts.push(String(digit * place));
    }
    const data: ExpandedData = { number, expanded: parts.join(' + ') };
    return {
      typeId: 'expanded-form',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: data.expanded },
      fingerprint: fingerprintOf(['expanded-form', data.number, data.expanded]),
    };
  },

  render(p): string {
    const { number } = p.data as unknown as ExpandedData;
    return (
      `<div class="fact">` +
      `<span class="fact-nums">${number} =</span>${blank()}` +
      `</div>`
    );
  },

  estHeightPt: () => 52,
};
