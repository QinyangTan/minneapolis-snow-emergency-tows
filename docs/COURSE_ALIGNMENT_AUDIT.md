# CSCI 5609 lecture and rubric alignment audit

**Reviewed:** 2026-10-08 | **Canvas course:** CSCI 5609 (001) Visualization, Fall 2026, Canvas course ID 579493 | **Instructor:** Qianwen Wang.

**Scope and evidence.** The Canvas module structure, Learning Objectives, About Final Project, grading page, FP1–FP4 rubrics, and the lecture PDFs below were examined through the authenticated university Canvas connector. This file records *our original paraphrases and project implementation assessment*; it **does not redistribute** the copyrighted slides. Several PDFs are explicitly branded Spring 2024 or Spring 2026 even though they appear in the Fall 2026 modules. Their listing on Canvas does not prove every later-week topic has already been taught this fall. These entries are a curriculum/forward-readiness map, not an inference about unpublished personal instructor preferences.

## Professor's explicit principles

- **Function first, form next.** Visual analysis serves a defined real-world user, task and dataset, not an arbitrary visual effect. [Perception and Tasks lecture](https://canvas.umn.edu/courses/579493/modules/items/17410880).
- **Eyes beat memory.** Juxtapose the values readers need to compare, rather than ask them to remember a previous panel. The shared-domain day maps and event evidence pair chart follow this; the new constellation shows nine cases on one plane.
- **Expressiveness versus effectiveness.** Visual channels must preserve attribute semantics; quantitative values need appropriately ranked channels (position/length before arbitrary color or shape). [Data and Image Models](https://canvas.umn.edu/courses/579493/modules/items/17410867).
- **Nested model:** domain, abstraction (tasks and data), visual encoding/interaction, algorithm. Document evidence at each layer and evaluate failure at the corresponding layer.
- **Interaction with a purpose:** Select, Connect, Abstract/Elaborate, Filter/Query and Reconfigure. Clearly advertise actions and give selection-state feedback. [Interaction lecture](https://canvas.umn.edu/courses/579493/modules/items/17410887).
- **A hybrid story**, between an author-guided narrative and a reader-led data dashboard; explain the insight without requiring the reader to click everything. [About Final Project](https://canvas.umn.edu/courses/579493/pages/about-final-project).
- **Empirical evaluation is not analytic evaluation.** Axe, unit tests and browser regressions *cannot* demonstrate comprehension by humans. [Evaluation lecture](https://canvas.umn.edu/courses/579493/modules/items/17410901).

## Lecture-by-lecture coverage (a course inventory, not a score)

**Evidence grades:** VERIFIED = implemented and code/tests identifiable; PARTIAL = some mechanisms exist but lecture goal has not been fully demonstrated or evaluated; NOT YET = no verified implementation/evidence; NOT APPLICABLE = concept taught but data/tasks do not justify it. *Not all lecture formats are requirements for one final project.*

| Canvas module / lecture | Instructor's documented idea (paraphrase) | Current project's evidence | Coverage |
|---|---|---|---|
| 1 — Intro / data drawing | Distinct visual designs reveal different attributes and questions | City data project problem, mixed charts, frozen research findings in `docs/FINDINGS.md` | VERIFIED |
| 2 — Data and Image Models | Tabular/spatial/network types; nominal/ordinal/quantitative, marks and channels, truthful encodings | City tow tables + polygons, maps, heatmap, event fingerprints. **Missing formal published attribute-type inventory inside the narrative.** | PARTIAL |
| 3 — Color and Perception | Sequential vs categorical palette, magnitude perception, redundant encodings, color-vision deficiencies | Three day hues; sequential choropleths, legends, labels, focus-visible, serious/critical axe checks. **No documented CVD simulator/manual contrast/screenreader outcomes.** | PARTIAL |
| 4 — Perception and Tasks | Four-layer nested design, task-action-target formulation, compare adjacent values, text clarity | Shared map domains, paired-share comparison; new multi-attribute event constellation. Need final task-to-chart traceability and meaningful alternative sketches. | PARTIAL |
| 5 — Interaction Zoo | Select, connect, elaborate, filter, reconfigure with obvious feedback | Event/card/map/matrix links, filtering, reversible selection, metric switching, 3D camera. Need real user discovery of controls and onboarding evaluation. | VERIFIED implementation / PARTIAL user evidence |
| 6 — EDA / multi-attribute | Assess data quality; bivariate → multivariate; iteratively inspect findings and redesign | `docs/DATA_CONTRACT.md`, 9 × 87 event data, JSD, day signatures; **new constellation combines day 2 share + concentration + total + peak day.** No full three-finding multivariate presentation yet. | PARTIAL |
| 6 — Visualization Evaluation | Formative/summative, think-aloud, task success and comprehension, avoid developer bias | Automated Playwright/axe, `docs/USER_EVALUATION_PROTOCOL.md`; **zero verified human participants** | NOT YET empirical |
| 9 — Why/Why not 3D | Depth can occlude, distort magnitude; justify 3D with task; provide controls/2D alternatives | Independent Three.js 10-event winter demo; orbit/day plates, orthographic geometry, count/shares, 2D fallback and 5 Chromium tests | PARTIAL: 3D delivered; comparative user benefit not established |
| 9 — Narrative Viz | Data facts, visual appeal, sequence/interaction; author- and reader-driven balance; hybrid formats | 2D scrollytelling + exploration, narrative annotations and GIF examples | PARTIAL: editorial scene pacing / task comprehension unvalidated |
| 10 — Animation & Transitions | Direct attention, connect states, not misleading; data change vs mark/encoding change; reduced motion | D3 day selection, winter 3D day unfolding, marker-size-mode transition in new constellation. Need explicit staged scrollytelling and human comparison against static small multiples. | PARTIAL |
| 12 — Multidimensional / Maps | Scatterplot matrices, glyphs, dimensionality reduction; projection and map marks | Spatial map and small multiples; new multivariate scatter. **No claim a radar/star glyph is required; avoid misleading fancy marks.** | PARTIAL design space, relevant tasks covered |
| 12 — Networks/Trees | Node-link versus adjacency matrix; topology, hierarchy, network layouts | Event pair JSD **matrix**, but events are NOT a true observed network. An optional threshold-derived similarity graph requires explicit methodological justification and sensitivity analysis. | NOT APPLICABLE as raw-data network |
| 13 — Multi-view & Dashboard | Side-by-side, composite and dashboard arrangements, cross-view coordination | Three same-domain maps; linked event matrix/filters, selected community details, event paired shares, 3D comparison | VERIFIED implementation |
| 14 — Scalable Viz | Aggregation, data cubes, indexing, prefetch/query design, clarity under many points | Data already pre-aggregated into `static/data/summary.json` and area-by-event lookups; no performance baseline, caching stress test, million-row need or claim. | PARTIAL for scalability evaluation |
| FP3 / FP4 advice | Readability, annotated concrete insights, visible interaction cues, and small-scale evaluation | Some headings/annotations, nine genuine GIFs, Public 2D+3D demos, axe; **no empirical human study** | PARTIAL |

**Key distinction:** The topic of network visualization is *in the curriculum* but there is no authentic observed city tow graph here. Creating edges just to tick a lecture checkbox would work against Function First, Form Next. The nine-event JSD matrix is a justifiable *similarity analysis*, not evidence of a social/spatial network.

## New course-grounded design: Event Constellation

**Question:** Are emergencies with a larger share of Day 2 towing also highly concentrated into a few neighborhoods, or are these independent signatures in the observed sample?

- **Unit of analysis:** exactly nine selected complete emergency event IDs (never the 10-event independent 3D collection).
- **X:** Day 2 records / all City tow records for the event (quantitative ratio), positioned on a labeled numerical axis.
- **Y:** five largest neighborhood counts / *mapped* event tow records (quantitative ratio), positioned on a labeled numerical axis. Two denominators are identified, not pooled.
- **Area:** total City tow count, encoded by square-root scaling on bubble diameter, with an equal-size alternate mark representation to isolate the proportional variables.
- **Hue:** Day 1/2/3 event peak category (or tie), redundantly explained in legend, list and hover/ARIA text.
- **Tooltip/selection:** a persistent nine-event numerical roster and accessible buttons; event selection controls the entire existing analysis.
- **Task:** compare distributions, retrieve an event, determine extrema and spot potential departures/outliers; **no claim of correlation, representativeness or weather causality on n=9**.
- **Why not only a bar chart:** two normalized attributes would require reading or remembering different bars; one aligned plane exposes both at once. **Why not network nodes:** no genuine relationships are observed and a force layout creates unearned topology.
- **Animation semantics:** toggling equal-size versus magnitude-scaled marks deliberately changes an *encoding*, not the data. Reduced-motion removes transition; graph positions and values remain fixed.

Unit tests validate original event/day/mapping conservation and marker size semantics. Browser tests validate all nine marks, linked filtering, encoding toggle and 390px horizontal scrolling. This is an implementation change, not a claimed empirical evaluation.

## Milestone rubric and real completion status

| Milestone | What Canvas actually grades | Evidence / remaining gap |
|---|---|---|
| **FP1 (10 pts, due Mon Oct 12 2026, 11:59 AM CDT)** | Dataset source/format/overview (1); focused analysis questions (3); actual data analysis findings (5); questions and next steps (1); 7–10 min group presentation as PDF slides | City data and findings exist. **Canvas currently says UNSUBMITTED**; 13-page proposal is not sufficient evidence of an actual 7–10 minute PDF slide deck. Group must review and submit. |
| **FP2 (12 pts, Mon Nov 16)** | Title and members (1); three multivariate findings and *alternative design sketches with rationale* (6); narrative flow/layout/animations/interactions (4); feedback (1) | Working demos exist. Need three explicit multivariate findings, defensible designed alternatives and genuine group feedback, not fabricated sketches. |
| **FP3 (10 pts, Wed Dec 2)** | Implemented interactive data analysis (3); scrollytelling flow (3); section titles/key messages/annotations (2); public GitHub Pages URL (2) | Public 2D Pages URL exists; app implementation and scrollytelling mostly complete. Formal scoring still depends on course review and actual submission PDF. |
| **FP4 (20 pts, Dec 20 due Dec 21 UTC)** | Report PDF >1,500 words and illustrations; analysis, communication, reflection; demo/design/presentation/interactions; acknowledgment; optional 3D/data-encoding bonus | Public 3D and 2D demos and tests exist. **Cannot claim bonus points or project completeness** before instructor review, actual final report, group participation, peer review and accessibility/usability evidence. |

Canvas links: [FP1](https://canvas.umn.edu/courses/579493/assignments/5590015), [FP2](https://canvas.umn.edu/courses/579493/assignments/5590016), [FP3](https://canvas.umn.edu/courses/579493/assignments/5590018), [FP4](https://canvas.umn.edu/courses/579493/assignments/5590019).

## Highest-leverage next actions (in priority order)

1. **FP1 before Oct 12:** verify Canvas group membership, create and genuinely review a 7–10-minute PDF slide presentation from the actual data and current City graphics. Submit to Canvas after user/group review (no submission claimed).
2. **Findings evidence:** elevate at least three multivariate findings with exact event/neighborhood scope, numeric denominators, figure encoding explanation, a limitation, and the way a reader would reproduce it.
3. **Design alternatives:** produce several *genuine* candidate sketches, annotate which analytic task each succeeds/fails, compare them with the selected chart; do not invent experiments or teammate sketches.
4. **Narrative sequence:** explicitly guide readers from a citywide claim into concrete neighborhood/event counterexample; include a progressive visual change only where it preserves a clear object-constancy mapping, along with a reduced-motion alternative.
5. **Empirical evaluation:** do the real 3–5 adult participant think-aloud/screenreader study from `docs/USER_EVALUATION_PROTOCOL.md`; log tasks/errors/comprehension results honestly, refine accordingly.
6. **Quality/performance:** test one slow desktop/mobile device; measure WebGL startup/render CPU and worst-case interaction times; make fallback prominent if needed.
7. **Integrity and policy:** keep source Private and publish only reviewed compiled releases. Canvas course policy requires Codex **course-key session logging** and truthful use disclosure; this ChatGPT/GitHub assistance must be described honestly in `docs/AI_DISCLOSURE.md`, not misrepresented as logged Codex sessions. No instructor slides/code will be copied into public artifacts.

## Content-provenance and temporal caveat

Some **Fall Canvas** module items contain PDFs labeled Spring 2024/Spring 2026; module placement is not confirmation the Fall lecture has already occurred. The audit reports accessible curriculum concepts and the instructor's stated rubric, not a prediction of grading tastes. This document is our own analytical derivative; University-owned slides, sample code and class files are **not redistributed**.
