"""FP2 final: ordinary-day tow comparison, event-level snowfall and street exposure.

Stdlib only. Downloads two public City of Minneapolis ArcGIS layers (police-stop tows, street
centerlines), reuses the frozen nine-event neighborhood sample and the stored historical layers,
and writes aggregate tables to output/fp2-final/. No vehicle or person-level fields are saved.
"""
import csv
import json
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
PKG = ROOT / 'datasetsForFP2'
OUT = ROOT / 'output/fp2-final'
OUT.mkdir(parents=True, exist_ok=True)
CHI = ZoneInfo('America/Chicago')
ARC = 'https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services'


def get(url, **params):
    with urllib.request.urlopen(f'{url}?{urllib.parse.urlencode(params)}', timeout=120) as r:
        data = json.load(r)
    assert 'error' not in data, data
    return data


def query_all(layer, where, fields, geometry):
    rows, offset = [], 0
    while True:
        page = get(f'{ARC}/{layer}/FeatureServer/0/query', where=where, outFields=fields, f='json',
                   returnGeometry=str(geometry).lower(), outSR=4326, resultOffset=offset,
                   resultRecordCount=1000, orderByFields='OBJECTID')
        rows += page['features']
        if not page.get('exceededTransferLimit') and len(page['features']) < 1000:
            return rows
        offset += len(page['features'])


# ---------- neighborhoods ----------
geo = json.loads((ROOT / 'static/data/neighborhoods.geojson').read_text())
polys = []
for f in geo['features']:
    g = f['geometry']
    parts = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    polys.append((f['properties']['name'], parts))


def inside(x, y, ring):
    hit = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            hit = not hit
    return hit


def hood(x, y):
    for name, parts in polys:
        for rings in parts:
            if inside(x, y, rings[0]) and not any(inside(x, y, h) for h in rings[1:]):
                return name
    return None


# ---------- 1. historical snow-emergency layers: event table ----------
def parse_when(v):
    if v is None or v == '':
        return None
    if isinstance(v, (int, float)):
        return datetime.fromtimestamp(v / 1000, timezone.utc).date()  # stored as date-only UTC midnight
    s = ' '.join(str(v).split()).lower()
    for fmt in ('%m/%d/%Y %I:%M%p', '%m/%d/%Y %I:%M:%S%p', '%m/%d/%y %I:%M %p', '%m/%d/%Y'):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            pass
    raise ValueError(v)


def day_of(a):
    for k in ('Day', 'Day_identi', 'Day_Identi', 'Day_ID'):
        if k in a and a[k] is not None:
            return int(str(a[k]).replace('Day', '').strip())
    return None


weather = {r['date']: r for r in json.loads((PKG / 'prepared/weather_msp_daily_2015_2026.json').read_text())['rows']}


def snow_mm(d):
    v = weather.get(d.isoformat(), {}).get('SNOW')
    return None if v is None else v['value']


events, emergency_days = [], set()
for path in sorted((PKG / 'raw/city').glob('*Tows*.json')):
    feats = json.loads(path.read_text())['features']
    days = Counter(day_of(f['attributes']) for f in feats)
    dates = [parse_when(f['attributes'].get('Call_Taken', f['attributes'].get('Call_taken', f['attributes'].get('Service_Da'))))
             for f in feats if day_of(f['attributes']) == 1]
    dates = [d for d in dates if d]
    name = path.stem.split('__')[0].replace('Snow_Emergency_', '').replace('SnowEmergency', '')
    clean = set(days) == {1, 2, 3}  # quarantines Day=0 rows and layers missing a phase
    start = min(dates) if dates else None
    if start:
        emergency_days.update(start + timedelta(k) for k in range(-1, 4))
    storm = [snow_mm(start - timedelta(k)) for k in range(3)] if start else []
    events.append({
        'layer': name, 'start_date': start.isoformat() if start else '', 'clean_day1_3': clean,
        'tows': sum(v for k, v in days.items() if k in (1, 2, 3)),
        'day1': days[1], 'day2': days[2], 'day3': days[3], 'day0_quarantined': days[0],
        'snow_3day_mm': sum(storm) if storm and None not in storm else '',
        'winter': f'{start.year - (start.month < 7)}/{str(start.year + (start.month >= 7))[2:]}' if start else '',
    })
events.sort(key=lambda e: e['start_date'])

# ---------- 2. police-stop tows (year-round) ----------
police = query_all('Police_Stop_Data', "UPPER(callDisposition) LIKE '%TOW%'", 'OBJECTID,responseDate,problem,lat,long', False)
ordinary, all_police = Counter(), Counter()
police_rows = 0
for f in police:
    a = f['attributes']
    if a['responseDate'] is None or a['lat'] is None or a['long'] is None:
        continue
    police_rows += 1
    d = datetime.fromtimestamp(a['responseDate'] / 1000, timezone.utc).astimezone(CHI).date()
    n = hood(a['long'], a['lat'])
    all_police[n] += 1
    if d.month in (11, 12, 1, 2, 3) and d not in emergency_days:  # winter, outside every known event window
        ordinary[n] += 1

