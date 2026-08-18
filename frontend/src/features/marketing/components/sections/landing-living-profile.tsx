export function LandingLivingProfile() {
  const SATELLITE_NODES = [
    { id: "sat-1", label: "Resume evidence", detail: "Parsed Experience & Projects" },
    { id: "sat-2", label: "Interview signal", detail: "Scored Speech & Technical Clarity" },
    { id: "sat-3", label: "Learning milestone", detail: "Completed Skill Routes" },
    { id: "sat-4", label: "Confirmed skill", detail: "Deterministic Grounded Proof" },
    { id: "sat-5", label: "Job interaction", detail: "Saved Roles & Application History" },
  ];

  return (
    <section className="living-profile-section section" aria-label="Living Career Profile">
      <div className="container">
        <div className="profile-header">
          <p className="eyebrow mono">PROFILE CONSTELLATION</p>
          <h2 className="profile-title">A living record that evolves with you.</h2>
          <p className="profile-subtitle">
            Every analysis, mock interview practice, learning milestone, and job interaction automatically enriches your career profile.
          </p>
        </div>

        <div className="constellation-stage">
          {/* Central Profile Core Node */}
          <div className="constellation-core">
            <div className="core-inner">
              <span className="core-tag mono">CAREER RECORD</span>
              <h3 className="core-title">YOUR CAREER PROFILE</h3>
              <p className="core-status mono">EVOLVING CONTINUOUSLY</p>
            </div>
            <div className="core-pulse-rings" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          </div>

          {/* Connected Satellite Nodes */}
          <div className="constellation-satellites">
            {SATELLITE_NODES.map((sat, idx) => (
              <div key={sat.id} className={`satellite-node node-pos-${idx + 1}`}>
                <div className="satellite-badge mono">
                  <span className="sat-dot" />
                  <span className="sat-label">{sat.label}</span>
                </div>
                <p className="satellite-detail">{sat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
