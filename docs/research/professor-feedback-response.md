# Professor feedback: evidence, revised questions and next work

Research date: November 10, 2026. Repository inspected: `QinyangTan/minneapolis-snow-emergency-tows`. Frozen source: `f54d514f01575a6da5b38e6e1c5b93ba50e7f2e8`. This document is a proposed research design and completed data audit, not a claim that an ordinary-day baseline has been obtained.

## Recommendation

Use Minneapolis as the primary study area. Frame the story around a departure from ordinary winter towing, with neighborhood context explaining where that departure is concentrated. Keep Saint Paul as a separately audited extension. More rows from a different city will not repair a mismatched outcome definition or a missing Minneapolis baseline.

**Central question:** How do recorded public-street towing patterns during declared Snow Emergencies differ from comparable ordinary winter periods, and which neighborhoods show the largest departures?

The preferred design requires a consistently defined all-date tow archive covering both emergency and control dates. Until it exists, present the current work as **selected snow-event patterns and neighborhood context**. Do not claim to have measured an increase over normal days.

## What teammates already added

Olga's `4d0396b` adds the sourced FP2 research package; `f54d514` corrects ACS vintages against the original export rows. The package contains 661 original files and 180 data snapshots. Snapshots, table vintages and layers are not independent datasets or independent statistical samples.

The audit independently checked all 661 stored file hashes and the original decompressed hashes for five gzip files. This verifies bytes against the manifest; it does not certify every source's coverage or meaning.

| Available input | Verified role | Required limit |
|---|---|---|
| Main project: nine events, 5,423 published records | Current selected-snow comparison sample: 5,355 mapped records and 68 unmatched | Nine events in three winter seasons, not 5,423 independent emergencies |
| Separate ten-event reference, 6,118 records | Independent reference including Omega's 695 records | Never silently mix the nine- and ten-event versions |
| 34 historical towing layers and 33 citation layers | Candidates for expanding event coverage | Citations are not tows; a downloaded layer is not automatically a valid event |
| Neighborhood ACS starter, 87 map rows | Population, rental tenure, no-vehicle households and poverty context | 86 have population data; Humboldt Industrial Area remains null |
| City ACS observations, 11,954 rows | Source estimates, margins of error and reliability | Population/housing: 2020–2024; poverty/economics: 2019–2023 |
| Hennepin ACS tables, 2022/2023/2024 vintages | Potential tract/block-group income, housing, vehicles and commuting | Overlapping five-year windows; do not average tract medians or treat county rows as neighborhoods |
| Daily MSP weather, 2015–2026 | Snowfall, depth and temperature context | Station observations, not neighborhood snow or towing outcomes |
| Streets, curbs, meters, property/garage and transit snapshots | Potential exposure and access context | Current inventories do not establish historical parking availability |

Primary local inputs are under [`datasetsForFP2/prepared/`](../../datasetsForFP2/prepared/). The City's [Neighborhood Explorer](https://data.minneapolismn.gov/pages/minneapolis-neighborhood-explorer-dashboard) describes its neighborhood ACS estimates and sampling uncertainty.

## Three questions with distinct analytical roles

All three questions support one narrative. They differ in outcome, observational unit and analytical task; they are not three versions of ranking event-by-neighborhood counts.

| Research question | Unit and main outcome | Three planned analyses | Visualization |
|---|---|---|---|
| **RQ1 — Timing and volume:** How unusual is citywide towing during Snow Emergencies relative to comparable winter periods? | City × date or aligned operational window; completed public-street tows per window | 1. Compare matched winter weekday counts and absolute excess. 2. Align event trajectories with pre-event, operational and post-event windows; display control distributions. 3. Separate reason groups and compare across seasons, with event-level sensitivity. | Daily calendar/time series plus an event-aligned observed-versus-reference band |
| **RQ2 — Spatial redistribution:** Which neighborhoods gain or lose share relative to their usual towing pattern during an emergency? | Neighborhood × event; change in city share, percentage points | 1. Compare observed and reference neighborhood shares. 2. Compare raw-count ranks with excess-count/share-change ranks. 3. Check whether directional changes persist when each event or season is omitted, retaining exceptions. | Diverging city map and linked ordinary/snow comparison; a shared-scale count view remains available |
| **RQ3 — Neighborhood context:** Are those departures associated with parking exposure and neighborhood characteristics? | Neighborhood × event with repeated neighborhood/event structure; excess or share change plus context | 1. Compare raw, per-resident and area-based descriptions; examine small-denominator sensitivity. 2. Compare departures with renter share, poverty and no-vehicle share, showing ACS uncertainty/reliability. 3. Add verified street/curb or garage exposure and inspect whether contextual contrasts persist across events and reasonable denominators. | Linked scatterplot with uncertainty and a selected-neighborhood profile |

