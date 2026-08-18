import { useEffect, useMemo, useRef, useState } from "react";
import createGlobe from "cobe";
import { isWebGLAvailable } from "./globe-utils";

export type GlobeJobPin = {
  id: string;
  title: string;
  company?: string;
  location?: string | null;
  work_mode?: string | null;
  description?: string | null;
  requirements?: string[];
  application_url?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  latitude: number;
  longitude: number;
};

export { isWebGLAvailable };

const DEFAULT_NODES: GlobeJobPin[] = [
  { id: "node-1", title: "AI Engineer", company: "Meta", location: "Bengaluru", work_mode: "Hybrid", latitude: 12.9716, longitude: 77.5946 },
  { id: "node-2", title: "Data Analyst", company: "Barclays", location: "London", work_mode: "On-site", latitude: 51.5074, longitude: -0.1278 },
  { id: "node-3", title: "Backend Engineer", company: "Zalando", location: "Berlin", work_mode: "Remote", latitude: 52.5204, longitude: 13.405 },
  { id: "node-4", title: "Product Designer", company: "Shopify", location: "Toronto", work_mode: "Hybrid", latitude: 43.6532, longitude: -79.3832 },
  { id: "node-5", title: "ML Engineer", company: "Grab", location: "Singapore", work_mode: "On-site", latitude: 1.3521, longitude: 103.8198 },
  { id: "node-6", title: "Cloud Engineer", company: "Atlassian", location: "Sydney", work_mode: "Remote", latitude: -33.8688, longitude: 151.2093 },
];

export default function CareerGlobe({ jobs = DEFAULT_NODES }: { jobs?: GlobeJobPin[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeJobs = jobs.length > 0 ? jobs : DEFAULT_NODES;

  const markers = useMemo(
    () =>
      activeJobs
        .filter(
          (job) =>
            typeof job.latitude === "number" &&
            Number.isFinite(job.latitude) &&
            typeof job.longitude === "number" &&
            Number.isFinite(job.longitude),
        )
        .slice(0, 12)
        .map((job) => ({
          location: [job.latitude, job.longitude] as [number, number],
          size: 0.05,
        })),
    [activeJobs],
  );

  // Cycle active node callout automatically every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeJobs.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeJobs.length]);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebgl(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = containerRef.current?.clientWidth || 440;
    const onResize = () => {
      width = containerRef.current?.clientWidth || 440;
    };
    window.addEventListener("resize", onResize);

    let globe: ReturnType<typeof createGlobe> | undefined;
    let frame = 0;
    let phi = 0;

    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.2,
        dark: 0, // Light Mode Globe
        diffuse: 1.1,
        mapSamples: 16000,
        mapBrightness: 2.8,
        baseColor: [0.91, 0.94, 0.97], // Light pale ice blue-white
        markerColor: [0.09, 0.41, 0.67], // #1769aa primary navy
        glowColor: [0.85, 0.91, 0.97], // Soft atmosphere glow
        markers,
      });
    } catch {
      setWebgl(false);
      window.removeEventListener("resize", onResize);
      return;
    }

    const animate = () => {
      phi += 0.003;
      globe?.update({
        phi,
        theta: 0.2,
        width: width * 2,
        height: width * 2,
        markers,
      });
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      globe?.destroy();
    };
  }, [markers]);

  const activeJob = activeJobs[activeIndex] || activeJobs[0];

  if (!webgl) {
    return (
      <div
        className="radar-globe-fallback"
        data-testid="career-globe"
        role="img"
        aria-label="Global Career Radar map unavailable"
      >
        <div className="radar-fallback-inner">
          <p className="mono">CAREER RADAR NODES</p>
          <ul className="radar-fallback-list">
            {activeJobs.slice(0, 6).map((n, idx) => (
              <li key={n.id} className={idx === activeIndex ? "is-active" : ""}>
                <strong>{n.title}</strong> {n.location ? `· ${n.location}` : ""} ({n.work_mode || "Hybrid"})
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="radar-globe-wrapper"
      data-testid="career-globe"
      role="application"
      aria-label="Interactive Global Career Radar map"
    >
      <div className="radar-globe-circle">
        <canvas ref={canvasRef} className="radar-globe-canvas" />

        {/* Dynamic Single Callout Connected to Active Point */}
        {activeJob && (
          <div className="radar-callout-overlay" role="status" aria-live="polite">
            <div className="radar-callout-card">
              <span className="radar-callout-pulse" aria-hidden />
              <div className="radar-callout-info">
                <strong className="radar-callout-title">{activeJob.title}</strong>
                <div className="radar-callout-meta">
                  {activeJob.location && <span>{activeJob.location}</span>}
                  {activeJob.location && activeJob.work_mode && <span className="meta-sep">•</span>}
                  {activeJob.work_mode && <span>{activeJob.work_mode}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
