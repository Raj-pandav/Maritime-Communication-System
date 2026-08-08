import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL, COMM_RANGE, getDistance } from "../Simulation/simulation.constants";
import {
  fetchAllShips,
  sendMessage,
  addNewShip,
  removeShip,
  startSimulation,
  stopSimulation,
} from "../Simulation/simulation.api";
import Header from "../Simulation/Header";
import Sidebar from "../Simulation/Sidebar";
import NetworkMap from "../Simulation/NetworkMap";
import TransmissionLog from "../Simulation/TransmissionLog";
import "./Dashboard.css";

export default function Dashboard() {
  const [ships, setShips] = useState([]);
  const [transmitLog, setTransmitLog] = useState([]);
  const [sourceShip, setSourceShip] = useState("");
  const [destShip, setDestShip] = useState("");
  const [messageText, setMessageText] = useState("Hello Ship!");
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [pathResult, setPathResult] = useState(null);
  const [activePathIds, setActivePathIds] = useState([]);
  const [drawnSegments, setDrawnSegments] = useState(0);
  const [animStep, setAnimStep] = useState(-1);
  const [simRunning, setSimRunning] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [showAddShip, setShowAddShip] = useState(false);
  const [newShip, setNewShip] = useState({ name: "", x: "", y: "", speed: "15", status: "moving" });

  const logRef = useRef(null);
  const socketRef = useRef(null);

  // shipsRef always has the latest positions for use inside async loops
  const shipsRef = useRef([]);
  useEffect(() => { shipsRef.current = ships; }, [ships]);

  // activePathIds ref — so animation loop always reads current path
  const activePathIdsRef = useRef([]);
  useEffect(() => { activePathIdsRef.current = activePathIds; }, [activePathIds]);

  useEffect(() => {
    fetchShips();

    socketRef.current = io(SOCKET_URL);

    // ── Key fix: update ships state whenever socket fires shipsUpdate
    socketRef.current.on("shipsUpdate", (updated) => {
      setShips(updated);
    });

    // ── Listen for buffered messages that got auto-delivered during simulation
    socketRef.current.on("bufferDelivered", (data) => {
      const time = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
      setTransmitLog(prev => [
        ...prev,
        {
          text: `📬 Buffered message auto-delivered: ${data.fromName} → ${data.toName}`,
          type: "success",
          time,
          quote: `"${data.content}" | Path cost: ${data.distance} | Hops: ${data.hops}`,
          id: Date.now() + Math.random()
        }
      ]);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [transmitLog]);

  async function fetchShips() {
    try {
      const data = await fetchAllShips();
      // Filter out any lingering port entries from old DB data
      const onlyShips = data.filter(s => !s.name?.startsWith("P"));
      setShips(onlyShips);
      if (onlyShips.length > 0) setSourceShip(prev => prev || onlyShips[0]._id);
      if (onlyShips.length > 1) setDestShip(prev => prev || onlyShips[1]._id);
    } catch (e) { console.error(e); }
  }

  function addLog(text, type = "info", quote = null) {
    const time = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    setTransmitLog(prev => [...prev, { text, type, time, quote, id: Date.now() + Math.random() }]);
  }

  async function handleSimulate() {
    if (!sourceShip || !destShip || !messageText.trim()) return;
    if (sourceShip === destShip) {
      addLog("Source and destination cannot be the same ship.", "warn");
      return;
    }
    const src = shipsRef.current.find(s => s._id === sourceShip);
    const dst = shipsRef.current.find(s => s._id === destShip);
    if (!src || !dst) return;

    setTransmitting(true);
    setPathResult(null);
    setActivePathIds([]);
    setDrawnSegments(0);
    setAnimStep(-1);

    addLog(`Starting decentralized simulation: ${src.name} → ${dst.name}`, "start");

    try {
      const data = await sendMessage({
        from: sourceShip,
        to: destShip,
        content: messageText,
        algorithm,
        range: COMM_RANGE,
      });

      if (data.buffered || !data.pathResult || data.pathResult.path.length === 0) {
        addLog(`⚠ No path found — ships out of communication range`, "warn");
        setTransmitting(false);
        return;
      }

      const pr = data.pathResult;
      setPathResult(pr);

      const pathIds = pr.path;
      setActivePathIds(pathIds);
      activePathIdsRef.current = pathIds;

      // Resolve names at this moment
      const getName = id => shipsRef.current.find(s => s._id === id)?.name || id;
      const pathNames = pathIds.map(getName);

      addLog(`Path found: ${pathNames.join(" → ")}`, "path");
      addLog(`Total cost: ${pr.distance} units | Hops: ${pr.hops}`, "info");

      // Animate each hop one at a time
      for (let i = 0; i < pathIds.length - 1; i++) {
        const fromName = getName(pathIds[i]);
        const toName   = getName(pathIds[i + 1]);

        setAnimStep(i);
        // Wait for packet dot to travel (matches SVG animate dur="0.9s")
        await new Promise(r => setTimeout(r, 950));
        // Solidify this segment
        setDrawnSegments(i + 1);
        addLog(`Step ${i + 1}: • ${fromName} → • ${toName}`, "step", `"${messageText}"`);
      }

      setAnimStep(-1);
      await new Promise(r => setTimeout(r, 3000));
      addLog("✓ Message delivered successfully.", "success");

    } catch (e) {
      addLog("✗ Transmission error: " + e.message, "error");
    }

    setTransmitting(false);
  }

  async function handleSimToggle() {
    if (simRunning) {
      await stopSimulation();
      setSimRunning(false);
      addLog("■ Ship movement stopped", "warn");
    } else {
      await startSimulation();
      setSimRunning(true);
      addLog("▶ Ship movement started", "info");
    }
  }

  async function handleMoveOnce() {
    // Start, wait one tick, stop
    await startSimulation();
    setTimeout(async () => {
      await stopSimulation();
      fetchShips();
      addLog("Ships moved once", "info");
    }, 600);
  }

  async function handleAddShip(e) {
  e.preventDefault();

  try {
    const shipData = {
      name: newShip.name.trim(),
      x: Number(newShip.x),
      y: Number(newShip.y),
      speed: Number(newShip.speed),
      status: "moving",
    };

    console.log("Sending ship:", shipData);

    const result = await addNewShip(shipData);

    console.log("Ship created:", result);

    addLog(`Ship "${shipData.name}" added successfully`, "success");

    setNewShip({
      name: "",
      x: "",
      y: "",
      speed: "15",
      status: "moving",
    });

    setShowAddShip(false);

    await fetchShips();

  } catch (error) {
    console.error("ADD SHIP ERROR:", error);

    addLog(
      `Failed to add ship: ${error.message}`,
      "error"
    );
  }
}

  async function handleDeleteShip(id, name) {
    await removeShip(id);
    fetchShips();
    addLog(`Ship "${name}" removed`, "warn");
  }

  // ── Build in-range edges (dashed)
  const edges = [];
  for (let i = 0; i < ships.length; i++) {
    for (let j = i + 1; j < ships.length; j++) {
      if (getDistance(ships[i], ships[j]) <= COMM_RANGE) {
        edges.push([ships[i], ships[j]]);
      }
    }
  }

  // ── All edges that belong to the active path (to suppress dashed line underneath)
  const allPathEdgeSet = new Set();
  for (let i = 0; i < activePathIds.length - 1; i++) {
    allPathEdgeSet.add(`${activePathIds[i]}-${activePathIds[i + 1]}`);
    allPathEdgeSet.add(`${activePathIds[i + 1]}-${activePathIds[i]}`);
  }

  // ── Packet dot: current hop being animated
  let packetFrom = null;
  let packetTo   = null;
  if (transmitting && animStep >= 0 && animStep < activePathIds.length - 1) {
    packetFrom = ships.find(s => s._id === activePathIds[animStep]);
    packetTo   = ships.find(s => s._id === activePathIds[animStep + 1]);
  }

  const routePath = activePathIds.map(id => ships.find(s => s._id === id)?.name).filter(Boolean);

  return (
    <div className="app">

      <Header ships={ships} />

      <div className="main-layout">

        <Sidebar
          ships={ships}
          sourceShip={sourceShip}
          destShip={destShip}
          algorithm={algorithm}
          messageText={messageText}
          transmitting={transmitting}
          pathResult={pathResult}
          routePath={routePath}
          simRunning={simRunning}
          showAddShip={showAddShip}
          newShip={newShip}
          setSourceShip={setSourceShip}
          setDestShip={setDestShip}
          setAlgorithm={setAlgorithm}
          setMessageText={setMessageText}
          setShowAddShip={setShowAddShip}
          setNewShip={setNewShip}
          onSimulate={handleSimulate}
          onSimToggle={handleSimToggle}
          onMoveOnce={handleMoveOnce}
          onAddShip={handleAddShip}
          onDeleteShip={handleDeleteShip}
        />

        <NetworkMap
          ships={ships}
          edges={edges}
          sourceShip={sourceShip}
          destShip={destShip}
          activePathIds={activePathIds}
          allPathEdgeSet={allPathEdgeSet}
          drawnSegments={drawnSegments}
          animStep={animStep}
          transmitting={transmitting}
          packetFrom={packetFrom}
          packetTo={packetTo}
        />

        <TransmissionLog
          transmitLog={transmitLog}
          logRef={logRef}
        />

      </div>
    </div>
  );
}
