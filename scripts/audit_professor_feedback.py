"""Audit the FP2 package and prepare descriptive neighborhood context; no normal-day imputation."""
import collections
import csv
import gzip
import hashlib
import json
from pathlib import Path

import pyproj
from pyproj import Geod

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / 'datasetsForFP2'
OUT = ROOT / 'output/professor-feedback'
OUT.mkdir(parents=True, exist_ok=True)


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def digest(stream):
    result = hashlib.sha256()
    for chunk in iter(lambda: stream.read(1024 * 1024), b''):
        result.update(chunk)
    return result.hexdigest()


manifest = read(PACKAGE / 'STORAGE_MANIFEST.json')
for entry in manifest['files']:
    path = (PACKAGE / entry['stored_path']).resolve()
    assert path.is_relative_to(PACKAGE.resolve()), 'Manifest path outside package'
    with path.open('rb') as stream:
        assert digest(stream) == entry['stored_sha256'], entry['stored_path']
    if entry['compression'] == 'gzip':
        with gzip.open(path, 'rb') as stream:
            assert digest(stream) == entry['original_sha256'], entry['stored_path']
    else:
        assert entry['compression'] == 'none'
        assert entry['stored_sha256'] == entry['original_sha256']

pre = PACKAGE / 'prepared'
summary = read(pre / 'baseline_9_events/summary.json')
geo = read(pre / 'baseline_9_events/neighborhoods.geojson')
context = read(pre / 'neighborhood_context_starter.json')
observations = read(pre / 'city_acs2024_observations.json')['rows']
reference = read(pre / 'reference_10_events/snow-emergencies.json')
by_name = {row['neighborhood']: row for row in context}
assert len(by_name) == len(context) == len(geo['features']) == 87
assert {f['properties']['name'] for f in geo['features']} == set(by_name)
geod = Geod(ellps='WGS84')


def area_km2(geometry):
    assert geometry['type'] in ['Polygon', 'MultiPolygon']
    polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
    total = 0
    for rings in polygons:
        areas = []
        for ring in rings:
            assert all(-94 < p[0] < -92 and 44 < p[1] < 46 for p in ring), 'Expected Minneapolis lon/lat'
            areas.append(abs(geod.polygon_area_perimeter(*zip(*[p[:2] for p in ring]))[0]))
        total += areas[0] - sum(areas[1:])
    assert total > 0
    return total / 1_000_000


rows = []
for feature in geo['features']:
    p = feature['properties']
    c = by_name[p['name']]
    area = area_km2(feature['geometry'])
    # Area includes the supplied polygon's surface; water is not independently removed.
    reversed_geometry = json.loads(json.dumps(feature['geometry']))
    rings = [reversed_geometry['coordinates']] if reversed_geometry['type'] == 'Polygon' else reversed_geometry['coordinates']
    for polygon in rings:
        for ring in polygon:
            ring.reverse()
    assert abs(area - area_km2(reversed_geometry)) < 1e-8
    pop = c['population'] or {}
    population, moe = pop.get('estimate'), pop.get('moe')
    row = {'neighborhood': p['name'], 'snow_sample': 'selected_9_events', 'snow_records': p['total'],
           'events_with_records': sum(e['total'] > 0 for e in p['byEvent'].values()),
           'gross_polygon_km2': area, 'population_estimate': population, 'population_moe90': moe,
           'population_period': pop.get('period'), 'population_reliability': pop.get('reliability'),
           'snow_records_per_1000_residents': 1000 * p['total'] / population if population else None,
           'snow_records_per_km2': p['total'] / area,
           'per1000_population_sensitivity_lower': 1000 * p['total'] / (population + moe) if population and moe is not None else None,
           'per1000_population_sensitivity_upper': 1000 * p['total'] / (population - moe) if population and moe is not None and population > moe else None,
           'ordinary_day_baseline': None, 'baseline_adjusted_excess': None}
    for metric, desc in [('renter_households', 'renter-occupied'), ('households_no_vehicle', 'no vehicle'), ('people_below_poverty', 'below poverty')]:
        value = c[metric] or {}
        matches = [x for x in observations if x['map_neighborhood'] == p['name'] and x['ACS5 Table ID'] == value.get('table') and x['Desc1'] == desc and x['Desc2'] == '']
        assert len(matches) == (1 if value else 0)
        source = matches[0] if matches else {}
        if value:
            assert value['estimate'] == source['estimate_numeric'] and value['period'] == source['ACS5 Release']
        row.update({metric + '_estimate': value.get('estimate'), metric + '_moe90': value.get('moe'),
                    metric + '_percent': 100 * value['source_percent'] if value.get('source_percent') is not None else None,
                    metric + '_percent_moe90': 100 * float(source['Percent Universe MOE']) if source.get('Percent Universe MOE') else None,
                    metric + '_period': value.get('period'), metric + '_reliability': value.get('reliability')})
    for d in [1, 2, 3]:
        row[f'day_{d}_records'] = p['days'][str(d)]
    assert sum(row[f'day_{d}_records'] for d in [1, 2, 3]) == p['total']
    rows.append(row)

assert sum(r['snow_records'] for r in rows) + summary['unassigned_neighborhood_count'] == summary['total'] == 5423
assert sum(e['event']['total'] for e in reference['events']) == 6118
assert sum(e['event']['total'] for e in reference['events'] if e['event']['name'] == 'Omega') == 695

