# Architecture

## Overview

```
WorksheetSpec (JSON, in URL hash)
   │  seed + config
   ▼
ENGINE (src/engine — pure TS, zero DOM, integer-only math)
   1. generate   spec → Problems (per type, seeded RNG, dedupe)
   2. pack       problems → pages (per-type estHeightPt budgets)
   3. assemble   pages → sheet DOM string + deterministic CSS
   ▼
UI (src/ui — Svelte 5)
   preview: same DOM inside transform:scale() wrapper   (WYSIWYG)
   print:   same DOM unscaled in #print-root            (@media print)
```

The engine is importable and fully testable in Node — Svelte and the DOM are only the presentation layer.

## Determinism contract

| Rule | Why |
| --- | --- |
| mulberry32 is the only RNG (frozen) | Same seed ⇒ same stream forever |
| Integer-only math in the engine | No cross-platform float drift; exact tests |
| Answers by construction | Generate the answer, derive operands — answers always correct |
| RNG consumed in `generate()` only; `render()` pure | Rendering twice is byte-identical (tested) |
| No `Date` / `Math.random` in engine (ESLint) | No wall-clock or non-seeded randomness |
| Additive-only content rule | Existing type ids/generators/params never change behavior; fixes are new ids or version-gated generators — old share links keep working |
| `schemaVersion` + `migrate()` | Old URLs migrate forward; newer-version URLs get a friendly message |

## Core types (`src/engine/spec.ts`)

- `WorksheetSpec` — `{ schemaVersion, seed, title, gradeBands, sections, layout, options }`. Fully serializable; drives everything.
- `SectionSpec` — `{ typeIds: string[], counts, difficulty: 'grade'|'easy'|'challenge'|'mixed', params }`. Multiple typeIds = round-robin interleave (review sheets).
- `Problem` — `{ typeId, index, gradeLevel, data, answer, fingerprint, label }`. `data` is serializable + deterministic; layout decisions (jitter, spacing) live here, not in render.
- `QuestionType` — `{ id, subject, name, description, gradeRange, difficultyPresets, params: ParamSpec[], generate(rng, params, ctx) → Problem, render(p, ctx) → string, estHeightPt?(params) }`.
- `ParamSpec` — small TS DSL (`int|select|bool|text|color`, min/max/options/default/group) that auto-generates the config form. Deliberately not JSON Schema (no ajv, TS-checked).

## Page packing (`src/engine/pack.ts`)

Problems are generated per section, then packed deterministically:

1. Each type declares a hard-coded `estHeightPt(data)` — receives the problem's DATA (anything the estimate needs must be stored there), computed once during development from real renders, then frozen — never measured at runtime.
2. Page budget = content height − header − footer, × 0.92 safety factor.
3. Sections pack in order; overflow starts a new page. A problem never splits across pages.
4. Within a page, problems sit in a CSS grid (`repeat(columns, 1fr)`).

Output: `{ pages: [{ problems, headerSpec, footerSpec, keyType }], pageCount }`.

## Print pipeline (`src/render/sheet-css.ts`, `src/engine/assemble.ts`)

- Each page is a discrete `.sheet-page` element sized exactly to paper: Letter 8.5×11in or A4 210×297mm. `@page { size; margin: 0 }`, `break-after: page` per element.
- No `@page` margin boxes (unsupported in Firefox; `counter(pages)` broken everywhere) — page numbers are in-flow footer content ("Page 1 of 4"; answer-key pages number separately).
- Float-rounding guard: print-media `height: calc(<page height> - 0.02in)` + `overflow: hidden` prevents blank-page emission between sheets.
- `-webkit-print-color-adjust: exact` on everything; all rules/lines are real borders (not backgrounds) so sheets survive printing with "background graphics" off.
- One stylesheet serves preview and print: engine emits `sheetCss(spec)` deterministically; preview scales it with `transform: scale(k)`, print re-renders unscaled.
- Dev-only page-overflow lint: pages carry `data-page-content-h`; a dev overlay warns when content exceeds 98% of page height (clipping is silent otherwise).

## Icons and fonts

- **Icons** (`src/render/icons.ts`): hand-authored inline SVG, viewBox 0 0 32 32, stroke `currentColor`, fills via CSS vars (`--fill-solid`, `--fill-light`, `--accent`). Ink-first: black strokes + gray fills by default. No emoji (print-inconsistent), no external sets. One `<defs>` block per page with sheet-hash-suffixed pattern ids (avoids `<pattern>` id collisions).
- **Fonts** (bundled via @fontsource, latin subsets): Nunito (pre-K–2), Karla (3–5), Patrick Hand (handwriting: name line, tracing). Bundling is what makes pagination deterministic — sheet CSS never falls back to OS fonts.
- Glyph coverage of `× − ÷ ½ ★ →` varies by font; fallback is tiny inline-SVG operator symbols (`render/svg.ts`) — decided per symbol in QA.
- Columnar arithmetic uses fixed-width digit cells, not `tabular-nums` font features.

## Special rendering techniques

- **Number tracing**: SVG `<text>` with `fill: none` + `stroke` + `stroke-dasharray` (dotted) in Patrick Hand. `-webkit-text-stroke` can't dash. `tracingStyle: 'dashed' | 'outline'` param; QA picks the default.
- **Color-by-number survives B&W**: numbers inside regions are the functional layer (always dark); legend is text-based (`1 = red`); modes: default B&W (white fills), accent tints, hatch patterns.

## Manual questions

`content/manual/` is just another question type. Its params carry `ManualQuestion[]` (`{ prompt, answer?, layout: 'horizontal'|'vertical', workspace }`); `generate()` emits one Problem per entry with no RNG (index-based fingerprints). Packing, answer keys, variants, and URL serialization all work unchanged; manual questions interleave with generated ones via mixed `typeIds`. Prompts are HTML-escaped at render and length-capped in `validateSpec` (the only user-text XSS surface).

## URL serialization (`src/engine/serialize.ts`)

`#s=<base64url(JSON spec)>`; UI updates via `history.replaceState`. `decodeSpec` validates, then migrates. Hard caps: ≤ 60 problems per section, ≤ 20 pages, bounded manual prompts.

## Variants (anti-cheating)

Sets A–F are a UI feature: N sheets with `deriveVariantSeed(base, k)` (splitmix32 mix — NOT `base + k`, mulberry32 adjacent seeds correlate). Worksheet pages for all sets print first, then all answer keys, labeled per set.

## Testing

- **Golden** (`tests/golden/`): per type × representative params × fixed seeds — rendered HTML + sheet CSS snapshots. Regenerating fixtures is a deliberate version-bump ritual.
- **Property** (`tests/property/`): recompute the math from the data the renderer displays and assert it equals `problem.answer` (catches render/math drift); render purity; dedupe uniqueness; per-type invariants (no negatives, remainders < divisor, integer alignment, coin sums…).
- **Unit** (`tests/unit/`): rng determinism, serialize round-trip + migrate, validateSpec rejection table, packing page assignment, manual XSS escape.
- **Print QA** (`docs/qa-print.md`): browser-dependent, manual checklist per browser. Phase 4 adds a Puppeteer CI smoke test (page.pdf → assert page count == engine prediction, no blank pages).
