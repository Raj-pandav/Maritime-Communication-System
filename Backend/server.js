const dotenv = require('dotenv')
dotenv.config()
const http = require("http")
const app = require("./src/app")
const { Server } = require("socket.io")
const connectDB = require("./src/database/db")

// Create HTTP server and attach Socket.IO
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
})

// Socket.IO connection handler build kiya
io.on("connection", (socket) => {
  console.log("Frontend connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("Frontend disconnected:", socket.id)
  })
})

// io access kar sakta hai other files ko 
app.set("io", io)

// Connect to DB then start server
connectDB()
  .then(() => {
    server.listen(3000, () => {
      console.log("Server is running on port 3000")
    })
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err)
  })
