import { Link } from "@/shared/ui/router-link";

export interface OpportunitySignal {
  id: string;
  role: string;
  location: string;
  matchedSkills: string[];
  gapSkills: string[];
}

const RADAR_JOBS: OpportunitySignal[] = [
  {
    id: "opp-1",
    role: "Backend Engineer",
    location: "Berlin · Remote",
    matchedSkills: ["Python", "FastAPI", "Docker"],
    gapSkills: ["Kubernetes"],
  },
  {
    id: "opp-2",
    role: "AI Engineer",
    location: "Bengaluru · Hybrid",
    matchedSkills: ["Python", "PyTorch"],
    gapSkills: ["AWS Deployment"],
  },
  {
    id: "opp-3",
    role: "ML Engineer",
    location: "Singapore · On-site",
    matchedSkills: ["Python", "C++"],
    gapSkills: ["CUDA Optimization"],
  },
];

export function LandingOpportunityRadar() {
  return (
    <section className="opportunity-radar-section section" aria-label="Opportunity Radar">
      <div className="container">
        <div className="radar-header">
          <p className="eyebrow mono">OPPORTUNITY RADAR</p>
          <h2 className="radar-title">Matching with clear rationale.</h2>
          <p className="radar-subtitle">
            Every role recommendation comes with transparent evidence matching so you know exactly why it fits and what gaps remain.
          </p>
        </div>

        <div className="radar-cards-grid">
          {RADAR_JOBS.map((job) => (
            <div key={job.id} className="radar-job-card">
              <div className="radar-card-top">
                <span className="radar-pulse-dot" aria-hidden />
                <h3 className="radar-job-title">{job.role}</h3>
                <p className="radar-job-location mono">{job.location}</p>
              </div>

              <div className="radar-card-matches">
                <div className="match-group group-matched">
                  <span className="match-label mono">MATCHED EVIDENCE</span>
                  <div className="match-tags">
                    {job.matchedSkills.map((s) => (
                      <span key={s} className="tag-matched">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="match-group group-gap">
                  <span className="match-label mono">EVIDENCE GAP</span>
                  <div className="match-tags">
                    {job.gapSkills.map((s) => (
                      <span key={s} className="tag-gap">
                        ! {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="radar-footer">
          <p className="mono radar-caption">
            Illustrative global role signals — matching explanations based on profile evidence.
          </p>
          <Link className="button button-primary" href="/jobs">
            Explore opportunity radar
          </Link>
        </div>
      </div>
    </section>
  );
}
