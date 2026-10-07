"""Regression tests for the public, checked-in ArcGIS aggregates.

A dataset refresh may change counts. Tests enforce conservation and semantics,
not hard-code the FP1 preliminary values.
"""
import json
from pathlib import Path
import unittest

DATA = Path(__file__).resolve().parents[1] / "static" / "data"


class BundledDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.summary = json.loads((DATA / "summary.json").read_text())
        cls.geo = json.loads((DATA / "neighborhoods.geojson").read_text())
        cls.quality = json.loads((DATA / "quality.json").read_text())
        cls.by_name = {
            row["name"]: row for row in cls.summary["neighborhoods"]
        }

    def test_source_and_event_day_counts_reconcile(self):
        s = self.summary
        self.assertEqual(s["status"], "recomputed-official-arcgis")
        self.assertEqual(len(s["events"]), 9)
        self.assertEqual(s["total"], sum(row["count"] for row in s["days"]))
        self.assertEqual(s["total"], sum(row["total"] for row in s["events"]))
        for event in s["events"]:
            self.assertEqual(len(event["days"]), 3)
            self.assertEqual({row["day"] for row in event["days"]}, {1, 2, 3})
            self.assertEqual(event["total"], sum(d["count"] for d in event["days"]))

    def test_neighborhood_counts_and_outside_boundary_records_reconcile(self):
        s = self.summary
        polygons = self.geo["features"]
        self.assertEqual(self.geo["type"], "FeatureCollection")
        self.assertEqual(len(polygons), len(s["neighborhoods"]))
        self.assertEqual(len(self.by_name), len(polygons))
        self.assertEqual(
            sum(n["total"] for n in s["neighborhoods"])
            + s["unassigned_neighborhood_count"], s["total"]
        )
        for row in s["neighborhoods"]:
            self.assertEqual(row["total"], sum(d["count"] for d in row["days"]))
            self.assertTrue(0 <= row["event_count"] <= len(s["events"]))

    def test_map_features_drive_matrix_and_signature_views(self):
        events = [row["id"] for row in self.summary["events"]]
        for feature in self.geo["features"]:
            p = feature["properties"]
            self.assertIn(feature["geometry"]["type"], ("Polygon", "MultiPolygon"))
            self.assertIn(p["name"], self.by_name)
            self.assertEqual(set(p["byEvent"]), set(events))
            self.assertEqual(p["total"], self.by_name[p["name"]]["total"])
            self.assertEqual(sum(p["days"].values()), p["total"])
            self.assertEqual(sum(p["byEvent"][e]["total"] for e in events), p["total"])
            self.assertEqual(
                sum(p["byEvent"][e]["total"] > 0 for e in events),
                self.by_name[p["name"]]["event_count"]
            )
            for day in ("1", "2", "3"):
                self.assertEqual(
                    sum(p["byEvent"][e]["days"][day] for e in events),
                    p["days"][day]
                )

    def test_quality_report_and_sources(self):
        q, s = self.quality, self.summary
        self.assertEqual(q["actual_total"], s["total"])
        self.assertEqual(q["unassigned_neighborhood_count"], s["unassigned_neighborhood_count"])
        self.assertEqual(len(q["events"]), 9)
        for row in q["events"]:
            self.assertEqual(row["retrieved"], next(e["total"] for e in s["events"]
                                                    if e["id"] == row["event"]))
            self.assertIn(row["event"], s["sources"])
            self.assertTrue(s["sources"][row["event"]].startswith("https://services.arcgis.com/"))


if __name__ == "__main__":
    unittest.main()
