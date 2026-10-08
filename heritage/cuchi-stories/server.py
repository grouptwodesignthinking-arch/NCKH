#!/usr/bin/env python3
"""Local-only content server. Run: python3 server.py. No third-party dependencies."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import json, sqlite3, secrets, os
ROOT = Path(__file__).resolve().parent
DB = ROOT / 'data' / 'content.sqlite3'
TOKEN = secrets.token_urlsafe(32)
PORT = int(os.environ.get('CUCHI_PORT', '8765'))
DB.parent.mkdir(exist_ok=True)
with sqlite3.connect(DB) as con:
    con.execute('CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL)')
    con.execute('INSERT OR IGNORE INTO content VALUES (1,?)', ((ROOT / 'content.json').read_text(),))
ORIGIN = f'http://127.0.0.1:{PORT}'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Permissions-Policy', 'camera=(self), microphone=()')
        super().end_headers()
    def safe_host(self):
        return self.headers.get('Host') in (f'127.0.0.1:{PORT}', f'localhost:{PORT}')
    def reply(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def do_GET(self):
        if not self.safe_host(): return self.reply(403, {'error':'Invalid host'})
        path = urlsplit(self.path).path
        if path == '/api/content':
            with sqlite3.connect(DB) as con:
                stories = json.loads(con.execute('SELECT body FROM content WHERE id=1').fetchone()[0])
            return self.reply(200, {'app':'cuchi-stories', 'stories':stories, 'csrf':TOKEN})
        if path == '/health': return self.reply(200, {'ok':True})
        if path.startswith('/assets/'):
            resolved = (ROOT / path.lstrip('/')).resolve()
            if not resolved.is_relative_to(ROOT / 'assets'): return self.reply(403, {'error':'Forbidden'})
        if path not in ('/', '/index.html', '/styles.css', '/app.js', '/credits.js') and not path.startswith('/assets/'):
            return self.reply(404, {'error':'Not found'})
        return super().do_GET()
    def do_PUT(self):
        if not self.safe_host() or urlsplit(self.path).path != '/api/content':
            return self.reply(403, {'error':'Forbidden'})
        if self.headers.get('Origin') not in (None, ORIGIN, f'http://localhost:{PORT}'):
            return self.reply(403, {'error':'Invalid origin'})
        if not secrets.compare_digest(self.headers.get('X-CSRF-Token',''),TOKEN):
            return self.reply(403, {'error':'Invalid token'})
        try:
            length = int(self.headers.get('Content-Length','0'))
            if not 0 < length <= 180000: raise ValueError('Request size')
            data = json.loads(self.rfile.read(length))
            defaults = json.loads((ROOT/'content.json').read_text())
            if not isinstance(data,list) or len(data)!=len(defaults): raise ValueError('Story count')
            limits={'title':100,'excerpt':400,'lead':400,'body':12000,'stamp':24,'question':300,'explanation':1000}
            for item, original in zip(data, defaults):
                for key in ('id','code','image','category'):
                    if item.get(key)!=original[key]: raise ValueError('Immutable key')
                for key, limit in limits.items():
                    if not isinstance(item.get(key),str) or not 0<len(item[key].strip())<=limit: raise ValueError(key)
                if type(item.get('minutes')) is not int or not 1<=item['minutes']<=60: raise ValueError('Minutes')
                if type(item.get('answer')) is not int or item['answer'] not in range(3): raise ValueError('Answer')
                if not isinstance(item.get('options'),list) or len(item['options'])!=3: raise ValueError('Options')
                if any(not isinstance(o,str) or not 0<len(o.strip())<=300 for o in item['options']): raise ValueError('Option')
            with sqlite3.connect(DB) as con:
                con.execute('UPDATE content SET body=? WHERE id=1',(json.dumps(data,ensure_ascii=False),))
            self.reply(200, {'ok':True})
        except (ValueError,TypeError,KeyError,json.JSONDecodeError): self.reply(400, {'error':'Invalid content'})
if __name__ == '__main__':
    print(f'Củ Chi Stories: {ORIGIN}', flush=True)
    ThreadingHTTPServer(('127.0.0.1',PORT),Handler).serve_forever()
