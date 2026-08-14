// Classify shapes: six shapes labeled A–F, circle the three that belong to
// the category (quadrilaterals, curved shapes, polygons). By construction:
// pick the target members and the distractors, the answer letters follow
// from the shuffled positions.

import { canonicalJson, fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { icon } from '../../render/icons';
import { prompt } from '../../render/problem';
import { CURVED_SHAPES, POLYGON_SHAPES, SHAPE_NAMES } from './shapes';

interface ClassifyData extends Record<string, unknown> {
  shapes: string[]; // display order, length 6
  category: 'quadrilaterals' | 'curved' | 'polygons';
  targetIndices: number[]; // positions of target shapes in `shapes`
}

const CATEGORIES: Record<ClassifyData['category'], { label: string; members: string[]; others: string[] }> = {
  quadrilaterals: {
    label: 'quadrilaterals',
    members: ['square', 'rectangle', 'diamond', 'trapezoid'],
    others: ['circle', 'oval', 'triangle', 'pentagon', 'hexagon', 'crescent', 'heart'],
  },
  curved: {
    label: 'shapes with curves',
    members: CURVED_SHAPES,
    others: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'star', 'diamond'],
  },
  polygons: {
    label: 'polygons',
    members: POLYGON_SHAPES,
    others: ['circle', 'oval', 'crescent', 'heart', 'star'],
  },
};

const TARGET_COUNT = 3;

export const classify: QuestionType = {
  id: 'classify',
  subject: 'geometry',
  name: 'Which shapes belong?',
  description: 'Six shapes — circle the ones that fit the group.',
  gradeRange: ['G1', 'G3'],
  difficultyPresets: {
    G1: { category: 'curved' },
    G2: { category: 'quadrilaterals' },
    G3: { category: 'polygons' },
  },
  params: [
    {
      key: 'category',
      label: 'Circle the…',
      type: 'select',
      options: ['quadrilaterals', 'curved', 'polygons'],
      default: 'quadrilaterals',
    },
  ],

  generate(rng, params): Problem {
    const category = params.category as ClassifyData['category'];
    const { members, others } = CATEGORIES[category];
    const targets: string[] = [];
    while (targets.length < TARGET_COUNT) {
      const shape = rng.pick(members);
      if (!targets.includes(shape)) targets.push(shape);
    }
    const distractors: string[] = [];
    while (distractors.length < TARGET_COUNT) {
      const shape = rng.pick(others);
      if (!distractors.includes(shape) && !targets.includes(shape)) distractors.push(shape);
    }
    const shapes = rng.shuffle([...targets, ...distractors]);
    const targetIndices = targets.map((t) => shapes.indexOf(t)).sort((a, b) => a - b);

    const data: ClassifyData = { shapes, category, targetIndices };
    const letters = targetIndices.map((i) => String.fromCharCode(65 + i)).join(', ');
    return {
      typeId: 'classify',
      index: 0,
      gradeLevel: 0,
      data,
      answer: {
        value: letters,
        detail: targets.map((t) => SHAPE_NAMES[t]).join(', '),
      },
      fingerprint: fingerprintOf(['classify', canonicalJson(data)]),
    };
  },

  render(p): string {
    const { shapes, category } = p.data as unknown as ClassifyData;
    const { label } = CATEGORIES[category];
    const cells = shapes
      .map(
        (shape, i) =>
          `<div class="classify-cell">` +
          icon(shape) +
          `<span class="classify-letter">${String.fromCharCode(65 + i)}</span>` +
          `</div>`,
      )
      .join('');
    return (
      `<div class="classify">` +
      prompt(`Circle the <b>${label}</b>.`) +
      `<div class="classify-grid">${cells}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 118,
};
