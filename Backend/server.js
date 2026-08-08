const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const app = require("./src/app");
const { Server } = require("socket.io");
const connectDB = require("./src/database/db");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://maritime-communication-system.vercel.app"
        ],
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Frontend connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Frontend disconnected:", socket.id);
    });
});

app.set("io", io);

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000;

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
    });
