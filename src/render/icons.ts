// Hand-authored ink-first icon library. Every icon:
// - viewBox 0 0 32 32, stroke "currentColor", stroke-width 2, round caps/joins
// - line art only (fills via CSS: `svg` presentation attrs lose to CSS, so
//   color-by-number and accent modes can fill them without new markup)
// - no emoji, no external icon sets (licensing + print consistency)
//
// Adding an icon = adding one entry here; it's immediately usable by any
// question type via icon(id).

export const ICONS: Record<string, string> = {
  // ── shapes ──────────────────────────────────────────────
  circle: '<circle cx="16" cy="16" r="11"/>',
  square: '<rect x="6.5" y="6.5" width="19" height="19" rx="2"/>',
  triangle: '<polygon points="16,6 28,26 4,26"/>',
  star: '<polygon points="16,4 19.7,12.9 29,13.2 22,19 24.5,28 16,23.2 7.5,28 10,19 3,13.2 12.3,12.9"/>',
  heart:
    '<path d="M16 26C8 20 4.5 15 4.5 10.5 4.5 7 7.5 5 10.5 5c2.5 0 4.5 1.5 5.5 3.5C17 6.5 19 5 21.5 5 24.5 5 27.5 7 27.5 10.5 27.5 15 24 20 16 26Z"/>',
  diamond: '<polygon points="16,5 27,16 16,27 5,16"/>',
  oval: '<ellipse cx="16" cy="16" rx="12" ry="8"/>',

  // ── fruit ───────────────────────────────────────────────
  apple:
    '<path d="M11.5 16.5c-4 0-6-3.5-6-6.5C5.5 6 9.5 5 11.5 8c2-3 6-2 6 2 0 3-2 6.5-6 6.5Z"/><path d="M20.5 16.5c-4 0-6-3.5-6-6.5 0-4 4-5 6-2 2 3 2 6.5-2 6.5Z"/><path d="M16 10v-4"/><path d="M16 6.5c1.5-2.5 5-3 5-1.5-1.8.2-3.5 1-5 1.5Z"/>',
  banana: '<path d="M7 15.5C7 11 11 7.5 16.5 7.5 22 7.5 25.5 11 25.5 15c-3 .5-5.5 3.5-10 3.5S10 15.5 7 15.5Z"/><path d="M7.5 15c-.5 2-2.5 3.5-4 4.5"/>',
  orange:
    '<circle cx="16" cy="17" r="10"/><path d="M16 7V4.5"/><path d="M16 5.5c1.2-1.6 3.2-1.6 3.2-.4-1.2.1-2.2.3-3.2.4Z"/>',
  cherry:
    '<circle cx="11.5" cy="20" r="5"/><circle cx="20.5" cy="20" r="5"/><path d="M11.5 15C10.5 11 8.5 8.5 7 7"/><path d="M20.5 15c1-4 3-6.5 4.5-8"/>',

  // ── animals ─────────────────────────────────────────────
  cat: '<circle cx="16" cy="16" r="9"/><polygon points="9,10.5 6,3.5 13,7.5"/><polygon points="23,10.5 26,3.5 19,7.5"/><path d="M13 16.5h.01M19 16.5h.01" class="icon-dot"/><path d="M16 17v2"/><path d="M15 19.5h2"/><path d="M8.5 18.5h-3.5M8.5 20.5H6M23.5 18.5h3.5M23.5 20.5H26"/>',
  dog: '<circle cx="16" cy="16" r="9"/><path d="M8 8.5C6.5 4.5 7.5 2 10.5 3.5c-.8 1.7-1.2 3.4-1 5.5Z"/><path d="M24 8.5c1.5-4 .5-6.5-2.5-5 .8 1.7 1.2 3.4 1 5.5Z"/><path d="M13 15.5h.01M19 15.5h.01" class="icon-dot"/><path d="M16 19c1.5 0 2.5-1 2.5-2.2-2.5.8-5 0-5 0 0 1.2 1 2.2 2.5 2.2Z"/>',
  fish: '<ellipse cx="15" cy="16" rx="11" ry="7"/><polygon points="25,16 31,10 31,22"/><path d="M9.5 15h.01" class="icon-dot"/><path d="M13 13c1 2 1 4 0 6"/>',
  bird: '<path d="M5 20c0-6 5-10.5 12.5-10.5 5 0 9.5 2.5 9.5 2.5-1.5 5-4.5 9-10 10-4.5.8-9.5-.5-12-2Z"/><polygon points="25,13 31,15 25,17"/><path d="M9.5 17h.01" class="icon-dot"/><path d="M14 14.5c2 2.5 4.5 3 7 2"/>',

  // ── objects ─────────────────────────────────────────────
  ball: '<circle cx="16" cy="16" r="11"/><path d="M16 5c-4 3-4 8 0 11 4 3 4 8 0 11"/><path d="M16 5c4 3 4 8 0 11-4 3-4 8 0 11"/>',
  balloon:
    '<ellipse cx="16" cy="18" rx="8" ry="10"/><path d="M16 28l2 3.5h-4L16 28Z"/><path d="M15.5 31.5c-1.5 1.5-1.5 3 .5 4"/>',
  book: '<path d="M5.5 7.5h10.5c2.5 0 3.5 1.5 3.5 4v13c0-2.5-1-4-3.5-4H5.5Z"/><path d="M26.5 7.5H16c-2.5 0-3.5 1.5-3.5 4v13c0-2.5 1-4 3.5-4h10.5Z"/><path d="M16 11.5v13"/>',
  pencil:
    '<path d="M6.5 23.5l2 2L25.5 8.5l-2-2Z"/><path d="M8.5 25.5l-3 1 1-3Z"/><path d="M21.5 4.5l2.5 2.5-2 2-2.5-2.5Z"/>',
  sun: '<circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M25 7l-3 3M10 22l-3 3"/>',
};

export function iconIds(): string[] {
  return Object.keys(ICONS);
}

/** Themed pools for counting types ("count the apples", mixed variety, etc.). */
export const ICON_SETS: Record<string, string[]> = {
  shapes: ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'oval'],
  fruit: ['apple', 'banana', 'orange', 'cherry'],
  animals: ['cat', 'dog', 'fish', 'bird'],
  objects: ['ball', 'balloon', 'book', 'pencil', 'sun'],
  mixed: iconIds(),
};

/** Inline SVG for an icon, with the ink-first defaults applied. */
export function icon(id: string, className?: string): string {
  const inner = ICONS[id];
  if (!inner) throw new Error(`Unknown icon: ${id}`);
  const cls = className ? ` class="${className}"` : '';
  return (
    `<svg${cls} viewBox="0 0 32 32" aria-hidden="true" ` +
    `fill="none" stroke="currentColor" stroke-width="2" ` +
    `stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
  );
}
