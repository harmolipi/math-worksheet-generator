// Shape matching: draw a line from each shape to its name. Left column is
// the pool in canonical order; right column is the shuffled names.

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import { lineH, matchIconPt, promptH, promptLines } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { icon } from '../../render/icons';
import { prompt } from '../../render/problem';
import { BASIC_SHAPES, SHAPE_NAMES } from './shapes';

interface ShapeMatchData extends Record<string, unknown> {
  left: string[]; // shape ids, canonical pool order
  right: string[]; // names, shuffled
}

export const shapeMatch: QuestionType = {
  id: 'shape-match',
  subject: 'geometry',
  name: 'Match shape to name',
  description: 'Draw a line from each shape to its name.',
  gradeRange: ['preK', 'G1'],
  difficultyPresets: {
    preK: { pairs: 2 },
    K: { pairs: 3 },
    G1: { pairs: 4 },
  },
  params: [
    { key: 'pairs', label: 'Pairs', type: 'int', min: 2, max: 4, default: 3 },
  ],

  generate(rng, params): Problem {
    const pairs = params.pairs as number;
    const left: string[] = [];
    while (left.length < pairs) {
      const shape = rng.pick(BASIC_SHAPES);
      if (!left.includes(shape)) left.push(shape);
    }
    const right = rng.shuffle(left.map((s) => SHAPE_NAMES[s]));

    const data: ShapeMatchData = { left, right };
    return {
      typeId: 'shape-match',
      index: 0,
      gradeLevel: 0,
      data,
      answer: {
        value: data.left.map((s) => SHAPE_NAMES[s]).join(', '),
        detail: 'left column top to bottom; the right column is shuffled',
      },
      fingerprint: fingerprintOf(['shape-match', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { left, right } = p.data as unknown as ShapeMatchData;
    const rows = left
      .map(
        (shape, i) =>
          `<div class="match-row">` +
          `<span class="match-icons">${icon(shape)}</span>` +
          `<span class="match-line"></span>` +
          `<span class="match-name">${right[i]}</span>` +
          `</div>`,
      )
      .join('');
    return (
      `<div class="shape-match">` +
      prompt('Draw a line from each shape to its name.') +
      `<div class="match-list">${rows}</div>` +
      `</div>`
    );
  },

  estHeightPt(data, ctx): number {
    const { left } = data as unknown as ShapeMatchData;
    const rows = left.length;
    // Icon-tall rows, 6pt apart; the prompt wraps in narrow columns.
    return (
      promptH(ctx) +
      (promptLines('Draw a line from each shape to its name.', ctx) - 1) * lineH(ctx) +
      rows * matchIconPt(ctx) +
      6 * (rows - 1)
    );
  },
};
