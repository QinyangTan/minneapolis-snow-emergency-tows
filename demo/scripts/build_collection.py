"""Build ten audited Events from redacted official points and one NOAA station."""
import argparse
import calendar
import csv
import hashlib
import json
import math
import re
from collections import Counter
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.request import urlopen

from build_data import ROOT, SOURCES, clean_features, fetch_layer, interior_anchor, join_records

AUDIT = ROOT.parent / 'docs/snow-data-verification-2026-10-06.json'
RAW = ROOT / 'data/raw'
OUT = ROOT / 'public/data'
STATION = 'USW00014922'
WEATHER_URL = f'https://www.ncei.noaa.gov/pub/data/ghcn/daily/all/{STATION}.dly'
WEATHER_DOC = 'https://www.ncei.noaa.gov/pub/data/ghcn/daily/readme.txt'
FIELDS = ('OBJECTID', 'FID', 'Day', 'Latitude', 'Longitude', 'Neighborho', 'Neighorhoo',
          'Call_Taken', 'Snow_Emerg', 'Snow_Eme_1')
SELECTION_NOTE = ('Ten audited published three-day Events, 2022–2025. Victory2 is excluded because '
                  'its source contains only Day 1. This is a selected collection, not a census of all '
                  'Snow Emergencies or all tows. Counts use published Source Day and current official '
                  'neighborhood boundaries; unmatched points remain in Event totals.')


def parse_dly(text):
    """Read GHCN daily fields; a nonblank QFLAG makes the value unavailable."""
    records = {}
    for line in text.splitlines():
        if line[:11] != STATION or line[17:21] not in ('SNOW', 'SNWD', 'TMIN', 'TMAX'):
            continue
        year, month, element = int(line[11:15]), int(line[15:17]), line[17:21]
        for day in range(1, calendar.monthrange(year, month)[1] + 1):
            cell = line[21 + (day-1)*8:29 + (day-1)*8]
            raw = int(cell[:5])
            mflag, qflag, sflag = (c.strip() for c in cell[5:8])
            value = None if raw == -9999 or qflag else raw / 10 if element in ('TMIN', 'TMAX') else raw
            records.setdefault(date(year, month, day).isoformat(), {})[element] = {
                'value': value, 'rawValue': raw, 'mflag': mflag, 'qflag': qflag,
                'sflag': sflag, 'trace': mflag == 'T'}
    return records


def event_weather(records, start):
    first = date.fromisoformat(start) - timedelta(days=2)
    dates = [(first + timedelta(days=i)).isoformat() for i in range(3)]
    missing = {'value': None, 'rawValue': None, 'mflag': '', 'qflag': '', 'sflag': '', 'trace': False}
    daily = [{'date': d, 'snowfall': records.get(d, {}).get('SNOW', dict(missing))} for d in dates]
    start_values = {element: records.get(start, {}).get(element, dict(missing)) for element in ('SNWD', 'TMIN', 'TMAX')}
    snow = [d['snowfall']['value'] for d in daily]
    total = sum(snow) if all(v is not None for v in snow) else None
    complete = total is not None and all(v['value'] is not None for v in start_values.values())
    return {'stationId': STATION, 'stationName': 'MINNEAPOLIS ST PAUL INTERNATIONAL AIRPORT',
            'windowStart': dates[0], 'windowEnd': start, 'snowfallMm': total,
            'snowDepthMm': start_values['SNWD']['value'], 'tminC': start_values['TMIN']['value'],
            'tmaxC': start_values['TMAX']['value'], 'status': 'complete' if complete else 'incomplete',
            'sourceUrl': WEATHER_URL, 'dailySnowfall': daily, 'startObservations': start_values,
            'traceDays': [d['date'] for d in daily if d['snowfall']['trace']],
            'note': 'Fixed start−2 through start daily snowfall sum; not a storm total. Snow depth and '
                    'temperature are on the Event start date. One station measurement, not neighborhood '
                    'snowfall. Trace values retain their flag; the numeric sum is the reported measurable '
                    'amount. Missing or failed-quality values are null, never zero.'}


def source_date(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value/1000, timezone.utc).date().isoformat()
    text = str(value).strip().split()[0]
    for pattern in ('%Y-%m-%d', '%m/%d/%Y', '%m/%d/%y'):
        try:
            return datetime.strptime(text[:10] if pattern == '%Y-%m-%d' else text, pattern).date().isoformat()
        except ValueError:
            pass
    raise ValueError(f'Unrecognized published date: {text}')


