const mongoose = require("mongoose")
require("dotenv").config()

const shipModel = require("./src/Models/ship.model")

// No ports — only ships, all moving with high speed so movement is clearly visible
const initialShips = [
  { name: "A", x: 315, y: 205, speed: 8, status: "moving", heading: 45  },
  { name: "B", x: 425, y: 330, speed: 8, status: "moving", heading: 120 },
  { name: "C", x: 620, y: 150, speed: 8, status: "moving", heading: 200 },
  { name: "D", x: 450, y: 225, speed: 8, status: "moving", heading: 80  },
  { name: "E", x: 310, y: 405, speed: 8, status: "moving", heading: 160 },
  { name: "F", x: 570, y: 345, speed: 8, status: "moving", heading: 300 },
  { name: "G", x: 715, y: 225, speed: 8, status: "moving", heading: 270 },
  { name: "H", x: 750, y: 410, speed: 8, status: "moving", heading: 240 },
]

async function seed() {
  try {
    await mongoose.connect(process.env.mongoose_uri)
    console.log("Connected to database")

    // Drop ALL existing ships (including old ports) and re-seed fresh
    await shipModel.deleteMany({})
    console.log("Cleared existing ships/ports from database")

    await shipModel.insertMany(initialShips)
    console.log(`✓ Seeded ${initialShips.length} ships successfully (no ports)!`)

  } catch (err) {
    console.error("Seed error:", err)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected.")
  }
}

seed()
