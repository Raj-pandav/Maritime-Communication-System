# 🚢 Maritime Communication System

A **decentralized ship-to-ship communication network simulator** built as a Computer Networks project. Ships communicate via multi-hop relay using graph-based routing algorithms (Dijkstra & BFS), with real-time movement simulation and message buffering.

---

## ✨ Features

- **Decentralized Routing** — Ships relay messages through intermediate nodes using Dijkstra (shortest path) or BFS (fewest hops)
- **Real-Time Simulation** — Ships move autonomously with realistic drift and wall-bouncing physics
- **Dynamic Network Topology** — Communication links form/break as ships enter/leave each other's range
- **Message Buffering** — When no path exists, messages are buffered and auto-delivered once a route becomes available
- **Live Packet Animation** — Visual hop-by-hop packet traversal with animated SVG
- **Socket.IO Integration** — Real-time updates between frontend and backend via WebSockets

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite |
| **Backend** | Node.js + Express 5 |
| **Database** | MongoDB + Mongoose |
| **Real-time** | Socket.IO |
| **Routing Algorithms** | Dijkstra, BFS |

---


## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017`

### Installation

```bash
# Clone the repo
git clone https://github.com/Vaibhav-48-iiit/-Maritime-Communication-System.git
cd -Maritime-Communication-System

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### Run the Application

```bash
# Terminal 1 — Start Backend
cd Backend
npm run dev

# Terminal 2 — Seed the database (first time only)
cd Backend
npm run seed

# Terminal 3 — Start Frontend
cd Frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎮 How to Use

1. **Select Source & Destination** ships from the sidebar dropdowns
2. **Choose an Algorithm** — Dijkstra (shortest distance) or BFS (fewest hops)
3. **Type a Message** and click **Simulate Transmission**
4. Watch the **animated packet** travel hop-by-hop across the network
5. Use **Auto Move** to start continuous ship movement
6. If ships are out of range, messages get **buffered** and auto-delivered when a path forms

---

## 📡 How It Works

### Network Graph
- Ships within **150 units** of each other form a communication link
- The network is modeled as a **weighted undirected graph** (weights = Euclidean distance)

### Routing Algorithms
- **Dijkstra** — Finds the path with minimum total distance
- **BFS** — Finds the path with fewest hops (relay nodes)

### Message Buffering (Store-and-Forward)
- When no path exists, the message is stored in the sender's buffer
- Every simulation tick, the system checks if buffered messages can now be delivered
- Auto-delivery emits a Socket.IO event so the frontend shows it in real-time

---

## 👥 Team

Computer Networks Project — IIIT

---

## 📄 License

This project is for educational purposes.
