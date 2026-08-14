# Math Worksheet Generator

A browser-only math worksheet generator for pre-K through grade 5. Fully static, no backend, no realtime AI: a serializable config plus a seed deterministically reproduces the identical worksheet, and everything prints to clean PDFs through the browser's print dialog. Aimed at classroom teachers — answer keys, name/date lines, ink-friendly black-and-white printing, variant sets (same config, different numbers) for anti-cheating, and mixed-difficulty sheets for differentiation.

## Features

- **Deterministic generation** — same spec + seed ⇒ same sheet, every time, on every machine. Share a link and the recipient gets the exact worksheet you made.
- **Pre-K → grade 5 content** — number recognition, counting with line-art icons, tracing, ten-frames, all four operations (facts and vertical), fractions, place value, time, money, measurement, geometry, patterns, color-by-number, and templated word problems. Structured so grade 6+ can be added later.
- **Manual questions** — define any number of your own problems; they're laid out, paginated, and printed exactly like generated ones, and can be mixed with generated sections.
- **Print-perfect PDF** — worksheets render as exact page-sized elements (Letter or A4) with deterministic pagination, page-number footers, and separately-numbered answer-key pages.
- **Ink-first design** — black line art and gray shading by default; survives printing without "background graphics"; optional color accents for on-screen or color printers.
- **Teacher tools** — Sets A–F variants, answer key toggle, workspace boxes, large-print mode, share links, saved favorites.

## Quick start

```sh
cd web/math-worksheet-generator
direnv allow          # or: nix develop
npm install
npm run dev           # local dev server
```

| Command            | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Vite dev server with hot reload                 |
| `npm test`         | Vitest suite (determinism, property, packing)   |
| `npm run check`    | svelte-check TypeScript validation              |
| `npm run lint`     | ESLint (incl. engine determinism rules)         |
| `npm run build`    | Production build to `dist/`                     |
| `npm run preview`  | Serve the production build locally              |

## Deployment

Push to `main` — GitHub Actions builds, runs the test suite, and deploys `dist/` to GitHub Pages. The repo must have Pages set to "Deploy from a branch: GitHub Actions" (Source → GitHub Actions).

## How it works

The **engine** (`src/engine/`, pure TypeScript, zero DOM) turns a `WorksheetSpec` into a packed sheet: seeded RNG (frozen mulberry32), answers computed by construction, per-type height estimates driving deterministic page packing. The **content catalog** (`src/content/`) is a registry of question types, one file per type. **Rendering** (`src/render/`) produces the exact DOM + stylesheet used by both the scaled on-screen preview and print. The **UI** (`src/ui/`, Svelte 5) is a thin layer over the engine.

Docs: [`docs/architecture.md`](docs/architecture.md), [`docs/content-catalog.md`](docs/content-catalog.md) (the content contract), [`docs/roadmap.md`](docs/roadmap.md) (phases + status), [`docs/qa-print.md`](docs/qa-print.md) (per-browser print checklist).
