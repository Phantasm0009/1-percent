#!/usr/bin/env python3
"""
Simple HTTP server for testing the Daily 1% app locally.
Serves files with proper MIME types for ES6 modules.
"""

import http.server
import socketserver
import os
import sys
import mimetypes
import urllib.parse
import email.utils
import datetime

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        # Ensure JavaScript files are served with correct MIME type
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript', None
        
        # Use mimetypes for other files, ensuring we return a proper tuple
        mime_type, encoding = mimetypes.guess_type(path)
        return mime_type or 'application/octet-stream', encoding

    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Add cache control headers for development (force fresh content)
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        super().end_headers()

def start_server(port=8000):
    """Start the development server."""
    try:
        # Change to the directory containing this script
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Daily 1% Development Server")
            print(f"📡 Server running at: http://localhost:{port}")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"🔗 Open your browser to: http://localhost:{port}")
            print(f"⚡ Press Ctrl+C to stop the server")
            print()
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n🛑 Server stopped by user")
                
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Port {port} is already in use. Try a different port:")
            print(f"   python test-server.py {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number. Using default port 8000.")
    
    start_server(port)
