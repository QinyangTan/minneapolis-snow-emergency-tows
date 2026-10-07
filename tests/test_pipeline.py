"""Offline regression tests: no network, no raw public address data."""
import sys
import unittest
from pathlib import Path
from shapely.geometry import Polygon, mapping

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from build_data import parse_day, aggregate, EVENTS, clean_key, service_for


class DataPipelineTests(unittest.TestCase):
    def setUp(self):
        self.areas = [
            ("West", mapping(Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])), None),
            ("East", mapping(Polygon([(1, 0), (2, 0), (2, 1), (1, 1)])), None)
        ]

    def test_day_parsing_is_strict(self):
        self.assertEqual(parse_day({"Day": 1}), 1)
        self.assertEqual(parse_day({"Day": "Day 2"}), 2)
        self.assertEqual(parse_day({"Day": "3.0"}), 3)
        for bad in (0, 4, None, True, "Day 5", "Day 2 and 3"):
            with self.assertRaises(ValueError):
                parse_day({"Day": bad})

    def test_service_matching_is_unambiguous(self):
        services = [{"name": "Snow_Emergency_Dover_Tows_2023",
                     "type": "FeatureServer"}]
        self.assertIn("Dover_Tows_2023", service_for("Dover", services))
        with self.assertRaises(ValueError):
            service_for("Jane", services)
        self.assertEqual(clean_key("Victory 1"), "victory1")

    def test_reconcile_counts_and_recurring_neighborhoods(self):
        sample = [(event, day, "West" if day != 3 else "East")
                  for event, _, _ in EVENTS for day in (1, 2, 3)]
        summary, geojson = aggregate(sample, self.areas)
        self.assertEqual(summary["total"], 27)
        self.assertEqual([d["count"] for d in summary["days"]], [9, 9, 9])
        self.assertEqual(summary["neighborhoods"][0]["event_count"], 9)
        self.assertEqual(summary["neighborhoods"][1]["event_count"], 9)
        self.assertEqual(sum(e["total"] for e in summary["events"]), 27)
        self.assertEqual(geojson["features"][0]["properties"]["byEvent"]["Bridge"]["days"]["2"], 1)

    def test_incomplete_events_are_rejected(self):
        incomplete = [(e, d, "West")
                      for e, _, _ in EVENTS for d in (1, 2, 3)
                      if not (e == "Bridge" and d == 2)]
        with self.assertRaisesRegex(ValueError, "Incomplete"):
            aggregate(incomplete, self.areas)


if __name__ == "__main__":
    unittest.main()
