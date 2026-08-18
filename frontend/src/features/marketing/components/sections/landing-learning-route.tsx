import { Link } from "@/shared/ui/router-link";

export interface TransitNode {
  id: string;
  step: string;
  label: string;
  detail: string;
  status: "target" | "gap" | "objective" | "resource" | "complete";
}

const TRANSIT_NODES: TransitNode[] = [
  {
    id: "tn-1",
    step: "01",
    label: "TARGET ROLE",
    detail: "Backend Engineer (Cloud & Systems)",
    status: "target",
  },
  {
    id: "tn-2",
    step: "02",
    label: "MISSING EVIDENCE",
    detail: "Kubernetes & Container Orchestration",
    status: "gap",
  },
  {
    id: "tn-3",
    step: "03",
    label: "LEARNING OBJECTIVE",
    detail: "Production Deployment Fundamentals",
    status: "objective",
  },
  {
    id: "tn-4",
    step: "04",
    label: "VERIFIED LEARNING RESOURCE",
    detail: "Hands-on K8s Cluster Setup & Helm Deployments",
    status: "resource",
  },
  {
    id: "tn-5",
    step: "05",
    label: "RE-ANALYSIS & VERIFICATION",
    detail: "Profile Updated with Confirmed Milestone",
    status: "complete",
  },
];

export function LandingLearningRoute() {
  return (
    <section className="learning-route-section section" aria-label="Skill Gap Learning Route">
      <div className="container">
        <div className="learning-header">
          <p className="eyebrow mono">SKILL-GAP ROUTE MAP</p>
          <h2 className="learning-title">Targeted learning transit map.</h2>
          <p className="learning-subtitle">
            Bridge verified evidence gaps with clear, sequential learning milestones designed specifically for your target role.
          </p>
        </div>

        <div className="transit-map-card">
          <div className="transit-line-path" aria-hidden />

          <div className="transit-nodes-grid">
            {TRANSIT_NODES.map((node) => (
              <div key={node.id} className={`transit-node-item node-type-${node.status}`}>
                <div className="transit-node-badge mono">
                  <span className="node-step">{node.step}</span>
                  <span className="node-dot-indicator" />
                </div>

                <div className="transit-node-content">
                  <span className="node-type-label mono">{node.label}</span>
                  <h3 className="node-detail">{node.detail}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="transit-footer-cta">
            <Link className="button button-primary" href="/learning">
              Explore your learning routes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
