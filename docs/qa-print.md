# Print QA Checklist

Authoritative manual gate for print correctness. Browser print engines differ — every phase checkpoint requires the relevant rows to pass. Re-check after any change to `sheet-css.ts`, `pack.ts`, `assemble.ts`, or `estHeightPt` values.

**Print dialog settings that must always be documented in the UI:** Margins: None · Headers/footers: off · Scale: 100% · (Chrome: "Background graphics" optional — sheets must be fully usable with it OFF).

## Chrome (macOS + Windows)

- [ ] Page count matches engine prediction; no blank pages between sheets
- [ ] Footers on every page: "Page N of M" (answer keys numbered separately)
- [ ] Header (title / name / date) on every worksheet page
- [ ] Answer key breaks to a new page
- [ ] Letter and A4 both exact
- [ ] Backgrounds ON: gray fills/hatches render; Backgrounds OFF: sheet still fully usable
- [ ] Scale 100%, 1/2/3-column grids, glyphs (× ÷ − ½ ★) render
- [ ] Tracing digits dashed correctly

## Safari (macOS + iPad/iOS)

- [ ] Page count, no blank pages (iPad may force device margins — verify layout survives)
- [ ] Footers, headers, key page break
- [ ] A4/Letter
- [ ] Tracing digits

## Firefox

- [ ] Page count, no blank pages, footers, headers, key page break
- [ ] A4/Letter, tracing digits

## Per-feature rows (fill in as features land)

- [ ] Color-by-number: legend readable B&W; numbers legible with fills off
- [ ] Clock faces: hands between numbers correct
- [ ] Rulers: tick alignment exact
- [ ] Coins: proportional sizes
- [ ] 60-problem sheet: page count + no clipping (overflow lint clean)
- [ ] Variant sets: all worksheet pages then all key pages, labeled per set
