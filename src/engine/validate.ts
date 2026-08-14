// Deep spec validation. A hostile or malformed URL hash must never hang the
// app or crash generation — it must produce a friendly error instead.

import {
  GRADE_LEVEL,
  SCHEMA_VERSION,
  type GradeBand,
  type QuestionType,
  type WorksheetSpec,
} from './spec';

const MAX_SEED_LEN = 200;
const MAX_TITLE_LEN = 120;
const MAX_SECTIONS = 8;
const MAX_TYPES_PER_SECTION = 8;
const MAX_PROBLEMS_PER_TYPE = 60;
const MAX_TOTAL_PROBLEMS = 200;
const ACCENT_RE = /^#[0-9a-fA-F]{6}$/;

export type ValidationResult =
  | { ok: true; spec: WorksheetSpec }
  | { ok: false; errors: string[] };

export function validateSpec(
  raw: unknown,
  types: Map<string, QuestionType>,
): ValidationResult {
  const errors: string[] = [];
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, errors: ['Worksheet config is not an object.'] };
  }
  const spec = raw as Record<string, unknown>;

  if (spec.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`Unsupported config version: ${String(spec.schemaVersion)}.`);
  }

  const seed = spec.seed;
  if (typeof seed !== 'string' || seed.length > MAX_SEED_LEN) {
    errors.push('Seed must be text of at most 200 characters.');
  }

  const title = spec.title;
  if (title !== undefined && (typeof title !== 'string' || title.length > MAX_TITLE_LEN)) {
    errors.push('Title must be text of at most 120 characters.');
  }

  const gradeBand = spec.gradeBand as GradeBand;
  if (!(gradeBand in GRADE_LEVEL)) {
    errors.push(`Unknown grade band: ${String(gradeBand)}.`);
  }

  // Sections
  const sections = spec.sections;
  let totalProblems = 0;
  if (!Array.isArray(sections) || sections.length < 1 || sections.length > MAX_SECTIONS) {
    errors.push(`Worksheets need 1–${MAX_SECTIONS} sections.`);
  } else {
    for (const section of sections as Record<string, unknown>[]) {
      const typeIds = section.typeIds;
      const counts = section.counts;
      if (
        !Array.isArray(typeIds) ||
        typeIds.length < 1 ||
        typeIds.length > MAX_TYPES_PER_SECTION ||
        !typeIds.every((t) => typeof t === 'string')
      ) {
        errors.push('Each section needs 1–8 question types.');
        continue;
      }
      if (
        !Array.isArray(counts) ||
        counts.length !== typeIds.length ||
        !counts.every((c) => typeof c === 'number' && Number.isInteger(c))
      ) {
        errors.push('Section counts must be whole numbers matching its question types.');
        continue;
      }
      for (const typeId of typeIds as string[]) {
        if (!types.has(typeId)) errors.push(`Unknown question type: ${typeId}.`);
      }
      for (const c of counts as number[]) {
        if (c < 1 || c > MAX_PROBLEMS_PER_TYPE) {
          errors.push(`Each question type allows 1–${MAX_PROBLEMS_PER_TYPE} problems.`);
        }
        totalProblems += c;
      }
      const difficulty = section.difficulty;
      if (
        difficulty !== undefined &&
        !['easy', 'grade', 'challenge', 'mixed'].includes(difficulty as string)
      ) {
        errors.push(`Unknown difficulty: ${String(difficulty)}.`);
      }
      // Per-type param overrides
      const params = section.params;
      if (params !== undefined) {
        if (typeof params !== 'object' || params === null || Array.isArray(params)) {
          errors.push('Section params must be an object.');
        } else {
          for (const [typeId, overrides] of Object.entries(params)) {
            if (!(typeIds as string[]).includes(typeId)) {
              errors.push(`Params given for a type not in this section: ${typeId}.`);
              continue;
            }
            if (typeof overrides !== 'object' || overrides === null) {
              errors.push(`Params for ${typeId} must be an object.`);
              continue;
            }
            const type = types.get(typeId);
            if (type) {
              errors.push(...validateParamsForType(type, overrides as Record<string, unknown>));
              if (type.validateParams) {
                errors.push(...type.validateParams(overrides as Record<string, unknown>));
              }
            }
          }
        }
      }
    }
    if (totalProblems > MAX_TOTAL_PROBLEMS) {
      errors.push(`Worksheets allow at most ${MAX_TOTAL_PROBLEMS} problems.`);
    }
  }

  // Layout
  const layout = spec.layout as Record<string, unknown> | undefined;
  if (typeof layout !== 'object' || layout === null) {
    errors.push('Layout config is missing.');
  } else {
    if (!['letter', 'a4'].includes(layout.pageSize as string)) {
      errors.push('Page size must be letter or a4.');
    }
    if (![1, 2, 3].includes(layout.columns as number)) {
      errors.push('Columns must be 1, 2, or 3.');
    }
    if (!['sequential', 'page', 'column'].includes(layout.numbering as string)) {
      errors.push('Numbering must be sequential, page, or column.');
    }
    const header = layout.header as Record<string, unknown> | undefined;
    if (typeof header !== 'object' || header === null) {
      errors.push('Header config is missing.');
    } else {
      for (const key of ['title', 'name', 'date', 'classLine']) {
        if (typeof header[key] !== 'boolean') errors.push(`Header flag ${key} must be on/off.`);
      }
    }
    if (!['none', 'box', 'grid'].includes(layout.workspace as string)) {
      errors.push('Workspace must be none, box, or grid.');
    }
  }

  // Options
  const options = spec.options as Record<string, unknown> | undefined;
  if (typeof options !== 'object' || options === null) {
    errors.push('Options config is missing.');
  } else {
    if (typeof options.answerKey !== 'boolean') errors.push('answerKey must be on/off.');
    if (!['list', 'inline'].includes(options.answerKeyStyle as string)) {
      errors.push('Answer key style must be list or inline.');
    }
    if (typeof options.inkSaver !== 'boolean') errors.push('inkSaver must be on/off.');
    const accent = options.accentColor;
    if (accent !== null && (typeof accent !== 'string' || !ACCENT_RE.test(accent))) {
      errors.push('Accent color must be a #rrggbb value.');
    }
    if (typeof options.showPageNumbers !== 'boolean') errors.push('showPageNumbers must be on/off.');
    if (typeof options.largePrint !== 'boolean') errors.push('largePrint must be on/off.');
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, spec: raw as unknown as WorksheetSpec };
}

