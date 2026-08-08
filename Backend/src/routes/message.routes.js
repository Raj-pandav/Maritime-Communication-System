const express = require("express")

const {sendMessage,getMessages,getBuffer} = require("../Controllers/message.controller")

const router = express.Router()

router.post("/send",sendMessage)
router.get("/",getMessages)
router.get("/:shipId",getBuffer)

module.exports = router