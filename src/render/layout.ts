// Page chrome builders: header, footer, problem cells, answer-key entries.
// Everything returns HTML strings; user text is escaped here.

import type { PackedPage, PackedProblem } from '../engine/pack';
import { GRADE_LEVEL, type OptionsSpec, type QuestionType, type WorksheetSpec } from '../engine/spec';
import { escapeHtml } from './html';

export function headerHtml(spec: WorksheetSpec): string {
  const parts: string[] = [];
  if (spec.layout.header.title && spec.title) {
    parts.push(`<div class="sheet-title">${escapeHtml(spec.title)}</div>`);
  }
  const lines: string[] = [];
  if (spec.layout.header.name) lines.push('<span class="name-line">Name:</span>');
  if (spec.layout.header.date) lines.push('<span class="name-line">Date:</span>');
  if (spec.layout.header.classLine) lines.push('<span class="name-line">Class:</span>');
  if (lines.length > 0) parts.push(`<div class="name-date-row">${lines.join('')}</div>`);
  return `<header class="sheet-header">${parts.join('')}</header>`;
}

export function footerHtml(
  page: PackedPage,
  totalOfKind: number,
  options: OptionsSpec,
): string {
  if (!options.showPageNumbers) return '';
  const label =
    page.kind === 'answerKey'
      ? `Answer Key · Page ${page.number} of ${totalOfKind}`
      : `Page ${page.number} of ${totalOfKind}`;
  return `<footer class="sheet-footer">${label}</footer>`;
}

/** Workspace area under a problem; per-problem override (manual) wins. */
export function workspaceHtml(spec: WorksheetSpec, problem: PackedProblem): string {
  const mode =
    (problem.data as { workspace?: string }).workspace ?? spec.layout.workspace;
  if (!mode || mode === 'none') return '';
  return `<div class="workspace-${mode}"></div>`;
}

/** Small filled star marking a challenge problem (above the sheet's band).
 *  Inline SVG — the ★ glyph is not in the bundled latin font subsets. */
export function challengeStarSvg(): string {
  return (
    `<span class="challenge-star" role="img" aria-label="Challenge problem">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true">` +
    `<polygon points="12,3 14.7,8.6 20.8,9.3 16.3,13.5 17.5,19.5 12,16.5 6.5,19.5 7.7,13.5 3.2,9.3 9.3,8.6" fill="currentColor" stroke="none"/>` +
    `</svg></span>`
  );
}

export function problemCellHtml(
  spec: WorksheetSpec,
  problem: PackedProblem,
  type: QuestionType,
): string {
  const answerAttr = problem.answer ? escapeHtml(problem.answer.value) : '';
  const challenge = problem.gradeLevel > GRADE_LEVEL[spec.gradeBand];
  const label =
    `<span class="problem-label">${escapeHtml(problem.label)}</span>` +
    (challenge ? challengeStarSvg() : '');
  const body = `<div class="problem-body">${type.render(problem)}</div>`;
  const workspace = workspaceHtml(spec, problem);
  return (
    `<article class="problem" data-type="${problem.typeId}" ` +
    `data-fingerprint="${problem.fingerprint}" data-answer="${answerAttr}">` +
    label + body + workspace +
    `</article>`
  );
}

export function keyEntryHtml(entry: { label: string; value: string; detail?: string }): string {
  const detail = entry.detail ? ` <span class="key-detail">(${escapeHtml(entry.detail)})</span>` : '';
  return (
    `<div class="key-entry">` +
    `<span class="key-label">${escapeHtml(entry.label)}</span>` +
    `<span class="key-value">${escapeHtml(entry.value)}${detail}</span>` +
    `</div>`
  );
}
