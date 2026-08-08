const express = require("express")
const {findPath} = require("../controllers/pathfind.controller")

const router = express.Router()

router.post("/find",findPath)

module.exports = router
