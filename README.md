# Three Days, Three Rules
**Visualizing Minneapolis Snow Emergency Tows** · CSCI 5609 Final Project

An interactive, evidence-driven visual story about how Minneapolis towing patterns change between Snow Emergency Days 1, 2, and 3, and which neighborhoods repeatedly become hotspots.

**Status:** initial research + application scaffold. City data still needs to be regenerated from the reproducible pipeline. The numbers displayed before this regeneration are explicitly marked **FP1 preliminary estimates** (not validated live data).

## Research questions

1. How do observed towing patterns vary by Day 1, Day 2, and Day 3?
2. Which neighborhoods repeatedly appear as towing hotspots across distinct Snow Emergencies?
3. How different are individual Snow Emergencies in day composition and geography?

## Scope

Nine complete three-day emergencies: Dover, Jane, Lourdes, Northrop, Victory 1 (2022/23); Howard (2024/25); Bridge, Glenwood, Jefferson (2025/26). The FP1 proposal reports **5,423** tow records across them, subject to re-verification when rebuilding. Victory 2 is intentionally excluded because its published layer is incomplete.

- Study **observed towing records**, not probability of a particular vehicle being towed.
- Spatial claims primarily use neighborhoods rather than apparent address-level precision; City layers warn about approximately 8–14% geocoding-address error.
- No predictive model, backend, real-time tracker, St. Paul expansion, or demographic inference.

## Application

- **SvelteKit + D3**, statically deployed.
- **Python + requests + Shapely** data preparation; historical records are fetched from official ArcGIS FeatureServer endpoints, spatially joined to one neighborhood boundary definition, and exported as versionable summary JSON + GeoJSON.

### Run locally

Requires Node.js 20+:

```sh
npm install
npm run dev
```

Before authoritative data is built, the page shows preliminary FP1-only charts and a clearly marked map placeholder.

### Regenerate data (network required)

Requires Python 3.11+:

```sh
python -m pip install -r requirements.txt
python scripts/build_data.py
python -m unittest discover -s tests -v
npm run check
npm run build
```

The data pipeline fails loudly for ambiguous services, missing days, and invalid record geometry. Points outside the current City neighborhood polygons are retained in city totals, but excluded from neighborhood maps and disclosed in quality output. Inspect `static/data/quality.json` and review count differences from FP1 before using the generated maps as final evidence. After regeneration, commit `static/data/summary.json`, `static/data/neighborhoods.geojson`, and `static/data/quality.json` (but not raw address-level point data).

## Project map

```text
src/routes/+page.svelte          Scrollytelling overview + linked filtering
src/lib/NeighborhoodMap.svelte  D3 neighborhood choropleth
src/lib/preliminary.ts          Clearly labeled FP1 snapshot
scripts/build_data.py          ArcGIS acquisition / normalization / join / export
tests/                        Transformation unit tests
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
