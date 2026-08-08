const shipModel = require("../Models/ship.model")
const { buildGraph, dijkstra, bfs } = require("../utils/graph");


async function findPath(req,res){
    const range = 40
    try {
    const {sourceId,destId,algorithm} = req.body
    if(!sourceId || !destId || !algorithm){
        return res.status(400).json({message: "All fields are required"})
    }
    const ships = await shipModel.find()
    const graph = buildGraph(ships,range)
    const path = algorithm === "dijkstra" ? dijkstra(graph,sourceId,destId) : bfs(graph,sourceId,destId)
    res.json(path)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {findPath}
