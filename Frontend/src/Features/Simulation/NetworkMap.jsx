import { useEffect, useRef, useState } from "react";
import { GRID_W, GRID_H } from "./simulation.constants";

export default function NetworkMap({
  ships,
  edges,
  sourceShip,
  destShip,
  activePathIds,
  allPathEdgeSet,
  drawnSegments,
  animStep,
  transmitting,
  packetFrom,
  packetTo,
}) {
  // --------------------------------------------------
  // Smooth visual positions
  // --------------------------------------------------

  const visualPositionsRef = useRef(new Map());
  const targetPositionsRef = useRef(new Map());

  const [, forceRender] = useState(0);

  // Whenever backend sends new ship positions,
  // update only the TARGET position.
  useEffect(() => {
    const targetMap = targetPositionsRef.current;

    ships.forEach((ship) => {
      targetMap.set(ship._id, {
        x: ship.x,
        y: ship.y,
      });

      // First time a ship appears:
      // start directly from its current position.
      if (!visualPositionsRef.current.has(ship._id)) {
        visualPositionsRef.current.set(ship._id, {
          x: ship.x,
          y: ship.y,
        });
      }
    });

    // Remove ships that no longer exist.
    const currentIds = new Set(ships.map((ship) => ship._id));

    for (const id of visualPositionsRef.current.keys()) {
      if (!currentIds.has(id)) {
        visualPositionsRef.current.delete(id);
      }
    }

    for (const id of targetMap.keys()) {
      if (!currentIds.has(id)) {
        targetMap.delete(id);
      }
    }
  }, [ships]);

  // --------------------------------------------------
  // requestAnimationFrame smooth movement
  // --------------------------------------------------

  useEffect(() => {
    let animationFrame;
    let lastTime = performance.now();

    const animate = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const visualMap = visualPositionsRef.current;
      const targetMap = targetPositionsRef.current;

      let changed = false;

      for (const [id, target] of targetMap.entries()) {
        const current = visualMap.get(id);

        if (!current) {
          visualMap.set(id, {
            x: target.x,
            y: target.y,
          });

          changed = true;
          continue;
        }

        const dx = target.x - current.x;
        const dy = target.y - current.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.01) {
          current.x = target.x;
          current.y = target.y;
          continue;
        }

        // Smoothly move toward server position.
        //
        // Higher value = follows server faster.
        // Lower value = smoother but more delayed.
        const smoothing = 8;

        const factor = Math.min(1, smoothing * delta);

        current.x += dx * factor;
        current.y += dy * factor;

        changed = true;
      }

      if (changed) {
        forceRender((value) => value + 1);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // --------------------------------------------------
  // Get current smooth position
  // --------------------------------------------------

  const getVisualPosition = (ship) => {
    return (
      visualPositionsRef.current.get(ship._id) || {
        x: ship.x,
        y: ship.y,
      }
    );
  };

  // --------------------------------------------------
  // In-range edges
  // --------------------------------------------------

  return (
    <main className="network-map">
      <svg
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        className="net-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* -------------------------------------------- */}
        {/* In-range dashed edges */}
        {/* -------------------------------------------- */}

        {edges.map(([a, b], i) => {
          const k = `${a._id}-${b._id}`;

          const onActivePath =
            allPathEdgeSet.has(k) ||
            allPathEdgeSet.has(`${b._id}-${a._id}`);

          if (onActivePath && activePathIds.length > 0) {
            return null;
          }

          const aPos = getVisualPosition(a);
          const bPos = getVisualPosition(b);

          return (
            <line
              key={i}
              x1={aPos.x}
              y1={aPos.y}
              x2={bPos.x}
              y2={bPos.y}
              stroke="rgba(148,163,184,0.22)"
              strokeWidth={1}
              strokeDasharray="6,5"
            />
          );
        })}

        {/* -------------------------------------------- */}
        {/* Already drawn path segments */}
        {/* -------------------------------------------- */}

        {Array.from({ length: drawnSegments }, (_, i) => {
          const from = ships.find(
            (s) => s._id === activePathIds[i]
          );

          const to = ships.find(
            (s) => s._id === activePathIds[i + 1]
          );

          if (!from || !to) return null;

          const fromPos = getVisualPosition(from);
          const toPos = getVisualPosition(to);

          return (
            <line
              key={`seg-${i}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* -------------------------------------------- */}
        {/* Current animated segment */}
        {/* -------------------------------------------- */}

        {packetFrom && packetTo && (
          <line
            key={`anim-seg-${animStep}`}
            x1={getVisualPosition(packetFrom).x}
            y1={getVisualPosition(packetFrom).y}
            x2={getVisualPosition(packetTo).x}
            y2={getVisualPosition(packetTo).y}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.45}
            strokeDasharray="5,4"
          />
        )}

        {/* -------------------------------------------- */}
        {/* Ships */}
        {/* -------------------------------------------- */}

        {ships.map((ship) => {
          const isSrc = ship._id === sourceShip;
          const isDst = ship._id === destShip;
          const onPath = activePathIds.includes(ship._id);

          const fill = isSrc
            ? "#f59e0b"
            : isDst
            ? "#3b82f6"
            : onPath
            ? "#60a5fa"
            : "#475569";

          const pos = getVisualPosition(ship);

          return (
            <g
              key={ship._id}
              transform={`translate(${pos.x},${pos.y})`}
            >
              {/* Pulse ring */}
              {(isSrc || isDst) && (
                <circle
                  r={22}
                  fill="none"
                  stroke={
                    isSrc
                      ? "#f59e0b"
                      : "#3b82f6"
                  }
                  strokeWidth={1.5}
                  opacity={0.45}
                  className="pulse-ring"
                />
              )}

              {/* Ship node */}
              <circle
                r={14}
                fill={fill}
                stroke={
                  onPath
                    ? "#f59e0b"
                    : "rgba(255,255,255,0.15)"
                }
                strokeWidth={
                  onPath ? 2.5 : 1.5
                }
                filter={
                  isSrc
                    ? "url(#glow-orange)"
                    : isDst
                    ? "url(#glow-blue)"
                    : "none"
                }
              />

              <text
                y={5}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="700"
                fontFamily="monospace"
              >
                {ship.name}
              </text>
            </g>
          );
        })}

        {/* -------------------------------------------- */}
        {/* Packet animation */}
        {/* -------------------------------------------- */}

        {packetFrom && packetTo && (
          <g key={`pkt-${animStep}`}>
            <circle
              r={12}
              fill="#f59e0b"
              opacity={0.25}
            >
              <animate
                attributeName="cx"
                from={packetFrom.x}
                to={packetTo.x}
                dur="0.9s"
                fill="freeze"
              />

              <animate
                attributeName="cy"
                from={packetFrom.y}
                to={packetTo.y}
                dur="0.9s"
                fill="freeze"
              />
            </circle>

            <circle
              r={7}
              fill="#fbbf24"
              stroke="#fff"
              strokeWidth={2}
            >
              <animate
                attributeName="cx"
                from={packetFrom.x}
                to={packetTo.x}
                dur="0.9s"
                fill="freeze"
              />

              <animate
                attributeName="cy"
                from={packetFrom.y}
                to={packetTo.y}
                dur="0.9s"
                fill="freeze"
              />
            </circle>
          </g>
        )}
      </svg>

      {/* -------------------------------------------- */}
      {/* Transmitting status */}
      {/* -------------------------------------------- */}

      {transmitting && animStep >= 0 && (
        <div className="tx-bar">
          Transmitting — Step {animStep + 1} of{" "}
          {activePathIds.length - 1}
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* Legend */}
      {/* -------------------------------------------- */}

      <div className="legend">
        <div className="leg-item">
          <span
            className="leg-dot"
            style={{ background: "#f59e0b" }}
          />
          Source
        </div>

        <div className="leg-item">
          <span
            className="leg-dot"
            style={{ background: "#3b82f6" }}
          />
          Ship
        </div>

        <div className="leg-item">
          <span
            className="leg-line"
            style={{
              background:
                "repeating-linear-gradient(to right,rgba(148,163,184,0.5) 0,rgba(148,163,184,0.5) 4px,transparent 4px,transparent 8px)",
            }}
          />
          In Range
        </div>

        <div className="leg-item">
          <span
            className="leg-line"
            style={{ background: "#f59e0b" }}
          />
          Active Path
        </div>
      </div>
    </main>
  );
}
