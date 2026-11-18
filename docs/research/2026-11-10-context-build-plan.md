# Neighborhood context implementation plan

**Goal:** Add audited neighborhood denominators and ACS context to the existing linked dashboard, without inventing an ordinary-day baseline.

**Approved scope:** The user approved building after the completed research. Extend the existing dashboard in place. All product text and code remain English. The initial build stayed local on `research/professor-feedback`. On November 11, the user authorized checking, committing and pushing these changes. Deployment and merging to main remain separate actions.

**Design:** Preserve the existing winter dashboard. A shared Count / per-1,000 residents / per-km² selector controls the dashboard map and a linked neighborhood scatterplot. Existing event/day/neighborhood state stays authoritative. A native context selector chooses renters, no-vehicle households or poverty. Show selected-neighborhood source period, official MOE, reliability, raw count and denominator. Retain unknown values rather than turning them into zero. Additional charts remain behind the existing deep-dive control.

**Research specification:** [Professor feedback response](professor-feedback-response.md).

## 1. Publish audited inputs

- Extend `scripts/audit_professor_feedback.py` to emit `static/data/neighborhood-context.json` and a public aggregate CSV after its existing hash/reconciliation checks pass.
- The payload contains `schemaVersion`, frozen-source provenance and 87 neighborhoods with gross WGS84 area, population estimate/MOE/period and selected ACS percent estimates/MOE/period/reliability. No raw vehicle or property records enter the site.
- Confirm 86 population matches, one missing neighborhood and all existing 5,423 / 5,355 / 68 reconciliations.

## 2. Implement and test numerical selectors

- Create `src/lib/neighborhoodContext.mjs` and matching `.d.mts` declarations.
- `contextRows(geography, context, event, day, measure, attribute)` returns selected-scope counts and nullable contextual x/y values.
- `contextValue(count, row, measure)` returns a count, count per 1,000 residents or count per gross polygon km². Missing/zero denominators return null.
- `contextDomain(geography, context, measure)` uses the full selected-nine-event totals, preserving the map's scale as event/day selections change.
- Add `tests/test_neighborhood_context.mjs`: verify 577 / 15,393 × 1,000; unknown population; zero counts versus undefined ratios; event/day recalculation; indicator-specific periods; fixed domain; malformed/missing context entries.
- Run `node --test tests/test_neighborhood_context.mjs` and existing research tests.

## 3. Connect the existing dashboard

- Extend `NeighborhoodMap.svelte` with optional contextual values and units; default Count behavior remains available to existing callers. Unknown ratios have a separate hatch/legend and accessible label.
- Add `NeighborhoodContext.svelte`: labeled SVG scatterplot, native axis selector, keyboard-selectable points, selected-estimate uncertainty, neighborhood details and a semantic table fallback. Dispatch the existing neighborhood selection event.
- Update `src/routes/+page.svelte`: load context independently so its failure cannot hide the count map; connect the shared metric selector, map and scatterplot to existing event/day/neighborhood state; reset the metric with existing filters.
- Keep hover/focus/selection, loading, retry and unknown states explicit. Use the existing blue palette. Do not introduce new category colors or animate individual points.
- Add a concise Methods note distinguishing future timing/baseline, spatial redistribution and context questions. Label the ordinary-day comparison as unavailable.

## 4. Verify and document

- Run `npm run check`, numerical research tests and `npm run build`.
- Use the supported browser UI to verify Count → per-resident → per-area, event/day changes, shared neighborhood selection, missing-population hatch, source/MOE display, reset and keyboard interaction.
- Capture desktop and 390px mobile screenshots in one bounded inspection round; fix observed defects together, then confirm once if needed.
- Run the Impeccable detector once and record genuine limitations.
- Update the local research report with actual implemented behavior and verification. Leave changes uncommitted for review.

## Completion

All four implementation tasks are complete. Actual checks, browser scenarios, screenshots and scope limits are recorded in [context-build-verification.md](context-build-verification.md). The November 11 follow-up covers the authorized Commit and Push.
