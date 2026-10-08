# Visual Story Redesign — Evidence First

**Scope:** the Svelte/D3 website itself, not a slide deck. Intended audience: Minneapolis residents, visualization students, and the Fall 2026 CSCI 5609 reviewers. This document explains why each graphical encoding exists and what question its marks answer.

## One narrative, six complementary visual grammars

| Scene | Question | Visual grammar | Encoding / denominator | Interaction | Takeaway / guardrail |
|---|---|---|---|---|---|
| 1. Rules | Why do the three days differ? | Three illustrated editorial rule cards | Day and street-side restrictions; refer to City rules | Select Day 1–3 | Rule context only; not causal evidence |
| 2. Citywide composition | When are the observed tows recorded? | Labeled horizontal bars + data-derived finding | Observed tow count and % **of selected citywide event scope** | Day selection | Biggest day changes with event; never call this towing risk |
| 3. Event fingerprints | What is distinct about each emergency? | Nine multi-attribute editorial cards + normalized bar glyphs | Event, season, n, Day 1–3 % of citywide event records, largest *mapped* area by absolute count, per-event map exclusions | Click card ↔ linked event filter | Distinguish a high count from high per-car risk; coverage displayed |
| 4. Spatial shifts | Where is each day recorded? | Three equal-scale choropleth small multiples | Neighborhood-level absolute mapped counts with a **shared** maximum across days of the selected event | Select map or neighborhood | Count scale must not silently re-normalize each panel |
| 5. Recurrence / sensitivity | How stable is a hotspot definition? | Neighborhood × event count heatmap **and** top-K slope glyphs | Count matrix, ANY RECORD across events, PROMINENT recurrence among event top 5/10/15 with minimum five records | Click matrix cell, choose K, click slope row | Sensitivity curves are threshold changes, **not time progression** |
| 6. Day signature / event comparison | Can similar temporal profiles hide spatial differences? | 100%-normalized neighborhood bars + symmetric 9×9 JSD matrix with pair inspector | Neighborhood day shares versus Jensen–Shannon divergence of all-event day shares (citywide) or 87-neighborhood shares (mapped) | Sort signatures, change JSD metric, choose pair | Similarity *depends on which dimension* is measured |

## Data storytelling details

- The headline/takeaway above a plot should communicate a falsifiable, source-backed observation, **not** merely name the chart.
- Each visual provides short-form reading instructions, a legend, unit and denominator and either an annotation or grounded example.
- The day palette is semantically consistent across all 100% bars and small multiples: blue = Day 1; orange = Day 2; teal = Day 3. Sequential heat colors communicate count or divergence, never a day category.
- Fingerprint cards deliberately combine big numbers with tiny segmented bars because comparing event magnitude and event composition requires **two different channels**; no stacked flow illusion is created.
- The similarity matrix is chosen over a force-directed network because it shows all **36 unique pairwise measurements** transparently, without unstable arbitrary force layout or distance-based misinterpretation. The matrix's symmetric duplicate half and zero diagonal are explicitly disclosed.
- The prominence chart plots recurrence at **three alternate definitions**, not date. Every line should be nondecreasing when K changes 5 → 10 → 15; this property is unit-tested and browser-tested.
- Keyboard-accessible buttons convey the same number and selection semantics as hover. Screens stay functional at 390px using vertical responsive cards and internal matrix scrolling.
- **Geocoding coverage:** 5,423 valid tow records from nine complete events, 5,355 matched to current neighborhood polygons; the remaining 68 are included in all citywide totals but excluded from neighborhood-count and spatial-JSD denominators.
- City layer geocoding uncertainty, historical-boundary mismatch, nine-event selection limits and no exposure denominators remain explicit limitations. No generative observations, causal, demographic, weather-adjusted or predictive claims.

## Quality / review plan

- Numeric unit tests: event JSD identity/symmetry; strict data reconciliation; prominence threshold monotonicity.
- Browser regressions: 9 fingerprints, count/percentage totals, linked selection, 81 matrix cells, matrix symmetry and metric switching, sensitivity lines, mobile root width, keyboard and axe serious/critical.
- Manual gates remain: real user think-aloud comprehension, actual screenreader and low-end-device review, teammates' independent method critique and documented contribution sign-offs.
- **Recorded demo verification complete:** three additional real Chromium GIFs were committed and embedded in README; the three earlier authentic recordings remain intact. Human review of editorial wording and usability is still required before course release.
