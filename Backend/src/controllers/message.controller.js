const messageModel = require("../Models/message.model")
const shipModel = require("../Models/ship.model")
const { buildGraph, dijkstra, bfs } = require("../utils/graph")

async function sendMessage(req, res) {
    const { from, to, content, algorithm, range } = req.body
    if (!from || !to || !content) {
        return res.status(400).json({ message: "All fields are required" })
    }
    try {
        const ships = await shipModel.find()
        const graph = buildGraph(ships, range || 100)
        const algo = algorithm === "bfs" ? bfs : dijkstra
        const result = algo(graph, from, to)

        const io = req.app.get("io")

        if (result.path.length > 0) {
            const message = await messageModel.create({
                from,
                to,
                message: content,
                status: "in-transit",
                path: result.path
            })
            io.emit("packetSend", {
                message,
                path: result.path,
                distance: result.distance,
                hops: result.hops
            })
            res.status(201).json({ message, pathResult: result })
        } else {
            const message = await messageModel.create({
                from,
                to,
                message: content,
                status: "buffered",
                path: []
            })
            await shipModel.findByIdAndUpdate(from, {
                $push: { buffer: { messageId: message._id, to, content, createdAt: new Date() } }
            })
            io.emit("messageBuffered", {
                message,
                shipId: from,
                reason: "No path found - destination out of range"
            })
            res.status(201).json({ message, buffered: true, reason: "No path found" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function getMessages(req, res) {
    try {
        const messages = await messageModel.find()
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function getBuffer(req, res) {
    try {
        const ship = await shipModel.findById(req.params.shipId)
        if (!ship) {
            return res.status(404).json({ message: "Ship not found" })
        }
        res.status(200).json(ship.buffer)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { sendMessage, getMessages, getBuffer }
