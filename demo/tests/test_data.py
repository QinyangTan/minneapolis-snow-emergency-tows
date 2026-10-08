import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('build_data', Path(__file__).parents[1] / 'scripts/build_data.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

POLYGONS = [
    {'type':'Feature','properties':{'id':'a','name':'A'},'geometry':{'type':'Polygon','coordinates':[[[0,0],[2,0],[2,2],[0,2],[0,0]],[[.5,.5],[1,.5],[1,1],[.5,1],[.5,.5]]]}},
    {'type':'Feature','properties':{'id':'b','name':'B'},'geometry':{'type':'Polygon','coordinates':[[[2,0],[4,0],[4,2],[2,2],[2,0]]]}}
]

class SpatialJoinTests(unittest.TestCase):
    def test_holes_outside_and_boundaries_are_not_guessed(self):
        rows=[{'id':'1','lon':.2,'lat':.2,'day':1}, {'id':'2','lon':3,'lat':1,'day':2},
              {'id':'3','lon':.8,'lat':.8,'day':3}, {'id':'4','lon':9,'lat':9,'day':2},
              {'id':'5','lon':2,'lat':1,'day':1}]
        counts,qa=module.join_records(rows,POLYGONS)
        self.assertEqual(counts['a'],[1,0,0])
        self.assertEqual(counts['b'],[0,1,0])
        self.assertEqual(qa['unmatchedByDay'],[1,1,1])
        self.assertEqual(qa['ambiguousBoundary'],1)
        self.assertEqual(qa['matched']+qa['unmatched'],len(rows))

    def test_source_day_is_required(self):
        with self.assertRaises(ValueError):
            module.join_records([{'id':'1','lon':.2,'lat':.2,'day':4}],POLYGONS)

    def test_anchor_is_in_polygon_not_in_hole(self):
        from shapely.geometry import Point, shape
        anchor=module.interior_anchor(POLYGONS[0]['geometry'])
        self.assertTrue(shape(POLYGONS[0]['geometry']).contains(Point(anchor)))

if __name__=='__main__': unittest.main()
