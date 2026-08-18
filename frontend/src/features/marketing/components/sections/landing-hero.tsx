import { lazy, Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/shared/ui/primitives";
import { prefetchRoute } from "@/shared/route-prefetch";

const CareerGlobe = lazy(() => import("@/features/jobs/components/career-globe"));

export function LandingHero() {
  return (
    <section className="landing-hero landing-hero-container section" aria-label="Hero section">
      <div className="landing-hero-grid container">
        {/* Left Column: Copy & Actions */}
        <div className="hero-copy-column">
          <div className="hero-eyebrow-badge mono">
            <span className="eyebrow-dot" aria-hidden />
            CAREER NAVIGATION / EVIDENCE-DRIVEN
          </div>

          <h1 className="hero-heading">
            Navigate your career with evidence, not guesswork.
          </h1>

          <p className="hero-supporting-text">
            Analyze your resume, understand verified gaps, practice interviews, build relevant
            skills, and discover roles that match your progress.
          </p>

          <div className="hero-cta-group">
            <span onMouseEnter={() => prefetchRoute("/sign-up")} onFocus={() => prefetchRoute("/sign-up")}>
              <ButtonLink href="/sign-up" className="button-primary hero-btn-main">
                Start your career journey
              </ButtonLink>
            </span>
            <a href="#journey" className="button button-secondary hero-btn-sub">
              See how it works
            </a>
          </div>

          <div className="hero-evidence-note">
            <ShieldCheck size={16} className="hero-evidence-icon" aria-hidden />
            <span>One career profile. Every analysis, interview, skill and opportunity connected.</span>
          </div>

          <div className="hero-signal-grid" aria-label="Career Copilot workflow summary">
            <div className="hero-signal-card">
              <strong>01</strong>
              <span>living profile</span>
            </div>
            <div className="hero-signal-card">
              <strong>05</strong>
              <span>evidence paths</span>
            </div>
            <div className="hero-signal-card hero-signal-card-accent">
              <strong>∞</strong>
              <span>next moves</span>
            </div>
          </div>
        </div>

        {/* Right Column: Global Career Radar Globe */}
        <div className="hero-radar-column" aria-label="Global Career Radar map">
          <Suspense
            fallback={
              <div
                className="radar-globe-fallback"
                data-testid="mock-globe"
                role="img"
                aria-label="Illustrative global roles map"
              >
                Loading map...
              </div>
            }
          >
            <CareerGlobe />
          </Suspense>
          <p className="hero-radar-caption mono">
            Illustrative global roles — opportunity patterns, not live openings.
          </p>
        </div>
      </div>
    </section>
  );
}
