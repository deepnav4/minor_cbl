"use client";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Loading } from "@/components/ui";
import { buildReport, personalPace, pickQuestions, scoreResponse, topicStandings } from "@/lib/cbl";
import { addReport, newId, useStore } from "@/lib/store";
import type { Question } from "@/lib/types";

const QUESTION_COUNT = 10;
const SECONDS_PER_QUESTION = 60;

export default function Quiz({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useStore();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<(number | null)[]>([]);
  /** answer changes per question: a hesitation signal */
  const [switches, setSwitches] = useState<number[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const startedAt = useRef(0);
  const questionStartedAt = useRef(0);

  const subject = state?.subjects.find((s) => s.id === id);
  const reports = state ? state.reports.filter((r) => r.subjectId === id) : [];
  const isDiagnostic = reports.length === 0;
  const timeLimit = Math.min(QUESTION_COUNT, subject?.questions.length ?? QUESTION_COUNT) * SECONDS_PER_QUESTION;

  const finish = useCallback(
    (finalTimes: number[]) => {
      if (!questions || !subject || finishing) return;
      setFinishing(true);
      const pace = personalPace(reports);
      const responses = questions.map((q, i) =>
        scoreResponse(q, chosen[i] ?? null, Math.max(1, Math.round(finalTimes[i] ?? 0)), switches[i] ?? 0, pace),
      );
      const report = buildReport({
        id: newId("r"),
        subjectId: subject.id,
        createdAt: new Date().toISOString(),
        kind: isDiagnostic ? "diagnostic" : "practice",
        timeLimitSec: timeLimit,
        responses,
      });
      addReport(report);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      router.push(`/subjects/${subject.id}?thanks=${report.id}`);
    },
    [questions, subject, finishing, chosen, switches, reports, isDiagnostic, timeLimit, router],
  );

  // Count down; when time runs out, submit what we have.
  useEffect(() => {
    if (!questions || finishing) return;
    const t = setInterval(() => {
      const left = timeLimit - Math.floor((Date.now() - startedAt.current) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        const final = [...times];
        final[index] = (final[index] ?? 0) + (Date.now() - questionStartedAt.current) / 1000;
        finish(final);
      }
    }, 250);
    return () => clearInterval(t);
  }, [questions, finishing, timeLimit, times, index, finish]);

  if (!state) return <Loading />;
  if (!subject) notFound();

  if (subject.status !== "ready" || subject.questions.length === 0) {
    return (
      <div className="card empty">
        This subject has no question bank yet. <Link href={`/subjects/${id}`}>Back to subject</Link>
      </div>
    );
  }

  const start = () => {
    const standings = topicStandings(subject, reports, state.studied[id] ?? []);
    const qs = pickQuestions(subject, reports, standings, QUESTION_COUNT);
    setQuestions(qs);
    setChosen(qs.map(() => null));
    setSwitches(qs.map(() => 0));
    setTimes(qs.map(() => 0));
    setIndex(0);
    startedAt.current = Date.now();
    questionStartedAt.current = Date.now();
    setRemaining(qs.length * SECONDS_PER_QUESTION);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  // ---- intro ----
  if (!questions) {
    return (
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="small muted">
          <Link href={`/subjects/${id}`}>{subject.name}</Link> / Quiz
        </div>
        <h1 style={{ margin: "6px 0 10px" }}>{isDiagnostic ? "Diagnostic test" : "Practice quiz"}</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          {isDiagnostic
            ? "This first test covers every topic evenly. It sets your starting rankings."
            : "This quiz is built from your previous reports. It focuses on misconceptions first, then gaps, then shaky topics, and re-checks a few mastered ones."}
        </p>
        <div className="grid grid-3" style={{ margin: "18px 0" }}>
          <div className="card" style={{ boxShadow: "none" }}>
            <div className="stat-label">Questions</div>
            <div className="stat-value">{Math.min(QUESTION_COUNT, subject.questions.length)}</div>
          </div>
          <div className="card" style={{ boxShadow: "none" }}>
            <div className="stat-label">Time limit</div>
            <div className="stat-value">{timeLimit / 60} min</div>
          </div>
          <div className="card" style={{ boxShadow: "none" }}>
            <div className="stat-label">Mode</div>
            <div className="stat-value" style={{ fontSize: 18, paddingTop: 6 }}>Full screen</div>
          </div>
        </div>
        <h3>How you are evaluated</h3>
        <p className="small" style={{ margin: "6px 0 10px" }}>
          Just answer. You won&rsquo;t be asked how sure you are. Your <strong>confidence is measured automatically</strong> from how long
          you take compared with the ideal time for that question, and from how often you change your answer.
        </p>
        <table className="table" style={{ margin: "8px 0 18px" }}>
          <thead>
            <tr>
              <th>Your behaviour</th>
              <th>Read as</th>
              <th>If correct</th>
              <th>If wrong</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Within the ideal time, no changes</td><td><strong>High</strong> confidence</td><td className="ok">+3</td><td className="bad">−6</td></tr>
            <tr><td>Somewhat slow, or one change</td><td><strong>Medium</strong></td><td className="ok">+2</td><td className="bad">−2</td></tr>
            <tr><td>Much slower, or several changes</td><td><strong>Low</strong></td><td className="ok">+1</td><td>0</td></tr>
          </tbody>
        </table>
        <p className="small muted">
          Answering quickly but wrongly counts as a misconception, and those are what the next quiz targets first. Your normal speed is
          learned from earlier quizzes, so slow readers aren&rsquo;t penalised.
        </p>
        <button className="btn btn-primary btn-lg" onClick={start}>
          Start quiz in full screen
        </button>
      </div>
    );
  }

  // ---- running ----
  const q = questions[index];
  const last = index === questions.length - 1;
  const canNext = chosen[index] !== null;
  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, "0");

  const choose = (i: number) => {
    if (chosen[index] === i) return;
    if (chosen[index] !== null) setSwitches(switches.map((s, j) => (j === index ? s + 1 : s)));
    setChosen(chosen.map((c, j) => (j === index ? i : c)));
  };

  const next = () => {
    const now = Date.now();
    const updated = [...times];
    updated[index] += (now - questionStartedAt.current) / 1000;
    questionStartedAt.current = now;
    setTimes(updated);
    if (last) finish(updated);
    else setIndex(index + 1);
  };

  const topicName = subject.topics.find((t) => t.id === q.topicId)?.name;

  return (
    <div className="quiz-shell">
      <div className="quiz-top">
        <strong>{subject.name}</strong>
        <span className="badge">{isDiagnostic ? "Diagnostic" : "Practice"}</span>
        <span className="spacer" />
        <span className="small muted">
          Question {index + 1} / {questions.length}
        </span>
        <span className={`timer ${remaining < 60 ? "low" : ""}`} aria-label="Time remaining">
          ⏱ {mm}:{ss}
        </span>
      </div>
      <div className="bar" style={{ borderRadius: 0, height: 4 }}>
        <div style={{ width: `${(index / questions.length) * 100}%`, borderRadius: 0 }} />
      </div>
      <div className="quiz-body">
        <div className="small muted" style={{ marginBottom: 6 }}>{topicName}</div>
        <h2 style={{ fontSize: 21, marginBottom: 20 }}>{q.prompt}</h2>
        <div className="stack" style={{ gap: 10 }}>
          {q.options.map((opt, i) => (
            <button key={i} className={`option ${chosen[index] === i ? "selected" : ""}`} onClick={() => choose(i)}>
              <span className="letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>

        <div className="row" style={{ marginTop: 28 }}>
          <span className="small muted">{canNext ? "" : "Choose an answer to continue."}</span>
          <span className="spacer" />
          <button className="btn btn-primary btn-lg" disabled={!canNext || finishing} onClick={next}>
            {last ? (finishing ? "Generating report…" : "Finish & generate report") : "Next question →"}
          </button>
        </div>
      </div>
    </div>
  );
}
