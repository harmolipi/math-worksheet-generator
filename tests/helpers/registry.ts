import type { QuestionType } from '../../src/engine/spec';
import { manualType } from '../../src/content/manual/manual';

/**
 * Test registry. Content types are registered in src/engine/registry.ts, but
 * tests that want a minimal, known set of types build their own map here.
 */
export const registry: Map<string, QuestionType> = new Map(
  [manualType].map((t) => [t.id, t]),
);
