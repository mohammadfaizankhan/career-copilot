import { useEffect, useState } from "react";
import { useMotion } from "../motion-context";

export function LandingTrajectory() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const { isMotionPaused } = useMotion();

  useEffect(() => {
    let frameId: number | null = null;
    const handleScroll = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const current = Math.min(1, Math.max(0, window.scrollY / totalHeight));
          setScrollPercent(current);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="landing-trajectory-background" aria-hidden>
      <svg
        className="trajectory-svg"
        viewBox="0 0 1200 4000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="trajectoryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1769aa" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#3da2ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0b2942" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1769aa" stopOpacity="1" />
          </linearGradient>
          <filter id="trajectoryGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Structural Background Path */}
        <path
          d="M 280 280 Q 280 600, 600 750 T 600 1300 T 600 1850 T 600 2400 T 600 2950 T 600 3500 T 600 3850"
          fill="none"
          stroke="rgba(23, 105, 170, 0.12)"
          strokeWidth="2"
        />

        {/* Animated Active Trajectory Path */}
        <path
          d="M 280 280 Q 280 600, 600 750 T 600 1300 T 600 1850 T 600 2400 T 600 2950 T 600 3500 T 600 3850"
          fill="none"
          stroke="url(#trajectoryGrad)"
          strokeWidth="2.5"
          strokeDasharray="4000"
          strokeDashoffset={isMotionPaused ? 0 : 4000 * (1 - scrollPercent)}
          filter="url(#trajectoryGlow)"
          style={{ transition: isMotionPaused ? "none" : "stroke-dashoffset 120ms linear" }}
        />
      </svg>
    </div>
  );
}
