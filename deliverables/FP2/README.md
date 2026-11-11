# FP2 deliverables — Snow, Streets & Neighborhoods

## Presentation

- **FP2-Progress-Presentation.pptx**: finished 15-slide English presentation, with editable charts/tables and speaker notes; approximately 10–11 minutes including a brief demo.
- **FP2-Progress-Presentation.pdf**: visual PDF companion for presenting/submitting; the PPTX is the editable original.
- **speaker-notes.md**: the same narration and source references in readable text.
- **analysis-results.json**: reproducible values used in the presentation.

## Run the demo without building it

1. Download and extract **FP2-demo.zip** completely.
2. Install Node.js 20 or newer if it is not already available.
3. On Windows, double-click `start-demo.cmd`. On any platform, run `node demo-server.mjs` from the extracted folder.
4. Open **http://127.0.0.1:4175/fp2/**. Keep the server window open; Ctrl+C stops it.

The ZIP includes the prebuilt original dashboard and the new FP2 route. It does not require npm installation, API keys or downloading the 1 GB source archive. All chart data is bundled. Optional Google web fonts can fall back to system fonts when offline.

## Run or edit the source

From the repository root:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the printed local address and append `/fp2/`.

```sh
npm run data:fp2
npm run qa:fp2
npm run check
npm run build
npm run qa:browser
```

Data regeneration requires Python 3 (standard library) and the downloaded `datasetsForFP2` folder. Browser QA additionally requires `npx playwright install chromium`. Use task-local npm/Playwright caches where your workspace policy requires them.

## Demonstration sequence

1. Observe the count map and select a neighborhood; the scatterplot and detail panel follow.
2. Switch to records per 1,000 residents; inspect Camden Industrial to see the small-denominator warning.
3. Compare poverty, income brackets, renters, vehicle access, sale prices and traffic. Narrow the indicator range.
4. Change event and Day 1–3; inspect the selected neighborhood's event bars.
5. Explore per-capita income in its original census tract geography, then the 2024 traffic-site layer.

## Research boundaries

- 5,423 records in nine selected emergencies; 5,355 mapped and 68 unassigned. The expanded raw archive is not silently merged into this baseline.
- Neighborhood economics: ACS 2019–2023. Population/housing: ACS 2020–2024. These are not event-time measurements.
- Actual per-capita income is displayed for 121 census tracts; it is not fabricated at neighborhood scale.
- Sale-price medians cover 54 neighborhoods with at least 10 eligible 2024 transactions. Traffic medians cover 83 neighborhoods with at least three matched sampled sites.
- 2024 AADT includes measured and modeled estimates; it is neither total neighborhood traffic nor snow-day exposure.
- A complete public ordinary-day actual-towing log with reason codes was not verified. That comparison is explicitly deferred. Complaints, crashes, calls and tickets are not substituted for completed tows.
- Associations are descriptive. They do not establish direct causation or individual towing probabilities.

The repository also retains source metadata, download scripts, hashes, the search log and a draft data request under `datasetsForFP2`. The existing public demo uses a separate deployment repository: uploading these source deliverables does not by itself establish a new public URL.

The presentation authoring source is `scripts/build-fp2-presentation.mjs`. It uses the installed official `@oai/artifact-tool` runtime and presentation finalizer; set `FP2_TASK_DIR`, `PRESENTATION_SKILL_DIR`, `RUNTIME_NODE_MODULES` and `RUNTIME_PYTHON` to that runtime/workspace. It intentionally refuses to overwrite an existing finalized PPTX. The delivered PPTX can instead be edited directly in PowerPoint. The PDF is a rendered companion, not the editable source.
