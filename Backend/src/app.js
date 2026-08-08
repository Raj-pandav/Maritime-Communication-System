const express = require("express")
const shipRoutes = require("./routes/ship.routes")
const pathfindRoutes = require("./routes/pathfind.routes")
const simulationRoutes = require("./routes/simulation.routes")
const messageRoutes = require("./routes/message.routes")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/ship",shipRoutes)
app.use("/api/pathfind",pathfindRoutes)
app.use("/api/simulation",simulationRoutes)
app.use("/api/message",messageRoutes)

module.exports = app
