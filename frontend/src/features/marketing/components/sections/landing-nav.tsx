import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "@/shared/ui/router-link";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/shared/ui/primitives";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { prefetchRoute } from "@/shared/route-prefetch";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerTitleId = useId();

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trap focus when mobile drawer is open
  useEffect(() => {
    if (!open) return;
    const drawerNode = drawerRef.current;
    if (!drawerNode) return;

    const focusables = drawerNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (first) {
      first.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeDrawer();
        setTimeout(() => {
          menuButtonRef.current?.focus();
        }, 0);
      } else if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, closeDrawer]);

  return (
    <>
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        Skip to main content
      </a>

      <header className={`cnav-header ${scrolled ? "is-scrolled" : ""}`} aria-label="Primary">
        <div className="container cnav-inner">
          <Link href="/" className="cnav-brand">
            <span className="cnav-brand-icon" aria-hidden />
            <span className="cnav-brand-text">Career Copilot</span>
          </Link>

          {/* Desktop Links */}
          <nav className="cnav-links" aria-label="Main Navigation">
            <a href="#journey">How it works</a>
            <Link
              href="/resume-analysis?tab=upload"
              onMouseEnter={() => prefetchRoute("/resume-analysis")}
              onFocus={() => prefetchRoute("/resume-analysis")}
            >
              Resume Analysis
            </Link>
            <Link
              href="/mock-interview/preparation"
              onMouseEnter={() => prefetchRoute("/mock-interview")}
              onFocus={() => prefetchRoute("/mock-interview")}
            >
              Mock Interview
            </Link>
            <Link href="/sign-in" className="cnav-link-subtle">
              Sign in
            </Link>
            <span onMouseEnter={() => prefetchRoute("/sign-up")} onFocus={() => prefetchRoute("/sign-up")}>
              <ButtonLink href="/sign-up" className="button-primary cnav-cta">
                Get started
              </ButtonLink>
            </span>

            {/* Theme Toggle */}
            <ThemeToggle compact />

          </nav>

          {/* Mobile Menu Trigger */}
          <button
            ref={menuButtonRef}
            type="button"
            className="cnav-mobile-trigger"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
          >
            <Menu size={22} aria-hidden />
          </button>
        </div>
      </header>

      {/* Accessible Mobile Nav Drawer */}
      {open && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitleId}
          className="cnav-mobile-drawer"
        >
          <div className="cnav-drawer-overlay" onClick={() => { closeDrawer(); menuButtonRef.current?.focus(); }} />
          <div className="cnav-drawer-content">
            <div className="cnav-drawer-header">
              <h2 id={drawerTitleId} className="cnav-brand-text">
                Career Copilot
              </h2>
              <button
                type="button"
                className="cnav-drawer-close"
                onClick={() => { closeDrawer(); menuButtonRef.current?.focus(); }}
                aria-label="Close menu"
              >
                <X size={22} aria-hidden />
              </button>
            </div>

            <nav className="cnav-drawer-links" aria-label="Mobile Navigation">
              <a href="#journey" onClick={closeDrawer}>
                How it works
              </a>
              <Link href="/resume-analysis?tab=upload" onClick={closeDrawer}>
                Resume Analysis
              </Link>
              <Link href="/mock-interview/preparation" onClick={closeDrawer}>
                Mock Interview
              </Link>
              <Link href="/learning" onClick={closeDrawer}>
                Skill Learning
              </Link>
              <Link href="/jobs" onClick={closeDrawer}>
                Opportunities
              </Link>
              <hr className="cnav-drawer-hr" />
              <Link href="/sign-in" onClick={closeDrawer}>
                Sign in
              </Link>
              <ButtonLink href="/sign-up" className="button-primary cnav-drawer-btn" onClick={closeDrawer}>
                Start your journey
              </ButtonLink>

              <div className="cnav-drawer-controls">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