for key, label in [('snow_records', 'count_rank'), ('snow_records_per_1000_residents', 'per1000_rank'), ('snow_records_per_km2', 'density_rank')]:
    valid = [r for r in rows if r[key] is not None]
    for r in valid:
        r[label] = 1 + sum(other[key] > r[key] for other in valid)  # Competition ranks retain ties.

with (OUT / 'neighborhood_snow_context.csv').open('w', newline='', encoding='utf-8') as stream:
    writer = csv.DictWriter(stream, fieldnames=sorted(set().union(*(r.keys() for r in rows))), lineterminator='\n')
    writer.writeheader()
    writer.writerows(rows)

# Publish only the audited neighborhood aggregates used by the browser.
public_context = []
for row in rows:
    source = by_name[row['neighborhood']]
    attributes = {}
    for key, metric in [('renters', 'renter_households'), ('noVehicle', 'households_no_vehicle'), ('poverty', 'people_below_poverty')]:
        attributes[key] = None if not source[metric] else {
            'percent': row[metric + '_percent'], 'moe': row[metric + '_percent_moe90'],
            'period': row[metric + '_period'], 'reliability': row[metric + '_reliability']}
    public_context.append({'name': row['neighborhood'], 'areaKm2': row['gross_polygon_km2'],
                           'population': source['population'], 'attributes': attributes})
public = ROOT / 'static/data'
(public / 'neighborhood-context.json').write_text(json.dumps({
    'schemaVersion': 1, 'sourceCommit': 'f54d514f01575a6da5b38e6e1c5b93ba50e7f2e8',
    'areaMethod': 'WGS84 ellipsoidal gross polygon area; not land-only or parkable area',
    'ordinaryDayBaseline': None, 'neighborhoods': public_context}, separators=(',', ':'), allow_nan=False) + '\n')
(public / 'neighborhood-snow-context.csv').write_bytes((OUT / 'neighborhood_snow_context.csv').read_bytes())

# Screen archived layers for triage only; passing these gates does not validate an event.
historical = []
for layer in read(PACKAGE / 'catalog/snow_layer_audit.json')['layers']:
    if 'tows' not in layer['file'].lower():
        continue
    day_counts = collections.Counter()
    for day, count in layer['day_counts'].items():
        normalized = day.removeprefix('Day ')
        day_counts[normalized] += count
    historical.append({'file': layer['file'], 'rows': layer['count'],
                       'has_all_three_days': all(day_counts[str(d)] > 0 for d in [1, 2, 3]),
                       'unclassified_rows': sum(n for d, n in day_counts.items() if d not in ['1', '2', '3']),
                       'date_range_available': layer['call_taken_min'] is not None,
                       'admitted_to_primary_sample': False})

leaders = lambda key: [{k: r.get(k) for k in ['neighborhood', 'snow_records', 'population_estimate', 'snow_records_per_1000_residents', 'snow_records_per_km2']} for r in sorted([r for r in rows if r[key] is not None], key=lambda r: (-r[key], r['neighborhood']))[:5]]
report = {'source_commit': 'f54d514f01575a6da5b38e6e1c5b93ba50e7f2e8', 'access_date': '2026-11-10',
          'stored_files_hash_verified': len(manifest['files']), 'compressed_originals_hash_verified': sum(x['compression'] == 'gzip' for x in manifest['files']),
          'pyproj_version': pyproj.__version__, 'area_method': 'WGS84 ellipsoidal ring areas; gross supplied polygon, not land-only or parkable curb area',
          'sample': {'events': len(summary['events']), 'records': summary['total'], 'mapped_records': sum(r['snow_records'] for r in rows), 'unmatched_records': summary['unassigned_neighborhood_count'], 'event_days': len(summary['events']) * 3, 'seasons': sorted({e['season'] for e in summary['events']})},
          'context_rows': len(rows), 'missing_population': [r['neighborhood'] for r in rows if r['population_estimate'] is None],
          'missing_neighborhood_per_capita_income': sum(c['per_capita_income'] is None for c in context),
          'acs_periods_by_table': {table: sorted({o['ACS5 Release'] for o in observations if o['ACS5 Table ID'] == table}) for table in ['B01003', 'B25003', 'B25044', 'B17021']},
          'low_reliability_counts': {metric: sum((c[metric] or {}).get('reliability') == 'Low' for c in context) for metric in ['population', 'renter_households', 'households_no_vehicle', 'people_below_poverty']},
          'top_by_count': leaders('snow_records'), 'top_by_per1000': leaders('snow_records_per_1000_residents'), 'top_by_density': leaders('snow_records_per_km2'),
          'historical_layer_triage': historical,
          'ordinary_day_baseline_status': 'not_available; null values are not zeros',
          'interpretation': 'Exploratory selected-snow sample, not causal effects, annual rates, or individual tow risk. Population sensitivity bounds vary the ACS denominator only; not outcome confidence intervals.'}
(OUT / 'audit.json').write_text(json.dumps(report, indent=2, allow_nan=False) + '\n')
print(json.dumps({k: report[k] for k in ['stored_files_hash_verified', 'sample', 'context_rows', 'missing_population', 'low_reliability_counts', 'top_by_count', 'top_by_per1000']}, indent=2))