function validateParamsForType(
  type: QuestionType,
  overrides: Record<string, unknown>,
): string[] {
  const errors: string[] = [];
  for (const param of type.params) {
    const value = overrides[param.key];
    if (value === undefined) continue;
    switch (param.type) {
      case 'int':
        if (typeof value !== 'number' || !Number.isInteger(value)) {
          errors.push(`${type.id}: ${param.key} must be a whole number.`);
        } else if (param.min !== undefined && value < param.min) {
          errors.push(`${type.id}: ${param.key} must be at least ${param.min}.`);
        } else if (param.max !== undefined && value > param.max) {
          errors.push(`${type.id}: ${param.key} must be at most ${param.max}.`);
        }
        break;
      case 'select':
        if (!(param.options ?? []).includes(value as string)) {
          errors.push(`${type.id}: ${param.key} has an unknown value.`);
        }
        break;
      case 'bool':
        if (typeof value !== 'boolean') errors.push(`${type.id}: ${param.key} must be on/off.`);
        break;
      case 'text':
        if (typeof value !== 'string') errors.push(`${type.id}: ${param.key} must be text.`);
        break;
      case 'color':
        if (typeof value !== 'string' || !ACCENT_RE.test(value)) {
          errors.push(`${type.id}: ${param.key} must be a #rrggbb value.`);
        }
        break;
    }
  }
  return errors;
}
