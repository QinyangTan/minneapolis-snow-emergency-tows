#!/usr/bin/env python3
"""Turn REAL Google Maps Chromium screenshots into a compact animated README demo.

This only resizes/labels browser-captured pixels and cross-fades between real UI
states. It does not synthesize map geometry, data or extension screens.
Usage: python3 scripts/build-google-maps-demo-gif.py artifacts docs/demos/google-maps-extension-demo.gif
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys

STAGES = [
    ("live-map-overlay-initial.png", "LIVE GOOGLE MAPS   |   87 neighborhood tow-count overlays"),
    ("live-map-overlay-bridge-day2.png", "BRIDGE   |   Day 2 historical tow records"),
    ("live-map-overlay-neighborhood.png", "MARCY HOLMES   |   inspect the selected neighborhood"),
    ("live-map-overlay-recurrence.png", "RECURRING HOTSPOTS   |   compare all nine events"),
    ("live-map-overlay-top10.png", "TOP 10 PROMINENCE   |   change the recurrence rule"),
    ("live-map-overlay-fingerprints.png", "EVENT FINGERPRINTS   |   100% normalized Day 1-3 profiles"),
    ("live-map-overlay-after-zoom.png", "NATIVE GOOGLE MAPS ZOOM   |   overlay reprojects"),
    ("live-map-overlay-after-drag.png", "NATIVE GOOGLE MAPS PAN   |   overlay follows the map"),
]

def generate(in_dir: Path, out_path: Path) -> None:
    if len(STAGES) < 8:
        raise RuntimeError("Demo should include distinct interactions, not a slideshow of one view")
    missing = [name for name, _ in STAGES if not (in_dir / name).is_file()]
    if missing:
        raise FileNotFoundError("Missing genuine browser captures: " + ", ".join(missing))
    canvas_width, image_height, caption_height = 960, 680, 48
    font_file = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    font = ImageFont.truetype(font_file, 16) if Path(font_file).exists() else ImageFont.load_default()
    built = []
    for i, (name, description) in enumerate(STAGES, start=1):
        with Image.open(in_dir / name) as source:
            if source.width < 950 or source.height < 700:
                raise ValueError(name + " is too small to demonstrate the actual Google Maps UI")
            # Small output protects repo size; preserve screenshots' aspect without stretching.
            snapshot = source.convert("RGB").resize((canvas_width, image_height), Image.Resampling.LANCZOS)
        frame = Image.new("RGB", (canvas_width, image_height + caption_height), "#102f45")
        frame.paste(snapshot, (0, 0))
        drawer = ImageDraw.Draw(frame)
        drawer.rectangle((0, image_height, canvas_width, image_height + caption_height), fill="#123952")
        drawer.text((21, image_height + 12), description, fill="#f5fcff", font=font)
        drawer.text((916, image_height + 12), str(i) + "/8", fill="#bad9ea", font=font)
        built.append(frame)
    timeline = []
    durations = []
    for index, frame in enumerate(built):
        # A pause keeps the legend/labels readable. Transitions are edits between
        # actual captured UI states, not fake user interaction frames.
        timeline.append(frame)
        durations.append(1350 if index in (0, 3, 5) else 1150)
        if index < len(built) - 1:
            next_frame = built[index + 1]
            for strength in (0.20, 0.40, 0.60, 0.80):
                timeline.append(Image.blend(frame, next_frame, strength))
                durations.append(90)
    # A shared palette avoids color-ramping flicker across urban basemap scenes.
    atlas = Image.new("RGB", (canvas_width * 2, (image_height + caption_height) * 4))
    for index, frame in enumerate(built):
        atlas.paste(frame, ((index % 2) * canvas_width, (index // 2) * (image_height + caption_height)))
    palette = atlas.quantize(colors=192, method=Image.Quantize.MEDIANCUT)
    frames = [item.quantize(palette=palette, dither=Image.Dither.NONE) for item in timeline]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(out_path, save_all=True, append_images=frames[1:],
                   duration=durations, loop=0, disposal=2, optimize=True)
    result_bytes=out_path.stat().st_size
    if result_bytes > 18_000_000:
        raise RuntimeError(f"GIF too large for a README: {result_bytes:,} bytes")
    print(f"Created {out_path}, {result_bytes:,} bytes, {len(frames)} actual-scene/transition frames, " 
          f"{sum(durations) / 1000:.1f}s total, sources: {[name for name,_ in STAGES]}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: build-google-maps-demo-gif.py <screenshots-dir> <output.gif>")
    generate(Path(sys.argv[1]), Path(sys.argv[2]))
