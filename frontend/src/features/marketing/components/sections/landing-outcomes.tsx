import { CheckCircle2, Eye, LineChart, Target, Zap } from "lucide-react";

export function LandingOutcomes() {
  const OUTCOMES = [
    {
      action: "KNOW",
      title: "why a role matches.",
      description: "Understand the exact overlap between your experience and target role criteria.",
      icon: Target,
    },
    {
      action: "SEE",
      title: "which evidence is missing.",
      description: "Spot skill and experience gaps instantly before sending a single application.",
      icon: Eye,
    },
    {
      action: "PRACTICE",
      title: "before the interview.",
      description: "Rehearse responses in a realistic practice room with actionable speech feedback.",
      icon: Zap,
    },
    {
      action: "IMPROVE",
      title: "without inventing experience.",
      description: "Strengthen resume framing using true, grounded evidence from your work.",
      icon: CheckCircle2,
    },
    {
      action: "TRACK",
      title: "how your profile evolves.",
      description: "Watch your candidate profile gain clarity and strength with every milestone.",
      icon: LineChart,
    },
  ];

  return (
    <section className="outcomes-section section" aria-label="Career Outcomes">
      <div className="container">
        <div className="outcomes-header">
          <p className="eyebrow mono">CLEAR OUTCOMES</p>
          <h2 className="outcomes-title">Clarity at every career decision.</h2>
        </div>

        <div className="outcomes-editorial-grid">
          {OUTCOMES.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.action} className="outcome-editorial-item">
                <div className="outcome-action-badge mono">
                  <IconComponent size={18} className="outcome-icon" aria-hidden />
                  <span>{item.action}</span>
                </div>
                <h3 className="outcome-item-title">{item.title}</h3>
                <p className="outcome-item-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
