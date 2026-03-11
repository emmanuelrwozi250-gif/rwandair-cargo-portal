#!/usr/bin/env python3
"""Simple dev server with no-cache headers for hot reloading."""
import http.server
import os

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # suppress logs

if __name__ == '__main__':
    port = 4040
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with http.server.HTTPServer(('', port), NoCacheHandler) as httpd:
        print(f'Serving at http://localhost:{port}')
        httpd.serve_forever()
