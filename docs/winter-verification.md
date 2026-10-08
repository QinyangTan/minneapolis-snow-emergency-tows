# Winter demo verification · 2026-10-07

- Production build succeeds; a Three.js bundle size advisory remains (approximately 186 KB gzip).
- Svelte check: zero errors and zero warnings. Standalone demo has its own config to avoid inheriting root SvelteKit config.
- JavaScript tests: 22 passed. Python data tests: 16 passed.
- Browser: desktop 1440×1000 and mobile 390×844 checked. Mobile document width equals viewport width.
- Drag rotates the map while keeping Marcy Holmes selected and Day 2 count at 62. Reset view returns the camera without changing the data.
- Three-day unfolding shows Marcy Holmes counts 26, 62, 1.
- Bridge / Howard comparison shows Day 2 shares 69.7% / 53.2%. The comparison disclosure closes after selection.
- Browser console: no recorded errors during this check.
- Impeccable detector ran once. It reported design-document advisories for legacy type sizes and secondary color literals; no certification claim is made.
- Vercel deployment dpl_FtUz6zkip2GYEGDbCDZtoxwWtXD4 reports READY. The first deployment was automatically assigned to production by Vercel.
- Live alias: https://minneapolis-snow-emergency-demo.vercel.app

The public deployment contains the static build and aggregate public data only. Raw coordinate snapshots, tests and documentation remain in the private GitHub repository.

Source-code diff whitespace check passes. NOAA fixed-width raw records, original source README/license whitespace and generated CSV CRLF endings are preserved intentionally.
