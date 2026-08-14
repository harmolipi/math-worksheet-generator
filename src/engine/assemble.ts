// Assembly: spec → generated problems → packed pages → sheet DOM string + CSS.
// The UI injects `html` into BOTH the scaled preview and the print root; the
// exact same markup is printed. Rendering is a pure function of the spec.

import { generateSections } from './generate';
import { packSheet, type PackedPage } from './pack';
import { footerHtml, headerHtml, keyEntryHtml, problemCellHtml } from '../render/layout';
import { sheetCss } from '../render/sheet-css';
import type { QuestionType, WorksheetSpec } from './spec';
import { escapeHtml } from '../render/html';

export interface SheetResult {
  html: string;
  css: string;
  worksheetPageCount: number;
  keyPageCount: number;
}

export function assembleSheet(
  spec: WorksheetSpec,
  types: Map<string, QuestionType>,
): SheetResult {
  const generated = generateSections(spec, types);
  const { pages, worksheetPageCount, keyPageCount } = packSheet(
    generated,
    spec.layout,
    spec.options,
    types,
    spec.gradeBand,
  );
  const html = pages
    .map((page) =>
      page.kind === 'answerKey'
        ? keyPageHtml(spec, page, keyPageCount)
        : worksheetPageHtml(spec, page, worksheetPageCount, types),
    )
    .join('');
  return { html, css: sheetCss(spec), worksheetPageCount, keyPageCount };
}

function worksheetPageHtml(
  spec: WorksheetSpec,
  page: PackedPage,
  totalOfKind: number,
  types: Map<string, QuestionType>,
): string {
  const content = page.problems
    .map((p) => {
      const type = types.get(p.typeId);
      if (!type) throw new Error(`Unknown question type: ${p.typeId}`);
      return problemCellHtml(spec, p, type);
    })
    .join('');
  const inkSaver = spec.options.inkSaver ? ' ink-saver' : '';
  return (
    `<section class="sheet-page worksheet${inkSaver}" data-page="${page.number}" ` +
    `data-content-h="${page.contentHeightPt}">` +
    headerHtml(spec) +
    `<main class="sheet-content">${content}</main>` +
    footerHtml(page, totalOfKind, spec.options) +
    `</section>`
  );
}

function keyPageHtml(spec: WorksheetSpec, page: PackedPage, totalOfKind: number): string {
  const entries = page.keyEntries.map(keyEntryHtml).join('');
  const title = spec.title ? escapeHtml(spec.title) : '';
  const inkSaver = spec.options.inkSaver ? ' ink-saver' : '';
  return (
    `<section class="sheet-page answer-key${inkSaver}" data-page="${page.number}" ` +
    `data-content-h="${page.contentHeightPt}">` +
    `<header class="sheet-header">` +
    `<div class="key-title">Answer Key${title ? ` — ${title}` : ''}</div>` +
    `<div class="key-subtitle">Answers match the problem numbers on the worksheet.</div>` +
    `</header>` +
    `<main class="key-list">${entries}</main>` +
    footerHtml(page, totalOfKind, spec.options) +
    `</section>`
  );
}
