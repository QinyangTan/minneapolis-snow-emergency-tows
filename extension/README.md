# Google Maps Chrome Extension — Snow Emergency Tows (prototype)

An original, **opt-in Chrome/Edge Manifest V3 extension** for the CSCI 5609 Three Days, Three Rules project. When enabled on desktop Google Maps, it paints official City of Minneapolis neighborhood tow **counts** over the 2D map, with a floating event/day filter and linked neighborhood count roster.

**Status:** experimental GIS overlay, not navigationally calibrated. Source reproducible and offline. Never claim exact alignments to Google Maps' private rendering engine.

## Why this is separate from the main website

Our [complete data story](https://qinyangtan.github.io/minneapolis-snow-emergency-tows-demo/) uses its own map projection and internally linked views. Google Maps itself **does not expose a stable mapping camera API to third-party extensions**. A Chrome content script can render HTML/SVG above the page, but cannot turn private Google Maps layers into an officially supported geospatial overlay.

This prototype reads only Google Maps' *visible URL camera* (`@latitude,longitude,zoomz`) and aligns a transparent Web Mercator SVG against a detected map-scene rectangle. That allows a plausible 2D layer with pan/zoom updates, **not guaranteed pixel-accurate map registration**. To prevent clearly wrong placements, the plugin **refuses to draw** when URL coordinates are absent, the view has explicit tilt/heading, the map scene is not confidently found, or the camera is outside the Minneapolis vicinity. Google could change URL/DOM conventions at any time.

The first version intentionally does not draw street-level tow-address pins, use Google Maps Platform credentials, or claim parking-law risk or current street rules.

## Live Google Maps DOM audit — October 10, 2026

A separate Playwright browser visited the **actual** public Google Maps website at `https://www.google.com/maps/@44.9778,-93.2650,12z` (1200 × 880 viewport). Findings:

- Legacy selectors `canvas.widget-scene-canvas`, `#scene`, `.widget-scene`, `[aria-label="Map"]` **were absent**. The page used **two overlapping viewport-sized WebGL canvases** (plus a zero-size canvas). The initial extension could not locate a scene there and therefore would fail closed.
- A real map wheel-zoom updated the visible image **before** changing the URL. In this browser observation, the address first retained zoom `12z`, then later reported approximately `12.68z` and an adjusted center. It is not safe to keep previously projected polygons visible during that delay.
- The patched extension now recognizes an **overlapping pair** of large canvases; one generic full-page canvas is intentionally not enough.
- The patched extension **suspends geographic geometry** as soon as a map wheel, drag/pinch gesture or viewport relayout is observed. It resumes only after a *different* URL camera appears and remains settled. If Google Maps never updates its URL, the layer stays paused instead of presenting stale geometry.
- The filter panel now offers a one-click **collapse** without disabling the layer, preserving more room for map search, zoom, navigation and POI selection.

**Evidence limits:** This was live Google Maps DOM/URL inspection plus separate Chromium MV3 fixture verification. The extension **has not yet been installed and georegistered against the live website** in that browser; no claim of pixel-perfect overlay positioning, compatibility with all search sidebars, or production readiness is justified. Google Maps can change its private DOM/URL conventions without notice.

**Production release gate:** screen-record dragging/panning/zooming and compare known neighborhood boundaries with independent ground-truth references at multiple viewport sizes and zoom levels; verify search and directions remain usable; test Street View, tilt/rotate, route sidebar and accessibility. Prefer a fully supported Google Maps JavaScript API **owned map instance** with `OverlayView` for guaranteed map-synchronized custom layers, but recognize this creates a new Google-powered map rather than modifying the consumer `google.com/maps` instance.

## Installing a verified QA build

1. Open the repository's [Google Maps Extension Actions workflow](https://github.com/QinyangTan/minneapolis-snow-emergency-tows/actions/workflows/google-maps-extension.yml).
2. Download the most recent **successful** `google-maps-snow-emergency-extension` artifact and unzip it. Or from a checkout, run `npm run build:extension` and use the folder `build/google-maps-extension/`.
3. Open `chrome://extensions` or `edge://extensions`; enable **Developer mode**; select **Load unpacked**; pick the extracted folder containing `manifest.json`.
4. Open or refresh [Minneapolis Google Maps in 2D](https://www.google.com/maps/@44.9778,-93.2650,12z) (north-up, no tilt). Pin the extension in the toolbar, then click its icon once to enable it. Click again to hide it.
5. Use **Snow Emergency** and **Day 1/2/3** to change mapped counts, or uncheck the layer to use the numerical panel alone. You can also change layer opacity.

If alignment visibly drifts after dragging, rotating, changing modes or opening a sidebar, **switch the layer off**; do not use estimated geometry for navigation or street decisions. The stand-alone [data story](https://qinyangtan.github.io/minneapolis-snow-emergency-tows-demo/) has a reliable in-app map rather than trying to synchronize with an undocumented third-party camera.

## Exactly what is in the package

- `content.js`: dynamically injected only on Google Maps URLs by the MV3 content-script match. Shadow DOM UI and viewport overlay. No access to private Google JS internals.
- `content.css`: the floating control panel. All CSS remains in the extension's shadow root, and polygon SVG ignores pointer events, so Google Maps keeps receiving mouse and touch interactions.
- `data/neighborhoods.geojson`: 87 official City neighborhood polygons with event/day count aggregates.
- `data/summary.json`: nine complete historical emergencies, 5,423 tow records; 5,355 mapped into current neighborhood boundaries and 68 unassigned.
- `background.js`: a toolbar click toggles the extension through local settings. Settings persist via Chrome `storage.local`.
- `manifest.json`: `activeTab` (only when user clicks extension to identify the active site) + `storage`, with content scripts limited to Google Maps. **No all-sites access, login credential storage, geolocation permission, remote code execution, or data exfiltration endpoint**.

The SVG renderer and event/day selectors are original vanilla JavaScript ported conceptually from our Svelte+D3 map. The extension copies **only our own validated source data**, not copyrighted course slide content. It makes no external API requests for tow records.

## Build, tests, and verification

```bash
npm run build:extension
npm run qa:extension
npm run qa:extension:browser
```

The unit suite checks URL cameras, tilt gate, numeric Mercator projection, all 87 geometry paths, count denominators and offline build contents. The Chromium smoke test sideloads the actual MV3 package into a persistent browser profile but uses a **controlled page fixture** at a Google Maps-shaped URL, not the changing production Google DOM. It exercises the 87 projected polygons, 5,423 total, Bridge/Day 2 = 418, layer enable/disable, and fail-closed camera tilt behavior. Passing this test is evidence of extension functionality **under the fixture**, not a visual alignment guarantee against live Google Maps. Actual live Google Maps manual QA remains required before shipping to the public or the Chrome Web Store.

## Next milestones / graduation conditions

- Manual pixel-level comparison on live Google Maps 2D at multiple zooms, pans and sidebar widths.
- Verify URL camera synchronization behavior after fast drag/zoom and additional Google Maps layouts.
- Improve camera registration with a supported map integration rather than claiming unsupported alignment. If Google's DOM can't reliably expose bounds, keep only the numerical companion panel or switch to an officially supported GIS-host map for accurate overlay.
- Accessibility checks (ChromeVox/keyboard, color-vision deficiency, 390px layout), and real-user testing (do not invent participant evidence).
- Add a new screenshot/GIF recorded from the extension in Chromium only after actual production Google Maps inspection.
- Finalize attribution, contributor review and course AI disclosure before project submission.

**No Canvas coursework has been submitted or altered by implementing this extension.**
