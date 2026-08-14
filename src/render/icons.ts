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

  // ── more shapes (geometry) ──────────────────────────────
  pentagon: '<polygon points="16,5 27,13 22.5,27 9.5,27 5,13"/>',
  hexagon: '<polygon points="10,5.5 22,5.5 27.5,16 22,26.5 10,26.5 4.5,16"/>',
  rectangle: '<rect x="6" y="10" width="20" height="12" rx="1"/>',
  trapezoid: '<polygon points="8,12.5 24,12.5 27,23.5 5,23.5"/>',
  crescent: '<path d="M21 4.5A13.5 13.5 0 1 0 27.5 27.5 11 11 0 1 1 21 4.5Z"/>',

  // ── vehicles ────────────────────────────────────────────
  car: '<path d="M5 21v-2.5c0-1.5 1-2.5 2.5-2.5h7L16 12h5.5c1.5 0 2.5 1 2.5 2.5l2 4c1.5 0 2.5 1 2.5 2.5H5Z"/><path d="M10 16h5"/><circle cx="10" cy="23.5" r="2.2"/><circle cx="22" cy="23.5" r="2.2"/>',
  truck: '<rect x="4" y="10" width="11" height="10" rx="1"/><rect x="15" y="9" width="13" height="11" rx="1"/><path d="M4 14h7"/><circle cx="8.5" cy="23" r="2.2"/><circle cx="22" cy="23" r="2.2"/>',
  plane:
    '<path d="M6 21.5c0-2 1.5-3 3.5-3h13c2 0 3.5 1 3.5 3 0 1.5-1.5 2.5-3.5 2.5h-13C7.5 24 6 23 6 21.5Z"/><path d="M24.5 19L28 11l2.5 8.5"/><path d="M13 21.5l2.5-4.5 2 4.5"/><path d="M9.5 20.5h.01M12.5 20.5h.01M15.5 20.5h.01" class="icon-dot"/>',
  boat:
    '<path d="M5.5 21.5C9 18.5 15 17.5 20.5 18c4 .4 6 1.5 7 3-2 1.5-4.5 2.8-7.5 3C15 25 9.5 24 6.5 22Z"/><path d="M16 18V6.5"/><path d="M16 7.5c4.5 2 6.5 5.5 6.5 9.5h-6.5Z"/><path d="M9 26.5c1.5 1.2 3 1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0"/>',
  train:
    '<rect x="4" y="9" width="24" height="12" rx="2"/><path d="M4 15h24"/><path d="M10 21v2.5M16 21v2.5M22 21v2.5"/><path d="M4 11h3.5l3 3"/><circle cx="8.5" cy="26" r="1.8"/><circle cx="16" cy="26" r="1.8"/><circle cx="23.5" cy="26" r="1.8"/><path d="M27 14c1 1.5 1.5 3 1 4.5"/>',
  rocket:
    '<path d="M16 3c4.5 2.5 7 7.5 7 12.5l-2.5 3v5.5c0 1.5-1 2.5-2.5 2.5h-4c-1.5 0-2.5-1-2.5-2.5V18.5L9 15.5C9 10.5 11.5 5.5 16 3Z"/><circle cx="16" cy="12.5" r="2.5"/><path d="M11.5 20l-3 4.5 2.5 1.5 2.5-4M20.5 20l3 4.5-2.5 1.5-2.5-4"/>',

  // ── foods ───────────────────────────────────────────────
  icecream:
    '<path d="M9.5 19c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5c-2.2 1-4.3 1-6.5 0-2.2 1-4.3 1-6.5 0Z"/><path d="M11 19h10l-5 8.5Z"/><path d="M11.5 21l3.5 5M20.5 21l-3.5 5"/>',
  cupcake:
    '<path d="M6.5 15.5C8.5 11 11.5 9 16 9s7.5 2 9.5 6.5c0 0-2 1.5-4.5 1.5-3 0-5-1.5-5-1.5s-2 1.5-5 1.5c-2.5 0-4.5-1.5-4.5-1.5Z"/><path d="M7.5 17.5h17l-1.5 7c0 1.5-1 2.5-2.5 2.5h-9c-1.5 0-2.5-1-2.5-2.5Z"/><path d="M11 19v8M16 19v8M21 19v8"/>',
  pizza:
    '<path d="M16 5L7.5 22.5a12.5 12.5 0 0 0 17 0Z"/><path d="M12.5 16.5h.01M18.5 19h.01M15 12h.01" class="icon-dot"/>',
  carrot:
    '<path d="M16 6c-5 4-7 9-7 13.5 0 2 1 4 3 5.5l2-6 2 6c2-1.5 3-3.5 3-5.5 0-4.5-2-9.5-7-13.5Z"/><path d="M16 6c0-2 2-2.5 3-1M16 6c0-2-2-2.5-3-1"/><path d="M12 13l1.5 4M14.5 17.5l2 4"/>',
  grapes:
    '<circle cx="11" cy="13" r="3.2"/><circle cx="16.5" cy="13" r="3.2"/><circle cx="22" cy="13" r="3.2"/><circle cx="8.5" cy="19.5" r="3.2"/><circle cx="14" cy="19.5" r="3.2"/><circle cx="19.5" cy="19.5" r="3.2"/><circle cx="25" cy="19.5" r="3.2"/><circle cx="11" cy="26" r="3.2"/><circle cx="16.5" cy="26" r="3.2"/><circle cx="22" cy="26" r="3.2"/><path d="M16.5 9.8V6.5c0-1.2-1.5-1.2-1.5 0v3.3"/><path d="M15 6.5c-2-1.2-4 0-4 0M16.5 6.5c1.2-1.3 3-1 3-1"/>',
  mushroom:
    '<path d="M6 17c0-6 4.5-9.5 10-9.5S26 11 26 17Z"/><path d="M6 17c3.5 1 6.5 1 10 0 3.5 1 6.5 1 10 0"/><path d="M13 17v4.5c0 1.8 1.3 3 3 3s3-1.2 3-3V17"/><path d="M12 11h.01M20 11h.01M16 7.5h.01" class="icon-dot"/>',

  // ── weather ─────────────────────────────────────────────
  cloud:
    '<path d="M8.5 23a5.5 5.5 0 0 1-.5-11C9.6 9 12.8 6.8 16.3 6.8c4.2 0 7.7 3 8.2 7.2 3 .2 5 2.6 5 5.3a5 5 0 0 1-5 5H8.5Z"/>',
  rain:
    '<path d="M10 20a4.5 4.5 0 0 1-.4-9C10.6 9.4 13.2 8 15.8 8c3.2 0 6 2.2 6.4 5.4 2.4.1 4.3 2 4.3 4.4a4.3 4.3 0 0 1-4.3 4.3H10Z"/><path d="M12 23.5l-1.5 3M17 23.5l-1.5 3M22 23.5l-1.5 3"/>',
  umbrella:
    '<path d="M5.5 18a10.5 10.5 0 0 1 21 0Z"/><path d="M5.5 18c3.5 1.3 7 1.3 10.5 0 3.5 1.3 7 1.3 10.5 0"/><path d="M16 4.5V18"/><path d="M16 18v5.5c0 2-1.5 3-3.5 3-1.5 0-2.5-.7-3-2"/>',
  snowflake:
    '<path d="M16 4v24M7 10l18 12M25 10L7 22"/><path d="M16 9.5l-3-3M16 9.5l3-3M16 22.5l-3 3M16 22.5l3 3M10 8.5l1-4M10 8.5l4.5-1M22 23.5l-1 4M22 23.5l-4.5 1M22 8.5l-1-4M22 8.5l-4.5-1M10 23.5l1 4M10 23.5l4.5 1"/>',
  rainbow: '<path d="M4 24a12 12 0 0 1 24 0"/><path d="M7 24a9 9 0 0 1 18 0"/><path d="M10 24a6 6 0 0 1 12 0"/>',

  // ── more animals ────────────────────────────────────────
  rabbit:
    '<ellipse cx="16" cy="19" rx="8" ry="7"/><path d="M11.5 13.5C10 8 6.5 6 4 6c1.5 2.5 2 5 1.5 8M20.5 13.5C22 8 25.5 6 28 6c-1.5 2.5-2 5-1.5 8"/><path d="M13 18h.01M19 18h.01" class="icon-dot"/><path d="M14.5 21.5c1 .9 2 .9 3 0"/>',
  butterfly:
    '<path d="M16 13C11.5 9 7.5 6 5 4.5 6.5 10 10 14.5 16 16Z"/><path d="M16 13c4.5-4 8.5-7 11-8.5C25.5 10 22 14.5 16 16Z"/><path d="M16 19c-4 2.5-7.5 6-8.5 9.5 3-1.5 6.5-5.5 8.5-9.5Z"/><path d="M16 19c4 2.5 7.5 6 8.5 9.5-3-1.5-6.5-5.5-8.5-9.5Z"/><path d="M16 12.5V23"/><path d="M16 12.5c-1.5-2.5-3.5-4-5-4.5M16 12.5c1.5-2.5 3.5-4 5-4.5"/>',
  snail:
    '<circle cx="19.5" cy="16" r="7.8"/><path d="M19.5 11.8c-2 0-3.7 1.7-3.7 3.7 0 2.4 2 3.9 4.2 3.9"/><path d="M6 21.5c0-2.3 1.9-4 4.2-4 .8 0 1.6.2 2.2.6l2.6-1.5c1.5 2.3 2.8 3.8 3.5 4.9-1 .6-2.2 1-3.5 1H10c-2.2 0-4-1.8-4-4Z"/><path d="M5.8 17.5c-1.2-.3-2-1.2-2-2.5M5.8 17.5c1.2-.3 2-1.2 2-2.5"/>',
  frog:
    '<ellipse cx="16" cy="18" rx="9" ry="7.5"/><circle cx="10" cy="9.5" r="3.5"/><circle cx="22" cy="9.5" r="3.5"/><path d="M10.5 9h.01M21.5 9h.01" class="icon-dot"/><path d="M13 18c1.5 1.8 4.5 1.8 6 0"/><path d="M12.5 25l-2 2.5M19.5 25l2 2.5"/>',
  bee:
    '<ellipse cx="16" cy="18" rx="6.5" ry="8"/><path d="M11.5 16.5c3 1 6 1 9 0M10.8 20c3 1.2 7.4 1.2 10.4 0"/><ellipse cx="13.5" cy="12" rx="4" ry="3" transform="rotate(-30 13.5 12)"/><ellipse cx="18.5" cy="12" rx="4" ry="3" transform="rotate(30 18.5 12)"/><circle cx="16" cy="9" r="3"/><path d="M14 6.5L12.5 4M18 6.5l1.5-2.5"/><path d="M15 9h.01M17 9h.01" class="icon-dot"/><path d="M16 26l1.5 3"/>',
  ladybug:
    '<circle cx="16" cy="8" r="3"/><path d="M7.5 17.5c0-5.5 3.8-9.5 8.5-9.5s8.5 4 8.5 9.5c0 4.5-3.5 7-8.5 7s-8.5-2.5-8.5-7Z"/><path d="M16 8v16.5"/><path d="M11.5 15h.01M20.5 15h.01M11.5 20h.01M20.5 20h.01" class="icon-dot"/>',

  // ── more objects ────────────────────────────────────────
  house:
    '<path d="M5 16.5L16 5.5l11 11"/><path d="M7.5 14.5V26c0 .8.7 1.5 1.5 1.5h14c.8 0 1.5-.7 1.5-1.5V14.5"/><path d="M13 27.5v-7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v7.5"/><path d="M20.5 18.5v5M18 21h5"/>',
  tree: '<polygon points="16,5 25,17 7,17"/><polygon points="16,10 27,22 5,22"/><rect x="13.5" y="22" width="5" height="5.5"/>',
  flower:
    '<circle cx="16" cy="16" r="3.5"/><circle cx="16" cy="7.5" r="3.5"/><circle cx="23.5" cy="12" r="3.5"/><circle cx="20.5" cy="20.5" r="3.5"/><circle cx="11.5" cy="20.5" r="3.5"/><circle cx="8.5" cy="12" r="3.5"/><path d="M16 23.5V28"/><path d="M16 26c-2 .5-3.5 2-3.5 3.5 0 1 1 1.5 2 1 1-.5 1.5-2 1.5-4.5"/>',
  kite:
    '<path d="M16 4l10 10-3 13H9L6 14Z"/><path d="M16 4v23M6 14l13 13"/><path d="M9.5 26.5c-1.5 1.5-3.5 1-4-.5 1.5-1 3.5-.5 4 .5Z"/><path d="M9 28.5c-1 1.5-2.5 1.5-3.5 0 1-1 2.5-1 3.5 0Z"/>',
  gift:
    '<rect x="5" y="12" width="22" height="14" rx="1"/><rect x="3.5" y="8.5" width="25" height="4.5" rx="1"/><path d="M16 8.5v17.5"/><path d="M14 7.5c0-1.5 1-2.5 2-2.5s2 1 2 2.5c0 1-1 2-2 3-1-1-2-2-2-3Z"/>',
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
  polygons: ['pentagon', 'hexagon', 'trapezoid', 'rectangle'],
  vehicles: ['car', 'truck', 'plane', 'boat', 'train', 'rocket'],
  foods: ['icecream', 'cupcake', 'pizza', 'carrot', 'grapes', 'mushroom'],
  weather: ['cloud', 'rain', 'umbrella', 'snowflake', 'rainbow'],
  moreAnimals: ['rabbit', 'butterfly', 'snail', 'frog', 'bee', 'ladybug'],
  moreObjects: ['house', 'tree', 'flower', 'kite', 'gift'],
  /**
   * FROZEN: the original Phase 1 pool. Adding icons must never change what
   * existing seeds pick from `mixed` (additive-only content rule).
   */
  mixed: [
    'circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'oval',
    'apple', 'banana', 'orange', 'cherry',
    'cat', 'dog', 'fish', 'bird',
    'ball', 'balloon', 'book', 'pencil', 'sun',
  ],
  /** Everything, for NEW types only. */
  mixedPlus: iconIds(),
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
