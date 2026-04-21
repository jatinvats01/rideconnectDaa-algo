CITY_GRAPH = {
    "College": [
        {"node": "Bus Stand", "weight": 4},
        {"node": "Hospital", "weight": 7},
        {"node": "City Park", "weight": 3},
    ],
    "Bus Stand": [
        {"node": "College", "weight": 4},
        {"node": "Railway Station", "weight": 5},
        {"node": "Market", "weight": 6},
    ],
    "Railway Station": [
        {"node": "Bus Stand", "weight": 5},
        {"node": "Airport", "weight": 12},
        {"node": "Hospital", "weight": 8},
    ],
    "Hospital": [
        {"node": "College", "weight": 7},
        {"node": "Railway Station", "weight": 8},
        {"node": "Mall", "weight": 5},
        {"node": "City Park", "weight": 4},
    ],
    "Mall": [
        {"node": "Hospital", "weight": 5},
        {"node": "Market", "weight": 3},
        {"node": "Airport", "weight": 9},
    ],
    "Market": [
        {"node": "Bus Stand", "weight": 6},
        {"node": "Mall", "weight": 3},
        {"node": "City Park", "weight": 5},
    ],
    "Airport": [
        {"node": "Railway Station", "weight": 12},
        {"node": "Mall", "weight": 9},
    ],
    "City Park": [
        {"node": "College", "weight": 3},
        {"node": "Hospital", "weight": 4},
        {"node": "Market", "weight": 5},
    ],
}

DRIVERS = [
    {"name": "Rahul", "location": "College", "rating": 4.8, "vehicle": "Sedan", "available": True},
    {"name": "Aman", "location": "Railway Station", "rating": 4.5, "vehicle": "SUV", "available": True},
    {"name": "Simran", "location": "Mall", "rating": 4.9, "vehicle": "Hatchback", "available": True},
    {"name": "Rohit", "location": "Airport", "rating": 4.3, "vehicle": "Sedan", "available": False},
    {"name": "Priya", "location": "Market", "rating": 4.7, "vehicle": "SUV", "available": True},
    {"name": "Neha", "location": "Bus Stand", "rating": 4.6, "vehicle": "Auto", "available": True},
]

LOCATIONS = list(CITY_GRAPH.keys())
