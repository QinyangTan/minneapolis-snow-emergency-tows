# Visualization design brief

## Audience and assertion boundary
Audience: classmates, Minneapolis residents, and instructors curious about how a three-day parking rule system appears in **observed towing** records. The visual narrative must never imply a car's tow risk or causal evidence for enforcement disparity.

## Six-scene storyboard
| Scene | Takeaway | Core visual | Interaction |
|---|---|---|---|
| 1 · Rules | Different street parking restrictions across Days 1–3 | Compact day-by-day rule cards | Select day; official rule link |
| 2 · Volume | Days 2 and 3 account for most preliminary tows | Counts + labeled bars | Hover/focus value labels |
| 3 · Spatial shifts | Map concentrations may differ by day | Equal-scale 3-up neighborhood maps | Coordinated day highlight |
| 4 · Recurrence | A hotspot may recur across distinct events | Neighborhood × event recurrence matrix | Hover counts and recurrence definition |
| 5 · Signatures | Neighborhoods have distinct day profiles | Normalized 100% bars or heatmap | Sort by total/day share |
| 6 · Explore | Select event, day and neighborhood | Linked choropleth and details | Filters persist; reset available |
| 7 · Event difference | Ask which emergencies share a day or neighborhood composition | Two complementary JSD comparisons | Select any event pair; link to explorer |

## Visual encoding choices
- Neighborhood **fill intensity** = absolute observed tow count; common domain for side-by-side day comparisons.
- Day color tokens = Day 1 blue, Day 2 orange, Day 3 teal; do not rely only on color.
- 100% bars = composition (percentage of records), **not rate, probability, or risk**.
- Recurrence has **two distinct measures**: ANY RECORD (at least one observed tow per event) versus PROMINENT (top 5/10/15 by observed event count among city neighborhoods, minimum 5 tows, cutoff ties included). The threshold is adjustable for sensitivity checks. Neither measures exposure-adjusted risk.
- Event comparison uses Jensen–Shannon divergence (base 2; 0 identical, 1 fully disjoint). Day-share comparisons include all citywide event records; geographic comparisons renormalize over assigned neighborhood records. These denominators are explicitly stated.
- Count vs composition are different encodings; never use them interchangeably.
- Display absolute N, selected event/day, and source provenance alongside maps.
- Provide keyboard focus behavior, readable tooltips, and reduced-motion fallbacks.

## Initial interface
Hero: Three Days, Three Rules — a Minneapolis context introduction.
Sticky-ish secondary filter rail for event/day; clear data-quality status.
Sections: day counts, event totals, geographic explorer, methods/limitations.
Next: small-multiple map, normalized neighborhood profiles, recurrence matrix, scroll-driven transitions.

## Acceptance criteria
1. The page works with the preliminary snapshot **and visibly labels it preliminary**, with a no-map-yet state rather than fake geography.
2. Regenerated data is strictly derived from official ArcGIS layers, is neighborhood-aggregated, and never exposes address-level raw point records.
3. Event/day counts match the full source; spatially assigned neighborhood counts plus explicit unassigned points reconcile with the source.
4. Exclude the incomplete Victory 2 layer; every included event has days 1, 2 and 3.
5. Glenwood uses the identical neighborhood join applied to all events.
6. The deployment is a static artifact; no runtime third-party geocoding.
7. Include explicit City geocoding uncertainty and the 'observed tows != risk' disclaimer.

## Prioritized milestones
- M0: private repo, design spec, static app scaffold, auditable data-contract tests.
- M1: nine official layers -> deterministic processed neighborhood data; source/count audit.
- M2: linked event/day explorer and 3-up small-multiple maps.
- M3: recurrence heatmap, normalized day signatures, guided narrative.
- M4: accessibility, performance, reproducibility, course FP2/FP3 deliverables.

## Neighborhood context extension · November 10, 2026

- The compact dashboard now shares a Count / per-1,000 residents / per-km² measure between its map and neighborhood scatterplot. Counts follow the selected event/day; map domains remain fixed to full selected-nine-event totals for each measure.
- A linked context axis uses renter households, households without a vehicle or people below poverty. Source universes are distinct. Population, tenure and vehicle access use 2020–2024 ACS; poverty uses 2019–2023.
- Hollow points identify low-reliability ACS estimates. A selected point shows the source percentage's horizontal 90% MOE, clipped to the physical 0–100% range. Population MOE appears in the detail, not as an outcome confidence interval.
- Unknown population produces a hatched map region and unavailable ratio. True zero records with a valid denominator remain zero. All 87 neighborhoods stay selectable through a native selector and semantic table.
- Areas are WGS84 ellipsoidal areas of the supplied gross polygons, including water where present. Resident and area descriptions do not measure parked vehicles or individual tow risk.
- The new context surface uses the existing cold-blue dashboard palette, flat chart/detail layout and responsive SVG dimensions. Secondary source/record details remain collapsed by default.
- Context downloads independently; a failed context request leaves the count map available and offers retry. Reset restores event/day/neighborhood, brush, measure and context attribute.
- Ordinary-day towing and a complete emergency calendar remain unavailable. No baseline-adjusted excess, estimated normal-day counts or causal claims appear in this extension.
