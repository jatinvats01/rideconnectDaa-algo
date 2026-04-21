/*  ============================================
    RideWise – script.js
    ─────────────────────────────────────────────
    Complete logic with:
      • Graph Data Structure
      • BFS  (Breadth-First Search)
      • DFS  (Depth-First Search)
      • Dijkstra's Shortest Path Algorithm
      • Greedy Driver Allocation
      • Searching & Sorting (drivers by distance)
      • Fare & ETA calculation
      • Interactive canvas graph drawing
      • Hero particle animation
      • Scroll-triggered animations
    ============================================ */


// ═══════════════════════════════════════════════
// 1. GRAPH DATA STRUCTURE
//    ─────────────────────────────────────────
//    Locations are NODES.  Roads are EDGES.
//    Each edge has a WEIGHT (distance in km).
//    The graph is UNDIRECTED — every road is two-way.
// ═══════════════════════════════════════════════

/**
 * Adjacency list representation of the city graph.
 * Key   = location name (node)
 * Value = array of { node, weight } (connected edges)
 */
const cityGraph = {
  "College": [{ node: "Bus Stand", weight: 4 },
  { node: "Hospital", weight: 7 },
  { node: "City Park", weight: 3 }],

  "Bus Stand": [{ node: "College", weight: 4 },
  { node: "Railway Station", weight: 5 },
  { node: "Market", weight: 6 }],

  "Railway Station": [{ node: "Bus Stand", weight: 5 },
  { node: "Airport", weight: 12 },
  { node: "Hospital", weight: 8 }],

  "Hospital": [{ node: "College", weight: 7 },
  { node: "Railway Station", weight: 8 },
  { node: "Mall", weight: 5 },
  { node: "City Park", weight: 4 }],

  "Mall": [{ node: "Hospital", weight: 5 },
  { node: "Market", weight: 3 },
  { node: "Airport", weight: 9 }],

  "Market": [{ node: "Bus Stand", weight: 6 },
  { node: "Mall", weight: 3 },
  { node: "City Park", weight: 5 }],

  "Airport": [{ node: "Railway Station", weight: 12 },
  { node: "Mall", weight: 9 }],

  "City Park": [{ node: "College", weight: 3 },
  { node: "Hospital", weight: 4 },
  { node: "Market", weight: 5 }]
};

/** Array of all location names (nodes of the graph) */
const locations = Object.keys(cityGraph);


// ═══════════════════════════════════════════════
// 2. DRIVER DATA
//    ─────────────────────────────────────────
//    Each driver has:
//      name, location, rating, vehicle, available
// ═══════════════════════════════════════════════

const drivers = [
  { name: "Rahul", location: "College", vehicle: "Sedan", available: true },
  { name: "Aman", location: "Railway Station", vehicle: "SUV", available: true },
  { name: "Simran", location: "Mall",  vehicle: "Hatchback", available: true },
  { name: "Rohit", location: "Airport", vehicle: "Sedan", available: false },
  { name: "Priya", location: "Market", vehicle: "SUV", available: true },
  { name: "Neha", location: "Bus Stand", vehicle: "Auto", available: true }
];


// ═══════════════════════════════════════════════
// 3. ALGORITHM IMPLEMENTATIONS
// ═══════════════════════════════════════════════


// ───── 3a. BFS (Breadth-First Search) ─────────
/**
 * BFS explores the graph LEVEL BY LEVEL.
 * It visits all neighbours of the current node before
 * moving on to the next level.
 *
 * Data structure used: Queue (FIFO – First In, First Out)
 *
 * @param {Object} graph   – adjacency list
 * @param {string} start   – starting node name
 * @returns {string[]}     – nodes in the order they were visited
 *
 * Time  Complexity: O(V + E)  where V = vertices, E = edges
 * Space Complexity: O(V)
 */
