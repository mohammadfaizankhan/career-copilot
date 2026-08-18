import { Link } from "@/shared/ui/router-link";

export function LandingFooter() {
  return (
    <footer className="landing-footer-container">
      <div className="container footer-inner-grid">
        <div className="footer-brand-column">
          <Link href="/" className="footer-brand-logo">
            <span className="footer-brand-dot" aria-hidden />
            <span>Career Copilot</span>
          </Link>
          <p className="footer-tagline">Private career records. Evidence you can review.</p>
        </div>

        <div className="footer-navigation-links">
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up">Create account</Link>
          <a href="#journey">How it works</a>
          <Link href="/resume-analysis?tab=upload">Resume analysis</Link>
          <Link href="/mock-interview/preparation">Mock interview</Link>
        </div>
      </div>
    </footer>
  );
}
