// Which has more? Two picture groups; circle the larger (or smaller).

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { ICON_SETS } from '../../render/icons';
import { iconGroup, prompt } from '../../render/problem';

interface CompareData extends Record<string, unknown> {
  question: 'more' | 'fewer';
  left: { icons: string[]; count: number };
  right: { icons: string[]; count: number };
}

export const whichHasMore: QuestionType = {
  id: 'which-has-more',
  subject: 'counting',
  name: 'Which has more?',
  description: 'Compare two groups of pictures and circle the answer.',
  gradeRange: ['preK', 'K'],
  difficultyPresets: {
    preK: { maxCount: 5 },
    K: { maxCount: 10 },
  },
  params: [
    { key: 'maxCount', label: 'Biggest count', type: 'int', min: 3, max: 10, default: 10 },
    {
      key: 'question',
      label: 'Circle the group with…',
      type: 'select',
      options: ['more', 'fewer', 'random'],
      default: 'random',
    },
  ],

  generate(rng, params): Problem {
    const maxCount = params.maxCount as number;
    const a = rng.int(2, maxCount);
    const delta = rng.int(1, Math.max(1, Math.min(3, maxCount - 1)));
    const b = rng.int(0, 1) === 0 ? a + delta : a - delta;
    // clamp: b must stay ≥ 1 and ≠ a
    const rightCount = Math.min(Math.max(b, 1), maxCount) === a ? a + 1 : Math.min(Math.max(b, 1), maxCount);
    const questionParam = params.question as string;
    const question: 'more' | 'fewer' =
      questionParam === 'random' ? (rng.int(0, 1) === 0 ? 'more' : 'fewer') : (questionParam as 'more' | 'fewer');

    const pool = ICON_SETS.mixed;
    const makeGroup = (count: number) => {
      const one = rng.pick(pool);
      return { count, icons: Array.from({ length: count }, () => one) };
    };

    const data: CompareData = {
      question,
      left: makeGroup(a),
      right: makeGroup(rightCount),
    };

    const winnerSide =
      question === 'more'
        ? data.left.count >= data.right.count
          ? 'A'
          : 'B'
        : data.left.count <= data.right.count
          ? 'A'
          : 'B';
    const winnerCount = winnerSide === 'A' ? data.left.count : data.right.count;

    return {
      typeId: 'which-has-more',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: `Group ${winnerSide} (${winnerCount})`, detail: `circle the group with ${question}` },
      fingerprint: fingerprintOf(['which-has-more', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { question, left, right } = p.data as unknown as CompareData;
    const label = question === 'more' ? 'MORE' : 'FEWER';
    const box = (icons: string[], tag: string) =>
      `<div class="compare-box"><span class="compare-tag">${tag}</span>` +
      iconGroup(icons, 'icon-group row') +
      `</div>`;
    return (
      `<div class="which-has-more">` +
      prompt(`Circle the group with <b>${label}</b>.`) +
      `<div class="compare-row">${box(left.icons, 'A')}${box(right.icons, 'B')}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 106,
};
