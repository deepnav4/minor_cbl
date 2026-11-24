import { QUADRANT_INFO, QUADRANTS } from "@/lib/cbl";
import type { Quadrant } from "@/lib/types";

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

export function QuadrantBadge({ q }: { q: Quadrant }) {
  return <span className={`badge q-${q}`}>{QUADRANT_INFO[q].label}</span>;
}

/** Stacked bar of quadrant counts. */
export function QuadrantBar({ counts }: { counts: Record<Quadrant, number> }) {
  const total = QUADRANTS.reduce((s, q) => s + counts[q], 0);
  if (!total) return <div className="qbar" />;
  return (
    <div className="qbar" title={QUADRANTS.map((q) => `${QUADRANT_INFO[q].label}: ${counts[q]}`).join(" · ")}>
      {QUADRANTS.map((q) =>
        counts[q] ? <div key={q} style={{ width: `${(counts[q] / total) * 100}%`, background: `var(--${q})` }} /> : null,
      )}
    </div>
  );
}

export function QuadrantLegend() {
  return (
    <div className="row small muted" style={{ gap: 14 }}>
      {QUADRANTS.map((q) => (
        <span key={q} className="row" style={{ gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: `var(--${q})` }} />
          {QUADRANT_INFO[q].label}
        </span>
      ))}
    </div>
  );
}

/** 2×2 knowledge-quadrant matrix: correctness × confidence. */
export function QuadrantMatrix({ counts }: { counts: Record<Quadrant, number> }) {
  const cell = (q: Quadrant) => (
    <div className={`cell q-${q}`}>
      <div className="n">{counts[q]}</div>
      <div className="l">{QUADRANT_INFO[q].label}</div>
      <div className="h">{QUADRANT_INFO[q].hint}</div>
    </div>
  );
  return (
    <div className="matrix">
      <div />
      <div className="axis">Confident</div>
      <div className="axis">Not confident</div>
      <div className="axis" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Correct</div>
      {cell("mastery")}
      {cell("doubt")}
      <div className="axis" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Incorrect</div>
      {cell("misinformed")}
      {cell("uninformed")}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  );
}

export function Loading() {
  return <div className="empty">Loading…</div>;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
