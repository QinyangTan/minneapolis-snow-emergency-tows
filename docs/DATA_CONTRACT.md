# Data contract and provenance

## Input
City of Minneapolis Open Data via ArcGIS FeatureServer; nine **complete** event layers plus official neighborhood polygon layer (BDNAME). Source service selection is checked for ambiguity and all URL matches are persisted in quality output.

Input geometry is reprojected in ArcGIS requests to WGS84 / EPSG:4326. Each event record is normalized to {event,season,day,longitude,latitude}; address is never exported. A point is joined to exactly one current neighborhood geometry. Events with no records for one of Days 1/2/3 cause a hard stop.

## Public output
`static/data/summary.json`
- `status`: `recomputed-official-arcgis`
- `generated_at_utc`: ISO timestamp
- `total`: sum of **valid, joined** tow records
- `days[]`: `{day,count}`
- `events[]`: `{id,season,total,days:[{day,count}]}`
- `neighborhoods[]`: `{name,total,days:[{day,count}],event_count}`
- `sources`: city URLs used

`static/data/neighborhoods.geojson`: feature collection; each polygon has `properties.name`, `total`, `days` keyed by day number (as string), `byEvent` keyed by event ID with `total` and `days`.

`static/data/quality.json`: selected services, actual counts, preliminary counts, source field names, invalid day, missing geometry, outside-boundary, and ambiguous spatial joins. Records outside the current neighborhood boundaries are retained in citywide counts and counted as unassigned in summary and quality outputs, but excluded from maps. A >20% unassigned share fails validation.

## Semantics
- 'Day' is the official dataset's 1/2/3 categorization, not reconstructed from the timestamp.
- Neighborhood polygons are current boundaries and do not imply historical boundary consistency.
- Day share denominator = records in the **selected scope** (city/event/neighborhood).
- Recurrence = count of distinct complete emergencies with at least one observed tow in that neighborhood.
- Count differences from the proposal are disclosed; hard failure is reserved for integrity problems, not ordinary changes in open-data totals.

## Data limits
Official tow layers describe observed tow operations. City notes address geocoding uncertainty (~8–14% in some current event metadata). No exact-address causal claim, towing probability or weather-adjusted conclusion is supported.

## Pipeline behavior
`python scripts/build_data.py` pulls sources, validates fields/geometries/days, joins every point, then writes JSON atomically only when validation passes. This intentionally avoids releasing a partial city dataset on failure.
