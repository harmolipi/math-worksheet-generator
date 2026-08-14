// Page packing: problems → pages, deterministically, using each type's
// hard-coded estHeightPt (never measured at runtime). A problem never splits
// across pages; page capacity uses a conservative factor so real rendering
// always fits.
//
// The packing model mirrors the actual CSS grid (`.sheet-content`):
// row-major auto-placement, each row as tall as its tallest problem (grid
// items stretch), a 16pt gap between rows. Page breaks happen on row
// boundaries, so a problem never shares a row across two pages.

import {
  SheetError,
  GRADE_LEVEL,
  type EstContext,
  type GradeBand,
  type LayoutSpec,
  type OptionsSpec,
  type Problem,
  type QuestionType,
} from './spec';
import type { GeneratedSection } from './generate';

export interface PackedProblem extends Problem {
  /** Resolved problem label: "7.", "C3", etc. — stable between sheet and key. */
  label: string;
}

export interface AnswerKeyEntry {
  label: string;
  value: string;
  detail?: string;
}

export interface PackedPage {
  /** 1-based, restarting per kind (worksheet pages and key pages number separately). */
  number: number;
  kind: 'worksheet' | 'answerKey';
  problems: PackedProblem[];
  keyEntries: AnswerKeyEntry[];
  /** Estimated content height in pt — used by the dev-only overflow lint. */
  contentHeightPt: number;
}

/** Page dimensions in integer points. Letter: 8.5×11in. A4: 210×297mm (rounded). */
export const PAGE_DIMS: Record<'letter' | 'a4', { wPt: number; hPt: number }> = {
  letter: { wPt: 612, hPt: 792 },
  a4: { wPt: 595, hPt: 842 },
};

const MARGIN_PT = 36; // 0.5in all around
/** Calibrated chrome (sheet-css, measured): .sheet-header is always emitted
 *  (16pt bottom margin even when empty); title block ≈ 44pt; the name/date/
 *  class row ≈ 21pt. Footer ≈ 26pt incl. margin, only when page numbers show. */
const HEADER_MARGIN_PT = 16;
const TITLE_PT = 44;
const NAME_ROW_PT = 21;
const FOOTER_PT = 26;
const GAP_ROW_PT = 16; // grid row gap
const GAP_COL_PT = 20; // grid column gap
const LABEL_PAD_PT = 22; // .problem padding-left
const CAPACITY_FACTOR = 0.95; // safety margin over exact estimates
const KEY_ENTRY_PT = 28;
const DEFAULT_EST_PT = 72;
/** Workspace area under a problem: margin-top + height + borders (sheet-css). */
const WORKSPACE_BOX_PT = 10 + 40 + 2;
const WORKSPACE_BOX_LARGE_PT = 10 + 48 + 2;
export const MAX_PAGES = 20;

const COLUMN_LETTERS = ['A', 'B', 'C'];

function headerEstPt(layout: LayoutSpec): number {
  let h = HEADER_MARGIN_PT;
  if (layout.header.title) h += TITLE_PT;
  if (layout.header.name || layout.header.date || layout.header.classLine) h += NAME_ROW_PT;
  return h;
}

function footerEstPt(options: OptionsSpec): number {
  return options.showPageNumbers ? FOOTER_PT : 0;
}

function contentCapacity(layout: LayoutSpec, options: OptionsSpec): number {
  const { hPt } = PAGE_DIMS[layout.pageSize];
  const available = hPt - 2 * MARGIN_PT - headerEstPt(layout) - footerEstPt(options);
  return Math.floor(available * CAPACITY_FACTOR);
}

/** Grid cell content width in pt (what estHeightPt sees for flex-wrap math). */
function contentWidthPt(layout: LayoutSpec): number {
  const { wPt } = PAGE_DIMS[layout.pageSize];
  const colW = Math.floor((wPt - 2 * MARGIN_PT - (layout.columns - 1) * GAP_COL_PT) / layout.columns);
  return colW - LABEL_PAD_PT;
}

function estContext(layout: LayoutSpec, options: OptionsSpec, gradeLevel: number): EstContext {
  const basePt = options.largePrint ? 14 : gradeLevel <= 3 ? 13 : 11.5;
  return { contentWidthPt: contentWidthPt(layout), basePt, largePrint: options.largePrint };
}

/** Height cost of the show-your-work area; per-problem override (manual) wins. */
function workspaceCost(layout: LayoutSpec, options: OptionsSpec, problem: Problem): number {
  const mode =
    (problem.data as { workspace?: string }).workspace ?? layout.workspace;
  if (!mode || mode === 'none') return 0;
  return options.largePrint ? WORKSPACE_BOX_LARGE_PT : WORKSPACE_BOX_PT;
}

