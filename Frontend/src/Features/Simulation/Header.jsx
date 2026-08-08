export default function Header({ ships }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-icon">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M4 22L16 10L28 22" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 22L25 22L27 27L5 27Z" fill="#3b82f6"/>
            <rect x="14" y="4" width="4" height="8" fill="#60a5fa" rx="1"/>
            <path d="M2 27L30 27" stroke="#1e40af" strokeWidth="1.5"/>
          </svg>
        </div>
        <div>
          <h1 className="header-title">Ship Communication System</h1>
          <p className="header-sub">Network Simulation — Computer Networks Project</p>
        </div>
      </div>
      <div className="header-right">
        <span className="live-badge"><span className="live-dot"/><span>Live</span></span>
        <span className="ship-count">{ships.length} ships</span>
      </div>
    </header>
  );
}
