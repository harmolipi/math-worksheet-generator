// Odd or even: circle the odd (or even) numbers in a list.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { numeralChip, prompt } from '../../render/problem';

interface OddEvenData extends Record<string, unknown> {
  numbers: number[];
  target: 'odd' | 'even';
}

export const oddEven: QuestionType = {
  id: 'odd-even',
  subject: 'placevalue',
  name: 'Odd or even',
  description: 'Circle the odd (or even) numbers in the row.',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {
    G1: { maxNumber: 20 },
    G2: { maxNumber: 100 },
    G3: { maxNumber: 1000 },
  },
  params: [
    { key: 'maxNumber', label: 'Biggest number', type: 'int', min: 10, max: 1000, default: 100 },
    {
      key: 'target',
      label: 'Circle the…',
      type: 'select',
      options: ['odd', 'even', 'random'],
      default: 'random',
    },
  ],

  generate(rng, params): Problem {
    const maxNumber = params.maxNumber as number;
    const targetParam = params.target as string;
    const target: 'odd' | 'even' =
      targetParam === 'random' ? (rng.int(0, 1) === 0 ? 'odd' : 'even') : (targetParam as 'odd' | 'even');

    const numbers: number[] = [];
    while (numbers.length < 6) {
      const n = rng.int(1, maxNumber);
      if (!numbers.includes(n)) numbers.push(n);
    }

    const data: OddEvenData = { numbers, target };
    const matches = numbers.filter((n) => (target === 'odd' ? n % 2 === 1 : n % 2 === 0));
    return {
      typeId: 'odd-even',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: matches.join(', ') },
      fingerprint: fingerprintOf(['odd-even', data.numbers.join(','), data.target]),
    };
  },

  render(p): string {
    const { numbers, target } = p.data as unknown as OddEvenData;
    return (
      `<div class="odd-even">` +
      prompt(`Circle the <b>${target.toUpperCase()}</b> numbers.`) +
      `<div class="chip-row">${numbers.map((n) => numeralChip(n, 'chip')).join('')}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 64,
};
