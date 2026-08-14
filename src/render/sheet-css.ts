// Deterministic sheet stylesheet. The engine emits this string; preview and
// print inject the exact same CSS. Golden-tested.
//
// Print contract:
// - .sheet-page elements are EXACTLY paper-sized; @page { margin: 0 }
// - everything functional is a border, never a background (survives
//   "Background graphics" unchecked in the Chrome dialog)
// - print-color-adjust: exact on all elements
// - @media print height shaved 0.02in so float rounding can't emit blank pages

import { FONTS, bodyFontFor } from './fonts';
import { GRADE_LEVEL, type WorksheetSpec } from '../engine/spec';

interface PageCss {
  width: string;
  height: string;
  printHeight: string;
  atPageSize: string;
}

function pageCss(pageSize: 'letter' | 'a4'): PageCss {
  if (pageSize === 'letter') {
    return {
      width: '8.5in',
      height: '11in',
      printHeight: 'calc(11in - 0.02in)',
      atPageSize: 'letter',
    };
  }
  return {
    width: '210mm',
    height: '297mm',
    printHeight: 'calc(297mm - 0.6mm)',
    atPageSize: 'A4',
  };
}

export function sheetCss(spec: WorksheetSpec): string {
  const dims = pageCss(spec.layout.pageSize);
  const level = GRADE_LEVEL[spec.gradeBand];
  const bodyFont = bodyFontFor(level);
  const playful = level <= 3;
  const largePrint = spec.options.largePrint;
  const accent = spec.options.accentColor ?? '#1a1a1a';
  const cols = spec.layout.columns;

  const basePt = largePrint ? 14 : playful ? 13 : 11.5;
  const headingPt = largePrint ? 15 : 13;

  // Fixed-size elements scale up under large print (fonts already scale via
  // basePt; icons, coins, grids etc. are hard-coded and need these).
  const iconPt = largePrint ? 30 : 24;
  const matchIconPt = largePrint ? 27 : 22;
  const coinPt = largePrint ? 40 : 32;
  const shapeBigPt = largePrint ? 68 : 56;
  const symSvgPt = largePrint ? 90 : 76;
  const classifyIconPt = largePrint ? 40 : 32;
  const patternIconPt = largePrint ? 28 : 22;
  const patternChipIconPt = largePrint ? 22 : 18;
  const barWpt = largePrint ? 130 : 110;
  const barHpt = largePrint ? 17 : 15;
  const rulerMaxPt = largePrint ? 240 : 220;
  const cbnCellPt = largePrint ? 48 : 40;
  const traceWpt = largePrint ? 84 : 72;
  const traceHpt = largePrint ? 96 : 84;
  const chipPad = largePrint ? '5pt 10pt' : '3pt 8pt';

  return `
@page { size: ${dims.atPageSize}; margin: 0; }

.sheet-page {
  box-sizing: border-box;
  width: ${dims.width};
  height: ${dims.height};
  padding: 36pt;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: #fff;
  color: #1a1a1a;
  font-family: ${bodyFont};
  font-size: ${basePt}pt;
  line-height: 1.35;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── header ─────────────────────────────────────────── */
.sheet-header { margin-bottom: 16pt; }
.sheet-title {
  text-align: center;
  font-size: 17pt;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 12pt;
  border-bottom: 2.5pt solid ${accent};
  padding-bottom: 6pt;
}
.name-date-row {
  display: flex;
  gap: 16pt;
  font-family: ${FONTS.handwriting};
  font-size: ${headingPt}pt;
  color: #333;
}
.name-line {
  flex: 1;
  border-bottom: 0.8pt solid #666;
  padding: 0 4pt 2pt;
  white-space: nowrap;
}

/* ── content grid ───────────────────────────────────── */
.sheet-content {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(${cols}, minmax(0, 1fr));
  gap: 16pt 20pt;
  align-content: start;
}
.problem {
  position: relative;
  padding-left: 22pt;
  break-inside: avoid;
  page-break-inside: avoid;
}
.problem-label {
  position: absolute;
  left: 0;
  top: 2pt;
  font-weight: 700;
  font-size: 11.5pt;
  color: #333;
}
.challenge-star {
  position: absolute;
  left: 2pt;
  top: 18pt;
  color: #555;
}
.challenge-star svg { width: 8pt; height: 8pt; display: block; }
.prompt {
  font-weight: 700;
  margin-bottom: 6pt;
}
.prompt b { font-weight: 800; }

/* answer blanks — real borders, never backgrounds */
.blank, .write-box {
  display: inline-block;
  border-bottom: 1pt solid #333;
  min-width: 1.7em;
  height: 1.15em;
  vertical-align: baseline;
}
.write-box { width: 2.4em; }

/* ── workspace ──────────────────────────────────────── */
.workspace-box {
  margin-top: 10pt;
  height: ${largePrint ? 48 : 40}pt;
  border: 1pt solid #999;
  border-radius: 5pt;
}
.workspace-grid {
  margin-top: 10pt;
  height: ${largePrint ? 48 : 40}pt;
  border: 1pt solid #999;
  border-radius: 5pt;
  background-image:
    linear-gradient(to right, rgba(0,0,0,0.06) 0.8pt, transparent 0.8pt),
    linear-gradient(to bottom, rgba(0,0,0,0.06) 0.8pt, transparent 0.8pt);
  background-size: 16pt 16pt;
}

/* ── icons ──────────────────────────────────────────── */
.group-icon, .scatter-icon svg, .match-icons svg {
  width: ${iconPt}pt;
  height: ${iconPt}pt;
  color: #333;
  display: inline-block;
  margin: 0 2pt;
  vertical-align: middle;
}
svg .icon-dot { stroke-width: 3.2; }
.icon-group.row { display: flex; flex-wrap: wrap; align-items: center; gap: 2pt; }
.icon-group.grid {
  display: grid;
  grid-template-columns: repeat(5, auto);
  justify-content: start;
  gap: 4pt;
}
.icon-group.scatter { position: relative; height: 96pt; }
.scatter-icon { position: absolute; }
.scatter-icon svg { margin: 0; }
.count-answer { margin-top: 8pt; text-align: center; }
.count-objects, .ten-frame-problem { text-align: left; }
.ten-frame {
  width: 110pt;
  height: 48pt;
  display: block;
}
.frame-cell { fill: none; stroke: #444; stroke-width: 1.5; }
.frame-dot { fill: #333; }

/* ── chips ──────────────────────────────────────────── */
.chip-row { display: flex; flex-wrap: wrap; gap: 8pt; }
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6em;
  padding: ${chipPad};
  border: 1.3pt solid #444;
  border-radius: 8pt;
  font-size: ${headingPt}pt;
  font-weight: 700;
}
.chip.missing-chip { border-style: solid; border-color: #666; min-width: 2.4em; }
.chip.missing-chip .write-box { border-bottom: none; height: 1.15em; }

/* ── matching ───────────────────────────────────────── */
.match-list { display: flex; flex-direction: column; gap: 6pt; }
.match-row { display: flex; align-items: center; gap: 10pt; }
.match-numeral { font-size: ${headingPt}pt; font-weight: 800; width: 1.4em; text-align: center; }
.match-line { flex: 1; border-bottom: 0.7pt dashed #999; height: 1pt; }
.match-icons { display: flex; gap: 2pt; }

/* ── comparison ─────────────────────────────────────── */
.compare-row { display: flex; gap: 14pt; }
.compare-box {
  flex: 1;
  border: 1.3pt solid #444;
  border-radius: 10pt;
  padding: 10pt 8pt 8pt;
  text-align: center;
}
.compare-tag {
  display: block;
  font-weight: 800;
  margin-bottom: 6pt;
  color: #555;
  font-size: 10.5pt;
}

/* ── tracing ────────────────────────────────────────── */
.trace-grid { display: flex; flex-wrap: wrap; gap: 6pt 14pt; }
.trace-pair { display: flex; flex-direction: column; align-items: center; gap: 4pt; }
.trace-digit { width: ${traceWpt}pt; height: ${traceHpt}pt; }
.trace-glyph {
  font-family: ${FONTS.handwriting};
  font-size: 74px;
  fill: none;
  stroke: #666;
  stroke-width: 1.6;
}
.trace-baseline { stroke: #999; stroke-width: 1; }
.trace-write .write-box { width: 2.6em; }

/* ── arithmetic ─────────────────────────────────────── */
.fact { display: inline-flex; align-items: baseline; gap: 8pt; }
.fact-nums {
  font-size: ${basePt + 3.5}pt;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.fact .blank { width: 2.2em; }
.fact-vertical {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: ${basePt + 3.5}pt;
  font-weight: 700;
}
.v-row { display: flex; justify-content: flex-end; gap: 0; }
.v-row.op, .op-cell { font-weight: 700; }
.v-answer-row { width: 5.4em; border-bottom: 1.2pt solid #333; height: 1.1em; }
.v-line { width: 6em; border-bottom: 1.2pt solid #333; }

.add-vertical { display: inline-flex; flex-direction: column; align-items: flex-end; }
.digit-cell, .op-cell, .carry-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.05em;
  text-align: center;
  font-size: ${basePt + 3.5}pt;
  font-weight: 700;
}
.op-cell { color: #444; }
.carry-row { font-size: ${basePt}pt; height: 1em; }
.carry-cell { color: #555; font-weight: 700; }
.add-vertical .v-line {
  width: 5.25em;
  border-bottom: 1.2pt solid #333;
}

/* ── money ───────────────────────────────────────────── */
.coin-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4pt;
}
.coin { width: ${coinPt}pt; height: ${coinPt}pt; display: inline-block; }
.coin-rim { fill: none; stroke: #444; stroke-width: 2; }
.coin-mill { fill: none; stroke: #444; stroke-width: 1.4; }
.coin-label {
  font-size: 30px;
  font-weight: 700;
  fill: #333;
  font-family: inherit;
}
.money-add-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8pt;
}
.money-add-row .coin-row { max-width: 132pt; }
.money-op { font-size: 16pt; font-weight: 800; color: #444; }
.money-add .blank { width: 2.6em; }
.coins-count, .money-add, .making-change { text-align: center; }

/* ── measurement ─────────────────────────────────────── */
.ruler { width: 100%; max-width: ${rulerMaxPt}pt; display: block; }
.ruler-base, .ruler-tick { stroke: #444; stroke-width: 1.6; }
.ruler-tick { stroke-width: 1.2; }
.ruler-number { font-size: 13px; fill: #333; font-weight: 600; }
.ruler-span { stroke: #222; stroke-width: 2.4; }
.ruler-guide { stroke: #888; stroke-width: 1; }
.ruler-head { fill: #222; stroke: none; }
.ruler-read, .compare-lengths, .area-perimeter { text-align: center; }
.bar-list { display: flex; flex-direction: column; align-items: center; gap: 8pt; margin-top: 4pt; }
.bar-row { display: flex; align-items: center; gap: 8pt; }
.bar-svg { width: ${barWpt}pt; height: ${barHpt}pt; display: block; }
.bar-rect { fill: none; stroke: #333; stroke-width: 2; }
.ap-grid {
  width: 100%;
  max-width: 180pt;
  /* Non-square rects (e.g. 2×6) explode in height at full width — cap so
     the grid letterboxes instead of overflowing the page. */
  max-height: 170pt;
  display: block;
}
.ap-cell { stroke: #444; stroke-width: 1; }
.ap-frame { fill: none; stroke: #222; stroke-width: 2; }

/* ── geometry ────────────────────────────────────────── */
.shape-identify, .sides-corners, .symmetry, .classify, .shape-match { text-align: center; }
.shape-big svg { width: ${shapeBigPt}pt; height: ${shapeBigPt}pt; color: #333; }
.shape-match .match-row { justify-content: center; }
.shape-match .match-icons svg { width: ${matchIconPt}pt; height: ${matchIconPt}pt; }
.match-name { font-size: 12.5pt; font-weight: 700; }
.sym-svg { width: ${symSvgPt}pt; height: ${symSvgPt}pt; display: inline-block; color: #333; }
.sym-axis { stroke: #999; stroke-width: 1.4; }
.sym-choice { justify-content: center; margin-top: 4pt; }
.classify-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 8pt 14pt;
  justify-content: center;
  margin-top: 2pt;
}
.classify-cell { display: flex; flex-direction: column; align-items: center; gap: 2pt; }
.classify-cell svg { width: ${classifyIconPt}pt; height: ${classifyIconPt}pt; color: #333; }
.classify-letter { font-weight: 800; font-size: 10.5pt; color: #555; }

/* ── patterns ────────────────────────────────────────── */
.next-in-pattern, .color-by-number { text-align: center; }
.pattern-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6pt;
  margin-bottom: 8pt;
}
.pattern-row svg { width: ${patternIconPt}pt; height: ${patternIconPt}pt; color: #333; }
.pattern-blank {
  display: inline-block;
  width: 26pt;
  height: 26pt;
  border: 1.3pt dashed #666;
  border-radius: 6pt;
}
.pattern-options { justify-content: center; }
.pattern-chip { gap: 5pt; }
.pattern-chip svg { width: ${patternChipIconPt}pt; height: ${patternChipIconPt}pt; color: #333; }

/* ── color by number ─────────────────────────────────── */
.cbn-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 8pt;
  justify-content: center;
  margin-bottom: 8pt;
}
.cbn-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${cbnCellPt}pt;
  height: ${cbnCellPt}pt;
  border: 1.3pt solid #444;
  border-radius: 8pt;
  font-size: 14pt;
  font-weight: 700;
}
.cbn-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 3pt 12pt;
  justify-content: center;
  font-weight: 700;
}

/* ── manual questions ───────────────────────────────── */
.manual-horizontal { display: inline-flex; align-items: baseline; gap: 10pt; }
.manual-prompt {
  font-size: ${basePt + 3.5}pt;
  font-weight: 700;
  white-space: pre-wrap;
}
.manual-blank {
  display: inline-block;
  width: 60pt;
  border-bottom: 1pt solid #333;
  height: 1.2em;
}
.manual-vertical {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: ${basePt + 3.5}pt;
  font-weight: 700;
}
.manual-row { white-space: pre-wrap; text-align: right; }
.manual-answer-row { width: 5.5em; border-bottom: 1.2pt solid #333; height: 1.1em; }

/* ── footer ─────────────────────────────────────────── */
.sheet-footer {
  margin-top: 12pt;
  text-align: center;
  font-size: 9.5pt;
  color: #777;
}

/* ── answer key pages ───────────────────────────────── */
.key-title {
  text-align: center;
  font-size: 17pt;
  font-weight: 800;
  border-bottom: 2.5pt solid ${accent};
  padding-bottom: 6pt;
  margin-bottom: 6pt;
}
.key-subtitle { text-align: center; color: #666; font-size: 10.5pt; margin-bottom: 12pt; }
.key-list { flex: 1; }
.key-entry {
  display: flex;
  align-items: baseline;
  gap: 10pt;
  border-bottom: 0.6pt dotted #bbb;
  padding: 4.5pt 2pt;
  break-inside: avoid;
}
.key-label { font-weight: 800; min-width: 2.2em; text-align: right; }
.key-value { font-weight: 600; }
.key-detail { color: #666; font-size: ${basePt - 1}pt; }

/* ── drawn SVG assets ───────────────────────────────── */
/* Explicit sizes: an unconstrained <svg viewBox> falls back to UA-default
   sizing (≈300px+) and blows the packing estimates out of the water. */
.base10 {
  width: 100%;
  max-width: 200pt;
  max-height: 230pt;
  display: block;
  margin: 0 auto;
}
.clock-face-svg { width: 88pt; height: 88pt; display: block; margin: 0 auto; }
.frac-bar { width: 100%; max-width: 160pt; display: block; margin: 0 auto; }
.frac-pie { width: 96pt; height: 96pt; display: block; margin: 0 auto; }

/* ── hundreds chart ─────────────────────────────────── */
.hundreds-chart { text-align: center; }
.hundreds-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  border: 1pt solid #999;
  border-radius: 3pt;
  overflow: hidden;
}
.hundreds-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 19pt;
  font-size: 9.5pt;
  font-weight: 600;
  color: #444;
  border-right: 0.5pt solid #ccc;
  border-bottom: 0.5pt solid #ccc;
}
.hundreds-cell:nth-child(10n) { border-right: none; }
.hundreds-cell:nth-last-child(-n+10) { border-bottom: none; }
.hundreds-cell.missing { color: #fff; }

/* ── ink saver ──────────────────────────────────────── */
/* Pure line art: hatched fills become outlines, dotted decorations become
   plain hairlines. CSS fill overrides presentation attributes (fill="url(#…)"),
   so the pattern defs stay in the markup but draw nothing. */
.ink-saver [fill^="url(#"] { fill: none; }
.ink-saver .workspace-grid { background-image: none; border-style: solid; }
.ink-saver .key-entry { border-bottom-style: solid; border-bottom-color: #ccc; }
.ink-saver .coin-mill { stroke-width: 1.1; }

/* ── screen only ────────────────────────────────────── */
@media screen {
  .sheet-page {
    box-shadow: 0 2pt 12pt rgba(0, 0, 0, 0.18);
    margin: 16pt auto;
  }
}

/* ── print only ─────────────────────────────────────── */
@media print {
  .sheet-page {
    height: ${dims.printHeight};
    box-shadow: none;
    margin: 0;
    break-after: page;
    page-break-after: always;
  }
  .sheet-page:last-child {
    break-after: auto;
    page-break-after: auto;
  }
}
`.trim();
}
