"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProficiencyChart } from "@/components/charts";
import { formatDate, Loading, ProgressBar, QuadrantBar, QuadrantLegend, Stat } from "@/components/ui";
import { subjectProficiency, topicStandings } from "@/lib/cbl";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const state = useStore();
  const router = useRouter();
  if (!state) return <Loading />;

  const { subjects, reports, studied } = state;

  const rows = subjects.map((s) => {
    const subjectReports = reports.filter((r) => r.subjectId === s.id);
    const standings = topicStandings(s, subjectReports, studied[s.id] ?? []);
    const studyPct = s.pages.length ? Math.round(((studied[s.id] ?? []).length / s.pages.length) * 100) : 0;
    return {
      subject: s,
      reports: subjectReports,
      proficiency: subjectProficiency(standings),
      mastered: standings.filter((t) => (t.proficiency ?? 0) >= 80).length,
      studyPct,
    };
  });

  const ranked = rows.filter((r) => r.proficiency !== null);
  const avg = ranked.length ? Math.round(ranked.reduce((s, r) => s + (r.proficiency ?? 0), 0) / ranked.length) : null;

  // One point per quiz, one line per subject.
  const chartSeries = subjects.filter((s) => reports.some((r) => r.subjectId === s.id)).map((s) => ({ key: s.id, name: s.name }));
  const chartData = reports.map((r) => {
    const point: Record<string, string | number | null> = { label: formatDate(r.createdAt).replace(/ \d{4}$/, "") };
    for (const s of chartSeries) point[s.key] = s.key === r.subjectId ? r.proficiency : null;
    return point;
  });
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Your subjects, proficiency and every evaluation so far.</p>
        </div>
        <Link href="/subjects/new" className="btn btn-primary">
          + Add subject
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Stat label="Subjects" value={subjects.length} />
        <Stat label="Quizzes taken" value={reports.length} />
        <Stat label="Average proficiency" value={avg === null ? "—" : `${avg}%`} sub="confidence-weighted" />
        <Stat label="Topics mastered" value={rows.reduce((s, r) => s + r.mastered, 0)} sub="proficiency ≥ 80%" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        {rows.map(({ subject, reports: rs, proficiency, studyPct }) => {
          const last = rs[rs.length - 1];
          return (
            <Link key={subject.id} href={`/subjects/${subject.id}`} className="card" style={{ color: "inherit", textDecoration: "none" }}>
              <div className="card-head">
                <div>
                  <h2>{subject.name}</h2>
                  <p>
                    {subject.source.type === "pdf" ? "From PDF" : "From syllabus image"} · {subject.topics.length} topics
                  </p>
                </div>
                {proficiency === null ? (
                  <span className="badge">Not ranked</span>
                ) : (
                  <span className="badge badge-accent">{proficiency}% proficient</span>
                )}
              </div>
              <div className="stack" style={{ gap: 10 }}>
                <div>
                  <div className="row small muted" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <span>Study progress</span>
                    <span>{studyPct}%</span>
                  </div>
                  <ProgressBar value={studyPct} />
                </div>
                <div>
                  <div className="row small muted" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <span>Latest quiz</span>
                    <span>{last ? `${formatDate(last.createdAt)} · ${rs.length} taken` : "No quiz yet"}</span>
                  </div>
                  {last ? <QuadrantBar counts={last.quadrants} /> : <div className="small muted">Take one test to unlock rankings.</div>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Proficiency over time</h2>
              <p>Confidence-weighted score per quiz</p>
            </div>
          </div>
          {reports.length ? (
            <ProficiencyChart data={chartData} series={chartSeries} />
          ) : (
            <div className="empty">No quizzes yet.</div>
          )}
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h2>How confidence-based learning reads your answers</h2>
              <p>Confidence is measured from your answer time, so you never have to rate yourself</p>
            </div>
          </div>
          <div className="stack small" style={{ gap: 10 }}>
            <div><span className="badge q-mastery">Mastery</span> Correct and confident. This is real knowledge.</div>
            <div><span className="badge q-doubt">Doubt</span> Correct but slow or hesitant. The knowledge is fragile and needs reinforcing.</div>
            <div><span className="badge q-misinformed">Misinformed</span> Wrong but answered quickly. A misconception, so it is fixed first.</div>
            <div><span className="badge q-uninformed">Uninformed</span> Wrong and hesitant. A plain gap that is easy to fill.</div>
            <Link href="/about" className="small">Read how scoring works →</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Evaluation reports</h2>
            <p>Every quiz is stored and used to generate the next one</p>
          </div>
          <QuadrantLegend />
        </div>
        {reports.length ? (
          <div className="table-wrap">
            <table className="table table-click">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Accuracy</th>
                  <th>Proficiency</th>
                  <th style={{ width: "26%" }}>Quadrants</th>
                </tr>
              </thead>
              <tbody>
                {[...reports].reverse().map((r) => (
                  <tr key={r.id} onClick={() => router.push(`/reports/${r.id}`)}>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>{subjectName(r.subjectId)}</td>
                    <td><span className="badge">{r.kind === "diagnostic" ? "Diagnostic" : "Practice"}</span></td>
                    <td>{r.accuracy}%</td>
                    <td><strong>{r.proficiency}%</strong></td>
                    <td><QuadrantBar counts={r.quadrants} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No reports yet.</div>
        )}
      </div>
    </>
  );
}
