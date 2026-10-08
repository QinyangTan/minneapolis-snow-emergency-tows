# GitHub Pages project-path readiness — build-only, not published

## Why this work is necessary

CSCI 5609 FP3 explicitly gives credit for a **publicly accessible GitHub Pages URL**. The current **source repository is Private**. The static code may be published *only after* the five-person team agrees on an acceptable public artifact and checks the repository/organization plan and Pages permissions.

The old client requested `/data/*.json` from the domain root. That would 404 if the app is served under `/<repo>/`. This branch uses SvelteKit's `$app/paths.base` for data fetches and a configurable build-time `paths.base`.

## Reproduce a project-path artifact without publishing

```bash
npm install
npm run check
npm run qa:research
npm run build:pages
npm run qa:pages
PAGES_BASE_PATH=/minneapolis-snow-emergency-tows npx playwright test e2e/pages.spec.mjs
```

The Pages build should have `/minneapolis-snow-emergency-tows/_app/...` asset links. The smoke test visits that subpath in Chromium and confirms the official processed summary and map geometry both return HTTP 200, plus nine event cards, three maps and the evidence chart render. Ordinary `npm run build` remains root-path compatible.

## Static content and privacy review

- The built artifact intentionally includes **aggregate City towing data** under `/data/`, UI HTML, assets and JS. It should not include exact tow addresses or individual respondent records.
- The preflight blocks common development/private artifact paths (`.env`, docs, tests, git internals, raw data, team contribution documents) in `build/`. This is **not a full security scan** and cannot guarantee no sensitive content embedded in JS bundles; a reviewer must inspect the final build.
- No automatic public deployment action is configured. A **new/public GitHub Pages repository** may be needed if the private source repository's Pages entitlement does not allow an anonymous public site. Do not make source public just to simplify a class demo.
- If an approved standalone public artifact repo is used, ensure its Pages path matches the `PAGES_BASE_PATH` build value. Keep the source Private. Ask teammates before publishing team names, recording footage or course material.
- Public deployment requires **unauthenticated browser verification** of the exact URL, phone and desktop checks, 404 fallback and resource loading, linked controls and a data provenance note.
- Add the final URL to README and Canvas only **after** it has been opened successfully without signing in; no URL is currently claimed.

## Human validation gates

Follow [USER_EVALUATION_PROTOCOL.md](USER_EVALUATION_PROTOCOL.md) to conduct a real small user evaluation. The existing axe/Playwright checks are not actual user feedback. Record contributor reviews and AI/Codex disclosure honestly.
