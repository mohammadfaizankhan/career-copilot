export function LandingEvidenceEngine() {
  return (
    <section id="analysis" className="evidence-engine-section section" aria-label="Evidence Engine">
      <div className="container">
        <div className="evidence-header">
          <p className="eyebrow mono">DETERMINISTIC GROUNDING</p>
          <h2 className="evidence-title">Every recommendation should have evidence.</h2>
          <p className="evidence-subtitle">
            Career Copilot links every detected skill directly back to verified source text in your experience and projects.
          </p>
        </div>

        <div className="evidence-mapping-stage">
          {/* Left: Resume Snippet Fragment */}
          <div className="evidence-resume-panel">
            <div className="panel-tag mono">SOURCE RESUME FRAGMENT</div>
            <div className="resume-snippet-box">
              <div className="snippet-section">
                <span className="snippet-label mono">EXPERIENCE</span>
                <p className="snippet-text">
                  Built scalable microservices using{" "}
                  <mark className="source-highlight highlight-go">Go</mark> and{" "}
                  <mark className="source-highlight highlight-docker">Docker</mark>.
                </p>
              </div>

              <div className="snippet-section">
                <span className="snippet-label mono">PROJECT</span>
                <p className="snippet-text">
                  Designed a high-throughput backend API in{" "}
                  <mark className="source-highlight highlight-fastapi">FastAPI</mark> handling 10k req/sec.
                </p>
              </div>
            </div>
          </div>

          {/* Middle: SVG Connection Paths */}
          <div className="evidence-connectors-svg" aria-hidden>
            <svg viewBox="0 0 160 220" preserveAspectRatio="none" className="connectors-svg">
              {/* Connection Line 1: Go */}
              <path
                d="M 10 50 C 70 50, 90 40, 150 40"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="path-animated"
              />
              {/* Connection Line 2: Docker */}
              <path
                d="M 10 70 C 70 70, 90 110, 150 110"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="path-animated"
              />
              {/* Connection Line 3: FastAPI */}
              <path
                d="M 10 160 C 70 160, 90 180, 150 180"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="path-animated"
              />
            </svg>
          </div>

          {/* Right: Evidence Map Chips */}
          <div className="evidence-map-panel">
            <div className="panel-tag mono">VERIFIED EVIDENCE CHIPS</div>

            <div className="evidence-chips-stack">
              <div className="evidence-chip-card chip-go">
                <div className="chip-header">
                  <strong className="chip-name">Go (Golang)</strong>
                  <span className="badge badge-success">Verified</span>
                </div>
                <p className="chip-origin mono">← Evidence found in Experience</p>
              </div>

              <div className="evidence-chip-card chip-docker">
                <div className="chip-header">
                  <strong className="chip-name">Docker / Containers</strong>
                  <span className="badge badge-success">Verified</span>
                </div>
                <p className="chip-origin mono">← Evidence found in Experience</p>
              </div>

              <div className="evidence-chip-card chip-fastapi">
                <div className="chip-header">
                  <strong className="chip-name">FastAPI / REST APIs</strong>
                  <span className="badge badge-info">Project Evidence</span>
                </div>
                <p className="chip-origin mono">← Evidence found in Projects</p>
              </div>
            </div>
          </div>
        </div>

        <p className="evidence-disclaimer mono">
          Illustrative evidence extraction map — grounded directly in candidate source text.
        </p>
      </div>
    </section>
  );
}
