"""Reproducible City of Minneapolis Snow Emergency tow data preparation.

Only public neighborhood aggregates are exported; raw addresses and tow points
remain in memory. Integrity errors stop publication instead of dropping records.
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sys

import requests
from shapely.geometry import Point, shape, mapping

BASE = "https://services.arcgis.com/afSMGVsC7QlRK1kZ/ArcGIS/rest/services"
EVENTS = [
    ("Dover", "2022/23", 631), ("Jane", "2022/23", 584),
    ("Lourdes", "2022/23", 435), ("Northrop", "2022/23", 465),
    ("Victory 1", "2022/23", 506), ("Howard", "2024/25", 665),
    ("Bridge", "2025/26", 852), ("Glenwood", "2025/26", 719),
    ("Jefferson", "2025/26", 566),
]
KNOWN = {
    "Bridge": "Snow_Emergency_Bridge_Tows_2025",
    "Howard": "Snow_Emergency_Howard_Tows_2024",
}
OUT = Path(__file__).resolve().parents[1] / "static" / "data"


def api(url, **params):
    response = requests.get(url, params={"f": "json", **params}, timeout=90)
    response.raise_for_status()
    obj = response.json()
    if not isinstance(obj, dict) or "error" in obj:
        raise ValueError(f"ArcGIS query error at {url}: {str(obj)[:300]}")
    return obj


def clean_key(value):
    return re.sub("[^a-z0-9]", "", value.lower())


def parse_day(properties):
    value = next((v for k, v in properties.items() if clean_key(k) == "day"), None)
    if value is None or isinstance(value, bool):
        raise ValueError(f"Invalid day: {value!r}")
    match = re.fullmatch(r"(?:day\s*)?([123])(?:\.0)?", str(value).strip(), re.I)
    if not match:
        raise ValueError(f"Invalid day: {value!r}")
    return int(match.group(1))


def discover():
    services, start, seen = [], 1, set()
    while True:
        page = api(BASE + "/", start=start, num=1000)
        services.extend(page.get("services", []))
        nxt = page.get("nextStart", -1)
        if not isinstance(nxt, int) or nxt <= 0:
            return services
        if nxt == start or nxt in seen:
            raise ValueError("Repeated directory page")
        seen.add(nxt)
        start = nxt


def service_for(event, services):
    if event in KNOWN:
        return BASE + "/" + KNOWN[event] + "/FeatureServer"
    candidates = sorted(set(
        BASE + "/" + entry["name"] + "/FeatureServer"
        for entry in services
        if entry.get("type") == "FeatureServer"
        and "snowemergency" in clean_key(entry["name"])
        and "tow" in clean_key(entry["name"])
        and clean_key(event) in clean_key(entry["name"])
    ))
    if len(candidates) != 1:
        raise ValueError(f"Ambiguous or missing City service for {event}: {candidates}")
    return candidates[0]


def query_features(service, geometry_type):
    layers = api(service).get("layers", [])
    if len(layers) != 1:
        raise ValueError(f"Expected one layer at {service}: {layers}")
    layer = service + "/" + str(layers[0]["id"])
    if api(layer).get("geometryType") != geometry_type:
        raise ValueError(f"Unexpected layer geometry: {layer}")
    endpoint = layer + "/query"
    ids = api(endpoint, where="1=1", returnIdsOnly="true").get("objectIds") or []
    if not ids:
        raise ValueError(f"No records at {layer}")
    records = []
    for offset in range(0, len(ids), 400):
        chunk = ids[offset:offset+400]
        page = api(endpoint, f="geojson", where="1=1",
                   objectIds=",".join(map(str, chunk)), outFields="*",
                   returnGeometry="true", outSR=4326)
        features = page.get("features", [])
        if page.get("type") != "FeatureCollection" or len(features) != len(chunk):
            raise ValueError(f"Truncated ArcGIS response at {layer}")
        records.extend(features)
    return layer, records


def aggregate(records, neighborhoods):
    day_counts, event_counts, event_days = Counter(), Counter(), Counter()
    area_counts, area_days, area_events, area_event_days = (Counter() for _ in range(4))
    for event, day, neighborhood in records:
        day_counts[day] += 1
        event_counts[event] += 1
        event_days[event, day] += 1
        area_counts[neighborhood] += 1
        area_days[neighborhood, day] += 1
        area_events[neighborhood, event] += 1
        area_event_days[neighborhood, event, day] += 1
    for event, _, _ in EVENTS:
        if any(event_days[event, d] == 0 for d in (1, 2, 3)):
            raise ValueError(f"Incomplete day coverage: {event}")
    summary = {
        "status": "recomputed-official-arcgis",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "total": len(records),
        "days": [{"day": d, "count": day_counts[d]} for d in (1, 2, 3)],
        "events": [
            {"id": e, "season": s, "total": event_counts[e],
             "days": [{"day": d, "count": event_days[e, d]} for d in (1, 2, 3)]}
            for e, s, _ in EVENTS
        ],
        "neighborhoods": [
            {"name": n, "total": area_counts[n],
             "days": [{"day": d, "count": area_days[n, d]} for d in (1, 2, 3)],
             "event_count": sum(area_events[n, e] > 0 for e, _, _ in EVENTS)}
            for n, _, _ in neighborhoods
        ]
    }
    if sum(x["total"] for x in summary["neighborhoods"]) != len(records):
        raise ValueError("Neighborhood totals failed reconciliation")
    geography = {"type": "FeatureCollection", "features": []}
    for n, geometry, _ in neighborhoods:
        geography["features"].append({
            "type": "Feature", "geometry": geometry,
            "properties": {
                "name": n, "total": area_counts[n],
                "days": {str(d): area_days[n, d] for d in (1, 2, 3)},
                "byEvent": {
                    e: {"total": area_events[n, e],
                        "days": {str(d): area_event_days[n, e, d] for d in (1, 2, 3)}}
                    for e, _, _ in EVENTS
                }
            }
        })
    return summary, geography


def build():
    services = discover()
    area_layer, area_features = query_features(
        BASE + "/Minneapolis_Neighborhoods/FeatureServer", "esriGeometryPolygon")
    neighborhoods = []
    for f in area_features:
        name = str(f["properties"].get("BDNAME") or "").strip()
        polygon = shape(f["geometry"])
        if not name or polygon.is_empty or name in {n for n, _, _ in neighborhoods}:
            raise ValueError("Bad or duplicate Minneapolis neighborhood")
        neighborhoods.append((name, mapping(polygon), polygon))
    neighborhoods.sort(key=lambda row: row[0])
    records, sources, quality = [], {"neighborhoods": area_layer}, []
    for event, season, preliminary in EVENTS:
        layer, features = query_features(service_for(event, services), "esriGeometryPoint")
        sources[event] = layer
        for feature in features:
            day = parse_day(feature.get("properties") or {})
            geom = feature.get("geometry") or {}
            if geom.get("type") != "Point":
                raise ValueError(f"{event}: missing point geometry")
            coordinates = geom.get("coordinates") or []
            if len(coordinates) < 2:
                raise ValueError(f"{event}: missing coordinates")
            lon, lat = coordinates[:2]
            if not isinstance(lon, (int, float)) or not isinstance(lat, (int, float)):
                raise ValueError(f"{event}: non-numeric coordinates")
            if not (-180 <= lon <= 180 and -90 <= lat <= 90):
                raise ValueError(f"{event}: out-of-range coordinates")
            point = Point(lon, lat)
            matched = [n for n, _, polygon in neighborhoods if polygon.covers(point)]
            if len(matched) != 1:
                raise ValueError(f"{event}: point has {len(matched)} neighborhood matches")
            records.append((event, day, matched[0]))
        quality.append({"event": event, "season": season, "source_layer": layer,
                        "preliminary": preliminary, "retrieved": len(features),
                        "difference": len(features) - preliminary})
    summary, geography = aggregate(records, neighborhoods)
    summary["sources"] = sources
    report = {"events": quality, "actual_total": summary["total"],
              "preliminary_total": 5423,
              "difference": summary["total"] - 5423,
              "note": "Official observed tows; current neighborhood polygons; raw addresses never exported."}
    return summary, geography, report


def save(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    temp.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf8")
    temp.replace(path)


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else OUT
    summary, geography, report = build()
    for filename, value in (("summary.json", summary),
                            ("neighborhoods.geojson", geography),
                            ("quality.json", report)):
        save(target / filename, value)
    print(f"PASS: {summary['total']} observed tows, 9 complete events, "
          f"{len(summary['neighborhoods'])} neighborhoods.")
    print(f"Review {target / 'quality.json'} before publishing.")
