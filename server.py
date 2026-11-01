"""
Local HTTP Server and REST API for MCE Hassan CSE Timetable AI Chatbot.
Uses standard Python library (zero dependencies required).
"""

import json
import mimetypes
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from chatbot_core import (
    TIMETABLE,
    answer_query,
    get_current_day_and_time,
    get_status_at,
    get_all_faculty_list,
    get_batches_info,
    get_venues_info,
    format_day_schedule
)

# Ensure UTF-8 output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = Path(__file__).parent.resolve()
DEFAULT_PORT = 8000

class TimetableApiHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def _send_json(self, data: dict, status_code: int = 200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/timetable":
            self._send_json(TIMETABLE)
            return

        if path == "/api/status":
            custom_day = query.get("day", [None])[0]
            custom_time = query.get("time", [None])[0]
            day, time_str, _ = get_current_day_and_time(custom_day, custom_time)
            status = get_status_at(day, time_str)
            self._send_json(status)
            return

        if path == "/api/schedule":
            day = query.get("day", ["Monday"])[0]
            sched_text = format_day_schedule(day)
            self._send_json({"day": day, "schedule_markdown": sched_text})
            return

        if path == "/api/faculty":
            self._send_json({"faculty": TIMETABLE["faculty_directory"], "markdown": get_all_faculty_list()})
            return

        if path == "/api/venues":
            self._send_json({"venues": TIMETABLE["venues"], "markdown": get_venues_info()})
            return

        if path == "/api/batches":
            self._send_json({"batches": TIMETABLE["batches_25CS307BC"], "markdown": get_batches_info()})
            return

        # Serve static files (HTML, CSS, JS, JSON, images)
        if path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(post_body)
            except Exception:
                payload = {}

            query = payload.get("query", "")
            simulated_day = payload.get("simulated_day")
            simulated_time = payload.get("simulated_time")

            response_text = answer_query(query, simulated_day, simulated_time)
            day, time_str, _ = get_current_day_and_time(simulated_day, simulated_time)
            status = get_status_at(day, time_str)

            self._send_json({
                "query": query,
                "response": response_text,
                "simulated_day": day,
                "simulated_time": time_str,
                "status": status
            })
            return

        self._send_json({"error": "Endpoint not found"}, 404)

def run_server(port: int = DEFAULT_PORT):
    server_address = ("", port)
    HTTPServer.allow_reuse_address = True
    try:
        httpd = HTTPServer(server_address, TimetableApiHandler)
        print("=" * 65)
        print("🎓  MCE HASSAN CSE III SEM 'C' - AI TIMETABLE SERVER")
        print(f"📡  Server running at http://localhost:{port}/")
        print(f"📂  Serving files from: {BASE_DIR}")
        print("Press Ctrl+C to stop.")
        print("=" * 65)
        httpd.serve_forever()
    except OSError as e:
        if port < DEFAULT_PORT + 10:
            print(f"Port {port} in use, trying port {port + 1}...")
            run_server(port + 1)
        else:
            raise e
    except KeyboardInterrupt:
        print("\nShutting down server...")

if __name__ == "__main__":
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
