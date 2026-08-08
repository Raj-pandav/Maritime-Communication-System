export default function Sidebar({
  ships, sourceShip, destShip, algorithm, messageText,
  transmitting, pathResult, routePath, simRunning,
  showAddShip, newShip,
  setSourceShip, setDestShip, setAlgorithm, setMessageText,
  setShowAddShip, setNewShip,
  onSimulate, onSimToggle, onMoveOnce, onAddShip, onDeleteShip,
}) {
  return (
    <aside className="sidebar">

      <div className="section-label">NETWORK MODE</div>
      <div className="mode-display">Decentralized</div>

      <div className="divider"/>

      <div className="field-group">
        <label className="field-label">Source Ship</label>
        <div className="select-wrap">
          <select value={sourceShip} onChange={e => setSourceShip(e.target.value)}>
            {ships.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Destination Ship</label>
        <div className="select-wrap">
          <select value={destShip} onChange={e => setDestShip(e.target.value)}>
            {ships.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Algorithm</label>
        <div className="select-wrap">
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
            <option value="dijkstra">Dijkstra (Shortest Path)</option>
            <option value="bfs">BFS (Fewest Hops)</option>
          </select>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Message</label>
        <input
          className="text-input"
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          placeholder="Enter message…"
        />
      </div>

      <button
        className={`simulate-btn${transmitting ? " loading" : ""}`}
        onClick={onSimulate}
        disabled={transmitting || !sourceShip || !destShip}
      >
        {transmitting ? "Transmitting…" : "Simulate Transmission"}
      </button>

      {pathResult && (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-val">{pathResult.distance}</span>
              <span className="stat-lbl">Path cost (units)</span>
            </div>
            <div className="stat-card">
              <span className="stat-val">{pathResult.hops}</span>
              <span className="stat-lbl">Hops</span>
            </div>
          </div>

          {routePath.length > 0 && (
            <div className="route-box">
              <span className="field-label">Route</span>
              <div className="route-nodes">
                {routePath.map((n, i) => (
                  <span key={i} className="route-seg">
                    <span className="route-chip">{n}</span>
                    {i < routePath.length - 1 && <span className="route-arr">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="divider"/>

      <div className="section-label">SHIP MOVEMENT</div>
      <div className="btn-row">
        <button className={`mv-btn${simRunning ? " stop" : ""}`} onClick={onSimToggle}>
          {simRunning ? "Stop Auto" : "Auto Move"}
        </button>
        <button className="mv-btn secondary" onClick={onMoveOnce}>Move Once</button>
      </div>

      <div className="divider"/>

      <div className="section-label">SHIPS ({ships.length})</div>
      <button className="add-btn" onClick={() => setShowAddShip(!showAddShip)}>
        {showAddShip ? "✕ Cancel" : "+ Add Ship"}
      </button>

      {showAddShip && (
        <form className="add-form" onSubmit={onAddShip}>
          <input className="text-input" placeholder="Name (e.g. Ship I)"
            value={newShip.name} onChange={e => setNewShip({...newShip, name: e.target.value})} required/>
          <div className="xy-row">
            <input className="text-input" placeholder="X (0–800)" type="number"
              value={newShip.x} onChange={e => setNewShip({...newShip, x: e.target.value})} required/>
            <input className="text-input" placeholder="Y (0–600)" type="number"
              value={newShip.y} onChange={e => setNewShip({...newShip, y: e.target.value})} required/>
          </div>
          <input className="text-input" placeholder="Speed (default 15)" type="number"
            value={newShip.speed} onChange={e => setNewShip({...newShip, speed: e.target.value})}/>
          <button type="submit" className="simulate-btn" style={{marginTop: 6}}>Add Ship</button>
        </form>
      )}

      <div className="ship-list">
        {ships.map(s => (
          <div key={s._id} className="ship-row">
            <span className="sdot moving"/>
            <span className="sname">{s.name}</span>
            <span className="sstatus">moving</span>
            <button className="del-btn" onClick={() => onDeleteShip(s._id, s.name)}>✕</button>
          </div>
        ))}
      </div>

    </aside>
  );
}