function nextLabel(
  layout: LayoutSpec,
  positionInPage: number,
  seq: number,
): string {
  switch (layout.numbering) {
    case 'sequential':
      return `${seq}.`;
    case 'page':
      return `${positionInPage + 1}.`;
    case 'column': {
      // Column-major labels: items fill rows left-to-right but are labeled
      // A1, A2, ... B1, B2, ... down each column (classic textbook style).
      const col = positionInPage % layout.columns;
      const row = Math.floor(positionInPage / layout.columns);
      return `${COLUMN_LETTERS[col]}${row + 1}`;
    }
  }
}

export interface PackResult {
  pages: PackedPage[];
  worksheetPageCount: number;
  keyPageCount: number;
}

export function packSheet(
  generated: GeneratedSection[],
  layout: LayoutSpec,
  options: OptionsSpec,
  types: Map<string, QuestionType>,
  gradeBand: GradeBand,
): PackResult {
  const capacity = contentCapacity(layout, options);
  const gradeLevel = GRADE_LEVEL[gradeBand];
  const ctx = estContext(layout, options, gradeLevel);
  const pages: PackedPage[] = [];
  const packed: PackedProblem[] = [];

  let page: PackedPage = {
    number: 1,
    kind: 'worksheet',
    problems: [],
    keyEntries: [],
    contentHeightPt: 0,
  };
  let seq = 0;
  /** Current open row: raw problems + their sequence numbers. Labels are
   *  assigned when the row commits — a page break can move a row to the next
   *  page, and page-mode labels depend on the FINAL position in that page. */
  let rowItems: { problem: Problem; seq: number }[] = [];
  let rowEst = 0;
  /** Running content height of the open page (rows + gaps). */
  let total = 0;

  const commitRow = () => {
    total += rowEst + (page.problems.length > 0 ? GAP_ROW_PT : 0);
    for (const item of rowItems) {
      const packedProblem: PackedProblem = {
        ...item.problem,
        label: nextLabel(layout, page.problems.length, item.seq),
      };
      page.problems.push(packedProblem);
      packed.push(packedProblem);
    }
    rowItems = [];
    rowEst = 0;
  };

  const newPage = () => {
    page.contentHeightPt = total;
    pages.push(page);
    page = {
      number: pages.length + 1,
      kind: 'worksheet',
      problems: [],
      keyEntries: [],
      contentHeightPt: 0,
    };
    total = 0;
  };

  for (const section of generated) {
    for (const problem of section.problems) {
      const type = types.get(problem.typeId);
      const est = Math.min(
        capacity,
        (type?.estHeightPt?.(problem.data, ctx) ?? DEFAULT_EST_PT) +
          workspaceCost(layout, options, problem),
      );
      if (rowItems.length >= layout.columns) {
        // A row never straddles pages: break BEFORE it if it won't fit.
        const rowCost = rowEst + (page.problems.length > 0 ? GAP_ROW_PT : 0);
        if (total + rowCost > capacity) newPage();
        commitRow();
      }
      seq += 1;
      rowItems.push({ problem, seq });
      rowEst = Math.max(rowEst, est);
    }
  }
  if (rowItems.length > 0) {
    // The final row may be partial (fewer items than columns) and never went
    // through the fit check — verify it before committing.
    const rowCost = rowEst + (page.problems.length > 0 ? GAP_ROW_PT : 0);
    if (total + rowCost > capacity) newPage();
    commitRow();
  }
  newPage();
  const worksheetPageCount = pages.length;

  // Answer key pages (list style): worksheet labels + answers, numbered separately.
  if (options.answerKey) {
    const entries: AnswerKeyEntry[] = packed
      .filter((p) => p.answer !== null)
      .map((p) => ({ label: p.label, value: p.answer!.value, detail: p.answer!.detail }));
    const perPage = Math.max(1, Math.floor(capacity / KEY_ENTRY_PT));
    for (let i = 0; i < entries.length; i += perPage) {
      pages.push({
        number: Math.floor(i / perPage) + 1,
        kind: 'answerKey',
        problems: [],
        keyEntries: entries.slice(i, i + perPage),
        contentHeightPt: Math.min(entries.length - i, perPage) * KEY_ENTRY_PT,
      });
    }
  }

  if (pages.length > MAX_PAGES) {
    throw new SheetError(
      'validation',
      `This sheet would be ${pages.length} pages — reduce the number of questions or sections.`,
    );
  }

  return { pages, worksheetPageCount, keyPageCount: pages.length - worksheetPageCount };
}
