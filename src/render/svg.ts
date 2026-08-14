// Auxiliary drawn assets: fraction shapes, clock faces. Built as inline SVG
// with hatch-pattern shading (SVG <pattern> is vector content — it prints
// even when "background graphics" is off, unlike CSS backgrounds).
//
// Note on trig: render-time geometry uses Math.cos/sin. IEEE-754 trig is
// deterministic across platforms; the integer-only rule covers generation
// math (answers), not static drawing geometry.

/** Unique-per-problem hatch pattern id (avoids <pattern> id collisions). */
export function hatchId(suffix: string): string {
  return `hatch-${suffix}`;
}

function hatchDef(id: string): string {
  return (
    `<defs><pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
    `<line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-width="1.6"/>` +
    `</pattern></defs>`
  );
}

/** Fraction bar: `numerator` of `denominator` equal parts shaded (hatched). */
export function fractionBarSvg(numerator: number, denominator: number, suffix: string): string {
  const w = 200;
  const h = 40;
  const cell = w / denominator;
  let cells = '';
  for (let i = 0; i < denominator; i++) {
    const fill = i < numerator ? `fill="url(#${hatchId(suffix)})"` : '';
    cells += `<rect x="${i * cell}" y="0" width="${cell}" height="${h}" class="frac-cell" ${fill}/>`;
  }
  return (
    `<svg class="frac-bar" viewBox="0 0 ${w} ${h}" aria-hidden="true">` +
    hatchDef(hatchId(suffix)) +
    `<rect x="0" y="0" width="${w}" height="${h}" class="frac-frame"/>` +
    cells +
    `</svg>`
  );
}

/** Fraction pie: `numerator` of `denominator` wedges shaded. */
export function fractionPieSvg(numerator: number, denominator: number, suffix: string): string {
  const cx = 50;
  const cy = 50;
  const r = 44;
  const wedge = (from: number, to: number, filled: boolean): string => {
    const a1 = (from * Math.PI * 2) / denominator - Math.PI / 2;
    const a2 = (to * Math.PI * 2) / denominator - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const large = to - from > denominator / 2 ? 1 : 0;
    const fill = filled ? `fill="url(#${hatchId(suffix)})"` : '';
    return (
      `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z" ` +
      `class="frac-cell" ${fill}/>`
    );
  };
  let wedges = '';
  for (let i = 0; i < denominator; i++) {
    wedges += wedge(i, i + 1, i < numerator);
  }
  return (
    `<svg class="frac-pie" viewBox="0 0 100 100" aria-hidden="true">` +
    hatchDef(hatchId(suffix)) +
    `<circle cx="${cx}" cy="${cy}" r="${r}" class="frac-frame"/>` +
    wedges +
    `</svg>`
  );
}

/** Analog clock face: hour + minute hands, 12 tick marks. */
export function clockSvg(hour: number, minute: number, className?: string): string {
  const cx = 50;
  const cy = 50;
  const r = 46;
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const x1 = cx + (r - 6) * Math.sin(a);
    const y1 = cy - (r - 6) * Math.cos(a);
    const x2 = cx + r * Math.sin(a);
    const y2 = cy - r * Math.cos(a);
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="clock-tick"/>`;
  }
  const hourAngle = ((hour % 12) + minute / 60) * 30 * (Math.PI / 180);
  const minuteAngle = minute * 6 * (Math.PI / 180);
  const hx = cx + 0.55 * r * Math.sin(hourAngle);
  const hy = cy - 0.55 * r * Math.cos(hourAngle);
  const mx = cx + 0.85 * r * Math.sin(minuteAngle);
  const my = cy - 0.85 * r * Math.cos(minuteAngle);
  const cls = className ? ` class="${className}"` : '';
  return (
    `<svg${cls} viewBox="0 0 100 100" aria-hidden="true">` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" class="clock-face"/>` +
    ticks +
    `<line x1="${cx}" y1="${cy}" x2="${hx.toFixed(2)}" y2="${hy.toFixed(2)}" class="clock-hand hour"/>` +
    `<line x1="${cx}" y1="${cy}" x2="${mx.toFixed(2)}" y2="${my.toFixed(2)}" class="clock-hand minute"/>` +
    `<circle cx="${cx}" cy="${cy}" r="2.5" class="clock-pin"/>` +
    `</svg>`
  );
}
