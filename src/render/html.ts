// HTML helpers shared by all renderers. Renderers return HTML *strings* —
// the engine is DOM-free and testable in Node.

/**
 * Escape user-supplied text (manual prompts, titles). Everything else in the
 * sheet is our own generated strings, so this covers the whole XSS surface.
 */
export function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Render an inline SVG from a builder that returns inner markup (viewBox 0 0 32 32). */
export function svgIcon(inner: string, className?: string): string {
  const cls = className ? ` class="${className}"` : '';
  return `<svg${cls} viewBox="0 0 32 32" aria-hidden="true">${inner}</svg>`;
}