def source_rows(raw, event_id):
    rows = []
    for feature in raw['features']:
        p = feature['properties']
        day = p.get('Day')
        if isinstance(day, bool) or day not in (1, 2, 3):
            raise ValueError(f'Invalid Source Day: {day}')
        rows.append({'id': f"{event_id}:{p.get('OBJECTID', p.get('FID'))}",
                     'sourceId': p.get('OBJECTID', p.get('FID')), 'day': int(day), 'sourceDay': int(day),
                     'lon': p.get('Longitude'), 'lat': p.get('Latitude'),
                     'sourceNeighborhood': p.get('Neighborho', p.get('Neighorhoo')),
                     'sourceDate': source_date(p.get('Call_Taken'))})
    if len({r['id'] for r in rows}) != len(rows):
        raise ValueError(f'Duplicate source IDs in {event_id}')
    return rows


def join_all(rows, features):
    usable = [r for r in rows if all(isinstance(r[c], (int, float)) and math.isfinite(r[c]) for c in ('lon', 'lat'))]
    counts, qa = join_records(usable, features)
    usable_ids = {r['id'] for r in usable}
    for row in rows:
        if row['id'] not in usable_ids:
            row['neighborhoodId'] = None
            qa['unmatched'] += 1
            qa['unmatchedByDay'][row['day']-1] += 1
            qa['unmatchedRecords'].append({'id': row['id'], 'day': row['day'], 'reason': 'missing coordinates'})
    qa['missingCoordinates'] = len(rows) - len(usable)
    return counts, qa


def event_metadata(entry):
    name = re.match(r'Snow_Emergency_(.+?)_Tows', entry['service'])[1]
    start, end = entry['call_taken_date_min'], entry['call_taken_date_max']
    year = int(start[:4])
    season_start = year if int(start[5:7]) >= 7 else year-1
    return {'id': f'{name.lower()}-{year}', 'name': name, 'start': start, 'end': end,
            'season': f'{season_start}–{season_start+1}', 'total': entry['count'],
            'dayTotals': [entry['day_counts'][str(d)] for d in (1, 2, 3)]}


def selected_entries():
    return sorted((e for e in json.loads(AUDIT.read_text())['events'] if 'Victory2' not in e['service']),
                  key=lambda e: e['call_taken_date_min'])


def fetch_sources(entries):
    directory = RAW / 'events'
    directory.mkdir(parents=True, exist_ok=True)
    for entry in entries:
        event = event_metadata(entry)
        fields = ','.join(f for f in FIELDS if f in entry['fields'])
        payload = fetch_layer(entry['url'], fields)
        # Explicit allowlist protects snapshots if a service adds address fields.
        for feature in payload['features']:
            feature['properties'] = {k: v for k, v in feature['properties'].items() if k in FIELDS}
        (directory / f"{event['id']}.geojson").write_text(json.dumps(payload, separators=(',', ':')))
        print('Fetched', event['id'], len(payload['features']), flush=True)
    with urlopen(WEATHER_URL, timeout=90) as response:
        (RAW / f'{STATION}.dly').write_bytes(response.read())
    with urlopen(WEATHER_DOC, timeout=60) as response:
        (RAW / 'ghcn-daily-readme.txt').write_bytes(response.read())
    (directory / 'acquisition.json').write_text(json.dumps({'fetchedAt': datetime.now(timezone.utc).isoformat(),
        'addressesRetained': False, 'sources': [{'id':event_metadata(e)['id'],'url':e['url']} for e in entries],
        'weatherUrl':WEATHER_URL}, indent=2))


