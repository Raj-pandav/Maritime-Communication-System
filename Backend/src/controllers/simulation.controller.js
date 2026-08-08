const {startSimulation,stopSimulation} = require("../utils/simulation")


async function startSim(req,res){
    const io = req.app.get("io")
    startSimulation(io)
    res.status(200).json({message: "Simulation started"})
}

async function stopSim(req,res){
    stopSimulation()
    res.status(200).json({message: "Simulation stopped"})
}

module.exports = {startSim,stopSim}