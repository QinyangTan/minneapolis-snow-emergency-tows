"""Package the root-path production build for local demonstrations (Node 20+)."""
from pathlib import Path
import shutil, zipfile, hashlib, json
root=Path(__file__).resolve().parents[1]
package=root.parent/'demo-package'
package.mkdir(exist_ok=True)
shutil.copytree(root/'build',package/'site',dirs_exist_ok=True)
shutil.copy2(root/'scripts/fp2-demo-server.mjs',package/'demo-server.mjs')
(package/'start-demo.cmd').write_text('@echo off\ncd /d "%~dp0"\nnode demo-server.mjs\npause\n',encoding='ascii')
(package/'README.txt').write_text('FP2 DEMO\n\nRequires Node.js 20 or newer. No npm installation needed.\nWindows: double-click start-demo.cmd.\nOther systems: run node demo-server.mjs in this folder.\nOpen http://127.0.0.1:4175/fp2/\nKeep the server window open; Ctrl+C stops it.\n\nAll data is bundled. Optional web fonts fall back to local fonts offline.\nDo not double-click site/fp2/index.html; use the local server.\n',encoding='utf8')
output=root/'deliverables/FP2/FP2-demo.zip'
with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(package.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(package).as_posix())
with zipfile.ZipFile(output) as z:
 assert z.testzip() is None
 assert 'site/fp2/index.html' in z.namelist()
 assert 'site/data/fp2-context.json' in z.namelist()
print(json.dumps({'file':str(output),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest()}))
