# Roadmap & Status

**Source of truth for progress.** Tick items here AND in `.plans/durable-plan.md` as work completes. Each phase ends deployed + print-verified.

Current status: **Phase 2 in progress** — Phase 1 shipped: engine core, manual type, 10 content types + 20 icons, print pipeline (PDF page count verified in Chrome), config UI ("Worksheet Desk"), golden/property/unit test suite. Phase 1 checkpoint partially green: Chrome print verified; Safari/Firefox manual pass pending (docs/qa-print.md).

## Phase 0 — Scaffold

- [x] git init; Vite + Svelte 5 (runes) + TS + Vitest + ESLint (engine determinism rules)
- [x] flake.nix (nixpkgs-unstable + flake-utils house style) + .envrc
- [x] GitHub Actions deploy.yml (build → upload-pages-artifact → deploy-pages); Vite base './'
- [x] Docs skeleton: README, CLAUDE.md, docs/{architecture,content-catalog,roadmap,qa-print}.md; .plans/durable-plan.md
- [x] Checkpoint: placeholder live on Pages (harmolipi.github.io/math-worksheet-generator), CI green, golden test in CI

## Phase 1 — Engine + print pipeline + first content + UI v1

- [x] Engine: rng, seed, spec types, validateSpec, serialize+migrate, fingerprint, generate+dedupe, pack, assemble, registry (assemble pending — part of print pipeline item)
- [x] Engine support for `manual` type (no-RNG generate, escaped render, validation caps)
- [x] First 10 types (counting: count-objects, number-recognition, quantity-matching, which-has-more, missing-number-sequence, number-tracing, ten-frame; addsub: add-facts, sub-facts, add-vertical) + 20 icons
- [x] sheet-css (Letter+A4), scaled preview, print-root, header (title/name/date), answer key list mode, in-flow page numbers — print-verified: headless Chrome PDF page count == engine prediction (overflow lint overlay → UI task)
- [x] UI v1: grade-band picker, type cards with live samples, options panel, seed + regenerate + copy link, Print hints ("Worksheet Desk" design via frontend-design skill)
- [ ] Tests: golden, property, purity, round-trip, packing, validation
- [ ] Checkpoint: 3+ types print correctly on Chrome/Safari/Firefox (qa-print.md partially filled), deployed

## Phase 2 — Content expansion + teacher features

- [ ] ~24 more types (multdiv, placevalue, fractions, time, money, measurement, geometry, patterns, color-by-number) + 28 icons + per-band difficulty presets
- [ ] Teacher features: Sets A–F variants, mixed difficulty + stars, URL share + raw-spec editor, favorites, largePrint, inkSaver, hundreds chart
- [ ] Manual question editor UI (prompt/answer/workspace list editor, horizontal + vertical layout, mixing with generated)
- [ ] Per-type property tests
- [ ] Checkpoint: full pre-K–5 core catalog usable; variant sets print with correct page counts; deployed

## Phase 3 — Word problems + polish

- [ ] Template engine (typed slots, solve-by-construction, structural dedupe, equation + answer keys)
- [ ] Polish: workspace boxes, per-column lettering, print-dialog hints, page-count warnings, final font + glyph pass
- [ ] Checkpoint: end-to-end teacher flow documented in README

## Phase 4 — QA matrix + v1.0.0

- [ ] Manual print QA matrix (qa-print.md): Chrome Win/macOS, Safari macOS+iPad, Firefox
- [ ] CI smoke: Puppeteer page.pdf → pdf-lib page-count assertion
- [ ] Seed-stability drill; perf pass (60-problem sheets); a11y pass
- [ ] Checkpoint: v1.0.0 tag, full QA matrix green