function bfs(graph, start) {
  // Set to keep track of nodes we've already visited
  const visited = new Set();

  // Queue initialised with the start node
  const queue = [start];

  // Array to record the traversal order
  const order = [];

  // Mark the start node as visited
  visited.add(start);

  // Keep going until the queue is empty
  while (queue.length > 0) {
    // Remove the FIRST element from the queue (FIFO)
    const current = queue.shift();

    // Record this node in the traversal order
    order.push(current);

    // Look at all neighbours of the current node
    for (const neighbour of graph[current]) {
      // If we haven't visited this neighbour yet...
      if (!visited.has(neighbour.node)) {
        // Mark it as visited
        visited.add(neighbour.node);
        // Add it to the END of the queue
        queue.push(neighbour.node);
      }
    }
  }

  return order;
}


// ───── 3b. DFS (Depth-First Search) ──────────
/**
 * DFS explores the graph by going as DEEP as possible
 * along each branch, then BACKTRACKS when it hits a dead end.
 *
 * Data structure used: Stack (LIFO – Last In, First Out)
 * (Here we use an iterative approach with an explicit stack)
 *
 * @param {Object} graph   – adjacency list
 * @param {string} start   – starting node name
 * @returns {string[]}     – nodes in the order they were visited
 *
 * Time  Complexity: O(V + E)
 * Space Complexity: O(V)
 */
function dfs(graph, start) {
  const visited = new Set();

  // Stack initialised with the start node
  const stack = [start];

  const order = [];

  while (stack.length > 0) {
    // Remove the LAST element from the stack (LIFO)
    const current = stack.pop();

    // If we haven't visited this node yet...
    if (!visited.has(current)) {
      visited.add(current);
      order.push(current);

      // Push neighbours in REVERSE order so that the
      // first neighbour in the adjacency list gets
      // processed first (it will be on top of the stack)
      const neighbours = graph[current].slice().reverse();
      for (const neighbour of neighbours) {
        if (!visited.has(neighbour.node)) {
          stack.push(neighbour.node);
        }
      }
    }
  }

  return order;
}


// ───── 3c. Dijkstra's Algorithm ──────────────
/**
 * Dijkstra's algorithm finds the SHORTEST PATH from a
 * source node to ALL other nodes in a weighted graph.
 *
 * How it works:
 *   1. Set distance of start to 0, all others to Infinity
 *   2. Pick the unvisited node with SMALLEST distance
 *   3. For each neighbour, check if going through this node
 *      gives a shorter path — if yes, update the distance
 *   4. Mark this node as visited
 *   5. Repeat until all nodes are visited
 *
 * @param {Object} graph  – adjacency list with weights
 * @param {string} start  – source node
 * @returns {{ distances: Object, previous: Object }}
 *    distances[node] = shortest distance from start to node
 *    previous[node]  = the node just before this one on the shortest path
 *
 * Time  Complexity: O((V + E) log V)  ← with a min-heap
 * Space Complexity: O(V)
 */
function dijkstra(graph, start) {
  // distances[node] stores the shortest known distance from start → node
  const distances = {};

  // previous[node] stores which node comes before this one on the best path
  const previous = {};

  // Keep track of which nodes we've fully processed
  const visited = new Set();

  // STEP 1: Initialise all distances to Infinity (unknown)
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  // Distance from start to itself is 0
  distances[start] = 0;

  // STEP 2: Process nodes one by one
  while (visited.size < Object.keys(graph).length) {
    // Find the UNVISITED node with the SMALLEST distance
    // (This acts as our simple priority queue)
    let minNode = null;
    let minDist = Infinity;

    for (const node of Object.keys(graph)) {
      if (!visited.has(node) && distances[node] < minDist) {
        minDist = distances[node];
        minNode = node;
      }
    }

    // If no reachable unvisited node remains, stop
    if (minNode === null) break;

    // Mark this node as fully processed
    visited.add(minNode);

    // STEP 3: Relax all edges from this node
    // "Relax" means: check if going through minNode
    // gives a shorter path to any neighbour
    for (const edge of graph[minNode]) {
      const newDist = distances[minNode] + edge.weight;

      // If we found a shorter path, update!
      if (newDist < distances[edge.node]) {
        distances[edge.node] = newDist;
        previous[edge.node] = minNode;
      }
    }
  }

  return { distances, previous };
}


