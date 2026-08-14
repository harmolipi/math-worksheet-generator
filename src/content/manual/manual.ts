// Manual questions: teacher-authored prompts rendered with the same layout,
// pagination, answer keys, and printing as generated problems.
//
// The generator is RNG-free (index-based fingerprints) — manual questions are
// identical in every variant set, which is exactly what a teacher expects.
// Manual prompts are the only user-supplied text in a sheet: escaped at render
// and length-capped in validateParams (the XSS surface).

import type { Problem, QuestionType } from '../../engine/spec';
import { fingerprintOf } from '../../engine/fingerprint';
import { escapeHtml } from '../../render/html';

export interface ManualQuestion {
  /** The problem text, e.g. "34 + 57 =" or (vertical) "34\n+ 57". */
  prompt: string;
  /** Shown on the answer key when present. */
  answer?: string;
  /** horizontal: prompt inline with a blank answer line. vertical: prompt
   *  split on newlines, right-aligned rows above an answer line (column
   *  arithmetic style). */
  layout?: 'horizontal' | 'vertical';
  /** Per-question workspace override; falls back to the sheet default. */
  workspace?: 'none' | 'box' | 'grid';
}

const MAX_QUESTIONS = 60;
const MAX_PROMPT_LEN = 300;
const MAX_ANSWER_LEN = 200;

interface ManualData {
  prompt: string;
  layout: 'horizontal' | 'vertical';
  workspace?: 'none' | 'box' | 'grid';
}

function questionsFrom(params: Record<string, unknown>): ManualQuestion[] {
  return Array.isArray(params.questions) ? (params.questions as ManualQuestion[]) : [];
}

export const manualType: QuestionType = {
  id: 'manual',
  subject: 'manual',
  name: 'My own question',
  description:
    'Type any problem yourself — it gets the same layout, pagination, and answer key as generated ones.',
  gradeRange: ['preK', 'G5'],
  difficultyPresets: {},
  // No ParamSpec entries: `questions` is a structured array that the UI's
  // dedicated manual editor maintains, validated by validateParams below.
  params: [],

  generate(_rng, params, ctx): Problem {
    const questions = questionsFrom(params);
    const q = questions[ctx.index] ?? questions[questions.length - 1] ?? {
      prompt: '',
    };
    const prompt = (q.prompt ?? '').trim();
    const answer = typeof q.answer === 'string' ? q.answer.trim() : '';
    return {
      typeId: 'manual',
      index: ctx.index,
      gradeLevel: ctx.gradeLevel,
      data: {
        prompt,
        layout: q.layout ?? 'horizontal',
        workspace: q.workspace,
      } satisfies ManualData,
      answer: answer !== '' ? { value: answer } : null,
      fingerprint: fingerprintOf(['manual', ctx.index, prompt, answer]),
    };
  },

  render(p): string {
    const { prompt, layout } = p.data as unknown as ManualData;
    const esc = escapeHtml(prompt);
    if (layout === 'vertical') {
      const rows = esc.split('\n');
      return (
        `<div class="manual manual-vertical" data-layout="vertical">` +
        rows.map((row) => `<div class="manual-row">${row}</div>`).join('') +
        `<div class="manual-answer-row"></div>` +
        `</div>`
      );
    }
    return (
      `<div class="manual manual-horizontal" data-layout="horizontal">` +
      `<span class="manual-prompt">${esc}</span>` +
      `<span class="manual-blank">&#8203;</span>` +
      `</div>`
    );
  },

  estHeightPt(params): number {
    const questions = questionsFrom(params);
    const vertical = questions.some((q) => q.layout === 'vertical');
    // Conservative: vertical problems stack rows; horizontal fit one line.
    return vertical ? 110 : 64;
  },

  validateParams(params): string[] {
    const errors: string[] = [];
    if (params.questions === undefined) return errors;
    if (!Array.isArray(params.questions) || params.questions.length > MAX_QUESTIONS) {
      errors.push(`manual: questions must be a list of at most ${MAX_QUESTIONS} entries.`);
      return errors;
    }
    (params.questions as ManualQuestion[]).forEach((q, i) => {
      const n = i + 1;
      if (typeof q !== 'object' || q === null || typeof q.prompt !== 'string') {
        errors.push(`manual: question ${n} is invalid.`);
        return;
      }
      if (q.prompt.trim() === '' || q.prompt.length > MAX_PROMPT_LEN) {
        errors.push(`manual: question ${n} needs a prompt of at most ${MAX_PROMPT_LEN} characters.`);
      }
      if (
        q.answer !== undefined &&
        (typeof q.answer !== 'string' || q.answer.length > MAX_ANSWER_LEN)
      ) {
        errors.push(`manual: question ${n} answer must be text of at most ${MAX_ANSWER_LEN} characters.`);
      }
      if (q.layout !== undefined && !['horizontal', 'vertical'].includes(q.layout)) {
        errors.push(`manual: question ${n} layout must be horizontal or vertical.`);
      }
      if (q.workspace !== undefined && !['none', 'box', 'grid'].includes(q.workspace)) {
        errors.push(`manual: question ${n} workspace must be none, box, or grid.`);
      }
    });
    return errors;
  },
};
