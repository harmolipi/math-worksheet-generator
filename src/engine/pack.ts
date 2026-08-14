// Page packing: problems → pages, deterministically, using each type's
// hard-coded estHeightPt (never measured at runtime). A problem never splits
// across pages; page capacity uses a conservative factor so real rendering
// always fits.

import {
  SheetError,
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
const HEADER_PT = 88; // title + name/date lines
const FOOTER_PT = 28;
const CAPACITY_FACTOR = 0.92; // conservative — never overfill
const KEY_ENTRY_PT = 30;
const DEFAULT_EST_PT = 72;
/** Workspace area under a problem: margin-top + height (sheet-css values). */
const WORKSPACE_BOX_PT = 10 + 40;
const WORKSPACE_BOX_LARGE_PT = 10 + 48;
export const MAX_PAGES = 20;

const COLUMN_LETTERS = ['A', 'B', 'C'];

function contentCapacity(layout: LayoutSpec): number {
  const { hPt } = PAGE_DIMS[layout.pageSize];
  return Math.floor((hPt - 2 * MARGIN_PT - HEADER_PT - FOOTER_PT) * CAPACITY_FACTOR);
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
): PackResult {
  const capacity = contentCapacity(layout);
  const pages: PackedPage[] = [];
  const packed: PackedProblem[] = [];

  let page: PackedPage = {
    number: 1,
    kind: 'worksheet',
    problems: [],
    keyEntries: [],
    contentHeightPt: 0,
  };
  let cursor = 0;
  let seq = 0;

  const pushPage = () => {
    pages.push(page);
    page = {
      number: pages.length + 1,
      kind: 'worksheet',
      problems: [],
      keyEntries: [],
      contentHeightPt: 0,
    };
    cursor = 0;
  };

  for (const section of generated) {
    for (const problem of section.problems) {
      const type = types.get(problem.typeId);
      const est = Math.min(
        capacity,
        (type?.estHeightPt?.(problem.data) ?? DEFAULT_EST_PT) +
          workspaceCost(layout, options, problem),
      );
      if (cursor + est > capacity && page.problems.length > 0) pushPage();
      seq += 1;
      const packedProblem: PackedProblem = {
        ...problem,
        label: nextLabel(layout, page.problems.length, seq),
      };
      page.problems.push(packedProblem);
      packed.push(packedProblem);
      cursor += est;
      page.contentHeightPt = cursor;
    }
  }
  pages.push(page);
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
