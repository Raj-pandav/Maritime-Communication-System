const shipModel = require("../models/ship.model")
const messageModel = require("../models/message.model")
const { buildGraph, dijkstra } = require("./graph")

const MAX_X = 800
const MAX_Y = 600
const COMM_RANGE = 150

const TICK_MS = 100 // backend updates approximately every 100ms

let simulationRunning = false
let lastTickTime = null


async function moveShips(deltaTime) {
    const ships = await shipModel.find()

    for (const ship of ships) {

        // Keep heading changes small so ships don't jitter.
        const headingChange = (Math.random() - 0.5) * 4

        ship.heading =
            ((ship.heading + headingChange) % 360 + 360) % 360

        const radians = (ship.heading * Math.PI) / 180

        // IMPORTANT:
        // speed is now interpreted as units per second.
        const distance = ship.speed * deltaTime

        let newX =
            ship.x +
            distance * Math.cos(radians)

        let newY =
            ship.y +
            distance * Math.sin(radians)


        // Bounce off left/right walls.
        if (newX < 20 || newX > MAX_X - 20) {

            ship.heading =
                ((180 - ship.heading) % 360 + 360) % 360

            newX =
                Math.max(
                    20,
                    Math.min(MAX_X - 20, newX)
                )
        }


        // Bounce off top/bottom walls.
        if (newY < 20 || newY > MAX_Y - 20) {

            ship.heading =
                ((-ship.heading) % 360 + 360) % 360

            newY =
                Math.max(
                    20,
                    Math.min(MAX_Y - 20, newY)
                )
        }


        ship.x = Math.round(newX * 100) / 100
        ship.y = Math.round(newY * 100) / 100
        ship.status = "moving"

        await ship.save()
    }

    return ships
}


// Check all ships with buffered messages and try to deliver them
async function retryBufferedMessages(io) {

    try {

        const shipsWithBuffer =
            await shipModel.find({
                "buffer.0": { $exists: true }
            })

        if (shipsWithBuffer.length === 0) return


        const allShips = await shipModel.find()

        const graph =
            buildGraph(allShips, COMM_RANGE)


        for (const ship of shipsWithBuffer) {

            const deliveredIndexes = []

            for (let i = 0; i < ship.buffer.length; i++) {

                const buffered = ship.buffer[i]

                const fromId = ship._id.toString()
                const toId = buffered.to

                const result =
                    dijkstra(graph, fromId, toId)


                if (result.path.length > 0) {

                    if (buffered.messageId) {

                        await messageModel.findByIdAndUpdate(
                            buffered.messageId,
                            {
                                status: "delivered",
                                path: result.path
                            }
                        )
                    }


                    const fromShip =
                        allShips.find(
                            s => s._id.toString() === fromId
                        )

                    const toShip =
                        allShips.find(
                            s => s._id.toString() === toId
                        )


                    io.emit("bufferDelivered", {

                        from: fromId,
                        to: toId,

                        fromName:
                            fromShip?.name || fromId,

                        toName:
                            toShip?.name || toId,

                        content: buffered.content,

                        path: result.path,

                        distance: result.distance,

                        hops: result.hops
                    })


                    deliveredIndexes.push(i)
                }
            }


            if (deliveredIndexes.length > 0) {

                const remainingBuffer =
                    ship.buffer.filter(
                        (_, i) =>
                            !deliveredIndexes.includes(i)
                    )

                await shipModel.findByIdAndUpdate(
                    ship._id,
                    {
                        buffer: remainingBuffer
                    }
                )
            }
        }

    } catch (error) {

        console.error(
            "Buffer retry error:",
            error.message
        )
    }
}


// ----------------------------------------------------
// Simulation loop
// ----------------------------------------------------

async function simulationLoop(io) {

    if (!simulationRunning) return

    const now = Date.now()

    let deltaTime = 0

    if (lastTickTime !== null) {

        deltaTime =
            (now - lastTickTime) / 1000
    }

    lastTickTime = now


    try {

        // Prevent a huge movement if the server was paused.
        // Maximum allowed time step = 0.5 seconds.
        deltaTime =
            Math.min(deltaTime, 0.5)


        if (deltaTime > 0) {

            await moveShips(deltaTime)

            const ships =
                await shipModel.find()

            io.emit(
                "shipsUpdate",
                ships
            )

            await retryBufferedMessages(io)
        }

    } catch (error) {

        console.error(
            "Simulation tick error:",
            error.message
        )
    }


    if (simulationRunning) {

        setTimeout(
            () => simulationLoop(io),
            TICK_MS
        )
    }
}


function startSimulation(io) {

    if (simulationRunning) return

    simulationRunning = true

    lastTickTime = Date.now()

    simulationLoop(io)
}


function stopSimulation() {

    simulationRunning = false
    lastTickTime = null
}


module.exports = {
    moveShips,
    startSimulation,
    stopSimulation
}
