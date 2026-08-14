// Count sides or corners: a polygon shape, child writes the count. By
// construction: pick the shape, the count comes from the shared side map.

import { fingerprintOf } from '../../engine/fingerprint';
import { answerH, promptH } from '../estimate';
import type { Problem, QuestionType } from '../../engine/spec';
import { icon } from '../../render/icons';
import { prompt, writeBox } from '../../render/problem';
import { POLYGON_SHAPES, SHAPE_SIDES } from './shapes';

interface SidesCornersData extends Record<string, unknown> {
  shape: string;
  question: 'sides' | 'corners';
  count: number;
}

export const sidesCorners: QuestionType = {
  id: 'sides-corners',
  subject: 'geometry',
  name: 'Sides and corners',
  description: 'A shape — how many sides (or corners) does it have?',
  gradeRange: ['K', 'G2'],
  difficultyPresets: {
    K: { question: 'sides' },
    G1: { question: 'random' },
    G2: { question: 'corners' },
  },
  params: [
    { key: 'question', label: 'Count the…', type: 'select', options: ['sides', 'corners', 'random'], default: 'sides' },
  ],

  generate(rng, params): Problem {
    const shape = rng.pick(POLYGON_SHAPES);
    const questionParam = params.question as string;
    const question: 'sides' | 'corners' =
      questionParam === 'random'
        ? rng.int(0, 1) === 0
          ? 'sides'
          : 'corners'
        : (questionParam as 'sides' | 'corners');
    const count = SHAPE_SIDES[shape];

    const data: SidesCornersData = { shape, question, count };
    return {
      typeId: 'sides-corners',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: String(count) },
      fingerprint: fingerprintOf(['sides-corners', data.shape, data.question]),
    };
  },

  render(p): string {
    const { shape, question } = p.data as unknown as SidesCornersData;
    return (
      `<div class="sides-corners">` +
      prompt(`How many <b>${question}</b>?`) +
      `<div class="shape-big">${icon(shape, 'shape-glyph')}</div>` +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt(_data, ctx): number {
    return promptH(ctx) + (ctx.largePrint ? 68 : 56) + answerH(ctx) + 8;
  },
};
