# FP2 implementation and evidence

## Completed

The original dashboard remains available at `/`. The new `/fp2/` route adds a coordinated neighborhood map, scatterplot, selected-neighborhood details, nine-event history and emergency-day controls. Measures include counts and records per 1,000 residents. Indicators include poverty share, households below $35k, renters, no-vehicle households, qualifying residential sale medians and median sampled-site AADT. Range controls highlight the same subset across views; missing values stay unavailable. A separate source-geography view shows actual per-capita income across 121 census tracts and 1,228 matched traffic sites.

## Data transformations

- `scripts/prepare-fp2.py`: exact normalized-name ACS join, source-period retention, ratios from mutually exclusive categories, 2024 eligible sale filtering and ECRV+PIN deduplication. Sale eligibility: one-unit residential/condo/townhouse; one parcel; not land; not excluded from ratio study; positive adjusted price; minimum 10 sales.
- `scripts/prepare-fp2-geography.mjs`: B19301 GEOID join to city tracts; 2024 Minneapolis AADT join by LOCATION_ID to current site geometry; unique point-in-neighborhood assignment. 103 records lack current geometry, three have ambiguous/outside matches. Minimum three matched sites for neighborhood medians. Medians are not road-length-weighted volumes.
- `scripts/analyze-fp2.mjs`: tied-rank Spearman correlations and rankings from the exact plotted inputs. No significance test, causal model or propagated ACS-error interval is claimed.

## FP2 rubric mapping

| Requirement | Evidence |
|---|---|
| One key question | Presentation cover and research-question slide; demo introduction |
| Multidimensional visualization | Neighborhood, event, day, count/denominator, socioeconomic and transport indicators |
| Multiple linked views | Map + scatter + event/day details; shared selections and filters |
| Labels, interpretation, instructions | Unit/period labels, selection instructions, legends, methods and missing-data notes |
| Story logic | Three guided stages: concentration, population, association; slide 14 demonstration sequence |
| Transition plan | Preserve selection/scales across narrative steps; animation refinement deferred per FP2 rubric |
| Feedback | Slide 15 and methods section questions |
| English presentation | 15 slides with speaker notes, sourced calculations and actual demo screenshots |

## Validation boundaries

Automated data/type/build/browser/accessibility checks exercise the implementation. They are not a real participant study or a manual screen-reader evaluation. PPTX package, chart workbooks, layout and first-party re-import are checked; slide renders are visually inspected. Native Microsoft PowerPoint execution is not claimed.
