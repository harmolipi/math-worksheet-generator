// Name the shape: a big shape icon, child writes its name. By construction:
// pick the shape from a pool, the name comes from the shared shape map.

import { fingerprintOf } from '../../engine/fingerprint';
import type { Problem, QuestionType } from '../../engine/spec';
import { icon } from '../../render/icons';
import { prompt, writeBox } from '../../render/problem';
import { BASIC_SHAPES, POLYGON_SHAPES, SHAPE_NAMES } from './shapes';

interface ShapeIdentifyData extends Record<string, unknown> {
  shape: string;
  name: string;
}

export const shapeIdentify: QuestionType = {
  id: 'shape-identify',
  subject: 'geometry',
  name: 'Name the shape',
  description: 'A big shape — write its name.',
  gradeRange: ['K', 'G1'],
  difficultyPresets: {
    K: { shapeSet: 'basic' },
    G1: { shapeSet: 'polygons' },
  },
  params: [
    { key: 'shapeSet', label: 'Shapes', type: 'select', options: ['basic', 'polygons'], default: 'basic' },
  ],

  generate(rng, params): Problem {
    const pool = params.shapeSet === 'polygons' ? POLYGON_SHAPES : BASIC_SHAPES;
    const shape = rng.pick(pool);
    const name = SHAPE_NAMES[shape];

    const data: ShapeIdentifyData = { shape, name };
    return {
      typeId: 'shape-identify',
      index: 0,
      gradeLevel: 0,
      data,
      answer: { value: name },
      fingerprint: fingerprintOf(['shape-identify', data.shape]),
    };
  },

  render(p): string {
    const { shape } = p.data as unknown as ShapeIdentifyData;
    return (
      `<div class="shape-identify">` +
      prompt('What shape is this?') +
      `<div class="shape-big">${icon(shape, 'shape-glyph')}</div>` +
      `<div class="count-answer">${writeBox()}</div>` +
      `</div>`
    );
  },

  estHeightPt: () => 116,
};
