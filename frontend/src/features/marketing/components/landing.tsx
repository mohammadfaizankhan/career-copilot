import {
  ArrowUpRight,
  Check,
  Compass,
  FileText,
  Mic2,
  Radar,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { MotionProvider } from "../motion-context";
import { ButtonLink } from "@/shared/ui/primitives";
import { Link } from "@/shared/ui/router-link";
import { prefetchRoute } from "@/shared/route-prefetch";
import { LandingNav } from "./sections/landing-nav";

const CareerGlobe = lazy(() => import("@/features/jobs/components/career-globe"));

const journey = [
  { number: "01", label: "Read", title: "Resume + role", text: "Turn a resume and a target description into structured, usable evidence.", href: "/resume-analysis?tab=upload", icon: FileText },
  { number: "02", label: "Trace", title: "Evidence map", text: "See every skill connected to the line of work that proves it.", href: "/resume-analysis?tab=ats", icon: Radar },
  { number: "03", label: "Shape", title: "Sharper story", text: "Improve how your real experience reads without inventing a thing.", href: "/resume-analysis?tab=review", icon: Wrench },
  { number: "04", label: "Rehearse", title: "Interview room", text: "Practice the hard answer before a real person asks for it.", href: "/mock-interview/preparation", icon: Mic2 },
  { number: "05", label: "Close", title: "Skill route", text: "Follow the shortest learning route to your next credible milestone.", href: "/learning", icon: Target },
  { number: "06", label: "Move", title: "Role radar", text: "Find opportunities with a reason attached—not just a score.", href: "/jobs", icon: Compass },
];

const roleSignals = [
  ["Backend Engineer", "Berlin", "Remote"],
  ["AI Engineer", "Bengaluru", "Hybrid"],
  ["Product Designer", "Toronto", "Hybrid"],
  ["ML Engineer", "Singapore", "On-site"],
];

export function LandingPage() {
  return (
    <MotionProvider>
      <div className="atlas-landing landing-page-root">
        <LandingNav />

        <main id="main-content">
          <section className="atlas-hero" aria-label="Career Atlas introduction">
            <div className="atlas-container atlas-hero-grid">
              <div className="atlas-hero-copy">
                <p className="atlas-kicker"><span className="atlas-kicker-mark" /> CAREER ATLAS / FIELD NOTES 01</p>
                <h1>Navigate your career with evidence, not guesswork.</h1>
                <p className="atlas-hero-lede">Career Copilot turns the messy middle of a job search into a visible route: what you know, what is missing, and what to do next.</p>
                <div className="atlas-actions">
                  <span onMouseEnter={() => prefetchRoute("/sign-up")} onFocus={() => prefetchRoute("/sign-up")}>
                    <ButtonLink href="/sign-up" className="atlas-button atlas-button-dark">Start your career journey</ButtonLink>
                  </span>
                  <a href="#journey" className="atlas-text-link">See how it works <ArrowUpRight size={16} aria-hidden /></a>
                </div>
                <div className="atlas-hero-proof"><Check size={15} aria-hidden /><span>Private by default · grounded in your own work</span></div>
              </div>

              <div className="atlas-orbit-stage light-globe" role="img" aria-label="Illustrative global roles map">
                <div className="atlas-orbit-label atlas-orbit-label-top mono">LIVE CAREER SIGNALS <span>04</span></div>
                <div className="atlas-orbit-ring atlas-orbit-ring-outer" />
                <div className="atlas-orbit-ring atlas-orbit-ring-inner" />
                <div className="atlas-orbit-crosshair atlas-orbit-crosshair-x" />
                <div className="atlas-orbit-crosshair atlas-orbit-crosshair-y" />
                <div className="atlas-orbit-core">
                  <Suspense fallback={<div className="atlas-globe-fallback"><Compass size={24} /></div>}>
                    <div className="atlas-globe-shell" aria-hidden="true"><CareerGlobe /></div>
                  </Suspense>
                </div>
                <div className="atlas-orbit-card atlas-orbit-card-a"><span className="atlas-orbit-dot" /><strong>AI Engineer</strong><small>Bengaluru · Hybrid</small></div>
                <div className="atlas-orbit-card atlas-orbit-card-b"><span className="atlas-orbit-dot atlas-orbit-dot-warm" /><strong>Backend Engineer</strong><small>Berlin · Remote</small></div>
                <div className="atlas-orbit-card atlas-orbit-card-c"><span className="atlas-orbit-dot atlas-orbit-dot-muted" /><strong>ML Engineer</strong><small>Singapore · On-site</small></div>
                <div className="atlas-orbit-axis mono">N 13° 04' 22" · EVIDENCE FIELD</div>
                <p className="atlas-orbit-caption mono">Illustrative global roles — opportunity patterns, not live openings.</p>
              </div>
            </div>
            <div className="atlas-hero-index mono">CC / 2026 <span>SCROLL TO EXPLORE</span> ↘</div>
          </section>

          <section className="atlas-signal-band" aria-label="Illustrative global role signals ticker">
            <div className="atlas-signal-band-inner atlas-container">
              <span className="atlas-signal-band-title mono">FIELD SIGNALS</span>
              <div className="atlas-signal-list">{roleSignals.map(([role, location, mode]) => <span className="atlas-signal-pill" key={role}><i /> {role} <b>{location}</b> <small>{mode}</small></span>)}</div>
            </div>
          </section>

          <section id="journey" className="atlas-journey atlas-section" aria-label="Career route">
            <div className="atlas-container">
              <div className="atlas-section-intro">
                <p className="atlas-kicker">FROM SIGNAL TO DIRECTION</p>
                <h2>A job search with a north star.</h2>
                <p>Six connected moves. Every one leaves a clearer record for the next.</p>
              </div>
              <div className="atlas-journey-grid">
                {journey.map(({ number, label, title, text, href, icon: Icon }) => (
                  <article key={number} data-journey-card className="atlas-route-card">
                    <div className="atlas-route-card-top"><span className="atlas-route-number mono">{number}</span><Icon size={19} strokeWidth={1.7} aria-hidden /></div>
                    <p className="atlas-route-label mono">{label}</p>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <Link href={href} className="atlas-card-link">Open {label.toLowerCase()} <ArrowUpRight size={15} aria-hidden /></Link>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="atlas-proof atlas-section" aria-label="Evidence engine">
            <div className="atlas-container atlas-proof-grid">
              <div className="atlas-section-intro atlas-proof-copy">
                <p className="atlas-kicker">THE SOURCE MAP</p>
                <h2>Your resume is not a PDF. It is a source map.</h2>
                <p>Career Copilot keeps recommendations accountable. Select a skill and trace it back to the exact experience, project, or practice session that supports it.</p>
                <Link href="/resume-analysis?tab=upload" className="atlas-text-link">Explore resume analysis <ArrowUpRight size={16} aria-hidden /></Link>
              </div>
              <div className="atlas-source-board">
                <div className="atlas-board-bar"><span><i /> SOURCE / RESUME_2026.PDF</span><span className="mono">3 LINKS FOUND</span></div>
                <div className="atlas-board-body">
                  <div className="atlas-source-column"><span className="mono">EXPERIENCE</span><p>Built scalable services using <mark>Go</mark> and <mark>Docker</mark>.</p><span className="mono">PROJECT</span><p>Designed a high-throughput API in <mark>FastAPI</mark>.</p></div>
                  <div className="atlas-source-connector"><span /><span /><span /></div>
                  <div className="atlas-evidence-column"><span className="mono">VERIFIED CHIPS</span><div className="atlas-evidence-chip"><b>Go (Golang)</b><small><Check size={12} /> experience</small></div><div className="atlas-evidence-chip"><b>Docker / Containers</b><small><Check size={12} /> experience</small></div><div className="atlas-evidence-chip atlas-evidence-chip-warm"><b>FastAPI / REST APIs</b><small><Sparkles size={12} /> project evidence</small></div></div>
                </div>
              </div>
            </div>
          </section>

          <section className="atlas-console atlas-section" aria-label="Decision console">
            <div className="atlas-container">
              <div className="atlas-console-heading"><p className="atlas-kicker">THE DECISION CONSOLE</p><h2>Know the move before you make it.</h2><p>Transparent enough to trust. Specific enough to act on.</p></div>
              <div className="atlas-console-window">
                <div className="atlas-console-top"><span className="mono">ROLE FIT / BACKEND ENGINEER</span><span className="atlas-live-tag"><i /> LIVE PROFILE</span></div>
                <div className="atlas-console-grid">
                  <div className="atlas-console-score"><span className="mono">EVIDENCE FIT</span><strong>78<small>%</small></strong><div className="atlas-score-bar"><i /></div><p>Strong foundation. One visible gap.</p></div>
                  <div className="atlas-console-list"><div><span className="atlas-check-box"><Check size={13} /></span><span><b>Python core</b><small>confirmed in experience</small></span></div><div><span className="atlas-check-box"><Check size={13} /></span><span><b>API architecture</b><small>confirmed in project work</small></span></div><div className="atlas-console-gap"><span className="atlas-gap-box">+</span><span><b>Kubernetes</b><small>build one milestone before applying</small></span></div></div>
                  <div className="atlas-console-next"><span className="mono">RECOMMENDED NEXT</span><strong>Close the gap</strong><p>Start a targeted route for production deployment fundamentals.</p><Link href="/learning" className="atlas-console-link">Open learning route <ArrowUpRight size={15} aria-hidden /></Link></div>
                </div>
              </div>
            </div>
          </section>

          <section className="atlas-interview atlas-section" aria-label="Interview practice">
            <div className="atlas-container atlas-interview-grid">
              <div><p className="atlas-kicker">THE PRACTICE ROOM</p><h2>Confidence is a traceable skill.</h2><p>Practice answers, not vibes. Your interview record becomes another signal in the profile that guides your next move.</p><Link href="/mock-interview/preparation" className="atlas-text-link">Enter the practice room <ArrowUpRight size={16} aria-hidden /></Link></div>
              <div className="atlas-interview-card"><div className="atlas-interview-chrome"><span className="atlas-live-tag"><i /> RECORDING</span><span className="mono">Q2 / 05:14</span></div><div className="atlas-interview-question">“Tell me about a time you scaled a system under unexpected load.”</div><div className="atlas-waveform" aria-hidden>{[20, 38, 52, 28, 65, 42, 72, 34, 56, 26, 44, 68, 35, 52, 24, 40].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="atlas-interview-foot"><span>clarity <b>84</b></span><span>evidence <b>91</b></span><span>pace <b>76</b></span></div></div>
            </div>
          </section>

          <section className="atlas-cta atlas-section" aria-label="Start your career journey">
            <div className="atlas-container atlas-cta-inner"><span className="atlas-cta-compass"><Compass size={24} /></span><p className="atlas-kicker">NEXT COORDINATE</p><h2>Your next role should have a reason.</h2><p>Build the profile that makes your progress visible—to you first, and to the right opportunity next.</p><div className="atlas-actions"><span onMouseEnter={() => prefetchRoute("/sign-up")} onFocus={() => prefetchRoute("/sign-up")}><ButtonLink href="/sign-up" className="atlas-button atlas-button-dark">Create my profile</ButtonLink></span><Link href="/sign-in" className="atlas-text-link">I already have an atlas <ArrowUpRight size={16} aria-hidden /></Link></div></div>
          </section>
        </main>

        <footer className="atlas-footer"><div className="atlas-container atlas-footer-inner"><Link href="/" className="atlas-footer-brand"><span /> Career Copilot</Link><p>Private career records. Evidence you can review.</p><nav aria-label="Footer navigation"><Link href="/sign-in">Sign in</Link><Link href="/sign-up">Create account</Link><a href="#journey">How it works</a><Link href="/resume-analysis?tab=upload">Resume analysis</Link><Link href="/mock-interview/preparation">Mock interview</Link></nav></div></footer>
      </div>
    </MotionProvider>
  );
}
