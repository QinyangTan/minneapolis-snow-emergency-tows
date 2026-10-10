# CSCI 5609 — Human usability and comprehension evaluation protocol

**Status: not conducted.** This is a repeatable evaluation plan for the team, not a claim that anyone has participated. The Fall 2026 course emphasizes a small study, clear visual encodings and legible takeaway annotations. Automated tests, screenshots, and AI-generated opinions cannot substitute for genuine participants.


**Ready-to-run materials:** see [the six-task moderated study kit](USER_EVALUATION_SESSION_KIT.md), [blank coded observation worksheet](evaluation/evaluation-template.tsv), and the offline command `npm run evaluation:report -- /path/to/private-study.tsv`. The original protocol below remains a broader research plan. **Zero actual participant results have been reported.**

## Recruitment / ethics

Recruit 3–5 adult volunteers who have not built the project, ideally with different Minneapolis and data-visualization familiarity. Explain this is a classroom prototype, not City parking guidance. Participants may decline, skip questions or stop. Obtain permission before saving quotes or recordings; avoid collecting exact addresses, phone numbers or identifying records. Keep field notes private and anonymized; only share aggregated findings. Do not record ordinary visitor analytics without disclosure.

## Think-aloud tasks (12–15 minutes total)

| Task | Prompt to read verbatim | Evidence and expected comprehension | Watch for |
|---|---|---|---|
| T1 · Decode | “Using the nine-event cards, tell me which day had the largest share of the **Bridge** records. Then compare it with Howard.” | Participant identifies the leading day from proportions; distinguishes percentage from absolute event size | Misreads color, confusing segments, missed legends |
| T2 · Navigate | “Find Marcy Holmes on the map for Bridge, Day 2, and tell me what the displayed number means.” | Selects event, day and neighborhood; recognizes it is an observed count, not a probability | Lost selection state, unclear click targets |
| T3 · Define recurrence | “Explain the difference between ANY RECORD and PROMINENT. Does Top 15 mean we examined more Snow Emergencies than Top 5?” | Understands threshold definition and that 5/10/15 are ranks, not time or sample size | Mistakes sensitivity slopes for change over time |
| T4 · Compare distributions | “Using the two-event comparison, why can two emergencies look similar by Day 1–3 share but less similar by neighborhood?” | Explains two separate dimensions; points to JSD plus paired share evidence; notes differing mapped vs citywide denominator | Reads JSD as percentage probability, misses units |
| T5 · Limitations | “Could this site tell you your own chance of being towed next Tuesday? Why or why not?” | Says no; no parking exposure denominator, historical aggregates, uncertain geocoding | Predictive/causal misconception |

Do not coach during the task except to clarify unclear *instructions*. Note first action, errors/backtracks, task completion, spontaneous comments and whether a takeaway was independently explained. On mobile, additionally record horizontal overflow, tap targets and label readability.

## Measurement sheet — to fill with real evidence

For each anonymous P1…P5 and task T1…T5, record:
- **Completion:** independent / with hint / unsuccessful / skipped
- **Time:** seconds, measured by observer
- **Interpretation:** correct / partially correct / incorrect; write their explanation
- **Observed friction:** navigation, encodings, legends, contrast, responsiveness, or methodological confusion
- **Participant quote (optional):** only with explicit permission
- **Severity:** blocker / high / medium / low, with exact reproduction steps

Afterward: “Which view helped you understand the story best?” “What claim felt least justified?” “If you could change one thing, what would it be?” Rate ease-of-use 1–5 only if participants understand that it is informal, not a validated scale.

## How to turn findings into engineering

1. Collect genuinely observed notes; do **not** invent sample sizes, scores or favorable quotes.
2. Report total attempted tasks and independent successes. Avoid percentages when n is small, or explicitly show numerator/denominator.
3. Create GitHub issues for reproducible failures, assign severity and the specific view/metric.
4. Fix errors in a feature branch, rerun automated browser regression tests, then recruit or ask a fresh participant to repeat the task.
5. Summarize limitations of the study in FP3/FP4; keep observation separate from your interpretation.

## Manual screenreader pass

Use VoiceOver + Safari on macOS (or NVDA + Chrome on Windows). Navigate by headings, form controls, tables and buttons; verify selected event states, paired-share values, SVG plot descriptions, map interaction keyboard behavior and visible focus. Record **who tested and when** only with their consent. Axe's automated serious/critical scan is necessary but insufficient.

## Reporting stub (do not fill until conducted)

- Session dates: **NOT YET CONDUCTED**
- Volunteers recruited: **0 verified**
- Completed tasks: **0 verified**
- Findings: **pending real observation**
- Fixes and retests: **pending**
