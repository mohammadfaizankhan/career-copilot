export function LandingResumeMapping() {
  return (
    <section className="resume-mapping-section section" aria-label="Resume to Role Mapping">
      <div className="container">
        <div className="mapping-header">
          <p className="eyebrow mono">NAVIGATIONAL MATCHING</p>
          <h2 className="mapping-title">Deterministic requirement mapping.</h2>
          <p className="mapping-subtitle">
            See exactly how your verified evidence satisfies target role criteria before applying.
          </p>
        </div>

        <div className="mapping-diagram-card">
          <div className="mapping-diagram-grid">
            {/* Left: Candidate Evidence Clusters */}
            <div className="mapping-column evidence-col">
              <span className="col-header mono">CANDIDATE EVIDENCE</span>
              <div className="mapping-nodes-list">
                <div className="map-node node-confirmed">
                  <span className="node-icon">●</span>
                  <span>Python (3+ YOE)</span>
                </div>
                <div className="map-node node-confirmed">
                  <span className="node-icon">●</span>
                  <span>FastAPI Service</span>
                </div>
                <div className="map-node node-confirmed">
                  <span className="node-icon">●</span>
                  <span>Docker Containers</span>
                </div>
                <div className="map-node node-missing">
                  <span className="node-icon">○</span>
                  <span>AWS Deployment</span>
                </div>
              </div>
            </div>

            {/* Middle: Connection Map Lines & Status */}
            <div className="mapping-center-paths">
              <div className="path-row path-solid">
                <span className="line-solid" />
                <span className="match-pill pill-confirmed mono">CONFIRMED</span>
                <span className="line-solid" />
              </div>
              <div className="path-row path-solid">
                <span className="line-solid" />
                <span className="match-pill pill-confirmed mono">CONFIRMED</span>
                <span className="line-solid" />
              </div>
              <div className="path-row path-dashed">
                <span className="line-dashed" />
                <span className="match-pill pill-partial mono">PARTIAL</span>
                <span className="line-dashed" />
              </div>
              <div className="path-row path-open">
                <span className="line-open" />
                <span className="match-pill pill-missing mono">MISSING</span>
                <span className="line-open" />
              </div>
            </div>

            {/* Right: Target Role Requirements */}
            <div className="mapping-column requirements-col">
              <span className="col-header mono">ROLE REQUIREMENTS</span>
              <div className="mapping-nodes-list">
                <div className="map-node node-req">
                  <span>Python Core</span>
                </div>
                <div className="map-node node-req">
                  <span>API Architecture</span>
                </div>
                <div className="map-node node-req">
                  <span>Containerization</span>
                </div>
                <div className="map-node node-req">
                  <span>Cloud Deployment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Legend */}
          <div className="mapping-legend mono">
            <div className="legend-item">
              <span className="legend-line legend-solid-sample" />
              <span>Solid = Confirmed Evidence</span>
            </div>
            <div className="legend-item">
              <span className="legend-line legend-dashed-sample" />
              <span>Dashed = Partial Match</span>
            </div>
            <div className="legend-item">
              <span className="legend-line legend-open-sample" />
              <span>Open = Missing Evidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
