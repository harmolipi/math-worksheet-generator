// Problem generation: spec + frozen RNG → problems per section, with
// per-section dedupe and deterministic difficulty resolution.

import { createRng, type Rng } from './rng';
import { normalizeSeed } from './seed';
import {
  GRADE_LEVEL,
  SheetError,
  type GradeBand,
  type Problem,
  type QuestionType,
  type WorksheetSpec,
} from './spec';

const DEDUPE_RETRIES = 20;
const MAX_LEVEL = 6; // G5 — clamps challenge/mixed at the top of the catalog

export interface GeneratedSection {
  typeIds: string[];
  problems: Problem[];
}

const BANDS: GradeBand[] = ['preK', 'K', 'G1', 'G2', 'G3', 'G4', 'G5'];

function bandOfLevel(level: number): GradeBand {
  return BANDS[Math.min(Math.max(level, 0), BANDS.length - 1)];
}

/** defaults (ParamSpec) → difficulty preset for the band → section overrides */
function resolveParams(
  type: QuestionType,
  level: number,
  overrides: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const preset = type.difficultyPresets[bandOfLevel(level)] ?? {};
  const defaults: Record<string, unknown> = {};
  for (const p of type.params) defaults[p.key] = p.default;
  return { ...defaults, ...preset, ...(overrides ?? {}) };
}

function resolveLevel(
  rng: Rng,
  spec: WorksheetSpec,
  difficulty: 'easy' | 'grade' | 'challenge' | 'mixed',
): number {
  const base = GRADE_LEVEL[spec.gradeBand];
  switch (difficulty) {
    case 'easy':
      return Math.max(0, base - 1);
    case 'challenge':
      return Math.min(MAX_LEVEL, base + 1);
    case 'mixed':
      return Math.min(MAX_LEVEL, Math.max(0, base + rng.int(-1, 1)));
    case 'grade':
      return base;
  }
}

/**
 * Generate all sections. Deterministic: one rng stream, consumed in section
 * order then round-robin entry order; any reordering changes output (and is
 * caught by golden tests).
 */
export function generateSections(
  spec: WorksheetSpec,
  types: Map<string, QuestionType>,
): GeneratedSection[] {
  const rng = createRng(normalizeSeed(spec.seed));
  const sections: GeneratedSection[] = [];

  for (const section of spec.sections) {
    const problems: Problem[] = [];
    const seen = new Set<string>();

    // Expand (typeId, count) pairs into a round-robin interleaved order.
    const entries: string[] = [];
    const remaining = [...section.counts];
    let done = false;
    while (!done) {
      done = true;
      for (let t = 0; t < section.typeIds.length; t++) {
        if (remaining[t] > 0) {
          entries.push(section.typeIds[t]);
          remaining[t]--;
          done = false;
        }
      }
    }

    const difficulty = section.difficulty ?? 'grade';
    for (const typeId of entries) {
      const type = types.get(typeId);
      if (!type) throw new SheetError('validation', `Unknown question type: ${typeId}`);

      const level = resolveLevel(rng, spec, difficulty);
      const params = resolveParams(type, level, section.params?.[typeId]);

      let problem = type.generate(rng, params, { gradeLevel: level });
      let retries = 0;
      while (seen.has(problem.fingerprint) && retries < DEDUPE_RETRIES) {
        problem = type.generate(rng, params, { gradeLevel: level });
        retries++;
      }
      seen.add(problem.fingerprint);
      problem.index = problems.length;
      problem.gradeLevel = level;
      problems.push(problem);
    }
    sections.push({ typeIds: section.typeIds, problems });
  }
  return sections;
}
