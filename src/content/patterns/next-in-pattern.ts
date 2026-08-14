// Next in the pattern: a repeating icon sequence (ABAB, AABB, ABC…), pick
// the next picture from three choices. By construction: the cycle determines
// the next element; distractors are other pool icons.

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import { chipRowH, promptH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { ICON_SETS, icon } from '../../render/icons';
import { prompt } from '../../render/problem';

interface NextInPatternData extends Record<string, unknown> {
  cycle: string[]; // the repeating unit (2–3 distinct icons)
  sequence: string[]; // shown row (6 icons from the cycle)
  options: string[]; // 3 candidates: options[answerIndex] is correct
  answerIndex: number;
}

const TEMPLATES: number[][] = [
  [0, 1], // ABAB…
  [0, 0, 1], // AAB…
  [0, 1, 2], // ABC…
  [0, 1, 1], // ABB…
];

export const nextInPattern: QuestionType = {
  id: 'next-in-pattern',
  subject: 'patterns',
  name: 'What comes next?',
  description: 'A repeating picture pattern — pick the picture that comes next.',
  gradeRange: ['preK', 'G2'],
  difficultyPresets: {
    preK: { iconSet: 'shapes' },
    K: { iconSet: 'mixedPlus' },
    G1: { iconSet: 'polygons' },
    G2: { iconSet: 'polygons' },
  },
  params: [
    {
      key: 'iconSet',
      label: 'Pictures',
      type: 'select',
      options: ['shapes', 'polygons', 'fruit', 'animals', 'vehicles', 'foods', 'weather', 'moreAnimals', 'moreObjects', 'mixedPlus'],
      default: 'shapes',
    },
  ],

  generate(rng, params): Problem {
    const pool = ICON_SETS[params.iconSet as string] ?? ICON_SETS.mixedPlus;
    // Two or three distinct base icons for the cycle.
    const base: string[] = [];
    const baseCount = rng.int(2, 3);
    while (base.length < baseCount) {
      const id = rng.pick(pool);
      if (!base.includes(id)) base.push(id);
    }
    const template = rng.pick(TEMPLATES.filter((t) => Math.max(...t) < baseCount));
    const cycle = template.map((i) => base[i]);
    const sequence = Array.from({ length: 6 }, (_, i) => cycle[i % cycle.length]);

    // Next element is fixed by the cycle; distractors are other pool icons.
    const correct = cycle[sequence.length % cycle.length];
    const distractors: string[] = [];
    while (distractors.length < 2) {
      const id = rng.pick(pool);
      if (id !== correct && !distractors.includes(id)) distractors.push(id);
    }
    const options = rng.shuffle([correct, ...distractors]);
    const answerIndex = options.indexOf(correct);

    const data: NextInPatternData = { cycle, sequence, options, answerIndex };
    return {
      typeId: 'next-in-pattern',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String.fromCharCode(65 + answerIndex) },
      fingerprint: fingerprintOf(['next-in-pattern', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { sequence, options } = p.data as unknown as NextInPatternData;
    const optionChips = options
      .map(
        (id, i) =>
          `<span class="chip pattern-chip">${String.fromCharCode(65 + i)} ${icon(id)}</span>`,
      )
      .join('');
    return (
      `<div class="next-in-pattern">` +
      prompt('What picture comes next? Circle it.') +
      `<div class="pattern-row">` +
      sequence.map((id) => icon(id)).join('') +
      `<span class="pattern-blank"></span>` +
      `</div>` +
      `<div class="chip-row pattern-options">${optionChips}</div>` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    // Prompt + pattern icon row + option chips row.
    return promptH(ctx) + (ctx.largePrint ? 28 : 22) + 8 + chipRowH(ctx) + 6;
  },
};
