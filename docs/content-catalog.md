# Content Catalog — the contract

Every question type in the app is registered here. This file is **authoritative**: the UI, the docs, and validation all reflect this table. See also `CLAUDE.md` invariants.

## The additive-only rule

Once a type ships, its `id`, generator behavior, and params **never change**. A bug fix that changes output becomes a **new type id** (e.g. `add-vertical-v2`) or a version-gated generator — the old id keeps its old behavior so share links stay valid forever. `schemaVersion` in `WorksheetSpec` only ever increments for spec-shape changes, and `migrate()` must handle every past version.

## Type record

```ts
interface QuestionType {
  id: string;                    // kebab-case, unique forever
  subject: string;               // subject dir name
  name: string;                  // display name in UI
  description: string;           // shown on type cards
  gradeRange: [GradeBand, GradeBand];
  difficultyPresets: Record<GradeBand, Record<string, unknown>>; // param defaults per band
  params: ParamSpec[];           // drives the auto-generated config form
  generate(rng, params, ctx): Problem;
  render(p, ctx): string;
  estHeightPt?(params): number;  // hard-coded packing estimate
}
```

## How to add a type

1. Create `src/content/<subject>/<type-id>.ts` following an existing type's pattern (generate with answers by construction; render pure; estHeightPt conservative).
2. Export it from the subject's `index.ts`.
3. Add it to the table below (params, difficulty knobs, icon deps, phase).
4. Add golden + property tests.
5. New subject? New dir + `index.ts` with subject metadata — nothing else changes. Grade 6+ = a `prealgebra/` dir.

## Inventory

Status: `planned` → `implemented` → `print-verified` (docs/qa-print.md).

### counting (pre-K – G1)

| id | name | grade | status | phase | notes |
| --- | --- | --- | --- | --- | --- |
| `count-objects` | Count the objects | preK–K | implemented | 1 | icons row/grid/scatter; max 5/10/20; uniform or mixed icons |
| `number-recognition` | Circle the numeral | preK–K | implemented | 1 | distractors within ±3 |
| `quantity-matching` | Match number to group | preK–G1 | implemented | 1 | line-drawing pairs, shuffled right column |
| `which-has-more` | Which has more? | preK–K | implemented | 1 | also "fewer"; A/B boxes |
| `missing-number-sequence` | Fill the missing number | K–G1 | implemented | 1 | steps 1/2/5/10 |
| `number-tracing` | Trace the number | preK–K | implemented | 1 | SVG stroke-dasharray; dashed/outline |
| `ten-frame` | Ten frames | K–G1 | implemented | 1 | count / how many to make 10 |
| `count-and-write` | Count and write | preK–K | planned | 2 | icons → numeral in answer box |

### addsub (K – G5)

| id | name | grade | status | phase | notes |
| --- | --- | --- | --- | --- | --- |
| `add-facts` | Addition facts | K–2 | implemented | 1 | sums ≤10 → ≤20; horiz + vertical; includeZero |
| `sub-facts` | Subtraction facts | G1–2 | implemented | 1 | minuend ≤10/20; never negative; includeZero |
| `add-vertical` | Vertical addition | G2–4 | implemented | 1 | carry none/always/mixed by construction; carry row |
| `sub-vertical` | Vertical subtraction | G2–4 | planned | 2 | no-borrow / borrow |

### manual (all grades)

| id | name | grade | status | phase | notes |
| --- | --- | --- | --- | --- | --- |
| `manual` | My own question | preK–G5 | implemented | 1 | RNG-free; HTML-escaped; horizontal/vertical; editor UI in Phase 2 |

### money (G1 – G3)

| id | name | grade | status | phase | notes |
| --- | --- | --- | --- | --- | --- |
| `coins-count` | Count the coins | G1–3 | implemented | 2 | coin row (1¢/5¢/10¢/25¢), total in cents |
| `making-change` | Making change | G2–3 | implemented | 2 | pay with $1/$5; price first, change derived |
| `money-add` | Add the money | G1–3 | implemented | 2 | two coin groups, greedy exact decomposition |

### measurement (K – G4)

| id | name | grade | status | phase | notes |
| --- | --- | --- | --- | --- | --- |
| `ruler-read` | Read the ruler | G1–3 | implemented | 2 | inch ruler SVG, integer ticks, arrow span |
| `compare-lengths` | Longer or shorter? | K–2 | implemented | 2 | two bars A/B, distinct lengths |
| `area-perimeter` | Area or perimeter | G3–4 | implemented | 2 | hatched cell grid (area) / outline (perimeter) |

### geometry (preK – G3)

| id | name | grade | status | phase | notes |
| --- | --- | --- | --- | --- | --- |
| `shape-identify` | Name the shape | K–1 | implemented | 2 | big shape icon, write the name; basic / polygon pools |
| `sides-corners` | Sides and corners | K–2 | implemented | 2 | polygon → side/corner count from shared map |
| `shape-match` | Match shape to name | preK–1 | implemented | 2 | line-drawing pairs, shuffled right column |
| `symmetry` | Line of symmetry | G1–3 | implemented | 2 | symmetric icon shapes (Yes) + custom scalene/L (No) |
| `classify` | Which shapes belong? | G1–3 | implemented | 2 | circle quadrilaterals / curved / polygons, A–F letters |

### patterns / colorByNumber / wordproblems

Reserved subject dirs; tables filled in as Phase 2–3 types land (ruler reading, shape identification, next-in-pattern, color-by-number, word-problem template families).

## Icon library (`src/render/icons.ts`)

Hand-authored ink-first SVGs (viewBox 0 0 32 32, stroke `currentColor`, stroke-width 2, fills via CSS vars). Implemented (53): shapes — circle, square, triangle, star, heart, diamond, oval, pentagon, hexagon, rectangle, trapezoid, crescent; fruit — apple, banana, orange, cherry; animals — cat, dog, fish, bird, rabbit, butterfly, snail, frog, bee, ladybug; objects — ball, balloon, book, pencil, sun, house, tree, flower, kite, gift; vehicles — car, truck, plane, boat, train, rocket; foods — icecream, cupcake, pizza, carrot, grapes, mushroom; weather — cloud, rain, umbrella, snowflake, rainbow. Themed pools in `ICON_SETS`; `mixed` is FROZEN to the Phase 1 20 so existing seeds never change. Auxiliary drawn assets (ten-frame ✓, base-10 blocks ✓, clock ✓, fraction bars/pies ✓, coins ✓, ruler ✓, number line, tally marks, hundreds chart) live in `render/svg.ts` or the owning type.
