// Counting & Number Sense (pre-K – G1)
// One file per question type; register each type in `countingTypes`.

import type { QuestionType } from '../../engine/spec';
import { countObjects } from './count-objects';
import { numberRecognition } from './number-recognition';
import { quantityMatching } from './quantity-matching';
import { whichHasMore } from './which-has-more';
import { missingNumberSequence } from './missing-number-sequence';
import { numberTracing } from './number-tracing';
import { tenFrame } from './ten-frame';

export const countingSubject = {
  id: 'counting',
  name: 'Counting & Number Sense',
  gradeRange: ['preK', 'G1'] as const,
};

export const countingTypes: QuestionType[] = [
  countObjects,
  numberRecognition,
  quantityMatching,
  whichHasMore,
  missingNumberSequence,
  numberTracing,
  tenFrame,
];
