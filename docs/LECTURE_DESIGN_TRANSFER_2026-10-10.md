# From CSCI 5609 lecture examples to project design decisions

**Review date:** 2026-10-10 · **Source:** authenticated Fall 2026 [CSCI 5609 Canvas modules](https://canvas.umn.edu/courses/579493/modules). Some instructor-uploaded PDFs carry earlier Spring 2024/2026 labels; appearing in current modules does not prove those topics have already been taught this fall.

This is an original implementation-oriented synthesis, **not** a redistribution of instructor-owned slides, screenshots, or class code.

## Design decisions based on actual lecture materials

| Instructor lecture / example | Principle observed | Concrete project behavior | Acceptance or remaining risk |
|---|---|---|---|
| [Data & Image Models](https://canvas.umn.edu/courses/579493/modules/items/17410867) | Describe attributes as nominal/ordinal/quantitative and select expressive/effective channels rather than choosing an arbitrary chart style | Event plot uses quantitative position for Day 2 share and mapped-neighborhood concentration, mark *area* for record count, categorical hue for peak day | Keep axis denominators visible; never confuse raw count with risk or probability |
| [Color & Perception](https://canvas.umn.edu/courses/579493/modules/items/17410872) | Avoid misleading rainbow ordering; perceptually readable channels; give accessible redundant labels | Separated three-day palette; numerical values and accessible labels supplement colors | Still requires documented manual color-vision and screen-reader checks |
| [Perception and Tasks](https://canvas.umn.edu/courses/579493/modules/items/17410880) | Tasks first; "eyes beat memory"; nested domain/task/visual/algorithm decisions | Comparable day maps sit together; event points share axes; selected values are available in an adjacent roster | Future human comprehension test must establish whether linked views actually help |
| [Interaction Zoo](https://canvas.umn.edu/courses/579493/modules/items/17410887) | Select, connect/link, filter, reconfigure; Norman's execution/evaluation feedback | **New:** inclusive quantitative Day 2 interval brush synchronizes the event-scatter highlights and the numeric event roster, with live count feedback, clear action, keyboard-compatible range inputs and reversible single-event dashboard filtering | Brush highlights a subset **locally**; it does not silently treat a subset as one historical emergency or aggregate incompatible event data |
| [Exploratory Analysis](https://canvas.umn.edu/courses/579493/modules/items/17410899) | Investigate data quality and several attribute combinations before committing to a story | Nine events, 5,423 citywide records, 5,355 mapped; mapped denominator stays separate | Sample contains only selected historic events, not a representative causal study |
| [Visualization Evaluation](https://canvas.umn.edu/courses/579493/modules/items/17410901) | Automated checks are not substitutes for real-user qualitative and quantitative studies | E2E checks cover legend and brushing; `docs/USER_EVALUATION_PROTOCOL.md` contains a proposed protocol | **No participants tested yet**. Ask actual volunteers to identify the event with highest Day 2 share, brush 40–55%, and explain what 3 highlighted marks mean; record errors, time, and confusion |
| [Narrative Visualization](https://canvas.umn.edu/courses/579493/modules/items/17410922) | Evidence-backed story pieces, explicit annotations, author-led guidance mixed with exploration; film-dialogue example used as a narrative case | Guided snow-rule sequence before reader-driven map/recurrence/event exploration | Story pacing and comprehension still need evaluation |
| [Animation](https://canvas.umn.edu/courses/579493/modules/items/17410924) | Transitions should explain state changes rather than decorate; small multiples may outperform animated comparisons | Retain simultaneous comparable three-day maps; use brief transitions for event highlight and reconfiguration; respect reduced motion | Do not add gratuitous movement or imply an unseen continuous daily trajectory |
| [HD & Map](https://canvas.umn.edu/courses/579493/modules/items/17410947) | Maps can support region-color, glyphs and links, but overlays need meaningful data attributes and projection awareness | Neighborhood choropleth and event-linked count glyphs; no invented OD network or unjustified 3D | Region totals are **not** population- or parking-exposure normalized |
| [Multi-View & Dashboard](https://canvas.umn.edu/courses/579493/modules/items/17410963) | Examples include coordinated side-by-side views, juxtapositions, nested composite visuals and dashboards; compare alternatives task by task | Event scatter + synchronized numeric roster, same-domain Day 1–3 maps, linked neighborhood matrices | Check whether readers notice brushing range state without coaching |
| [FP3 Digest & FP4 Tips](https://canvas.umn.edu/courses/579493/modules/items/17410970) | Readability, honest annotations, explicit invitations to interaction and a small-scale evaluation are critical | Visible interval labels and count feedback accompany the quantitative brush; preserved evidence caveats | Run a real-user small-scale evaluation before claiming effectiveness |

## Classroom example → project transfer, without copy-pasting examples

- **Select & Link:** the professor's interactions lecture demonstrates selection synchronized across views. Our interval brush highlights matching event points and roster rows using *the same query*. Clicking one event separately updates the map, signatures and day chart.
- **Small multiples versus animation:** the animations lecture compares analysis effectiveness; preserve side-by-side day maps so readers do not have to memorize earlier frames.
- **Composite views:** the multi-view lecture discusses Domino, UpSet and linked dashboards as examples of distinct tasks. Our scatter + roster is a justified local coordination, not a force-directed pseudo-network.
- **Maps with additional data channels:** the HD/Map lecture presents spatial marks and glyphs; the current city shapes are purposeful. We should not add effects that turn low-volume neighborhood records into implied risk rankings.

## Suggested experiment for the actual team (not yet conducted)

Give 3–5 external readers identical tasks without pointing at controls:
1. Find the event with the highest Day 2 share, and report its numeric denominator.
2. Select a Day 2 share range of 40–55%, count the matching events, and identify one.
3. Explain whether the scatter's y-axis shows tow risk, raw volume, or a proportion of **mapped** records.

Record time, correctness, whether they discover the range controls, exact misunderstandings, and one open-ended explanation. Collect **real responses** rather than generating evaluation data. Compare with a screenshot lacking brushing if possible. Do not claim improved understanding unless observations support it.

## FP1 immediate gate

[Canvas FP1](https://canvas.umn.edu/courses/579493/assignments/5590015) is due **October 12, 2026 at 11:59 AM CDT**. The slide PDF must cover three questions with three planned analyses each, three data-grounded multivariate findings, human-validated visualization alternatives and design tradeoffs, plus feedback questions. This design enhancement does not replace submitting or rehearsing the PDF, and no Canvas submission is claimed.

**Provenance:** only interpretation notes and our code/tests enter GitHub; the instructor's copyrighted PPT/PDF contents stay in Canvas.
