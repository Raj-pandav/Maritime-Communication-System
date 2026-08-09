import { GRID_W, GRID_H } from "./simulation.constants";

export default function NetworkMap({
  ships, edges, sourceShip, destShip,
  activePathIds, allPathEdgeSet,
  drawnSegments, animStep, transmitting,
  packetFrom, packetTo,
}) {
  return (
    <main className="map-area">
      <div className="map-wrap">
        <svg
          viewBox={`0 0 ${GRID_W} ${GRID_H}`}
          className="net-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="grid" width="80" height="60" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 60" fill="none" stroke="rgba(148,163,184,0.13)" strokeWidth="0.8"/>
            </pattern>
            <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)"/>

          {/* ── In-range dashed edges (skip active path edges) ── */}
          {edges.map(([a, b], i) => {
            const k = `${a._id}-${b._id}`;
            const onActivePath = allPathEdgeSet.has(k) || allPathEdgeSet.has(`${b._id}-${a._id}`);
            if (onActivePath && activePathIds.length > 0) return null;
            return (
              <line key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="rgba(148,163,184,0.22)"
                strokeWidth={1}
                strokeDasharray="6,5"
              />
            );
          })}

          {/* ── Already-drawn path segments (solid orange) ── */}
          {Array.from({ length: drawnSegments }, (_, i) => {
            const from = ships.find(s => s._id === activePathIds[i]);
            const to   = ships.find(s => s._id === activePathIds[i + 1]);
            if (!from || !to) return null;
            return (
              <line key={`seg-${i}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round"
              />
            );
          })}

          {/* ── Current segment being animated (faint preview line) ── */}
          {packetFrom && packetTo && (
            <line
              key={`anim-seg-${animStep}`}
              x1={packetFrom.x} y1={packetFrom.y}
              x2={packetTo.x}   y2={packetTo.y}
              stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"
              opacity={0.45} strokeDasharray="5,4"
            />
          )}

          {/* ── Ship nodes ── */}
          {ships.map(ship => {
            const isSrc  = ship._id === sourceShip;
            const isDst  = ship._id === destShip;
            const onPath = activePathIds.includes(ship._id);

            const fill = isSrc ? "#f59e0b"
                       : isDst ? "#3b82f6"
                       : onPath ? "#60a5fa"
                       : "#475569";

            return (
                               <g
                    key={ship._id}
                    transform={`translate(${ship.x},${ship.y})`}
                    style={{
                      transition: "transform 120ms linear",
                    }}
                  >
                                  {/* Pulse ring for source/dest */}
                {(isSrc || isDst) && (
                  <circle
                    r={22} fill="none"
                    stroke={isSrc ? "#f59e0b" : "#3b82f6"}
                    strokeWidth={1.5} opacity={0.45}
                    className="pulse-ring"
                  />
                )}
                <circle
                  r={14} fill={fill}
                  stroke={onPath ? "#f59e0b" : "rgba(255,255,255,0.15)"}
                  strokeWidth={onPath ? 2.5 : 1.5}
                  filter={isSrc ? "url(#glow-orange)" : isDst ? "url(#glow-blue)" : "none"}
                />
                <text y={5} textAnchor="middle" fill="white"
                  fontSize="10" fontWeight="700" fontFamily="monospace">
                  {ship.name}
                </text>
              </g>
            );
          })}

          {/* ── Packet dot animation ── */}
          {packetFrom && packetTo && (
            <g key={`pkt-${animStep}`}>
              {/* Glow halo */}
              <circle r={12} fill="#f59e0b" opacity={0.25}>
                <animate attributeName="cx" from={packetFrom.x} to={packetTo.x} dur="0.9s" fill="freeze"/>
                <animate attributeName="cy" from={packetFrom.y} to={packetTo.y} dur="0.9s" fill="freeze"/>
              </circle>
              {/* Core dot */}
              <circle r={7} fill="#fbbf24" stroke="#fff" strokeWidth={2}>
                <animate attributeName="cx" from={packetFrom.x} to={packetTo.x} dur="0.9s" fill="freeze"/>
                <animate attributeName="cy" from={packetFrom.y} to={packetTo.y} dur="0.9s" fill="freeze"/>
              </circle>
            </g>
          )}
        </svg>

        {/* Transmitting status bar */}
        {transmitting && animStep >= 0 && (
          <div className="tx-bar">
            Transmitting — Step {animStep + 1} of {activePathIds.length - 1}
          </div>
        )}

        {/* Legend — no Port entry */}
        <div className="legend">
          <div className="leg-item">
            <span className="leg-dot" style={{background:"#f59e0b"}}/>Source
          </div>
          <div className="leg-item">
            <span className="leg-dot" style={{background:"#3b82f6"}}/>Ship
          </div>
          <div className="leg-item">
            <span className="leg-line" style={{background:"repeating-linear-gradient(to right,rgba(148,163,184,0.5) 0,rgba(148,163,184,0.5) 4px,transparent 4px,transparent 8px)"}}/>
            In Range
          </div>
          <div className="leg-item">
            <span className="leg-line" style={{background:"#f59e0b"}}/>Active Path
          </div>
        </div>
      </div>
    </main>
  );
}
