const express = require("express")
const router = express.Router()
const {getAllShips,addShip,deleteShip} = require("../controllers/ship.controller")


router.get("/",getAllShips)

router.post("/add",addShip)

router.delete("/:id",deleteShip)


module.exports = router