/**
 * Reconstructs the actual path from start → end
 * using the `previous` map that Dijkstra computed.
 *
 * We walk BACKWARDS from the destination to the source.
 *
 * @param {Object} previous  – predecessor map from dijkstra()
 * @param {string} start     – source node
 * @param {string} end       – destination node
 * @returns {string[]}       – the path as an ordered array of node names
 */
function reconstructPath(previous, start, end) {
  const path = [];
  let current = end;

  // Walk backwards: destination → ... → start
  while (current !== null) {
    path.unshift(current);   // Add to the FRONT of the array
    current = previous[current];
  }

  // If the first element isn't our start, there's no valid path
  if (path[0] !== start) return [];
  return path;
}


// ───── 3d. Greedy Driver Selection ───────────
/**
 * GREEDY APPROACH to assign the best driver:
 *
 * 1. Run Dijkstra from the pickup to find distances to ALL locations
 * 2. SEARCH: Filter only drivers that are available
 * 3. For each available driver, look up their distance from pickup
 * 4. SORT drivers by distance (ascending) — nearest first
 * 5. GREEDY CHOICE: Pick the first driver (minimum distance)
 *
 * This is "greedy" because we make the locally optimal choice
 * (nearest driver) without considering future consequences.
 *
 * @param {string} pickup  – pickup location name
 * @returns {{ sortedDrivers: Array, bestDriver: Object|null }}
 */
function greedyAssignDriver(pickup) {
  // Run Dijkstra from pickup to get distances to every location
  const { distances } = dijkstra(cityGraph, pickup);

  // SEARCHING: Filter only available drivers
  const available = drivers.filter(d => d.available);

  // Attach distance from pickup to each available driver
  const withDist = available.map(d => ({
    ...d,
    distanceFromPickup: distances[d.location]
  }));

  // SORTING: Sort drivers by distance (ascending)
  // This is a comparison-based sort, O(n log n)
  withDist.sort((a, b) => a.distanceFromPickup - b.distanceFromPickup);

  return {
    sortedDrivers: withDist,          // All available drivers, sorted
    bestDriver: withDist[0] || null // The NEAREST one (greedy pick)
  };
}


// ═══════════════════════════════════════════════
// 4. FARE & ETA CALCULATION
// ═══════════════════════════════════════════════

/**
 * Calculate the fare for a ride.
 * Formula: Base fare ₹40 + ₹8 per km
 *
 * @param {number} distance – distance in km
 * @returns {number} fare in ₹
 */
function calculateFare(distance) {
  return 40 + distance * 8;
}

/**
 * Calculate the Estimated Time of Arrival.
 * Formula: distance × 3 minutes per km
 *
 * @param {number} distance – distance in km
 * @returns {number} ETA in minutes
 */
function calculateETA(distance) {
  return distance * 3;
}


// ═══════════════════════════════════════════════
// 5. DOM ELEMENT REFERENCES
//    ─────────────────────────────────────────
//    We grab references to the HTML elements
//    that we'll need to read from or write to.
// ═══════════════════════════════════════════════

const pickupSelect = document.getElementById("pickup");
const destinationSelect = document.getElementById("destination");
const findRideBtn = document.getElementById("find-ride-btn");
const bookingError = document.getElementById("booking-error");
const resultsSection = document.getElementById("results-section");
const driversGrid = document.getElementById("drivers-grid");
const assignedDriverDiv = document.getElementById("assigned-driver");
const bfsOutput = document.getElementById("bfs-output");
const dfsOutput = document.getElementById("dfs-output");
const dijkstraOutput = document.getElementById("dijkstra-output");
const rideSummary = document.getElementById("ride-summary");


