# CSCI 5609 assessment-to-deliverable traceability

**Verification status (2026-10-07): NOT THE OFFICIAL RUBRIC.** The Fall 2026 Canvas rubric, assignment text, and specific larger-team workload policy are **not accessible** because the UMN Canvas connector is blocked by a disconnected local tunnel. Do not quote a numeric scoring weight or assert professor policy based on this checklist. Replace this matrix with the actual Canvas requirements once access is restored.

## Evidence actually available

1. `CSCI5609_FP1_Snow_Emergency_Proposal.pdf` (13 pp., Oct 2026): course-aligned project proposal, dataset inventory, three research questions, six-scene storyboard, geocoding caveat, FP1 planned presentation and static-website architecture. **This is a team proposal, not an instructor-issued rubric.**
2. UMN public CSCI 5609 catalog description: data-visualization fundamentals, programming applications, effective representation and information visualization. This also does **not** specify grading weights.
3. GitHub `main` CI evidence: 9 Python tests, 5 Chromium browser tests, Svelte build and axe scan on the frozen 5,423-record City dataset. Passing those confirms a narrow automated test set; it does not prove design research, grading outcomes or screenreader correctness.

## Evidence-based evaluation matrix

| Concern | Proposal commitment / quality bar (NOT instructor points) | Artifact | Current acceptance requirement |
|---|---|---|---|
| Research question 1: day shifts | Scene 2/3, common-scale three-day maps, event/day counts | DaySmallMultiples, chart, ArcGIS summary | Day counts and domain reconcile, maps share scale |
| Research question 2: recurring hotspots | Neighborhood × event/day analysis; avoid conflating appearance with high counts | NeighborhoodMatrix with separate ANY RECORD and PROMINENT rankings | threshold disclosed, tie behavior and sensitivity tested |
| Research question 3: event comparison | Beyond size, compare day profile and geographic composition | EventComparison JSD | 36 event pairs, both distributions, scope and denominator stated |
| Appropriate visual encodings | Small multiples instead of animation alone; normalized bars for shares | DESIGN.md, signature chart, map legend | common color scale, explicit number vs percentage |
| Data traceability | 9 source layers, Glenwood geometry join, reject incomplete Victory 2 | build_data.py, DATA_CONTRACT.md, quality.json | every event/day reconciles, 68 outside-boundary records reported |
| Reproducibility | Scripted processing; client-only SvelteKit build | requirements.txt, CI, checked-in aggregates | no opaque required server or secret |
| Public usability / accessibility | Reader-driven explorer with focus and linked views | Playwright, axe, keyboard controls | mobile viewport, linked selection and keyboard tests pass |
| Product delivery | Proposal calls for a shareable static public URL | README and static build; deployment outstanding | private source stays private; public deployment requires decision |
| Team integrity | Each member should be able to explain the work; report agent contributions | TEAM_CONTRIBUTIONS.md, AI_DISCLOSURE.md | contributions verified by humans before submission |
| FP2/FP3/Final instructor specifics | **Unknown until Canvas recovered** | Actual rubric from Canvas needed | verify deliverable type, group-size scaling, presentation length, deadlines, and weights |

## Prioritized readiness gates

- **Gate 1 · Analytical soundness:** all three research questions addressed with explicit methods and defensible conclusions. Compare citywide vs mapped denominators. Run hotspot-threshold sensitivity and distinguish evidence from inference.
- **Gate 2 · Usable product:** mobile, desktop, keyboard, reduced motion, initial load, fallback/no-data, no JS console exceptions. Browser and assisted human review.
- **Gate 3 · Reproducibility:** clean checkout `npm install && npm run build`, `npm run qa:research`, `npm run qa:browser`, `python -m unittest discover -s tests`.
- **Gate 4 · Group accountability:** every real member reviews a research claim, owns a deliverable, and can defend the code/visual encoding. Preserve real Git authorship; no invented team member biographies.
- **Gate 5 · Rubric compliance:** match instructor's actual Canvas rubric, submission format, exact milestones and dates. This gate remains blocked until Canvas is available.

## Responsible-communication requirements

- Tows observed in the published City layers are not exposure-adjusted towing rates, probabilities, or causal evidence.
- 5,423 is the full nine-event record count. Only 5,355 match current city neighborhood boundaries. Every neighborhood-based statistic uses its actual mapped denominator.
- Jensen–Shannon divergence compares distributions (0 identical; 1 disjoint), not weather similarity. Event sizes are not controlled with statistical uncertainty estimates.
- Prominence is an explicitly chosen descriptive threshold (top K by count per event, minimum 5), not a policy-designated hotspot; include ties and show sensitivity to K.
- Do not label the project as externally evaluated, professor-approved, fully accessible to assistive technology, or deployed until actually verified.
