import json
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from algorithms.bfs import bfs
from algorithms.dfs import dfs
from algorithms.dijkstra import dijkstra, reconstruct_path
from algorithms.fare import calculate_eta, calculate_fare
from algorithms.greedy import greedy_assign_driver
from data_store import CITY_GRAPH, DRIVERS, LOCATIONS


BASE_DIR = Path(__file__).resolve().parent


class RideConnectHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def _json_response(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/config":
            self._json_response(
                {
                    "locations": LOCATIONS,
                    "graph": CITY_GRAPH,
                    "drivers": DRIVERS,
                }
            )
            return

        if self.path == "/":
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self):
        if self.path != "/api/ride":
            self._json_response({"error": "Endpoint not found."}, status=HTTPStatus.NOT_FOUND)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
            pickup = payload["pickup"]
            destination = payload["destination"]
        except (KeyError, json.JSONDecodeError, UnicodeDecodeError, ValueError):
            self._json_response({"error": "Invalid request payload."}, status=HTTPStatus.BAD_REQUEST)
            return

        if pickup not in CITY_GRAPH or destination not in CITY_GRAPH:
            self._json_response({"error": "Unknown pickup or destination."}, status=HTTPStatus.BAD_REQUEST)
            return

        if pickup == destination:
            self._json_response({"error": "Pickup and destination cannot be the same."}, status=HTTPStatus.BAD_REQUEST)
            return

        driver_result = greedy_assign_driver(CITY_GRAPH, DRIVERS, pickup)
        best_driver = driver_result["bestDriver"]

        if not best_driver:
            self._json_response({"error": "No drivers available right now."}, status=HTTPStatus.BAD_REQUEST)
            return

        bfs_order = bfs(CITY_GRAPH, pickup)
        dfs_order = dfs(CITY_GRAPH, pickup)
        dijkstra_result = dijkstra(CITY_GRAPH, pickup)
        distances = dijkstra_result["distances"]
        previous = dijkstra_result["previous"]
        shortest_path = reconstruct_path(previous, pickup, destination)
        total_distance = distances[destination]

        self._json_response(
            {
                "pickup": pickup,
                "destination": destination,
                "sortedDrivers": driver_result["sortedDrivers"],
                "bestDriver": best_driver,
                "algorithms": {
                    "bfsOrder": bfs_order,
                    "dfsOrder": dfs_order,
                    "distances": distances,
                    "previous": previous,
                    "shortestPath": shortest_path,
                    "totalDistance": total_distance,
                },
                "ride": {
                    "eta": calculate_eta(total_distance),
                    "fare": calculate_fare(total_distance),
                },
            }
        )


def run():
    server = ThreadingHTTPServer(("127.0.0.1", 8000), RideConnectHandler)
    print("RideConnect server running at http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
