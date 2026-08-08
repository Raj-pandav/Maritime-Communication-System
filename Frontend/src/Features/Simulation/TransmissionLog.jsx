export default function TransmissionLog({ transmitLog, logRef }) {
  return (
    <aside className="log-panel">
      <div className="section-label">TRANSMISSION LOG</div>
      <div className="log-scroll" ref={logRef}>
        {transmitLog.length === 0 && (
          <p className="log-empty">No transmissions yet. Simulate a message to see logs.</p>
        )}
        {transmitLog.map(entry => (
          <div key={entry.id} className={`log-entry log-${entry.type}`}>
            <span className="log-time">{entry.time}</span>
            <span className="log-msg">{entry.text}</span>
            {entry.quote && <span className="log-quote">{entry.quote}</span>}
          </div>
        ))}
      </div>
    </aside>
  );
}
