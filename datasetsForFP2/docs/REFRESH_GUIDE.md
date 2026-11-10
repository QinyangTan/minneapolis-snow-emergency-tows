# Reuse and refresh

The collection is a frozen local research snapshot. No recurring job was created.

## Local preparation and verification

From the workspace directory:

```powershell
python FP2-data/scripts/prepare_bundle.py
python FP2-data/scripts/catalog_and_validate.py
```

Preparation uses Python standard-library modules. It does not infer neighborhood income by averaging tract values, expand the approved event cohort, or fill missing ACS values with zero.

## Network acquisition scripts

The acquisition scripts use Python `requests`. Archive this folder before refreshing: some scripts overwrite the latest manifest and data files.

- `discover.py`: city service directory and ArcGIS search metadata.
- `inspect_sources.py`: service/layer schemas for the selected city sources.
- `harvest_city.py`: selected city sources; skips successful existing files. `--refresh-snow` refreshes snow layers with historical day, reason and date fields.
- `collect_context.py`: weather, transit and boundary snapshots. Its Census API data requests require a Census key and failed without one during this session; **use `collect_acs_bulk.py` for the successful key-free data route**. The metadata endpoints worked without a key.
- `discover_extra.py`: official dashboard and additional source discovery.
- `collect_more.py`: official City Tableau neighborhood CSVs and packaged source workbook.
- `collect_regional.py`: geographically bounded traffic/ACS map layers; IDs-based pagination avoids short-page issues.
- `collect_acs_bulk.py`: 12 official ACS tables for three five-year vintages. Saves national compressed source and Hennepin rows; uses 4 concurrent requests.
- `collect_history.py`: 2022–2025 Hennepin traffic history, and archived weekly transit feeds for the ten project events.
- `collect_addons.py`: property sales, active rental licenses and 911 metadata.

The source URLs and actual filters used are recorded in the JSON download logs. Respect each source's usage terms and avoid repeatedly downloading national ACS files when a verified local copy is available. An ArcGIS `downloaded` status means the selected query completed and its count/IDs matched; it does not certify historical representativeness.

## Current dynamic endpoints

- Metro Transit static GTFS: https://svc.metrotransit.org/mtgtfs/gtfs.zip
- Trip updates: https://svc.metrotransit.org/mtgtfs/tripupdates.pb
- Vehicle positions: https://svc.metrotransit.org/mtgtfs/vehiclepositions.pb
- Service alerts: https://svc.metrotransit.org/mtgtfs/alerts.pb
- Historical GTFS: https://svc.metrotransit.org/mtgtfs/archive/gtfs{yyyyMMdd}.zip
- NOAA daily station file: https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/USW00014922.dly
- ArcGIS query endpoints: layer URL in `catalog/datasets.json` plus `/query`.

Realtime protobuf files are timestamped snapshots. They are not historical 2022–2025 transit performance data. The GTFS archive contains scheduled service; exact service dates still need calendar/calendar_dates filtering.

## Why some source types are deliberately separate

- `raw/city` stores ArcGIS feature JSON, not GeoJSON. Geometry is requested in WGS84 when included; attributes-only parcel snapshots retain original X/Y fields whose units must be read from metadata.
- Census national `.dat.gz` archives preserve complete source tables. `_hennepin.dat` files are pipe-delimited geographic subsets with unchanged source values.
- The main source manifest counts one ACS table/vintage as one snapshot; it does not double-count the full archive and subset.
- `prepared/baseline_9_events` is a copied versioned project baseline. Expanded raw snow layers remain candidates, not an approved combined dataset.
- Source reference files and metadata are not counted as independent observational datasets.
