# CLAUDE.md — Math Worksheet Generator

Browser-only math worksheet generator (pre-K → grade 5), Svelte 5 + Vite + TypeScript, deployed to GitHub Pages. No backend, no realtime LLM. Deterministic: `WorksheetSpec` (config) + seed ⇒ identical sheet.

**Svelte MCP tools:** see [AGENTS.md](./AGENTS.md) — use `list-sections`/`get-documentation` for Svelte questions and `svelte-autofixer` on any Svelte code before finishing.

## Commands

```sh
npm run dev      # Vite dev server
npm test         # Vitest (engine tests run in Node — engine must stay DOM-free)
npm run check    # svelte-check
npm run lint     # ESLint (engine has determinism restrictions)
npm run build    # dist/ — deployed by GitHub Actions on push to main
```

## Layout

- `src/engine/` — pure TS, zero DOM, integer-only math. rng, seed, spec types + validateSpec, serialize (URL hash), fingerprint, generate (dedupe), pack (pagination), assemble (pages → DOM string + CSS), registry.
- `src/content/` — question types. One dir per subject, one file per type, `index.ts` exports subject metadata + its types. Adding a subject (incl. grade 6+) = new dir + registration, nothing else changes.
- `src/render/` — deterministic sheet CSS + HTML builders, icon library (hand-authored ink-first SVGs), svg helpers, fonts, page chrome.
- `src/ui/` — Svelte 5 (runes). Thin layer: config form, scaled preview, print root.
- `docs/` — `roadmap.md` (phases + status checkboxes — **the source of truth for progress**), `content-catalog.md` (the content contract), `architecture.md`, `qa-print.md` (per-browser print checklist).
- `.plans/durable-plan.md` — full plan; gitignored.

## Invariants — DO NOT BREAK

1. **Frozen RNG**: mulberry32 in `src/engine/rng.ts` is the only randomness source. Never change its algorithm.
2. **Integer-only math** in the engine (cross-machine determinism, exact tests). No floats.
3. **Answers by construction**: generate the answer first, derive operands from it. Never pick operands then compute (avoids negatives/zero/remainders where invalid).
4. **render() is pure**: no RNG in render; all jitter decisions are made in generate() and stored in `Problem.data`. Rendering twice must be byte-identical (tested).
5. **Additive-only content**: an existing type's id/generator/params never change behavior. A behavior change = new type id (or version-gated generator). `docs/content-catalog.md` is the contract. Old share links must keep working across deploys.
6. **No `Date`/`Math.random` in engine** — enforced by ESLint (`no-restricted-globals`/`no-restricted-properties`).
7. **Sheet CSS must never fall back to OS fonts** — bundled @fontsource fonts only; pagination depends on identical metrics everywhere.
8. **estHeightPt values are hard-coded per type** (never measured at runtime — runtime measurement breaks determinism). Packing uses a 0.92 capacity factor; keep them conservative.
9. **validateSpec must reject hostile inputs** (unknown type ids, counts > 60, pages > 20, oversized manual prompts) — a URL hash must never hang the app.
10. **Manual prompts are user input** — always HTML-escape at render.

## Print architecture (why it looks like this)

Pages are discrete `.sheet-page` elements sized exactly to the paper (8.5×11in / 210×297mm), `@page { margin: 0 }`, `break-after: page`. No `@page` margin boxes (Firefox lacks them). Footers are in-flow. Preview shows the same DOM inside a `transform: scale()` wrapper; `#print-root` re-renders it unscaled for print. Print dialog must be set to Margins: None, headers/footers off, scale 100% — the UI reminds users.

## Resume procedure

1. Read `docs/roadmap.md` (status) + `.plans/durable-plan.md`.
2. Verify: `git status`, `npm test`.
3. Continue from the first unchecked item; tick checkboxes in both roadmap.md and the durable plan as work completes.
