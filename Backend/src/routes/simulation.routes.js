const express = require("express")
const {startSim,stopSim} = require("../controllers/simulation.controller")


const router = express.Router()

router.post("/start",startSim)
router.post("/stop",stopSim)

module.exports = router
