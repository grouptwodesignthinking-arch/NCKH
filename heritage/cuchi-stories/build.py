#!/usr/bin/env python3
"""Package the app as a standalone HTML. Python standard library only."""
from pathlib import Path
import base64,json,re
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text()
css=(ROOT/'styles.css').read_text()
for rel in set(re.findall(r'url\((assets/[^)]+)\)',css)):
    encoded=base64.b64encode((ROOT/rel).read_bytes()).decode()
    css=css.replace(rel,'data:'+({'ttf':'font/ttf','otf':'font/otf','woff':'font/woff','woff2':'font/woff2','webp':'image/webp','png':'image/png'}[Path(rel).suffix[1:]])+';base64,'+encoded)
assets={}
for file in (ROOT/'assets').glob('*.webp'):
    assets[file.name]='data:image/webp;base64,'+base64.b64encode(file.read_bytes()).decode()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
html=html.replace('<script src="credits.js"></script>','<script>'+(ROOT/'credits.js').read_text()+'</script>')
# Bộ đọc QR jsQR (Apache-2.0), three.js r149 (MIT) và lớp 3D cuchi3d.js nhúng sẵn để chạy offline.
for lib in ('jsQR.js','three.min.js','cuchi3d.js'):
    html=html.replace(f'<script src="assets/{lib}"></script>','<script>'+(ROOT/'assets'/lib).read_text().replace('</script','<\\/script')+'</script>')
html=html.replace('<script src="app.js"></script>','<script>window.CUCHI_STANDALONE=true;window.CUCHI_ASSETS='+json.dumps(assets)+';</script><script>'+(ROOT/'app.js').read_text()+'</script>')
output=ROOT.parent/'Cu-Chi-Stories-Heritage.html'
output.write_text(html)
print(f'{output.name}: {output.stat().st_size/1024/1024:.2f} MB')
