# Research results (frozen data, October 7, 2026)

These values are derived from the checked-in City of Minneapolis ArcGIS `static/data/summary.json` and `static/data/neighborhoods.geojson`. The source records are observed tow events, **not** tow probability, all illegal parking, or a representative weather sample. Regenerate/review this note whenever source data is refreshed.

## Q1 — What changes across Days 1, 2 and 3?

| Day | Citywide tows | Share |
|---|---:|---:|
| Day 1 | 1,255 | 23.1% |
| Day 2 | 2,222 | 41.0% |
| Day 3 | 1,946 | 35.9% |

These totals include all 5,423 valid tow records. Only 5,355 are successfully assigned to one of 87 current neighborhood polygons, so neighborhood-based comparisons have a **different denominator** and should not silently inherit citywide totals.

**Interpretation:** The largest number of observed tows falls on Day 2. This describes the selected historical events, not a causal effect of Day 2 parking policy.

## Q2 — Which neighborhoods recur across independent events?

**Any occurrence** is not a high-intensity hotspot. The app now exposes two separate metrics:

- **ANY RECORD:** number of events containing at least one observed tow in the neighborhood.
- **PROMINENT:** number of events where it ranks among the top K neighborhoods by observed tow count, with at least five tows in that event and ties at the cutoff included.

For **K = 10, minimum 5 tows** using all days, East Bde Maka Ska, Hawthorne, Loring Park, Marcy Holmes and Powderhorn Park each meet this descriptive prominence criterion in **8 of 9 events**. The criterion is chosen for comparison, not by the City or instructor. Its rank and interpretation can change when K is 5 or 15. Area, street length, number of cars and parking exposure are *not* accounted for.

**Interpretation:** These neighborhoods repeatedly rank highly by observed count under an explicit operational threshold, but there is no evidence here to say an individual parked car faces an elevated towing probability.

## Q3 — How similar are the events?

**Method:** Jensen–Shannon divergence in base-2 logarithms: symmetric, finite and bounded from 0 (identical probability distributions) to 1 (disjoint). Each event's observed counts are normalized to sum to one within the selected dimension. This is a descriptive comparison, **not** a hypothesis test or estimated causal relationship.

| Comparison distribution | Closest event pair | JSD | Most different pair | JSD |
|---|---|---:|---|---:|
| Three-day shares, all valid records | Howard ↔ Bridge | 0.000215 | Victory 1 ↔ Glenwood | 0.122764 |
| Assigned-neighborhood shares, mapped records only | Bridge ↔ Glenwood | 0.111399 | Victory 1 ↔ Jefferson | 0.306682 |

**Interpretation:** A pair can be nearly identical by Day 1/2/3 share without being the closest pair geographically. The comparison changes depending on what is being measured. For geographic composition, the 68 out-of-neighborhood records are excluded and each event's mapped counts are renormalized.

## Figure and methodological limitations

- Nine specific complete Snow Emergencies were selected for comparability; extrapolation beyond them is not justified.
- Event size, weather, enforcement priorities, street exposure, parking demand and geocoding error are not controlled.
- The location metadata for some recent City layers cites roughly 8–14% expected address geocoding error; current neighborhood boundaries are not guaranteed historically identical.
- No confidence interval, p-value or prediction is asserted for divergence scores or prominence recurrence. The low sample of nine events particularly argues against an unwarranted population-level significance claim.
- Source code and tests: `src/lib/eventAnalysis.mjs`, `tests/test_event_analysis.mjs`, `tests/test_checked_in_data.py`. Data provenance: `docs/DATA_CONTRACT.md`.
