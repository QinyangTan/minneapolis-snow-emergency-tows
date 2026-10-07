# Three Days, Three Rules
**Visualizing Minneapolis Snow Emergency Tows** · CSCI 5609 Final Project

An interactive, evidence-driven visual story about how Minneapolis towing patterns change between Snow Emergency Days 1, 2, and 3, and which neighborhoods repeatedly become hotspots.

**Status:** M0–M4 interactive prototype validated: nine official ArcGIS layers reprocessed (October 7, 2026), verified neighborhood GeoJSON, linked visualizations, real Chromium desktop/mobile automated QA (5/5 tests), WCAG 2.1 A/AA serious/critical automated audit, and three recorded GIF demos. Remaining before final course submission: manual screenreader review, final editorial annotations, and optional static deployment.

## Animated demos

These GIFs are **recordings of real Chromium browser interactions** with the reproducibly processed Minneapolis City dataset. They are not generated illustrations or static mockups.

### 1. Three days, one comparable map scale

Inspect Day 1, Day 2, and Day 3 neighborhood concentrations side by side, with synchronized day highlighting and a shared scale.

![Real browser GIF showing three comparable Minneapolis Snow Emergency neighborhood maps](docs/demos/three-day-map-comparison.gif)

### 2. Linked event, day, and neighborhood exploration

Filter to Bridge, select Day 2, click Marcy Holmes, and inspect the associated observed tow count — then reset the explorer.

![Real browser GIF showing event, day, and neighborhood filter interactions](docs/demos/linked-event-neighborhood-explorer.gif)

### 3. Recurring neighborhood footprints and day signatures

Explore the neighborhood-by-event count matrix, choose a particular event and neighborhood, and sort 100%-normalized day profiles.

![Real browser GIF showing the recurring tow count matrix and normalized neighborhood profiles](docs/demos/recurrence-and-day-signatures.gif)

**Recording and validation:** `npm run qa:browser` tests desktop/mobile layout, linked filters, numerical reconciliation, keyboard actions, and automated WCAG serious/critical violations. `npm run demo:gifs` records actual Chromium videos before transcoding to looping GIF. The video-to-GIF conversion does not alter any underlying City data.

## Research questions

1. How do observed towing patterns vary by Day 1, Day 2, and Day 3?
2. Which neighborhoods repeatedly appear as towing hotspots across distinct Snow Emergencies?
3. How different are individual Snow Emergencies in day composition and geography?

## Scope

Nine complete three-day emergencies: Dover, Jane, Lourdes, Northrop, Victory 1 (2022/23); Howard (2024/25); Bridge, Glenwood, Jefferson (2025/26). The FP1 proposal reports **5,423** tow records, **independently re-confirmed** from official City layers on October 7, 2026 (all nine event counts match). Victory 2 is intentionally excluded because its published layer is incomplete.

- Study **observed towing records**, not probability of a particular vehicle being towed.
- Spatial claims primarily use neighborhoods rather than apparent address-level precision; City layers warn about approximately 8–14% geocoding-address error.
- No predictive model, backend, real-time tracker, St. Paul expansion, or demographic inference.

## Application

- **SvelteKit + D3**, ready for static deployment (not yet publicly hosted).
- **Python + requests + Shapely** data preparation; historical records are fetched from official ArcGIS FeatureServer endpoints, spatially joined to one neighborhood boundary definition, and exported as versionable summary JSON + GeoJSON.

### Run locally

Requires Node.js 20+:

```sh
npm install
npm run dev
```

The processed data is now committed: 5,423 citywide tow records, 87 neighborhood polygons; 68 geocoded points not located within a current neighborhood are retained in city totals but excluded from neighborhood map counts. If processed files are absent, the page explicitly falls back to the FP1 preliminary view.

### Regenerate data (network required)

Requires Python 3.11+:

```sh
python -m pip install -r requirements.txt
python scripts/build_data.py
python -m unittest discover -s tests -v
npm run check
npm run build
```

The data pipeline fails loudly for ambiguous services, missing days, and invalid record geometry. Points outside the current City neighborhood polygons are retained in city totals, but excluded from neighborhood maps and disclosed in quality output. Inspect `static/data/quality.json` and review count differences from FP1 before using the generated maps as final evidence. The source-audit workflow publishes `static/data/summary.json`, `static/data/neighborhoods.geojson`, and `static/data/quality.json` only when all nine layer counts pass strict checks. It never exports raw address-level tow points.

## Project map

```text
src/routes/+page.svelte          Scrollytelling overview + linked filtering
src/lib/NeighborhoodMap.svelte  Keyboard-selectable D3 neighborhood choropleth
src/lib/DaySmallMultiples.svelte  Three comparable day maps with common legend\nsrc/lib/NeighborhoodMatrix.svelte  Event-by-neighborhood count matrix\nsrc/lib/DaySignatures.svelte  Normalized neighborhood composition\nsrc/lib/analytics.ts        Pure cross-view count/recurrence selectors\nsrc/lib/preliminary.ts      Clearly labeled FP1 fallback snapshot
scripts/build_data.py          ArcGIS acquisition / normalization / join / export
tests/                        Input and checked-in-output integrity tests
docs/DESIGN.md                 Storyboard, encodings, interaction, quality criteria
docs/DATA_CONTRACT.md          Schema, provenance and aggregation semantics
static/data/                   Generated public, aggregated data (not raw addresses)
```

## Official sources

- [Snow Emergency parking rules](https://www.minneapolismn.gov/getting-around/snow/snow-emergencies/snow-parking-rules/)
- [ArcGIS services directory](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/)
- [Minneapolis neighborhoods](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Minneapolis_Neighborhoods/FeatureServer)
- [Bridge tow event example](https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services/Snow_Emergency_Bridge_Tows_2025/FeatureServer)

The primary design authority is the team's *CSCI5609 FP1 Snow Emergency Proposal* (October 2026). Substantive AI/agent contributions must be reported in accordance with course guidance.

## Working agreement

Do not publish false-precision dot maps, mislabel observed counts as risk, silently discard unmatched records, or claim an FP1 preliminary count has been independently revalidated. Always show source, unit of analysis, time coverage, and limitations. No raw address-level export in the public app.
