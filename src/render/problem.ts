// Shared problem-chrome builders. Every renderer returns a bare problem body;
// the assembler wraps it with the label, workspace area, and answer box.

import { icon } from './icons';

/** Instruction line, e.g. "How many?" — consistent voice across types. */
export function prompt(text: string): string {
  return `<div class="prompt">${text}</div>`;
}

/** A row of icons. `icons` = icon ids; optional per-icon class suffix. */
export function iconGroup(icons: string[], className?: string): string {
  const cls = className ? ` class="${className}"` : '';
  return (
    `<div${cls} role="img">` + icons.map((id) => icon(id, 'group-icon')).join('') + `</div>`
  );
}

/** A scatter of icons with deterministic positions (percent coordinates in data). */
export function iconScatter(
  icons: string[],
  positions: { x: number; y: number }[],
  className?: string,
): string {
  const cls = className ? ` class="${className}"` : '';
  const items = icons
    .map(
      (id, i) =>
        `<span class="scatter-icon" style="left:${positions[i].x}%;top:${positions[i].y}%">${icon(id)}</span>`,
    )
    .join('');
  return `<div${cls} role="img">${items}</div>`;
}

/** Blank answer line the child writes on. */
export function writeBox(): string {
  return `<span class="write-box">&#8203;</span>`;
}

/** Inline blank inside an equation, e.g. `3 + 4 = ___`. */
export function blank(): string {
  return `<span class="blank">&#8203;</span>`;
}

/** A numeral chip (number-recognition, sequences). */
export function numeralChip(n: number, className?: string): string {
  const cls = className ? ` class="${className}"` : '';
  return `<span${cls}>${n}</span>`;
}

/** Dotted tracing digit (SVG stroke + dasharray). */
export function traceDigit(
  digit: string,
  opts: { style: 'dashed' | 'outline'; width: number; height: number },
): string {
  const dash = opts.style === 'dashed' ? ' stroke-dasharray="3 3.5"' : '';
  return (
    `<svg class="trace-digit" viewBox="0 0 ${opts.width} ${opts.height}" aria-hidden="true">` +
    `<text x="${opts.width / 2}" y="${opts.height - 8}" text-anchor="middle" ` +
    `class="trace-glyph"${dash}>${digit}</text>` +
    `<line x1="${opts.width / 2 - 20}" y1="${opts.height - 2}" ` +
    `x2="${opts.width / 2 + 20}" y2="${opts.height - 2}" class="trace-baseline"/>` +
    `</svg>`
  );
}