def main(fetch=False):
    entries = selected_entries()
    if fetch:
        fetch_sources(entries)
    features = clean_features(json.loads((RAW / 'neighborhoods.geojson').read_text()))
    assert len(features) == 87
    neighborhoods = sorted([{'id':f['properties']['id'],'name':f['properties']['name'],
                             'anchor':interior_anchor(f['geometry'])} for f in features], key=lambda n:n['name'])
    weather_records = parse_dly((RAW / f'{STATION}.dly').read_text())
    events, exports, hashes = [], [], {}
    normalize = lambda n: ''.join(c for c in (n or '').lower() if c.isalnum())
    names = {n['id']:normalize(n['name']) for n in neighborhoods}
    full_names = {n['id']:n['name'] for n in neighborhoods}
    for entry in entries:
        event = event_metadata(entry)
        path = RAW / 'events' / f"{event['id']}.geojson"
        rows = source_rows(json.loads(path.read_text()), event['id'])
        totals = [sum(r['sourceDay']==d for r in rows) for d in (1,2,3)]
        assert len(rows)==event['total'] and totals==event['dayTotals'], (event['id'],len(rows),totals)
        counts, qa = join_all(rows, features)
        differences = Counter((r['sourceNeighborhood'], full_names[r['neighborhoodId']]) for r in rows
                              if r['neighborhoodId'] and normalize(r['sourceNeighborhood']) and
                              normalize(r['sourceNeighborhood']) != names[r['neighborhoodId']])
        qa.update({'sourceLabelField': next((f for f in ('Neighborho','Neighorhoo') if f in entry['fields']), None),
                   'sourceLabelMissing':sum(not (r['sourceNeighborhood'] or '').strip() for r in rows),
                   'sourceLabelDisagreements':sum(bool(r['neighborhoodId'] and normalize(r['sourceNeighborhood']) and
                     normalize(r['sourceNeighborhood']) != names[r['neighborhoodId']]) for r in rows),
                   'sourceLabelDifferences':[{'sourceLabel':label,'joinedNeighborhood':joined,'count':count}
                                             for (label,joined),count in sorted(differences.items())],
                   'boundaryVersion':'Shared unsimplified official Minneapolis_Neighborhoods snapshot',
                   'expectedAddressError':'8–14% in publisher disclaimer; not measured here',
                   'datePrecision':'Published calendar dates; UTC midnight values are dates, not precise tow times',
                   'dayMethod':'Published Source Day; never derived from Call_Taken',
                   'dateMethod':'Start and end from audited published Call_Taken date range; item descriptions may contain typos'})
        sources = [{'name':event['name']+' published tows','url':entry['url']},
                   {'name':'Neighborhood boundaries','url':SOURCES['neighborhoods']},
                   {'name':'NOAA MSP GHCN daily','url':WEATHER_URL}]
        dataset = {'event':event,'neighborhoods':[{**n,'counts':counts[n['id']]} for n in neighborhoods],
                   'quality':qa,'sources':sources,'weather':event_weather(weather_records,event['start'])}
        for i,total in enumerate(totals):
            assert sum(n['counts'][i] for n in dataset['neighborhoods'])+qa['unmatchedByDay'][i]==total
        events.append(dataset)
        exports.extend({**row,'eventId':event['id']} for row in rows)
        hashes[str(path.relative_to(ROOT))] = hashlib.sha256(path.read_bytes()).hexdigest()
        print(event['id'], 'total',event['total'],'matched',qa['matched'],'unmatched',qa['unmatched'],flush=True)
    assert len(events)==10 and sum(d['event']['total'] for d in events)==6118
    assert [sum(d['event']['dayTotals'][i] for d in events) for i in range(3)]==[1287,2583,2248]
    assert len({r['id'] for r in exports})==6118
    all_sources = [d['sources'][0] for d in events] + [
        {'name':'Neighborhood boundaries','url':SOURCES['neighborhoods']},
        {'name':'Water','url':SOURCES['water']}, {'name':'NOAA MSP GHCN daily','url':WEATHER_URL},
        {'name':'GHCN daily format and flags','url':WEATHER_DOC}]
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'snow-emergencies.json').write_text(json.dumps({'events':events,'sources':all_sources,
                                                         'selectionNote':SELECTION_NOTE},separators=(',',':')))
    with (OUT / 'all-neighborhood-day-counts.csv').open('w',newline='') as handle:
        writer = csv.writer(handle)
        writer.writerow(['event_id','event','start','end','season','neighborhood_id','neighborhood','day1','day2','day3','total'])
        for d in events:
            e=d['event']
            for n in d['neighborhoods']:
                writer.writerow([e['id'],e['name'],e['start'],e['end'],e['season'],n['id'],n['name'],*n['counts'],sum(n['counts'])])
            writer.writerow([e['id'],e['name'],e['start'],e['end'],e['season'],'','Unmatched coordinates',
                             *d['quality']['unmatchedByDay'],d['quality']['unmatched']])
    with (OUT / 'snow-emergencies-weather.csv').open('w',newline='') as handle:
        writer=csv.writer(handle)
        writer.writerow(['event_id','station_id','window_start','window_end','snowfall_mm','snow_depth_mm','tmin_c','tmax_c','status','trace_days'])
        for d in events:
            w=d['weather']
            writer.writerow([d['event']['id'],w['stationId'],w['windowStart'],w['windowEnd'],w['snowfallMm'],
                             w['snowDepthMm'],w['tminC'],w['tmaxC'],w['status'],';'.join(w['traceDays'])])
    # Public exports are aggregate only; redacted source points remain in local raw snapshots.
    for name in ('neighborhoods.geojson','water.geojson',f'{STATION}.dly','ghcn-daily-readme.txt'):
        path=RAW/name
        hashes[str(path.relative_to(ROOT))]=hashlib.sha256(path.read_bytes()).hexdigest()
    provenance={'method':'Shapely covers on shared unsimplified polygons; multiple matches, outside boundaries and missing coordinates remain unmatched.',
                'recordsContainAddresses':False,'sourceHashes':hashes,'shapelyVersion':__import__('shapely').__version__,
                'selectionNote':SELECTION_NOTE,'sources':all_sources,'acquisition':json.loads((RAW/'events/acquisition.json').read_text()),
                'weatherMethod':events[0]['weather']['note'],'events':[{'event':d['event'],'quality':d['quality'],'weather':d['weather']} for d in events]}
    (OUT/'snow-emergencies-provenance.json').write_text(json.dumps(provenance,indent=2))


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--fetch',action='store_true')
    main(parser.parse_args().fetch)