**Availability gate:** RQ1 and the baseline-adjusted outcomes in RQ2/RQ3 remain unanswered without the all-date archive. The current CSV supports contextual and denominator exploration, not ordinary-day excess. If the archive is unavailable before the next milestone, make the narrowed deliverable explicit: citywide phase variation, neighborhood concentration, and denominator/leave-event-out robustness within selected snow events. Ask the professor to assess that narrower descriptive scope; do not present it as the baseline design completed.

## Ordinary-day data: what the search established

An independent [source audit](normal-day-source-audit.md) checked official Minneapolis ArcGIS discovery, sample service schemas, the impound lookup, annual reporting, and Saint Paul sources. No verified public daily neighborhood-level completed-tow archive was found. This does not mean the Cities lack such records.

The [2024 Traffic & Parking Services report, page 23](https://www.minneapolismn.gov/media/-www-content-assets/documents/2024-Accomplishments-TPS.pdf#page=23) reports 30,549 public-street tows in 2024, with reported categories including 680 Snow Emergency tows and 6,273 street-sweep tows. This supplies annual context only. It is not a neighborhood-day baseline; annual categories also do not identify the dates on which other-reason tows occurred.

The [Saint Paul impound page](https://www.stpaul.gov/departments/police/administration-office-chief/support-services-administration/police-impound-lot) describes operational impound services and vehicle lookup. A historical bulk archive with comparable scope and fields was not verified. Keep the two jurisdictions separate unless each passes the same coverage audit and comparable outcomes/windows are defined.

### Baseline contract

1. Obtain existing electronic completed-tow records, or existing neighborhood × date × reason/status aggregates, for a common covered period. Reuse the team's [unsent data-request draft](../../datasetsForFP2/docs/NORMAL_TOW_DATA_REQUEST_DRAFT.md) and the [official request route](https://www.minneapolismn.gov/government/government-data/request-public-data/). The Public Works [retention schedule](https://www.minneapolismn.gov/media/-www-content-assets/documents/Public-Works-Retention-Schedule.pdf) identifies tow logs; a retention schedule is not the log itself.
2. Require origin geography, occurrence/completion date, timezone, completed/cancelled status, public/private and jurisdiction scope, original reason codes/dictionary, deduplication support, and documented observation coverage. Intake, release and auction dates are different events. Request generalized geography, not personal identifiers.
3. Obtain the complete declaration/operation calendar, including extended winter restrictions. The complement of nine or ten selected events is **not** a verified ordinary-day calendar.
4. Define ordinary winter as a covered winter period outside declared/extended restrictions, with weekday and season recorded. Distinguish **non-emergency** from **snow-free**. A stricter snow-free control excludes measured/trace snowfall only after weather completeness is checked; snowy non-emergency days are a useful separate category.
5. Match control windows within the same winter and weekday/clock-duration stratum. A transparent first specification is the nearest eligible same-weekday windows within four weeks before/after, excluding restrictions and documenting holidays, sweeping and other disruptions. Report how many controls exist. Do not widen or substitute silently when none exist. Repeat with an alternative window to show sensitivity.
6. Compute observed `O` and expected `B` from the **same all-date archive, same jurisdiction and same completed-tow definition**. The current Snow Emergency layers may contain only snow-enforcement tows; comparing those counts against ordinary-day **all-cause** tows would change the outcome definition. Rebuild both sides from the archive before calculating excess.
7. Report `O − B`, control dispersion and percentage-point share change. A ratio `O / B` is undefined when `B = 0`; do not add an arbitrary constant. A no-record window becomes zero only when source coverage is confirmed. Missing windows remain missing.
8. Group reasons into documented categories, such as parking enforcement and crash/recovery, with an explicit crosswalk. A snow-specific legal reason being absent on ordinary days is not itself an informative effect estimate. Keep all-cause and reason-specific outcomes separate.

No request has been submitted or sent. The existing draft is already suitable for a concrete next acquisition step.

## Results already produced from the current package

The new [`neighborhood_snow_context.csv`](../../output/professor-feedback/neighborhood_snow_context.csv) joins 87 map neighborhoods to source-backed ACS context and computes WGS84 ellipsoidal polygon areas. It retains count/percent margins of error, reliability and indicator-specific periods. `ordinary_day_baseline` and `baseline_adjusted_excess` remain empty, not zero. The file is analysis input; it is not a new outcome dataset.

| Neighborhood | Selected-snow records | Records per 1,000 residents | Records per km² of supplied polygon |
|---|---:|---:|---:|
| Marcy Holmes | 577 | 37.5 | 266.3 |
| South Uptown | 356 | 58.4 | 373.4 |
| Steven's Square - Loring Heights | 270 | 63.0 | 560.8 |
| East Bde Maka Ska | 238 | 97.7 | 209.5 |

These are cumulative descriptions across the selected nine events, not daily or annual rates. The change in rankings shows why raw totals alone are insufficient. Area is the **gross supplied polygon**, not independently measured land-only area or parkable curb area.

There is also a useful warning: Camden Industrial has only **3 records and an estimated 31 residents**, producing about **96.8 records per 1,000 residents**. Do not interpret that high ratio as individual risk or promote a population-normalized leaderboard without showing the denominator. Visitors, commuters, students, fleet vehicles and parking supply differ from resident population. Present counts and denominators together; a verified historical parking-exposure measure would be more relevant to risk.

Uncertainty is material: the City's reliability labels are Low for renter estimates in 6 neighborhoods, no-vehicle household estimates in 35, and poverty estimates in 17. All 87 neighborhood **per-capita income** fields remain null in the starter; tract/block-group income cannot be silently treated as neighborhood income. The CSV's population-sensitivity bounds vary the ACS denominator only and are **not outcome confidence intervals**.

### Historical expansion triage

Of 34 towing layers, 29 contain all three recognized Day categories without extra Day categories. This is only a structural screen, not approval of 29 independent complete events. Only 14 layers have a non-null date range in the saved layer audit; others need declaration-date/source verification before weather or ordinary-day alignment.

- Ferry 2021: 4,238 `Day=0` rows lack dates and geometry.
- Oliver 2021: 5,223 `Day=0` rows lack dates and geometry.
- James 2020, Quincy 2019 and Victory2 2023 omit at least one Day category.

Quarantine those cases for semantic review. Do not relabel `Day=0` as ordinary days, infer a missing phase was zero, or admit all archived layers because their downloads succeeded. Verify event identity, date range, tow-versus-citation definition, import placeholders, coordinates/CRS, duplicates and operational completeness. Then join to one frozen boundary version and preserve unmatched records. The present audit admits **no additional event** automatically.

## Scope and implementation sequence

1. **Completed research stage:** inspect current main and teammate corrections; independently verify source availability; hash-check the package; create the 87-row context join, margins of error, geometry-based area and historical-layer triage. The subsequent local UI extension is documented in [implementation verification](context-build-verification.md).
2. **Next, using data already available:** review a small batch of clean historical towing candidates, confirm dates/definitions and compare inclusion/exclusion sensitivity. Keep the original nine-event sample frozen. A larger set of valid emergencies addresses event coverage, while ordinary-day data remain a separate requirement.
3. **Next acquisition:** review and submit the existing public-data request through the official route. Prepare the common outcome/calendar contract before ingesting responses. Do not send multiple duplicate requests.
4. **After the acquisition gate:** implement matched ordinary-day baseline and excess/share-change outputs. Carry coverage/status through every neighborhood-window row.
5. **Then update the narrative:** one city map, one baseline comparison, one contextual explanation. Use an observed/reference scale for volume, a diverging scale for change, and exact values/uncertainty in the selected-neighborhood detail. Keep the snow aesthetic, but encode a measured variable rather than decoration.

Keep inferential units explicit: records are nested within neighborhoods, event phases and winters. Thousands of tows do not create thousands of independent emergency observations. With the current nine events across three winters, prioritize effect-size descriptions, event-level displays and leave-event/season-out sensitivity. Do not claim conclusive causal effects or precise broad-population uncertainty from this convenience sample.

## Reproduce the local audit

```sh
python3 -m venv .venv-research
.venv-research/bin/pip install -r requirements-research.txt
.venv-research/bin/python scripts/audit_professor_feedback.py
```

Outputs: [`audit.json`](../../output/professor-feedback/audit.json) and [`neighborhood_snow_context.csv`](../../output/professor-feedback/neighborhood_snow_context.csv). The script reads the existing research package, streams hash checks, preserves raw files, checks join/count reconciliation and ring-orientation invariance, and leaves baseline values missing. Research and initial UI verification were completed locally on November 10; the user authorized Commit and Push on November 11.
