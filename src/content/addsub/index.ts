// Addition & Subtraction (K – G5)
// One file per question type; register each type in `addsubTypes`.

import type { QuestionType } from '../../engine/spec';
import { addFacts } from './add-facts';
import { subFacts } from './sub-facts';
import { addVertical } from './add-vertical';

export const addsubSubject = {
  id: 'addsub',
  name: 'Addition & Subtraction',
  gradeRange: ['K', 'G5'] as const,
};

export const addsubTypes: QuestionType[] = [addFacts, subFacts, addVertical];
