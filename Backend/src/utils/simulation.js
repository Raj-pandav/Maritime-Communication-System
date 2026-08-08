const shipModel = require("../models/ship.model")
const messageModel = require("../models/message.model")
const { buildGraph, dijkstra } = require("./graph")

const MAX_X = 800
const MAX_Y = 600
const COMM_RANGE = 150  // Same range used by the frontend
let simulationInterval = null

async function moveShips() {
    const ships = await shipModel.find()

    for (const ship of ships) {
        // Move ALL ships — never skip based on status
        // Slightly vary heading each tick for realistic drift
        const headingChange = (Math.random() - 0.5) * 20
        // Fix negative modulo: ((x % 360) + 360) % 360 always gives 0–359
        ship.heading = ((ship.heading + headingChange) % 360 + 360) % 360

        const radians = (ship.heading * Math.PI) / 180
        let newX = ship.x + ship.speed * Math.cos(radians)
        let newY = ship.y + ship.speed * Math.sin(radians)

        // Bounce off walls by reflecting heading
        if (newX < 20 || newX > MAX_X - 20) {
            ship.heading = ((180 - ship.heading) % 360 + 360) % 360
            newX = Math.max(20, Math.min(MAX_X - 20, newX))
        }
        if (newY < 20 || newY > MAX_Y - 20) {
            ship.heading = ((-ship.heading) % 360 + 360) % 360
            newY = Math.max(20, Math.min(MAX_Y - 20, newY))
        }

        ship.x = Math.round(newX * 100) / 100
        ship.y = Math.round(newY * 100) / 100
        ship.status = "moving"  // Always keep moving status

        await ship.save()
    }

    return ships
}

// Check all ships with buffered messages and try to deliver them
async function retryBufferedMessages(io) {
    try {
        // Find ships that have buffered messages
        const shipsWithBuffer = await shipModel.find({ "buffer.0": { $exists: true } })

        if (shipsWithBuffer.length === 0) return

        // Fetch all ships to build the graph
        const allShips = await shipModel.find()
        const graph = buildGraph(allShips, COMM_RANGE)

        for (const ship of shipsWithBuffer) {
            // Process each buffered message
            const deliveredIndexes = []

            for (let i = 0; i < ship.buffer.length; i++) {
                const buffered = ship.buffer[i]
                const fromId = ship._id.toString()
                const toId = buffered.to

                // Try to find a path now
                const result = dijkstra(graph, fromId, toId)

                if (result.path.length > 0) {
                    // Path found! Deliver the buffered message
                    // Update the message status in the database
                    if (buffered.messageId) {
                        await messageModel.findByIdAndUpdate(buffered.messageId, {
                            status: "delivered",
                            path: result.path
                        })
                    }

                    // Emit event to frontend so it can show the auto-delivery
                    const fromShip = allShips.find(s => s._id.toString() === fromId)
                    const toShip = allShips.find(s => s._id.toString() === toId)

                    io.emit("bufferDelivered", {
                        from: fromId,
                        to: toId,
                        fromName: fromShip?.name || fromId,
                        toName: toShip?.name || toId,
                        content: buffered.content,
                        path: result.path,
                        distance: result.distance,
                        hops: result.hops
                    })

                    deliveredIndexes.push(i)
                }
            }

            // Remove delivered messages from buffer (in reverse to keep indexes valid)
            if (deliveredIndexes.length > 0) {
                const remainingBuffer = ship.buffer.filter((_, i) => !deliveredIndexes.includes(i))
                await shipModel.findByIdAndUpdate(ship._id, { buffer: remainingBuffer })
            }
        }
    } catch (error) {
        console.error("Buffer retry error:", error.message)
    }
}

function startSimulation(io) {
    if (simulationInterval) return

    // Run every 500ms for smooth, clearly visible movement
    simulationInterval = setInterval(async () => {
        try {
            await moveShips()
            const ships = await shipModel.find()
            io.emit("shipsUpdate", ships)

            // After moving, check if any buffered messages can now be delivered
            await retryBufferedMessages(io)
        } catch (error) {
            console.error("Simulation tick error:", error.message)
        }
    }, 500)
}

function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval)
        simulationInterval = null
    }
}

module.exports = { moveShips, startSimulation, stopSimulation }
