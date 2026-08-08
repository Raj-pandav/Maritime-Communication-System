const express = require("express")
const {findPath} = require("../Controllers/pathfind.controller")

const router = express.Router()

router.post("/find",findPath)

module.exports = router