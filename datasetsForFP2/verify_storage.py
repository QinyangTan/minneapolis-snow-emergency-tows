"""Verify the complete FP2 storage package; optionally restore compressed JSON."""
import argparse, gzip, hashlib, json
from pathlib import Path
root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--restore', action='store_true')
args = parser.parse_args()
manifest = json.loads((root / 'STORAGE_MANIFEST.json').read_text(encoding='utf-8-sig'))
for item in manifest['files']:
    path = root / item['stored_path']
    raw = path.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == item['stored_sha256'], str(path)
    original = gzip.decompress(raw) if item['compression'] != 'none' else raw
    assert hashlib.sha256(original).hexdigest() == item['original_sha256'], item['original_path']
    if args.restore and item['compression'] != 'none':
        target = root / item['original_path']
        if target.exists():
            assert target.read_bytes() == original, f'Refusing to overwrite different file: {target}'
        else:
            target.write_bytes(original)
print(f"Verified {len(manifest['files'])} stored files and all original SHA-256 hashes.")
