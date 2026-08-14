// Bundled font families (via @fontsource, latin subsets, imported in the UI
// layer). Sheet CSS references these names ONLY — never OS font fallbacks:
// identical metrics everywhere is what makes pagination deterministic.

export const FONTS = {
  /** Friendly rounded sans — pre-K through G2 sheets. */
  playful: "'Nunito', sans-serif",
  /** Clean humanist sans — G3+ sheets. */
  body: "'Karla', sans-serif",
  /** Handwriting — name lines, tracing glyphs. */
  handwriting: "'Patrick Hand', cursive",
} as const;

/** Body font per grade level (GRADE_LEVEL values; ≤ G2 uses the playful font). */
export function bodyFontFor(gradeLevel: number): string {
  return gradeLevel <= 3 ? FONTS.playful : FONTS.body;
}
