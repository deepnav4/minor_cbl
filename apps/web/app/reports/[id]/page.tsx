"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { TimeVsIdealChart } from "@/components/charts";
import { formatDate, Loading, ProgressBar, QuadrantBadge, QuadrantBar, QuadrantMatrix, Stat } from "@/components/ui";
import { CONFIDENCE_LABELS, formatDuration } from "@/lib/cbl";
import { useStore } from "@/lib/store";

export default function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useStore();
  if (!state) return <Loading />;

  const report = state.reports.find((r) => r.id === id);
  if (!report) notFound();
  const subject = state.subjects.find((s) => s.id === report.subjectId);
  if (!subject) notFound();

  const topicName = (tid: string) => subject.topics.find((t) => t.id === tid)?.name ?? tid;
  const question = (qid: string) => subject.questions.find((q) => q.id === qid);
  const avgTime = report.responses.length ? report.totalTimeSec / report.responses.length : 0;
  const idealTotal = report.responses.reduce((s, r) => s + r.idealSec, 0);
  const timeData = report.responses.map((r, i) => ({ label: `Q${i + 1}`, taken: r.timeSec, ideal: r.idealSec }));
  const sortedTopics = [...report.topics].sort((a, b) => b.proficiency - a.proficiency);
  const strong = sortedTopics.filter((t) => t.proficiency >= 70);
  const weak = sortedTopics.filter((t) => t.proficiency < 40 || t.quadrants.misinformed > 0);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="small muted">
            <Link href="/">Dashboard</Link> / <Link href={`/subjects/${subject.id}`}>{subject.name}</Link> / Report
          </div>
          <h1 style={{ marginTop: 4 }}>
            {report.kind === "diagnostic" ? "Diagnostic" : "Practice"} report: {subject.name}
          </h1>
          <p>
            {formatDate(report.createdAt)} · {report.responses.length} questions · time limit {formatDuration(report.timeLimitSec)}
          </p>
        </div>
        <Link href={`/subjects/${subject.id}/quiz`} className="btn btn-primary">
          Take the next quiz
        </Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Stat label="Proficiency" value={`${report.proficiency}%`} sub={`${report.marks} / ${report.maxMarks} certainty-based marks`} />
        <Stat label="Accuracy" value={`${report.accuracy}%`} sub="ignores confidence" />
        <Stat
          label="Time taken"
          value={formatDuration(report.totalTimeSec)}
          sub={`ideal ${formatDuration(idealTotal)} · avg ${formatDuration(avgTime)} per question`}
        />
        <Stat label="Confidently wrong" value={report.quadrants.misinformed} sub="fast but wrong: misconceptions to fix first" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Knowledge quadrants</h2>
              <p>Correctness × inferred confidence for every answer</p>
            </div>
          </div>
          <QuadrantMatrix counts={report.quadrants} />
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Summary</h2>
              <p>What this quiz says about you</p>
            </div>
          </div>
          <div className="stack small" style={{ gap: 12 }}>
            <div>
              <strong className="ok">Good topics</strong>
              <div>{strong.length ? strong.map((t) => topicName(t.topicId)).join(", ") : "None yet. Keep going."}</div>
            </div>
            <div>
              <strong className="bad">Needs attention</strong>
              <div>{weak.length ? weak.map((t) => topicName(t.topicId)).join(", ") : "Nothing urgent."}</div>
            </div>
            <div>
              <strong>Next quiz will focus on</strong>
              <div className="muted">
                Questions you answered quickly but wrongly (misconceptions), then the ones you were unsure about and missed, then the correct
                but slow ones. A few mastered questions are re-checked for retention.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div>
            <h2>Time vs ideal time</h2>
            <p>Confidence is inferred from this: within the ideal time reads as High, well over it as Low</p>
          </div>
        </div>
        <TimeVsIdealChart data={timeData} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div>
            <h2>By topic</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Correct</th>
                <th style={{ width: "24%" }}>Proficiency</th>
                <th style={{ width: "24%" }}>Quadrants</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {sortedTopics.map((t) => (
                <tr key={t.topicId}>
                  <td><strong>{topicName(t.topicId)}</strong></td>
                  <td>{t.correct} / {t.questions}</td>
                  <td>
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      <div style={{ flex: 1 }}><ProgressBar value={t.proficiency} /></div>
                      <span className="small" style={{ width: 36, textAlign: "right" }}>{t.proficiency}%</span>
                    </div>
                  </td>
                  <td><QuadrantBar counts={t.quadrants} /></td>
                  <td>
                    {t.quadrants.misinformed > 0 ? (
                      <span className="badge q-misinformed">Misconception</span>
                    ) : t.proficiency >= 70 ? (
                      <span className="badge q-mastery">Good</span>
                    ) : t.proficiency >= 40 ? (
                      <span className="badge q-doubt">Fragile</span>
                    ) : (
                      <span className="badge q-uninformed">Weak</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Question review</h2>
            <p>Every answer with your time, the ideal time and the inferred confidence</p>
          </div>
        </div>
        {report.responses.map((r, i) => {
          const q = question(r.questionId);
          if (!q) return null;
          return (
            <div key={r.questionId + i} className="review-item">
              <div className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                <span className="muted small" style={{ width: 26, flex: "none", paddingTop: 2 }}>{i + 1}.</span>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ justifyContent: "space-between", flexWrap: "nowrap", alignItems: "flex-start" }}>
                    <strong>{q.prompt}</strong>
                    <QuadrantBadge q={r.quadrant} />
                  </div>
                  <div className="answer-line">
                    Your answer:{" "}
                    <span className={r.correct ? "ok" : "bad"}>
                      {r.chosen === null ? "Not answered" : q.options[r.chosen]} {r.correct ? "✓" : "✗"}
                    </span>
                    {!r.correct ? (
                      <>
                        {" "}· Correct: <span className="ok">{q.options[q.answer]}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="answer-line muted small">
                    {topicName(q.topicId)} · Time {formatDuration(r.timeSec)} (ideal {formatDuration(r.idealSec)}) ·{" "}
                    {r.switches ? `changed answer ${r.switches}× · ` : ""}
                    Confidence: {r.confidence ? `${CONFIDENCE_LABELS[r.confidence]} (${Math.round((r.confidenceScore ?? 0) * 100)}%)` : "—"} ·{" "}
                    {r.marks > 0 ? `+${r.marks}` : r.marks} marks
                  </div>
                  <div className="answer-line small" style={{ marginTop: 6 }}>{q.explanation}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
