// Build adjacency list graph from ships based on communication range
function buildGraph(ships, range) {
    const graph = {};

    // Initialize empty adjacency list for each ship
    for (const ship of ships) {
        graph[ship._id.toString()] = [];
    }

    // Check every pair of ships
    for (let i = 0; i < ships.length; i++) {
        for (let j = i + 1; j < ships.length; j++) {
            const shipA = ships[i];
            const shipB = ships[j];

            // Calculate Euclidean distance between two ships
            const dx = shipA.x - shipB.x;
            const dy = shipA.y - shipB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If within communication range, add edge both ways
            if (distance <= range) {
                graph[shipA._id.toString()].push({
                    id: shipB._id.toString(),
                    name: shipB.name,
                    distance: Math.round(distance * 100) / 100
                });
                graph[shipB._id.toString()].push({
                    id: shipA._id.toString(),
                    name: shipA.name,
                    distance: Math.round(distance * 100) / 100
                });
            }
        }
    }

    return graph;
}

// Dijkstra's Algorithm — finds shortest path by total distance
function dijkstra(graph, sourceId, destId) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const nodes = Object.keys(graph);

    // Initialize all distances to Infinity
    for (const node of nodes) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[sourceId] = 0;

    while (true) {
        // Pick unvisited node with smallest distance
        let currentNode = null;
        let smallestDist = Infinity;

        for (const node of nodes) {
            if (!visited.has(node) && distances[node] < smallestDist) {
                smallestDist = distances[node];
                currentNode = node;
            }
        }

        // No more reachable nodes
        if (currentNode === null) break;

        // Reached destination
        if (currentNode === destId) break;

        visited.add(currentNode);

        // Update distances to neighbors
        for (const neighbor of graph[currentNode]) {
            if (visited.has(neighbor.id)) continue;

            const newDist = distances[currentNode] + neighbor.distance;
            if (newDist < distances[neighbor.id]) {
                distances[neighbor.id] = newDist;
                previous[neighbor.id] = currentNode;
            }
        }
    }

    // Build path by backtracking from destination
    if (distances[destId] === Infinity) {
        return { path: [], distance: -1, message: "No path found" };
    }

    const path = [];
    let current = destId;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    return {
        path: path,
        distance: Math.round(distances[destId] * 100) / 100,
        hops: path.length - 1
    };
}

// BFS — finds shortest path by fewest hops
function bfs(graph, sourceId, destId) {
    const visited = new Set();
    const queue = [[sourceId]]; // queue of paths
    visited.add(sourceId);

    while (queue.length > 0) {
        const path = queue.shift();
        const currentNode = path[path.length - 1];

        // Reached destination
        if (currentNode === destId) {
            // Calculate total distance along the path
            let totalDistance = 0;
            for (let i = 0; i < path.length - 1; i++) {
                const neighbors = graph[path[i]];
                const edge = neighbors.find(n => n.id === path[i + 1]);
                totalDistance += edge.distance;
            }

            return {
                path: path,
                distance: Math.round(totalDistance * 100) / 100,
                hops: path.length - 1
            };
        }

        // Explore neighbors
        for (const neighbor of graph[currentNode]) {
            if (!visited.has(neighbor.id)) {
                visited.add(neighbor.id);
                queue.push([...path, neighbor.id]);
            }
        }
    }

    return { path: [], distance: -1, hops: -1, message: "No path found" };
}

module.exports = { buildGraph, dijkstra, bfs };