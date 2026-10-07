# Interaction acceptance plan — M2/M3

## Automated (GitHub Actions PR and main)
- Python's bundled-data suite checks all nine events, event-day totals, 87 polygon properties, matrix cells, neighborhood day counts, and 68 geographically unassigned records against the verified source file. The rules are conservation checks; on later refreshes counts may legitimately change.
- Svelte/TypeScript validation and production static build must pass.
- Pages must prerender with working anchor targets regardless of when the client fetches GeoJSON.

## Manual QA to complete before M4 / final submission
These are **acceptance checks**, not a claim they have already been run in a real browser.

1. **Desktop 1440px**: three Day 1–3 small maps visible together and use the exact same scale; plot shape and labels remain legible.
2. **Mobile 390px**: maps stack vertically, recurrence matrix scrolls horizontally, legends remain readable, and day bars remain usable.
3. **Filters**: choose Bridge in event list, focus Day 2 in narrative, select Marcy Holmes on any map; verify a consistent event/day/neighborhood across matrix and explorer.
4. **Count reconciliation**: Day 1 = 1,255, Day 2 = 2,222, Day 3 = 1,946 and citywide = 5,423 in frozen October 7 data. 68 geometrically unassigned points must remain in city totals and never be drawn inside neighborhood polygons.
5. **Matrix semantics**: “Events” = distinct emergencies where that neighborhood has at least one observed record within the selected day scope, NOT number of severe/high-risk events.
6. **Signatures**: each nonempty neighborhood row sums to 100%, selected event changes numerator and denominator, and min-N sorting avoids emphasizing tiny samples.
7. **Keyboard**: tab to maps/table controls, press Enter or Space on map region, reach filters and reset. Verify contrast and focus rings.
8. **Motion**: scroll through three narrative panels and observe selected-day change. Test prefers-reduced-motion.
9. **Fallback**: temporarily omit generated files; see the explicit FP1-only state and no invented neighborhood map.
10. **Source explanation**: official citation, excluded Victory 2, observed towing ≠ chance of towing, and approximate address geocoding uncertainty are visible.

## Visualization claims we can make
- City records are unevenly distributed across the three emergency days.
- Individual events exhibit different day compositions.
- Specific neighborhoods show distinct observed tow-count signatures.
- A repeated footprint is measured by **number of events with ≥1 tow**, not by exposure-adjusted towing risk.

## Claims we cannot make
- “This neighborhood is most likely to get towed.”
- “A rule caused this enforcement pattern.”
- “Geocoded dot location is exact address-level ground truth.”

## Next tasks
- Add narrative annotations keyed to data values, not hardcoded screenshots.
- Add more robust focus management after selecting a matrix cell.
- Run manual screenreader/viewport checks.
- Deploy and share the static application when ready.
