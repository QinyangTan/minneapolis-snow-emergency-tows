import csv
import json
import unittest
from pathlib import Path
from shapely.geometry import shape, Point

ROOT=Path(__file__).parents[1]
class SnapshotTests(unittest.TestCase):
    def test_bridge_counts_conserve_source_records(self):
        data=json.loads((ROOT/'public/data/bridge.json').read_text())
        self.assertEqual(data['event']['dayTotals'],[86,418,348])
        self.assertEqual(data['event']['total'],852)
        self.assertEqual(len(data['neighborhoods']),87)
        for i,total in enumerate(data['event']['dayTotals']):
            self.assertEqual(sum(n['counts'][i] for n in data['neighborhoods'])+data['quality']['unmatchedByDay'][i],total)
        self.assertEqual(data['quality']['matched']+data['quality']['unmatched'],852)
        self.assertEqual(next(n['counts'] for n in data['neighborhoods'] if n['name']=='Marcy Holmes'),[26,62,1])
    def test_every_anchor_is_inside_original_boundary(self):
        raw=json.loads((ROOT/'data/raw/neighborhoods.geojson').read_text())
        polygons={str(f['properties']['BDNUM']):shape(f['geometry']) for f in raw['features']}
        data=json.loads((ROOT/'public/data/bridge.json').read_text())
        for n in data['neighborhoods']:
            self.assertTrue(polygons[n['id']].contains(Point(n['anchor'])),n['name'])
    def test_public_csv_matches_interactive_data(self):
        with (ROOT/'public/data/neighborhood-day-counts.csv').open() as handle:
            rows=list(csv.DictReader(handle))
        self.assertEqual(len(rows),88)
        self.assertEqual(sum(int(r['total']) for r in rows),852)
        self.assertEqual([sum(int(r['day'+str(d)]) for r in rows) for d in [1,2,3]],[86,418,348])
if __name__=='__main__':unittest.main()
