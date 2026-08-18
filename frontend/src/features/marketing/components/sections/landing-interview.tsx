import { Mic, PlaySquare, Settings, Video } from "lucide-react";
import { useMotion } from "../../motion-context";

export function LandingInterview() {
  const { isMotionPaused } = useMotion();

  const waveformHeights = [
    45, 80, 30, 95, 20, 60, 85, 40, 75, 25, 90, 50, 65, 35, 15, 70, 55, 10, 100, 45, 85, 30, 95, 20,
  ];

  return (
    <section id="interview" className="interview-section section" aria-label="Interview Simulation">
      <div className="container">
        <div className="interview-section-header">
          <p className="eyebrow mono" style={{ color: "var(--accent)" }}>
            SIMULATION CHAMBER
          </p>
          <h2 className="interview-section-title">Practice before the real conversation.</h2>
          <p className="interview-section-subtitle">
            Experience realistic technical and behavioral question flows with live feedback on clarity and evidence.
          </p>
        </div>

        {/* Intentional Dark Navy Simulation Chamber Panel */}
        <div className="interview-chamber-panel">
          <div className="chamber-topbar">
            <div className="chamber-rec-indicator">
              <span className="rec-dot" aria-hidden />
              <span className="mono rec-text">REC 04:22</span>
            </div>
            <div className="chamber-controls" aria-hidden>
              <Mic size={18} />
              <Video size={18} />
              <Settings size={18} />
            </div>
          </div>

          <div className="chamber-body">
            {/* Main Stage Question & Waveform */}
            <div className="chamber-main-stage">
              <div className="question-content">
                <span className="question-badge mono">CURRENT QUESTION · Q2</span>
                <blockquote className="interviewer-question">
                  &quot;Can you walk me through a time when you had to scale a system under unexpected load?&quot;
                </blockquote>

                <div
                  className={`chamber-waveform ${isMotionPaused ? "is-paused" : ""}`}
                  aria-hidden
                >
                  {waveformHeights.map((h, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${(i % 10) * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Feed & Session Timeline */}
            <div className="chamber-side-feed">
              <div className="candidate-cam-frame">
                <div className="cam-placeholder">
                  <span className="cam-label mono">CANDIDATE_CAM</span>
                  <span className="cam-sublabel mono">LIVE FEED PREVIEW</span>
                </div>
              </div>

              <div className="session-timeline">
                <h4 className="timeline-heading mono">SESSION TIMELINE</h4>
                <div className="timeline-items">
                  <div className="timeline-item item-done">
                    <PlaySquare size={14} color="var(--success)" aria-hidden />
                    <span>Q1: System Design</span>
                  </div>
                  <div className="timeline-item item-active">
                    <PlaySquare size={14} color="var(--accent)" aria-hidden />
                    <span>Q2: Scaling Strategy</span>
                  </div>
                  <div className="timeline-item item-upcoming">
                    <PlaySquare size={14} aria-hidden />
                    <span>Q3: Team Conflict</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="chamber-footer-note mono">
            Product preview / demo — mock interview simulation environment.
          </div>
        </div>
      </div>
    </section>
  );
}