// ═══════════════════════════════════════════════
// 6. POPULATE DROPDOWNS
//    ─────────────────────────────────────────
//    Fill <select> menus with location names
// ═══════════════════════════════════════════════

function populateDropdowns() {
  locations.forEach(loc => {
    // Pickup dropdown option
    const opt1 = document.createElement("option");
    opt1.value = loc;
    opt1.textContent = loc;
    pickupSelect.appendChild(opt1);

    // Destination dropdown option
    const opt2 = document.createElement("option");
    opt2.value = loc;
    opt2.textContent = loc;
    destinationSelect.appendChild(opt2);
  });
}


// ═══════════════════════════════════════════════
// 7. CANVAS GRAPH VISUALIZATION
//    ─────────────────────────────────────────
//    Draws the city map as an interactive graph.
//    Nodes = circles, Edges = lines with weights.
// ═══════════════════════════════════════════════

/** Fixed (x, y) positions for each node on the canvas */
const nodePositions = {
  "College": { x: 100, y: 75 },
  "Bus Stand": { x: 290, y: 55 },
  "Railway Station": { x: 480, y: 75 },
  "Hospital": { x: 165, y: 220 },
  "Mall": { x: 365, y: 235 },
  "Market": { x: 290, y: 355 },
  "Airport": { x: 510, y: 310 },
  "City Park": { x: 80, y: 345 }
};

/**
 * Draws the complete city graph on the <canvas>.
 *
 * @param {string[]} [highlightPath=[]] – nodes on the shortest path to highlight
 * @param {string}   [pickup=null]      – pickup node (coloured purple)
 * @param {string}   [dest=null]        – destination node (coloured green)
 */
