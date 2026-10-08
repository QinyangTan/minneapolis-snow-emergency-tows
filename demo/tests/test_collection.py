import importlib.util
import csv
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('build_collection', ROOT / 'scripts/build_collection.py')
module = None
if spec and Path(spec.origin).exists():
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)


def month(element, values, year=2025, number=2):
    cells = ['-9999   '] * 31
    for day, (value, mflag, qflag, sflag) in values.items():
        cells[day-1] = f'{value:5d}{mflag}{qflag}{sflag}'
    return f'USW00014922{year:04d}{number:02d}{element}' + ''.join(cells)


class CollectionTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(module, 'collection builder is required')

    def test_weather_missing_and_quality_flags_are_not_numeric_zero(self):
        text = month('SNOW', {6: (5, ' ', ' ', 'W'), 7: (0, 'T', ' ', 'W'), 8: (3, ' ', 'X', 'W')})
        records = module.parse_dly(text)
        self.assertEqual(records['2025-02-06']['SNOW']['value'], 5)
        self.assertTrue(records['2025-02-07']['SNOW']['trace'])
        self.assertIsNone(records['2025-02-08']['SNOW']['value'])
        self.assertEqual(records['2025-02-08']['SNOW']['qflag'], 'X')
        self.assertIsNone(records['2025-02-09']['SNOW']['value'])
        self.assertNotIn('2025-02-29', records)

    def test_fixed_weather_window_and_start_date_temperature_units(self):
        text = '\n'.join([
            month('SNOW', {5:(99,' ',' ','W'), 6:(5,' ',' ','W'), 7:(0,'T',' ','W'), 8:(15,' ',' ','W'), 9:(99,' ',' ','W')}),
            month('SNWD', {8:(102,' ',' ','W')}),
            month('TMIN', {8:(-115,' ',' ','W')}),
            month('TMAX', {8:(-23,' ',' ','W')})])
        weather = module.event_weather(module.parse_dly(text), '2025-02-08')
        self.assertEqual(weather['windowStart'], '2025-02-06')
        self.assertEqual(weather['windowEnd'], '2025-02-08')
        self.assertEqual(weather['snowfallMm'], 20)
        self.assertEqual(weather['snowDepthMm'], 102)
        self.assertEqual((weather['tminC'], weather['tmaxC']), (-11.5, -2.3))
        self.assertEqual(weather['traceDays'], ['2025-02-07'])
        self.assertEqual(weather['status'], 'complete')

    def test_one_missing_window_day_keeps_sum_missing(self):
        weather = module.event_weather(module.parse_dly(month('SNOW', {6:(5,' ',' ','W'), 8:(15,' ',' ','W')})), '2025-02-08')
        self.assertIsNone(weather['snowfallMm'])
        self.assertIsNone(weather['snowDepthMm'])
        self.assertEqual(weather['status'], 'incomplete')

    def test_window_crosses_year_boundary(self):
        records = module.parse_dly('\n'.join([month('SNOW', {30:(1,' ',' ','W'),31:(2,' ',' ','W')},2024,12), month('SNOW',{1:(3,' ',' ','W')},2025,1)]))
        weather = module.event_weather(records, '2025-01-01')
        self.assertEqual(weather['snowfallMm'], 6)
        self.assertEqual(weather['windowStart'], '2024-12-30')

    def test_source_day_survives_date_and_missing_coordinates_remain_unmatched(self):
        polygons = [{'type':'Feature','properties':{'id':'a','name':'A'}, 'geometry':{'type':'Polygon','coordinates':[[[0,0],[2,0],[2,2],[0,2],[0,0]]]}}]
        raw = {'features':[
            {'properties':{'FID':1,'Day':3,'Longitude':1,'Latitude':1,'Call_Taken':1738972800000,'Neighorhoo':'A'}},
            {'properties':{'FID':2,'Day':2,'Longitude':None,'Latitude':None,'Call_Taken':'2025-02-08'}}]}
        rows = module.source_rows(raw, 'omega-2025')
        counts, qa = module.join_all(rows, polygons)
        self.assertEqual(rows[0]['sourceDay'], 3)
        self.assertEqual(rows[0]['sourceDate'], '2025-02-08')
        self.assertEqual(rows[0]['sourceNeighborhood'], 'A')
        self.assertEqual(rows[0]['id'], 'omega-2025:1')
        self.assertEqual(counts['a'], [0,0,1])
        self.assertEqual(qa['unmatchedByDay'], [0,1,0])
        self.assertEqual(qa['unmatchedRecords'][0]['reason'], 'missing coordinates')
        self.assertEqual(qa['matched'] + qa['unmatched'], 2)

    def test_fractional_source_day_is_rejected(self):
        with self.assertRaises(ValueError):
            module.source_rows({'features':[{'properties':{'FID':1,'Day':1.5}}]}, 'bad')

    def test_published_timestamp_string_retains_its_calendar_date(self):
        self.assertEqual(module.source_date('11/29/2022 09:49pm'), '2022-11-29')
        self.assertEqual(module.source_date('2025-12-10'), '2025-12-10')

    def test_all_events_reconcile_and_use_identical_anchors(self):
        path = ROOT / 'public/data/snow-emergencies.json'
        self.assertTrue(path.exists(), 'collection output is required')
        data = json.loads(path.read_text())
        self.assertEqual(len(data['events']), 10)
        self.assertEqual(sum(d['event']['total'] for d in data['events']), 6118)
        self.assertEqual([sum(d['event']['dayTotals'][i] for d in data['events']) for i in range(3)], [1287,2583,2248])
        anchors = [(n['id'],n['anchor']) for n in data['events'][0]['neighborhoods']]
        self.assertEqual(len(anchors), 87)
        dates = [d['event']['start'] for d in data['events']]
        self.assertEqual(dates, sorted(dates))
        for d in data['events']:
            self.assertEqual([(n['id'],n['anchor']) for n in d['neighborhoods']], anchors)
            self.assertEqual(d['quality']['matched']+d['quality']['unmatched'], d['event']['total'])
            for i,total in enumerate(d['event']['dayTotals']):
                self.assertEqual(sum(n['counts'][i] for n in d['neighborhoods'])+d['quality']['unmatchedByDay'][i], total)
            self.assertIsNotNone(d['weather'])
        bridge = next(d for d in data['events'] if d['event']['id']=='bridge-2025')
        self.assertEqual(bridge['event']['dayTotals'], [86,418,348])

    def test_source_label_changes_are_reported_without_changing_spatial_counts(self):
        data=json.loads((ROOT/'public/data/snow-emergencies.json').read_text())
        omega=next(d for d in data['events'] if d['event']['name']=='Omega')
        self.assertIn('sourceLabelDifferences', omega['quality'])
        self.assertEqual(omega['quality']['sourceLabelDifferences'], [
            {'sourceLabel':'CARAG','joinedNeighborhood':'South Uptown','count':89},
            {'sourceLabel':'ECCO','joinedNeighborhood':'East Bde Maka Ska','count':45}])
        self.assertEqual(omega['quality']['matched'],695)
        glenwood=next(d for d in data['events'] if d['event']['name']=='Glenwood')
        self.assertIsNone(glenwood['quality']['sourceLabelField'])
        self.assertEqual(glenwood['quality']['sourceLabelMissing'],719)

    def test_aggregate_csv_conserves_published_records_and_raw_snapshots_are_redacted(self):
        with (ROOT/'public/data/all-neighborhood-day-counts.csv').open() as handle:
            rows=list(csv.DictReader(handle))
        self.assertEqual(len(rows), 880)
        self.assertEqual(sum(int(r['total']) for r in rows), 6118)
        self.assertEqual([sum(int(r['day'+str(d)]) for r in rows) for d in (1,2,3)], [1287,2583,2248])
        ids=[]
        for path in (ROOT/'data/raw/events').glob('*.geojson'):
            raw=json.loads(path.read_text())
            for feature in raw['features']:
                self.assertFalse({'Location','Customer','Address'} & feature['properties'].keys())
            ids.extend(r['id'] for r in module.source_rows(raw,path.stem))
        self.assertEqual(len(ids), 6118)
        self.assertEqual(len(set(ids)), 6118)


if __name__ == '__main__':
    unittest.main()
