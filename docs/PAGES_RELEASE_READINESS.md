# GitHub Pages live release — compiled-only public artifact

**Deployment status: LIVE (October 8, 2026).** The actual authenticated-source GitHub repo `QinyangTan/minneapolis-snow-emergency-tows` is **Private**. The separate `QinyangTan/minneapolis-snow-emergency-tows-demo` repository is **Public** and contains compiled build artifacts only.

- **Public, unauthenticated site:** https://qinyangtan.github.io/minneapolis-snow-emergency-tows-demo/
- **Public release artifact repo:** https://github.com/QinyangTan/minneapolis-snow-emergency-tows-demo
- **Public release commit:** `989dd33ea50bd7341520763b19cdeed025415dfc`
- **Private source PR for deploy readiness:** #8, merged into main at `f0e9a7f1b1d3c3c0b83116df001acf9cd6cf3a3e`
- **Public build source:** October 7 City aggregate snapshot, SvelteKit static build using `PAGES_BASE_PATH=/minneapolis-snow-emergency-tows-demo`.

## Independent live verification

Checked after GitHub Pages build became `built`:

| Item | Live result |
|---|---|
| Homepage, no login | HTTP 200 |
| `data/summary.json` | HTTP 200 |
| `data/neighborhoods.geojson` | HTTP 200 (771,993 bytes) |
| Headless Chrome 1440px | PASS, nine fingerprint cards, three maps, official data, filtering, paired-event comparison |
| Headless Chrome 390px | PASS, nine fingerprint cards, three maps, no root overflow or page script errors |
| Existing private-source Actions CI | 14/14 Chromium tests and independent Pages-subpath smoke test passed |
| Source repository visibility | Private |
| Demo artifact repository visibility | Public |

Published artifact: 19 static build files totaling 993,262 bytes plus `.nojekyll` and a public README; no original `src/`, `.git/` from source, `docs/`, `tests/`, `.env`, course PDF, team records, raw address data, or deployment credentials. A text scan for team names, e-mail identity, common GitHub/OpenAI keys and PEM private-key delimiters had no matches. This is limited evidence, not a comprehensive security audit.

## Reproduce builds safely

```bash
npm install --no-audit --no-fund
npm run check
npm run qa:research
npm run build:pages
npm run qa:pages
PAGES_BASE_PATH=/minneapolis-snow-emergency-tows-demo npx playwright test e2e/pages.spec.mjs
```

The code uses SvelteKit `$app/paths.base` rather than root-absolute `/data/` for fetching official City aggregates. The public Pages checkout requires `.nojekyll` so the compiler's `_app/` folder is served intact. Pages is configured to publish the **public repo main branch root**. Do not publish this private development repository or its `docs/TEAM_CONTRIBUTIONS.md` to make a class URL.

## Future deployments

Future UI changes to the **private source** do **not** update the public site automatically. To release another version, (1) run all source CI / browser checks, (2) build with this public demo's exact base path, (3) repeat the privacy preflight, (4) commit only `build/` contents (plus `.nojekyll` and public README) to the **separate public artifact repo**, (5) verify the GitHub Pages build and uncached HTTP 200, assets and real browser interactions. Do not put personal tokens in workflows or publish private repo code history. The deployed client JS is necessarily accessible in minified form on the public web.

## Still required before course final

The public URL addresses the **FP3 publication requirement**, but does not by itself establish a score. Team sign-off, human think-aloud comprehension evaluation, real screenreader accessibility review, narrative annotations and FP2/FP4 report/presentation still remain. See [USER_EVALUATION_PROTOCOL.md](USER_EVALUATION_PROTOCOL.md) and [RUBRIC_TRACEABILITY.md](RUBRIC_TRACEABILITY.md).
