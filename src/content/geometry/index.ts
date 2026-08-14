// Geometry (preK – G3)
// One file per question type; register each type in `geometryTypes`.

import type { QuestionType } from '../../engine/spec';
import { shapeIdentify } from './shape-identify';
import { sidesCorners } from './sides-corners';
import { shapeMatch } from './shape-match';
import { symmetry } from './symmetry';
import { classify } from './classify';

export const geometrySubject = {
  id: 'geometry',
  name: 'Geometry',
  gradeRange: ['preK', 'G3'] as const,
};

export const geometryTypes: QuestionType[] = [shapeIdentify, sidesCorners, shapeMatch, symmetry, classify];
