import { ButtonLink } from "@/shared/ui/primitives";

export function LandingCta() {
  return (
    <section className="final-cta-section section" aria-label="Final Career CTA">
      <div className="container">
        <div className="final-cta-card">
          {/* Destination Node Marker */}
          <div className="destination-node-marker">
            <div className="coordinate-circle" aria-hidden>
              <span className="coordinate-dot" />
            </div>
            <span className="coordinate-label mono">NEXT COORDINATE</span>
          </div>

          <h2 className="final-cta-title">Your next role should not depend on guesswork.</h2>

          <p className="final-cta-copy">
            Build one evidence-backed career profile that improves every time you analyze, practice,
            learn and apply.
          </p>

          <div className="final-cta-actions">
            <ButtonLink href="/sign-up" className="button-primary hero-btn-main">
              Create your profile
            </ButtonLink>
            <ButtonLink href="/sign-in" className="button-secondary">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
