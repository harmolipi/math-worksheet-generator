// Quantity matching: draw a line from each numeral to its group of pictures.

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { ICON_SETS } from '../../render/icons';
import { iconGroup, prompt } from '../../render/problem';

interface Match extends Record<string, unknown> {
  value: number;
  icons: string[];
}

interface MatchingData extends Record<string, unknown> {
  left: Match[]; // numerals, in ascending order
  right: Match[]; // icon groups, shuffled
}

export const quantityMatching: QuestionType = {
  id: 'quantity-matching',
  subject: 'counting',
  name: 'Match number to group',
  description: 'Draw a line from each number to its group of pictures.',
  gradeRange: ['preK', 'G1'],
  difficultyPresets: {
    preK: { pairs: 2, maxNumber: 5 },
    K: { pairs: 3, maxNumber: 10 },
    G1: { pairs: 4, maxNumber: 10 },
  },
  params: [
    { key: 'pairs', label: 'Pairs', type: 'int', min: 2, max: 4, default: 3 },
    { key: 'maxNumber', label: 'Biggest number', type: 'int', min: 3, max: 10, default: 10 },
    {
      key: 'iconSet',
      label: 'Pictures',
      type: 'select',
      options: ['mixed', 'shapes', 'fruit', 'animals', 'objects'],
      default: 'mixed',
    },
  ],

  generate(rng, params): Problem {
    const pairs = params.pairs as number;
    const maxNumber = params.maxNumber as number;
    const pool = ICON_SETS[params.iconSet as string] ?? ICON_SETS.mixed;

    // Distinct values, ascending on the numeral side.
    const values: number[] = [];
    while (values.length < pairs) {
      const v = rng.int(1, maxNumber);
      if (!values.includes(v)) values.push(v);
    }
    values.sort((a, b) => a - b);

    const matches: Match[] = values.map((value) => {
      const one = rng.pick(pool);
      return { value, icons: Array.from({ length: value }, () => one) };
    });
    const right = rng.shuffle([...matches]);

    const data: MatchingData = { left: matches, right };
    return {
      typeId: 'quantity-matching',
      index: 0,
      gradeLevel: 0,
      data,
      answer: {
        value: matches.map((m) => `${m.value} → ${m.value}`).join('   '),
        detail: 'match each number to its group',
      },
      fingerprint: fingerprintOf(['quantity-matching', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { left, right } = p.data as unknown as MatchingData;
    const rows = left
      .map(
        (m, i) =>
          `<div class="match-row">` +
          `<span class="match-numeral">${m.value}</span>` +
          `<span class="match-line"></span>` +
          iconGroup(right[i].icons, 'match-icons') +
          `</div>`,
      )
      .join('');
    return `<div class="quantity-matching">${prompt('Draw a line from each number to its group.')}<div class="match-list">${rows}</div></div>`;
  },

  estHeightPt(data): number {
    return 66 + 30 * (data as unknown as MatchingData).left.length;
  },
};
