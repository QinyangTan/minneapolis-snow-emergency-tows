"""FP3: export the FP2-final analysis tables as small JSON files for the website.

Reads output/fp2-final/ (built by scripts/fp2_final_data.py) and writes:
  static/data/story.json                 storms, annual context, neighborhood comparisons, associations, poverty groups
  static/data/neighborhood-context.json  adds streetKm per neighborhood (existing fields untouched)
Stdlib only, no network.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'output/fp2-final'
STATIC = ROOT / 'static/data'

summary = json.loads((SRC / 'summary.json').read_text())
storms_raw = list(csv.DictReader((SRC / 'events.csv').open()))
hoods_raw = list(csv.DictReader((SRC / 'neighborhoods.csv').open()))


def num(value):
    return None if value in ('', None) else float(value)


def label(layer):
    name = layer.replace('PembinaTows2018', 'Pembina_2018').split('_Tows')[0].split('_20')[0]
    return {'Diamond_Lake': 'Diamond Lake', 'Victory1': 'Victory 1', 'Victory2': 'Victory 2'}.get(name, name)


storms, quarantined = [], []
for row in storms_raw:
    item = {'id': row['layer'], 'name': label(row['layer']), 'start': row['start_date'], 'winter': row['winter'],
            'day1': int(row['day1']), 'day2': int(row['day2']), 'day3': int(row['day3']), 'tows': int(row['tows']),
            'snowMm': int(row['snow_3day_mm']) if row['snow_3day_mm'] else None}
    if row['clean_day1_3'] == 'True' and item['start'] and item['snowMm'] is not None:
        storms.append(item)
    else:
        reason = 'Day 0 rows without date or location' if int(row['day0_quarantined']) else 'missing a rule day'
        quarantined.append({'name': item['name'], 'start': item['start'], 'reason': reason})

# City Traffic & Parking Services accomplishment reports: 2024 report p.23 (2023, 2024), 2025 report p.21 (2025).
annual = [
    {'year': 2023, 'publicStreetTows': 32560, 'snowTows': 1191, 'sweepTows': 5867},
    {'year': 2024, 'publicStreetTows': 30549, 'snowTows': 680, 'sweepTows': 6273},
    {'year': 2025, 'publicStreetTows': 33519, 'snowTows': 3650, 'sweepTows': 6244, 'snowEvents': 3},
]

hoods = []
for row in hoods_raw:
    hoods.append({
        'name': row['neighborhood'],
        'snowTows': int(row['snow_tows_9_events']), 'snowShare': num(row['snow_share_pct']),
        'ordinaryTows': int(row['ordinary_police_tows']), 'ordinaryShare': num(row['ordinary_share_pct']),
        'gap': num(row['share_change_pp']), 'streetKm': num(row['street_km']), 'snowRouteKm': num(row['snow_route_km']),
        'perStreetKm': num(row['snow_tows_per_street_km']), 'population': num(row['population']),
        'areaKm2': num(row['area_km2']), 'density': num(row['pop_density_per_km2']),
        'age1824': num(row['age_18_24_pct']), 'renters': num(row['renter_pct']),
        'noVehicle': num(row['no_vehicle_pct']), 'poverty': num(row['poverty_pct']),
    })

# Poverty groups: neighborhoods sorted by poverty rate, split into five groups of about 17 neighborhoods each.
ranked = sorted((h for h in hoods if h['poverty'] is not None and h['population']), key=lambda h: h['poverty'])
n = len(ranked)
totals = {k: sum(h[k] for h in ranked) for k in ('snowTows', 'ordinaryTows', 'streetKm', 'population')}
groups = []
for i in range(5):
    g = ranked[i * n // 5:(i + 1) * n // 5]
    for h in g:
        h['povertyGroup'] = i + 1

    def weighted(key):
        rows = [h for h in g if h[key] is not None]
        return sum(h[key] * h['population'] for h in rows) / sum(h['population'] for h in rows)

    snow, street = sum(h['snowTows'] for h in g), sum(h['streetKm'] for h in g)
    groups.append({
        'group': i + 1, 'neighborhoods': len(g),
        'povertyMin': g[0]['poverty'], 'povertyMax': g[-1]['poverty'],
        'streetShare': 100 * street / totals['streetKm'], 'populationShare': 100 * sum(h['population'] for h in g) / totals['population'],
        'snowShare': 100 * snow / totals['snowTows'], 'ordinaryShare': 100 * sum(h['ordinaryTows'] for h in g) / totals['ordinaryTows'],
        'perStreetKm': snow / street, 'renters': weighted('renters'), 'noVehicle': weighted('noVehicle'), 'age1824': weighted('age1824'),
    })

assoc_names = {'no_vehicle_pct': 'Households without a vehicle', 'pop_density_per_km2': 'Population density',
               'renter_pct': 'Renter households', 'poverty_pct': 'People below poverty',
               'age_18_24_pct': 'Residents aged 18–24', 'street_km': 'Street length (km)'}
rho = summary['associations_spearman_rho_n']['snow_tows_per_street_km']
ci = summary['per_street_km_bootstrap_95ci']
associations = sorted(({'key': k, 'label': v, 'rho': rho[k][0], 'n': rho[k][1], 'low': ci[k][0], 'high': ci[k][1]}
                       for k, v in assoc_names.items()), key=lambda a: -a['rho'])

story = {
    'schemaVersion': 1,
    'sources': {
        'storms': 'City of Minneapolis Snow Emergency tow layers (ArcGIS), 34 layers, 29 kept',
        'ordinary': 'City of Minneapolis Police Stop Data, call disposition TOW, Nov-Mar outside storm windows, 2016-2026',
        'context': 'City Neighborhood Explorer ACS profiles; Public Works street centerline; NOAA GHCN MSP daily snowfall',
        'annual': 'Minneapolis Traffic & Parking Services accomplishment reports 2024 (p.23) and 2025 (p.21)',
    },
    'totals': {'stormTows': sum(s['tows'] for s in storms), 'mappedSnowTows': summary['snow_tows_9_events_mapped'],
               'ordinaryTows': summary['ordinary_winter_police_tows'], 'streetKm': summary['street_km_total'],
               'snowfallSpearman': summary['event_tows_vs_snow_spearman'][0]},
    'annual': annual, 'storms': storms, 'quarantined': quarantined,
    'neighborhoods': hoods, 'associations': associations, 'povertyGroups': groups,
    'definitions': summary['definitions'],
}
(STATIC / 'story.json').write_text(json.dumps(story, ensure_ascii=False, separators=(',', ':')))

context_path = STATIC / 'neighborhood-context.json'
context = json.loads(context_path.read_text())
street = {h['name']: h['streetKm'] for h in hoods}
for row in context['neighborhoods']:
    row['streetKm'] = street.get(row['name'])
context_path.write_text(json.dumps(context, ensure_ascii=False, separators=(',', ':')))

# self-check
assert len(storms) == 29 and story['totals']['stormTows'] == 27839, story['totals']
assert story['totals']['mappedSnowTows'] == 5355 and len(hoods) == 87
assert abs(sum(g['snowShare'] for g in groups) - 100) < 1e-6 and sum(g['neighborhoods'] for g in groups) == n
assert all(r['streetKm'] for r in context['neighborhoods'])
print(f"story.json: {len(storms)} storms, {len(quarantined)} quarantined, {len(hoods)} neighborhoods, {len(groups)} poverty groups")
