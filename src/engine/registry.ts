// Question-type registry: every content subject registers its types here.
// Adding a subject = new dir in src/content + one line in `allTypes`.

import type { QuestionType } from './spec';
import { countingTypes } from '../content/counting';
import { addsubTypes } from '../content/addsub';
import { multdivTypes } from '../content/multdiv';
import { placevalueTypes } from '../content/placevalue';
import { fractionTypes } from '../content/fractions';
import { timeTypes } from '../content/time';
import { manualTypes } from '../content/manual';

export const allTypes: QuestionType[] = [
  ...countingTypes,
  ...addsubTypes,
  ...multdivTypes,
  ...placevalueTypes,
  ...fractionTypes,
  ...timeTypes,
  ...manualTypes,
];

export const typeMap: Map<string, QuestionType> = new Map(
  allTypes.map((t) => [t.id, t]),
);

export function registeredTypeIds(): string[] {
  return allTypes.map((t) => t.id);
}
