// Shared height-estimation helpers. Every content type's estHeightPt is a
// hand-derived model of its own render() structure using the CSS constants
// from sheet-css.ts — calibrated against measured rendering, never measured
// at runtime. All arithmetic is integer-friendly (Math.floor/ceil on ratios).

import type { EstContext } from '../engine/spec';

/** One body-text line at 1.35 line-height. */
export const lineH = (c: EstContext): number => Math.ceil(c.basePt * 1.35);

/** `.prompt` line + its 6pt bottom margin. */
export const promptH = (c: EstContext): number => lineH(c) + 6;

/** `.count-answer`: 8pt margin + write-box (1.15em). */
export const answerH = (c: EstContext): number => 8 + Math.ceil(c.basePt * 1.15);

/** One-line `.fact` row (no prompt), e.g. "3 + 4 = ___". */
export const factH = (c: EstContext): number => Math.ceil(c.basePt * 1.2) + 7;

/** Digit row in vertical arithmetic (basePt+3.5 font, tight rows). */
export const digitRowH = (c: EstContext): number => Math.ceil((c.basePt + 3.5) * 1.185);

/** `.chip`: 1.6em min-width + 3pt padding + 1.3pt borders. */
export const chipW = (c: EstContext): number => Math.ceil(c.basePt * 1.6) + 19;
export const chipRowH = (c: EstContext): number => Math.ceil(c.basePt * 2.25);

/** Generic icon sizes (sheet-css iconPt / matchIconPt / classifyIconPt). */
export const iconPt = (c: EstContext): number => (c.largePrint ? 30 : 24);
export const matchIconPt = (c: EstContext): number => (c.largePrint ? 27 : 22);
export const classifyIconPt = (c: EstContext): number => (c.largePrint ? 40 : 32);
export const coinPt = (c: EstContext): number => (c.largePrint ? 40 : 32);

/** Rows a wrap container needs for `count` fixed-width items in `availW`.
 *  3pt tolerance absorbs sub-pixel (px-rounding) wrap differences. */
export function rowsFor(count: number, itemW: number, gap: number, availW: number): number {
  if (count <= 0) return 0;
  const per = Math.max(1, Math.floor((availW + gap - 3) / (itemW + gap)));
  return Math.ceil(count / per);
}

/** Legend entry width (color-by-number key: "3 = red" spans). */
export const legendW = (c: EstContext): number => Math.ceil(c.basePt * 3.2) + 12;

/** Prompt line count for a known prompt string (0.52×basePt ≈ Nunito/Karla
 *  average glyph width for mixed-case sentence text). */
export function promptLines(text: string, ctx: EstContext): number {
  const textW = Math.ceil(text.length * ctx.basePt * 0.52);
  return Math.max(1, Math.ceil(textW / ctx.contentWidthPt));
}
