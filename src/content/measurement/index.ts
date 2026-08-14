// Measurement (K – G4)
// One file per question type; register each type in `measurementTypes`.

import type { QuestionType } from '../../engine/spec';
import { rulerRead } from './ruler-read';
import { compareLengths } from './compare-lengths';
import { areaPerimeter } from './area-perimeter';

export const measurementSubject = {
  id: 'measurement',
  name: 'Measurement',
  gradeRange: ['K', 'G4'] as const,
};

export const measurementTypes: QuestionType[] = [rulerRead, compareLengths, areaPerimeter];