# ---------- 3. street centerline exposure ----------
streets = query_all('PW_Street_Centerline', '1=1', 'OBJECTID,SEGMENT_LENGTH,SNOW_EMERGENCY_ROUTE,JURISDICTION', True)
street_km, route_km = defaultdict(float), defaultdict(float)
for f in streets:
    pts = f.get('geometry', {}).get('paths', [[]])[0]
    length = f['attributes']['SEGMENT_LENGTH']
    if not pts or not length:
        continue
    x, y = pts[len(pts) // 2]  # ponytail: midpoint-vertex assignment, not clipping; fine for short segments
    n = hood(x, y)
    km = length * 0.0003048  # SEGMENT_LENGTH is feet
    street_km[n] += km
    if str(f['attributes']['SNOW_EMERGENCY_ROUTE']).upper() in ('Y', 'YES', '1', 'TRUE'):
        route_km[n] += km

# ---------- 4. neighborhood table ----------
ctx = {r['neighborhood']: r for r in csv.DictReader((ROOT / 'output/professor-feedback/neighborhood_snow_context.csv').open())}
acs = json.loads((PKG / 'prepared/city_acs2024_observations.json').read_text())['rows']
young = {r['map_neighborhood']: float(r['Percent Universe']) * 100 for r in acs
         if r['Topic'] == 'age' and r['Desc1'] == '18 - 24 years' and r['Race Ethnicity'] == 'all'
         and r['Subuniverse'] == 'all' and r['Percent Universe'] not in ('', None)}
snow = {f['properties']['name']: f['properties']['total'] for f in geo['features']}
snow_total, ord_total = sum(snow.values()), sum(v for k, v in ordinary.items() if k)


def num(v):
    return float(v) if v not in ('', None) else None


hoods = []
for name in sorted(snow):
    c = ctx[name]
    sk = street_km.get(name, 0)
    hoods.append({
        'neighborhood': name, 'snow_tows_9_events': snow[name],
        'snow_share_pct': 100 * snow[name] / snow_total,
        'ordinary_police_tows': ordinary.get(name, 0),
        'ordinary_share_pct': 100 * ordinary.get(name, 0) / ord_total,
        'share_change_pp': 100 * snow[name] / snow_total - 100 * ordinary.get(name, 0) / ord_total,
        'street_km': round(sk, 2), 'snow_route_km': round(route_km.get(name, 0), 2),
        'snow_tows_per_street_km': snow[name] / sk if sk else None,
        'population': num(c['population_estimate']), 'area_km2': num(c['gross_polygon_km2']),
        'age_18_24_pct': young.get(name), 'renter_pct': num(c['renter_households_percent']),
        'no_vehicle_pct': num(c['households_no_vehicle_percent']), 'poverty_pct': num(c['people_below_poverty_percent']),
    })
for h in hoods:
    h['pop_density_per_km2'] = h['population'] / h['area_km2'] if h['population'] and h['area_km2'] else None


def ranks(xs):
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    r = [0.0] * len(xs)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        for k in range(i, j + 1):
            r[order[k]] = (i + j) / 2
        i = j + 1
    return r


def spearman(xs, ys):
    pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    rx, ry = ranks([p[0] for p in pairs]), ranks([p[1] for p in pairs])
    mx, my = sum(rx) / len(rx), sum(ry) / len(ry)
    cov = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    return round(cov / (sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry)) ** 0.5, 2), len(pairs)


attrs = ['age_18_24_pct', 'renter_pct', 'no_vehicle_pct', 'poverty_pct', 'pop_density_per_km2', 'street_km']
assoc = {out: {a: spearman([h[a] for h in hoods], [h[out] for h in hoods]) for a in attrs}
         for out in ('share_change_pp', 'snow_tows_per_street_km')}

def boot_ci(xs, ys, n=4000):
    import random
    rng = random.Random(5609)
    pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    vals = sorted(spearman(*zip(*[rng.choice(pairs) for _ in pairs]))[0] for _ in range(n))
    return [vals[int(0.025 * n)], vals[int(0.975 * n) - 1]]


ci = {a: boot_ci([h[a] for h in hoods], [h['snow_tows_per_street_km'] for h in hoods]) for a in attrs}

clean = [e for e in events if e['clean_day1_3'] and e['start_date'] and e['snow_3day_mm'] != '']
summary = {
    'police_stop_tows_downloaded': len(police), 'police_stop_tows_with_date_xy': police_rows,
    'police_unmatched_neighborhood': all_police.get(None, 0),
    'ordinary_winter_police_tows': ord_total, 'snow_tows_9_events_mapped': snow_total,
    'street_segments': len(streets), 'street_km_total': round(sum(v for k, v in street_km.items() if k), 1),
    'street_km_unmatched': round(street_km.get(None, 0), 1),
    'historical_layers': len(events), 'clean_dated_events': len(clean),
    'event_tows_vs_snow_spearman': spearman([e['snow_3day_mm'] for e in clean], [e['tows'] for e in clean]),
    'associations_spearman_rho_n': assoc,
    'per_street_km_bootstrap_95ci': ci,
    'definitions': {
        'ordinary': 'Police-stop calls with TOW disposition, Nov-Mar, excluding day before through Day 3 of every stored event layer. Police-initiated tows only; not parking-enforcement tows.',
        'share_change_pp': 'Neighborhood share of nine-event snow tows minus its share of ordinary winter police-stop tows. Different tow definitions: compare geography, not volume.',
        'snow_3day_mm': 'MSP airport snowfall on the Day 1 date and two prior days.',
    },
}


def write(name, rows):
    with (OUT / name).open('w', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)


write('events.csv', events)
write('neighborhoods.csv', hoods)
(OUT / 'summary.json').write_text(json.dumps(summary, indent=2))
print(json.dumps(summary, indent=2))

# self-check
assert snow_total == 5355, snow_total
assert len(hoods) == 87
assert abs(sum(h['share_change_pp'] for h in hoods)) < 1e-6
assert spearman([1, 2, 3], [3, 2, 1])[0] == -1.0
