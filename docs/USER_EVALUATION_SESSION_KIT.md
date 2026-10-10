# CSCI 5609 — moderated usability & comprehension study kit (team-ready)

**Status: READY TO RUN — NO HUMAN SESSIONS RECORDED.** Designed from the professor's [Visualization Evaluation lecture](https://canvas.umn.edu/courses/579493/modules/items/17410901), [Interactions lecture](https://canvas.umn.edu/courses/579493/modules/items/17410887), and [FP4 design checklist](https://canvas.umn.edu/courses/579493/modules/items/17410970). This is original material; instructor slides are not reproduced.

**App:** [live 2D demo](https://qinyangtan.github.io/minneapolis-snow-emergency-tows-demo/) (confirm that the **new range brush is deployed** before studying it; the source PR preview alone is not a public deployment). If testing an unpublished PR, use a local preview of that exact commit and record the commit SHA privately.

## The experiment

**Purpose:** Can new readers find meaningful patterns, operate coordinated selections, and avoid treating descriptive tow counts as a prediction of personal towing risk?

**People & timing:** 3–5 **actual** adult volunteers who did not develop the app, 12–18 minutes each, conducted by a human team member. Include at least one mobile viewport if available. Record whether the participant knows Minneapolis or data visualization; do not infer demographics or collect their personal information.

**Consent opening (read aloud):** "We're evaluating our visualization, not your skill. This is a student-made story based on historical records, not live parking advice. You can skip anything or stop at any time. We'd like to note your actions and whether the instructions are clear, without your name or identifying details. We won't record audio or your screen unless you separately agree. Is it okay to proceed?"

If not, **stop**. Do not collect observational data, recordings or quotes without permission. Never upload identifiable raw session notes into this GitHub repository, a public site or an AI chat.

**Facilitator method:** Start on the landing page with filters reset. Say only the participant prompt; do **not** show the answer key. Let them think aloud without coaching. Time each task in seconds; record whether they completed independently, needed a standardized hint, were unsuccessful or skipped. Distinguish interaction completion from **interpretation accuracy**. A correct click with a wrong claim is not a correct interpretation. Log the first misstep and a reproducible UI problem privately. One brief navigation hint is permitted only *after* allowing an unaided attempt; mark the task "hinted."

### Tasks (read prompts verbatim, without the target answers)

| ID | Participant prompt | Interaction/comprehension skill |
|---|---|---|
| T1 | "Compare Bridge and Howard using the nine Snow Emergency cards. For each event, which day has the largest share? Tell me whether that is a count or a percentage." | Decode marks, shares, legibility of labels |
| T2 | "Find the Snow Emergency with the greatest **proportion** of records on Day 2. Tell me the event name and the proportion you see." | Multivariate retrieval, reading quantitative values |
| T3 | "In the Event Constellation, use the Day 2 range controls to show only the emergencies whose Day 2 share is between 40% and 55%. How many are highlighted? Name the events. Now choose one and see whether another view responds." | Discoverability of range brush, feedback, link behavior |
| T4 | "In the spatial explorer, choose Bridge and Day 2, and inspect Marcy Holmes. What does the number mean? Is it a risk estimate?" | Coordinated map navigation, quantitative denominator |
| T5 | "The recurrence matrix distinguishes ANY RECORD from PROMINENT. Explain these, and tell me whether changing Top 5 to Top 15 changes the number of emergencies being studied." | Conceptual interpretation, filter semantics |
| T6 | "Could you use this website to determine your own chance of being towed next Tuesday? Why or why not? Does the constellation's vertical axis use the same denominator as its horizontal axis?" | Limits/uncertainty, denominator awareness |

**Run order:** T1–T2 (encoding) → T3 (brushing) → T4–T5 (cross-view navigation) → T6 (critical interpretation). T3 requires PR #15 or later to be deployed. If not deployed, **do not record T3 as a failure**: mark "skipped" and describe the missing feature in private notes.

**Closing prompts (optional, in private notes):** "What were you most surprised by?" "What did you think the colors meant?" "What would you improve?" Ask for a 1–5 ease-of-use rating only as an *informal* descriptive answer, not a validated UX scale.

## Measurement and scoring

Open [evaluation-template.tsv](evaluation/evaluation-template.tsv) in Excel, Numbers, or a text editor. The blank template has **no participant rows**. Keep a working copy **outside version control**. For each consented P01–P05 and T1–T6:

- `participant_id`: P01, P02, … only. Do not write a real name, school ID or contact information.
- `device`: `desktop` or `mobile`.
- `task_id`: T1…T6, once per participant.
- `completion`: `independent`, `hinted`, `unsuccessful`, or `skipped`.
- `interpretation`: `correct`, `partial`, `incorrect`, or `not_assessed`. Always use `not_assessed` when skipped.
- `seconds`: integer elapsed seconds for an attempted task; empty for skipped.
- `friction`: one primary category: `none`, `discovery`, `navigation`, `terminology`, `encoding`, `denominator`, `accessibility`, `performance`, `other`.

Use a separate, private free-form record for exact observations/quotes and obtain explicit consent for quotes. Our coded TSV deliberately has no free-text personal information field.

### Report generation (does not invent data)

```bash
npm run qa:evaluation
npm run evaluation:report -- /path/to/private-study.tsv
```

The report command validates the rows and prints **observed** counts, medians and categories only. With an empty template it prints "NOT CONDUCTED" rather than producing fake outcomes. It never sends data to a server or edits the repo. Report n/N counts rather than overselling percentages from three or five people.

### Facilitator-only answer key

- **T1:** Bridge Day 2 = 418/852 = 49.1%; Howard Day 2 = 329/665 = 49.5%; both have highest **counts** on Day 2. The bars convey within-event composition, not per-car risk.
- **T2:** Glenwood Day 2 = 448/719 = **62.3%**. The entire sample contains nine selected complete emergencies.
- **T3:** Inclusive 40–55% range highlights **Bridge, Howard, Lourdes** (3 of 9); choose a highlighted event to update global event selection. Clearing the range leaves the manually selected event in place.
- **T4:** Marcy Holmes, Bridge, Day 2 = **62 observed tow records**. This is a mapped **count**, not a probability; the relevant selection is event + day + neighborhood.
- **T5:** ANY RECORD = an event with at least one observed record in the neighborhood. PROMINENT = one of the top K mapped neighborhoods for that particular event by count (at least five records, tied ranks included). Top 5/10/15 changes **the ranking threshold**, not the nine-event sample size.
- **T6:** **No** personal tow probability/forecast: no car-parking-exposure denominator, full population of parked vehicles, street-level context or weather-adjusted causal model. Scatter x is Day 2 / **citywide** records for that event; y is top-five neighborhood counts / **mapped** records. The denominators differ intentionally.

Answers reflect the checked-in official ArcGIS-derived dataset (5,423 selected tow records, 5,355 neighborhood-mapped, 68 not assigned). **Regenerate and reconfirm** if source files change.

## After sessions

Summarize observed task successes and comprehension separately; quote participants only with permission. File focused GitHub issues for reproducible failures, prioritize by impact, then retest changes. Clearly distinguish (a) analytical QA (CI), (b) human task outcomes (real sessions), and (c) the team's interpretation. Avoid causal or generalizable claims about UX with a tiny voluntary sample.

**Do not submit the evaluation as completed, merge the PR, or claim improved user comprehension until real participants have run these tasks and the team has reviewed the evidence.**
