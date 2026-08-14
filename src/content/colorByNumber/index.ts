// Color by Number (preK – G1)
// One file per question type; register each type in `colorByNumberTypes`.

import type { QuestionType } from '../../engine/spec';
import { colorByNumber } from './color-by-number';

export const colorByNumberSubject = {
  id: 'colorByNumber',
  name: 'Color by Number',
  gradeRange: ['preK', 'G1'] as const,
};

export const colorByNumberTypes: QuestionType[] = [colorByNumber];