function drawGraph(highlightPath = [], pickup = null, dest = null) {
  const canvas = document.getElementById("graph-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Handle high-DPI (retina) displays for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  // Scale factor to adapt fixed coordinates to the actual canvas size
  const scaleX = rect.width / 600;
  const scaleY = rect.height / 420;

  // Clear the entire canvas
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Build a set of edge-pairs that form the highlighted path
  const hlSet = new Set();
  for (let i = 0; i < highlightPath.length - 1; i++) {
    hlSet.add(highlightPath[i] + "→" + highlightPath[i + 1]);
    hlSet.add(highlightPath[i + 1] + "→" + highlightPath[i]);
  }

  // ── Draw all edges (lines between nodes) ──
  const drawnEdges = new Set();
  for (const node of Object.keys(cityGraph)) {
    for (const edge of cityGraph[node]) {
      // Avoid drawing the same edge twice
      const key = [node, edge.node].sort().join("~");
      if (drawnEdges.has(key)) continue;
      drawnEdges.add(key);

      const from = nodePositions[node];
      const to = nodePositions[edge.node];
      const isHL = hlSet.has(node + "→" + edge.node);

      // Draw the line
      ctx.beginPath();
      ctx.moveTo(from.x * scaleX, from.y * scaleY);
      ctx.lineTo(to.x * scaleX, to.y * scaleY);

      if (isHL) {
        // Highlighted path: thick purple line with glow
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "rgba(124, 58, 237, 0.4)";
        ctx.shadowBlur = 10;
      } else {
        // Normal edge: thin gray line
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Draw the weight label at the midpoint
      const midX = ((from.x + to.x) / 2) * scaleX;
      const midY = ((from.y + to.y) / 2) * scaleY;

      // Background pill for the weight
      const text = edge.weight + " km";
      const fontSize = Math.max(9, 10 * Math.min(scaleX, scaleY));
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      const textW = ctx.measureText(text).width;

      ctx.fillStyle = isHL ? "rgba(124, 58, 237, 0.12)" : "rgba(241, 245, 249, 0.9)";
      // Draw a rounded rectangle (cross-browser compatible)
      const rx = midX - textW / 2 - 6;
      const ry = midY - fontSize / 2 - 4;
      const rw = textW + 12;
      const rh = fontSize + 8;
      const rr = 6;
      ctx.beginPath();
      ctx.moveTo(rx + rr, ry);
      ctx.lineTo(rx + rw - rr, ry);
      ctx.arcTo(rx + rw, ry, rx + rw, ry + rr, rr);
      ctx.lineTo(rx + rw, ry + rh - rr);
      ctx.arcTo(rx + rw, ry + rh, rx + rw - rr, ry + rh, rr);
      ctx.lineTo(rx + rr, ry + rh);
      ctx.arcTo(rx, ry + rh, rx, ry + rh - rr, rr);
      ctx.lineTo(rx, ry + rr);
      ctx.arcTo(rx, ry, rx + rr, ry, rr);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = isHL ? "#7c3aed" : "#94a3b8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, midX, midY);
    }
  }

  // ── Draw all nodes (circles with labels) ──
  for (const node of Object.keys(nodePositions)) {
    const pos = nodePositions[node];
    const x = pos.x * scaleX;
    const y = pos.y * scaleY;
    const r = Math.max(14, 18 * Math.min(scaleX, scaleY));

    // Determine node colour based on its role
    let fillColor = "#ffffff";
    let strokeColor = "#cbd5e1";
    let textColor = "#334155";
    let shadowCol = "rgba(0,0,0,0.08)";

    if (node === pickup) {
      fillColor = "#7c3aed";
      strokeColor = "#6d28d9";
      textColor = "#ffffff";
      shadowCol = "rgba(124, 58, 237, 0.3)";
    } else if (node === dest) {
      fillColor = "#10b981";
      strokeColor = "#059669";
      textColor = "#ffffff";
      shadowCol = "rgba(16, 185, 129, 0.3)";
    } else if (highlightPath.includes(node)) {
      fillColor = "#c4b5fd";
      strokeColor = "#a78bfa";
      textColor = "#4c1d95";
      shadowCol = "rgba(167,139,250,0.3)";
    }

    // Shadow
    ctx.shadowColor = shadowCol;
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Abbreviation inside circle
    const abbr = node.length > 8 ? node.slice(0, 7) + "…" : node;
    const nodeFontSize = Math.max(8, 9 * Math.min(scaleX, scaleY));
    ctx.fillStyle = textColor;
    ctx.font = `700 ${nodeFontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(abbr, x, y);

    // Full name below the circle
    const labelSize = Math.max(8, 9.5 * Math.min(scaleX, scaleY));
    ctx.fillStyle = "#64748b";
    ctx.font = `500 ${labelSize}px Inter, sans-serif`;
    ctx.fillText(node, x, y + r + 14 * scaleY);
  }
}


// ═══════════════════════════════════════════════
// 8. RENDER FUNCTIONS
//    ─────────────────────────────────────────
//    Functions that build the result UI HTML
// ═══════════════════════════════════════════════

/** Gradient palette for driver avatar backgrounds */
const avatarGradients = [
  "linear-gradient(135deg, #7c3aed, #a78bfa)",
  "linear-gradient(135deg, #3b82f6, #60a5fa)",
  "linear-gradient(135deg, #ec4899, #f472b6)",
  "linear-gradient(135deg, #10b981, #34d399)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "linear-gradient(135deg, #f43f5e, #fb7185)"
];

/** Vehicle type emoji map */
const vehicleEmoji = {
  "Sedan": "🚗", "SUV": "🚙", "Hatchback": "🏎️", "Auto": "🛺"
};

/**
 * Render all available driver cards into the grid.
 * The best (nearest) driver gets a special "BEST MATCH" ribbon.
 */
function renderDrivers(sortedDrivers, bestDriverName) {
  driversGrid.innerHTML = "";

  sortedDrivers.forEach((d, i) => {
    const isBest = d.name === bestDriverName;
    const card = document.createElement("div");
    card.className = "driver-card" + (isBest ? " best-match" : "");

    card.innerHTML = `
      <div class="driver-card-header">
        <div class="driver-avatar" style="background: ${avatarGradients[i % avatarGradients.length]}">
          ${d.name.charAt(0)}
        </div>
        <div>
          <div class="driver-name">${d.name}</div>
          <div class="driver-location-text">📌 ${d.location}</div>
        </div>
      </div>
      <div class="driver-meta">
        <span class="driver-tag rating">⭐ ${d.rating}</span>
        <span class="driver-tag vehicle">${vehicleEmoji[d.vehicle] || "🚗"} ${d.vehicle}</span>
        <span class="driver-tag distance">📍 ${d.distanceFromPickup} km</span>
      </div>
      <div class="driver-info">
        Distance from pickup: <strong>${d.distanceFromPickup} km</strong> (via Dijkstra)
      </div>
    `;
    driversGrid.appendChild(card);
  });
}

/**
 * Render the assigned driver section with explanation.
 */
function renderAssignedDriver(best) {
  assignedDriverDiv.innerHTML = `
    <div class="assigned-avatar">${best.name.charAt(0)}</div>
    <div class="assigned-details">
      <h3>${best.name}</h3>
      <div class="driver-meta">
        <span class="driver-tag rating">⭐ ${best.rating}</span>
        <span class="driver-tag vehicle">${vehicleEmoji[best.vehicle] || "🚗"} ${best.vehicle}</span>
        <span class="driver-tag distance">📍 ${best.distanceFromPickup} km away</span>
      </div>
      <div class="driver-info">📌 Currently at: <strong>${best.location}</strong></div>
      <div class="assigned-reason">
        <strong>🧠 Greedy Algorithm Applied:</strong>
        This driver was selected because they are the <em>nearest available driver</em>
        to your pickup location (distance = ${best.distanceFromPickup} km).
        The algorithm computed Dijkstra distances for all ${drivers.filter(d => d.available).length}
        available drivers, sorted them, and picked the one with the minimum distance.
      </div>
    </div>
  `;
}

/**
 * Run all three algorithms and render their outputs.
 * Returns the Dijkstra shortest path info for the summary.
 */
function renderAlgorithms(pickup, destination) {
  // ── BFS ──
  const bfsResult = bfs(cityGraph, pickup);
  bfsOutput.innerHTML =
    `<span style="color:#60a5fa;">// BFS Traversal from "${pickup}"</span>\n`
    + `<span style="color:#94a3b8;">// Data Structure: Queue (FIFO)</span>\n\n`
    + `Queue ← [${pickup}]\n\n`
    + bfsResult.map((n, i) => {
      const prefix = i === 0 ? "START →" : `Step ${i} →`;
      return `${prefix}  Visit: <span style="color:#fbbf24;font-weight:600;">${n}</span>`;
    }).join("\n")
    + `\n\n<span style="color:#34d399;font-weight:600;">BFS Order: ${bfsResult.join(" → ")}</span>`;

  // ── DFS ──
  const dfsResult = dfs(cityGraph, pickup);
  dfsOutput.innerHTML =
    `<span style="color:#34d399;">// DFS Traversal from "${pickup}"</span>\n`
    + `<span style="color:#94a3b8;">// Data Structure: Stack (LIFO)</span>\n\n`
    + `Stack ← [${pickup}]\n\n`
    + dfsResult.map((n, i) => {
      const prefix = i === 0 ? "START →" : `Step ${i} →`;
      return `${prefix}  Visit: <span style="color:#fbbf24;font-weight:600;">${n}</span>`;
    }).join("\n")
    + `\n\n<span style="color:#60a5fa;font-weight:600;">DFS Order: ${dfsResult.join(" → ")}</span>`;

  // ── Dijkstra ──
  const { distances, previous } = dijkstra(cityGraph, pickup);
  const shortestPath = reconstructPath(previous, pickup, destination);
  const totalDist = distances[destination];

  dijkstraOutput.innerHTML =
    `<span style="color:#fbbf24;">// Dijkstra: ${pickup} → ${destination}</span>\n`
    + `<span style="color:#94a3b8;">// Finds shortest weighted path</span>\n\n`
    + `<span style="color:#e2e8f0;">Distances from "${pickup}":</span>\n`
    + Object.entries(distances).map(([node, dist]) => {
      const marker = node === destination ? " ← TARGET" : "";
      const color = node === destination ? "#f472b6" : "#fbbf24";
      return `  ${node.padEnd(18)} <span style="color:${color};font-weight:600;">${dist} km</span>${marker}`;
    }).join("\n")
    + `\n\n<span style="color:#34d399;font-weight:600;">Shortest Path:</span>\n`
    + `  <span style="color:#fbbf24;font-weight:700;">${shortestPath.join("  →  ")}</span>\n`
    + `  Total: <span style="color:#f472b6;font-weight:700;">${totalDist} km</span>`;

  return { shortestPath, totalDist };
}

/**
 * Render the final ride summary with all details.
 */
function renderSummary(best, path, distance, eta, fare) {
  rideSummary.innerHTML = `
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-icon">👤</div>
        <div class="summary-label">Driver</div>
        <div class="summary-value">${best.name}</div>
      </div>
      <div class="summary-item">
        <div class="summary-icon">${vehicleEmoji[best.vehicle] || "🚗"}</div>
        <div class="summary-label">Vehicle</div>
        <div class="summary-value">${best.vehicle}</div>
      </div>
      <div class="summary-item">
        <div class="summary-icon">🛣️</div>
        <div class="summary-label">Route</div>
        <div class="summary-value route-val">${path.join(" → ")}</div>
      </div>
      <div class="summary-item">
        <div class="summary-icon">📏</div>
        <div class="summary-label">Distance</div>
        <div class="summary-value highlight">${distance} km</div>
      </div>
      <div class="summary-item">
        <div class="summary-icon">⏱️</div>
        <div class="summary-label">ETA</div>
        <div class="summary-value highlight">${eta} min</div>
      </div>
      <div class="summary-item">
        <div class="summary-icon">💰</div>
        <div class="summary-label">Fare</div>
        <div class="summary-value price">₹${fare}</div>
      </div>
    </div>
  `;
}


// ═══════════════════════════════════════════════
// 9. MAIN FLOW — "FIND RIDE" BUTTON
//    ─────────────────────────────────────────
//    This is the main entry point when the user
//    clicks "Find My Ride".
// ═══════════════════════════════════════════════

findRideBtn.addEventListener("click", () => {
  // ── Step 1: Read and validate inputs ──
  const pickup = pickupSelect.value;
  const destination = destinationSelect.value;

  // Clear any previous error
  bookingError.classList.add("hidden");
  bookingError.textContent = "";

  if (!pickup || !destination) {
    bookingError.textContent = "⚠️ Please select both pickup and destination.";
    bookingError.classList.remove("hidden");
    return;
  }

  if (pickup === destination) {
    bookingError.textContent = "⚠️ Pickup and destination cannot be the same location.";
    bookingError.classList.remove("hidden");
    return;
  }

  // ── Step 2: Show loading state ──
  findRideBtn.classList.add("loading");

  // Simulate brief processing time for a realistic feel
  setTimeout(() => {
    // ── Step 3: Run GREEDY driver assignment ──
    // (internally runs Dijkstra + filter + sort)
    const { sortedDrivers, bestDriver } = greedyAssignDriver(pickup);

    if (!bestDriver) {
      bookingError.textContent = "😔 No drivers available right now. Please try again later.";
      bookingError.classList.remove("hidden");
      findRideBtn.classList.remove("loading");
      return;
    }

    // ── Step 4: Run all algorithms & render route analysis ──
    const { shortestPath, totalDist } = renderAlgorithms(pickup, destination);

    // ── Step 5: Calculate fare & ETA ──
    const eta = calculateETA(totalDist);
    const fare = calculateFare(totalDist);

    // ── Step 6: Render all UI sections ──
    renderDrivers(sortedDrivers, bestDriver.name);
    renderAssignedDriver(bestDriver);
    renderSummary(bestDriver, shortestPath, totalDist, eta, fare);

    // ── Step 7: Update graph with highlighted path ──
    drawGraph(shortestPath, pickup, destination);

    // ── Step 8: Show results section & scroll to it ──
    resultsSection.classList.remove("hidden");

    setTimeout(() => {
      document.getElementById("drivers-block").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 150);

    // Reset button state
    findRideBtn.classList.remove("loading");

  }, 1000); // 1 second simulated processing
});


// ═══════════════════════════════════════════════
// 10. HERO PARTICLE ANIMATION
//     ─────────────────────────────────────────
//     Animated floating particles in the hero
//     background for a premium visual effect.
// ═══════════════════════════════════════════════

function initParticles() {
  const canvas = document.getElementById("hero-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height;
  const particles = [];
  const PARTICLE_COUNT = 60;

  // Set canvas size to match the hero section
  function resize() {
    const hero = document.getElementById("hero");
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  // Create a particle with random properties
  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.4 + 0.1
    };
  }

  // Initialise particle array
  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  // Draw and animate particles each frame
  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      // Move particle
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.fill();
    }

    // Draw faint lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  init();
  animate();

  // Re-initialise on window resize
  window.addEventListener("resize", init);
}


// ═══════════════════════════════════════════════
// 11. SCROLL ANIMATIONS (Intersection Observer)
//     ─────────────────────────────────────────
//     Elements with class "animate-on-scroll"
//     fade in when they enter the viewport.
// ═══════════════════════════════════════════════

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, {
    threshold: 0.1,    // Trigger when 10% of the element is visible
    rootMargin: "0px 0px -40px 0px"
  });

  // Observe all elements with the animation class
  document.querySelectorAll(".animate-on-scroll").forEach(el => {
    observer.observe(el);
  });
}


// ═══════════════════════════════════════════════
// 12. NAVBAR BEHAVIOUR
//     ─────────────────────────────────────────
//     • Add shadow when scrolled
//     • Highlight active nav link
//     • Mobile hamburger menu toggle
// ═══════════════════════════════════════════════

function initNavbar() {
  const navbar = document.getElementById("navbar");
  const sections = ["hero", "booking-section", "algo-showcase", "how-it-works"];

  window.addEventListener("scroll", () => {
    // Add/remove scrolled class for background change
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // Update active nav link based on scroll position
    let currentSection = "hero";
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 200) {
        currentSection = id;
      }
    }

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + currentSection) {
        link.classList.add("active");
      }
    });
  });

  // Mobile hamburger toggle
  const hamburger = document.getElementById("nav-hamburger");
  const navLinks = document.getElementById("nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    // Close mobile menu when a link is clicked
    navLinks.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }
}


// ═══════════════════════════════════════════════
// 13. COUNTER ANIMATION
//     ─────────────────────────────────────────
//     Animates numeric stats counting up from 0.
// ═══════════════════════════════════════════════

function initCounters() {
  const counters = document.querySelectorAll(".counter");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-target"));
        if (isNaN(target)) return;

        let current = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current;
        }, 40);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}


// ═══════════════════════════════════════════════
// 14. INITIALISATION
//     ─────────────────────────────────────────
//     Everything that runs when the page loads.
// ═══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  // Populate the pickup/destination dropdowns
  populateDropdowns();

  // Draw the initial graph (no highlights)
  drawGraph();

  // Start the hero particle animation
  initParticles();

  // Set up scroll-triggered animations
  initScrollAnimations();

  // Set up navbar behaviour
  initNavbar();

  // Set up counter animations
  initCounters();

  // Redraw graph when window is resized
  window.addEventListener("resize", () => drawGraph());
});
