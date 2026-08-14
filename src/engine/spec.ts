// Core spec types: everything serializable that defines a worksheet.
// The engine compiles against these — treat as a stable contract.

import type { Rng } from './rng';

export const SCHEMA_VERSION = 1;

/** Public grade bands (pre-K through grade 5; G6+ reserved for the future). */
export type GradeBand = 'preK' | 'K' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5';

/** Internal numeric grade level — integer-only, like everything in the engine. */
export const GRADE_LEVEL: Record<GradeBand, number> = {
  preK: 0,
  K: 1,
  G1: 2,
  G2: 3,
  G3: 4,
  G4: 5,
  G5: 6,
};

export interface SectionSpec {
  /** 1..N type ids; N > 1 = round-robin interleave (review sheets). */
  typeIds: string[];
  /** Problem count per typeId — must match typeIds length. */
  counts: number[];
  /** Difficulty vs the sheet's gradeBand: easy / grade / challenge / mixed. */
  difficulty?: 'easy' | 'grade' | 'challenge' | 'mixed';
  /** Per-typeId param overrides, e.g. { 'add-facts': { maxSum: 12 } }. */
  params?: Record<string, Record<string, unknown>>;
}

export interface LayoutSpec {
  pageSize: 'letter' | 'a4';
  columns: 1 | 2 | 3;
  /** sequential: 1..N; page: restart each page; column: A1, B1... down columns. */
  numbering: 'sequential' | 'page' | 'column';
  header: {
    title: boolean;
    name: boolean;
    date: boolean;
    classLine: boolean;
  };
  /** Show-your-work area under each problem. */
  workspace: 'none' | 'box' | 'grid';
}

export interface OptionsSpec {
  answerKey: boolean;
  /** v1 implements 'list'; 'inline' reserved for later. */
  answerKeyStyle: 'list' | 'inline';
  inkSaver: boolean;
  accentColor: string | null;
  showPageNumbers: boolean;
  largePrint: boolean;
}

export interface WorksheetSpec {
  schemaVersion: number;
  seed: string;
  title?: string;
  gradeBand: GradeBand;
  sections: SectionSpec[];
  layout: LayoutSpec;
  options: OptionsSpec;
}

export interface Answer {
  /** Primary display, e.g. "7" or "34 + 57 = 91". */
  value: string;
  /** Optional supporting line, e.g. the equation for a word problem. */
  detail?: string;
}

export interface Problem {
  typeId: string;
  /** Position within its section. */
  index: number;
  /** Resolved numeric grade level (GRADE_LEVEL values). */
  gradeLevel: number;
  /** Serializable, integer-only, deterministic. Layout jitter lives here too. */
  data: Record<string, unknown>;
  answer: Answer | null;
  fingerprint: string;
}

/** Minimal type-safe param DSL — drives the auto-generated config form. */
export interface ParamSpec {
  key: string;
  label: string;
  type: 'int' | 'select' | 'bool' | 'text' | 'color';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: unknown;
  group?: string;
}

export interface GenCtx {
  /** Target numeric grade level for this problem. */
  gradeLevel: number;
  /** Position within the section (0-based) — types like manual use it. */
  index: number;
}

export interface QuestionType {
  /** kebab-case, unique forever (additive-only content rule). */
  id: string;
  subject: string;
  name: string;
  description: string;
  gradeRange: [GradeBand, GradeBand];
  /** Param defaults per grade band — the difficulty mechanism. */
  difficultyPresets: Partial<Record<GradeBand, Record<string, unknown>>>;
  params: ParamSpec[];
  generate(rng: Rng, params: Record<string, unknown>, ctx: GenCtx): Problem;
  /** Pure — no RNG, no wall-clock. Must return byte-identical output twice. */
  render(p: Problem): string;
  /** Hard-coded conservative height estimate in points (never measured at runtime). */
  estHeightPt?(params: Record<string, unknown>): number;
  /** Extra validation beyond ParamSpec (e.g. array-valued params like manual questions). */
  validateParams?(params: Record<string, unknown>): string[];
}

/** Error thrown by the engine with a message safe to show in the UI. */
export class SheetError extends Error {
  readonly kind: 'validation' | 'generation';
  constructor(kind: 'validation' | 'generation', message: string) {
    super(message);
    this.kind = kind;
    this.name = 'SheetError';
  }
}
