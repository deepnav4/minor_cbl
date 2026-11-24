// Confidence-based learning (CBL) scoring.
// Documented in context/confidence-based-learning.md and the project report.
import type { Confidence, Quadrant, Question, Report, Response, Subject, TopicResult } from "./types";

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

// ---- Implicit confidence -------------------------------------------------------------------
// The student is never asked how sure they are. Confidence is inferred from behaviour:
// how long they took compared with an ideal time, and whether they kept changing their answer.

const READING_WORDS_PER_SEC = 3.5; // ≈ 210 words per minute
const THINK_SEC: Record<1 | 2 | 3, number> = { 1: 6, 2: 12, 3: 30 };
const BASE_SEC = 4;

/** Ideal time = base + reading time of prompt and options + thinking time for the difficulty. */
export function idealTimeSec(q: Question): number {
  const words = [q.prompt, ...q.options].join(" ").split(/\s+/).filter(Boolean).length;
  return Math.round(BASE_SEC + words / READING_WORDS_PER_SEC + THINK_SEC[q.difficulty ?? 2]);
}

/**
 * The student's personal pace: median of (time / ideal) over their previous CORRECT answers,
 * clamped to [0.7, 1.5]. Slow-but-sure readers aren't marked unconfident for being slow readers.
 * Needs at least 5 samples, otherwise 1.
 */
export function personalPace(reports: Report[]): number {
  const ratios = reports
    .flatMap((r) => r.responses)
    .filter((r) => r.correct && r.idealSec > 0)
    .map((r) => r.timeSec / r.idealSec)
    .sort((a, b) => a - b);
  if (ratios.length < 5) return 1;
  const mid = Math.floor(ratios.length / 2);
  const median = ratios.length % 2 ? ratios[mid] : (ratios[mid - 1] + ratios[mid]) / 2;
  return Math.min(1.5, Math.max(0.7, median));
}

/**
 * r = time / (ideal × pace)
 * time factor  f_t = 0.35 if r < 0.25 (too fast to have read it: a rushed guess)
 *                    1 if r ≤ 1, falls linearly to 0 at r = 2.5, 0 beyond
 * switch factor f_s = 0.7 ^ answer changes
 * confidence   c = f_t × f_s  →  High ≥ 0.7, Medium ≥ 0.4, else Low
 */
export function inferConfidence(timeSec: number, idealSec: number, switches: number, pace = 1) {
  const r = timeSec / Math.max(1, idealSec * pace);
  const ft = r < 0.25 ? 0.35 : r <= 1 ? 1 : r >= 2.5 ? 0 : 1 - (r - 1) / 1.5;
  const fs = Math.pow(0.7, switches);
  const score = Math.round(ft * fs * 100) / 100;
  const level: Confidence = score >= 0.7 ? 3 : score >= 0.4 ? 2 : 1;
  return { score, level, ratio: Math.round(r * 100) / 100 };
}

/** Certainty-based marking (Gardner-Medwin): reward confident knowledge, penalise confident errors. */
const MARKS_CORRECT: Record<Confidence, number> = { 1: 1, 2: 2, 3: 3 };
const MARKS_WRONG: Record<Confidence, number> = { 1: 0, 2: -2, 3: -6 };
export const MAX_MARKS_PER_QUESTION = 3;

export const QUADRANTS: Quadrant[] = ["mastery", "doubt", "misinformed", "uninformed"];

export const QUADRANT_INFO: Record<Quadrant, { label: string; hint: string }> = {
  mastery: { label: "Mastery", hint: "Correct and confident" },
  doubt: { label: "Doubt", hint: "Correct but slow or hesitant" },
  misinformed: { label: "Misinformed", hint: "Wrong but answered confidently: fix first" },
  uninformed: { label: "Uninformed", hint: "Wrong and hesitant" },
};

export function emptyQuadrants(): Record<Quadrant, number> {
  return { mastery: 0, doubt: 0, misinformed: 0, uninformed: 0 };
}

export function quadrantOf(correct: boolean, confidence: Confidence | null): Quadrant {
  const confident = confidence !== null && confidence >= 2;
  if (correct) return confident ? "mastery" : "doubt";
  return confident ? "misinformed" : "uninformed";
}

export function marksFor(correct: boolean, confidence: Confidence | null): number {
  if (confidence === null) return 0;
  return correct ? MARKS_CORRECT[confidence] : MARKS_WRONG[confidence];
}

export function scoreResponse(
  q: Question,
  chosen: number | null,
  timeSec: number,
  switches: number,
  pace = 1,
): Response {
  const correct = chosen !== null && chosen === q.answer;
  const idealSec = idealTimeSec(q);
  const inferred = chosen === null ? null : inferConfidence(timeSec, idealSec, switches, pace);
  const confidence = inferred ? inferred.level : null;
  return {
    questionId: q.id,
    topicId: q.topicId,
    chosen,
    correct,
    timeSec,
    idealSec,
    switches,
    confidenceScore: inferred ? inferred.score : null,
    confidence,
    marks: marksFor(correct, confidence),
    quadrant: quadrantOf(correct, confidence),
  };
}

const pct = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 100);

export function buildReport(args: {
  id: string;
  subjectId: string;
  createdAt: string;
  kind: Report["kind"];
  timeLimitSec: number;
  responses: Response[];
}): Report {
  const { responses } = args;
  const byTopic = new Map<string, TopicResult>();
  const quadrants = emptyQuadrants();
  let marks = 0;
  let correct = 0;

  for (const r of responses) {
    let t = byTopic.get(r.topicId);
    if (!t) {
      t = { topicId: r.topicId, questions: 0, correct: 0, marks: 0, proficiency: 0, quadrants: emptyQuadrants() };
      byTopic.set(r.topicId, t);
    }
    t.questions++;
    t.marks += r.marks;
    t.quadrants[r.quadrant]++;
    if (r.correct) {
      t.correct++;
      correct++;
    }
    quadrants[r.quadrant]++;
    marks += r.marks;
  }
  for (const t of byTopic.values()) {
    t.proficiency = pct(t.marks / (t.questions * MAX_MARKS_PER_QUESTION));
  }
  const maxMarks = responses.length * MAX_MARKS_PER_QUESTION;
  return {
    ...args,
    totalTimeSec: responses.reduce((s, r) => s + r.timeSec, 0),
    topics: [...byTopic.values()],
    accuracy: pct(correct / Math.max(1, responses.length)),
    proficiency: pct(marks / Math.max(1, maxMarks)),
    marks,
    maxMarks,
    quadrants,
  };
}

export interface TopicStanding {
  topicId: string;
  name: string;
  /** null until the topic has been tested at least once */
  proficiency: number | null;
  misinformedShare: number;
  studied: number;
  priority: number;
  latest: TopicResult | null;
}

/**
 * Current standing per topic: the latest tested result for each topic,
 * re-ranked by priority = (1 - proficiency) + 0.5 * misinformed share + 0.1 * unstudied fraction.
 */
export function topicStandings(subject: Subject, reports: Report[], studiedPageIds: string[]): TopicStanding[] {
  const sorted = [...reports].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const studiedSet = new Set(studiedPageIds);

  return subject.topics
    .map((topic) => {
      let latest: TopicResult | null = null;
      for (const r of sorted) {
        const t = r.topics.find((x) => x.topicId === topic.id);
        if (t) latest = t;
      }
      const pages = subject.pages.filter((p) => p.topicId === topic.id);
      const studied = pages.length ? pages.filter((p) => studiedSet.has(p.id)).length / pages.length : 0;
      const proficiency = latest ? latest.proficiency : null;
      const misinformedShare = latest ? latest.quadrants.misinformed / latest.questions : 0;
      const priority = (1 - (proficiency ?? 0) / 100) + 0.5 * misinformedShare + 0.1 * (1 - studied);
      return { topicId: topic.id, name: topic.name, proficiency, misinformedShare, studied, priority, latest };
    })
    .sort((a, b) => b.priority - a.priority);
}

/** Subject proficiency = mean of tested topic proficiencies. */
export function subjectProficiency(standings: TopicStanding[]): number | null {
  const tested = standings.filter((s) => s.proficiency !== null);
  if (!tested.length) return null;
  return Math.round(tested.reduce((s, t) => s + (t.proficiency ?? 0), 0) / tested.length);
}

/**
 * Pick questions for the next quiz. This stands in for the iterative-RAG generator:
 * with no history it's a balanced diagnostic, otherwise it weights topics by priority
 * and prefers questions previously answered Misinformed > Uninformed > Doubt, and
 * re-tests a few Mastery ones for retention.
 */
export function pickQuestions(
  subject: Subject,
  reports: Report[],
  standings: TopicStanding[],
  count: number,
): Question[] {
  const bank = subject.questions;
  if (bank.length <= count) return shuffle(bank);

  if (!reports.length) {
    // Diagnostic: round-robin across topics.
    const byTopic = subject.topics.map((t) => shuffle(bank.filter((q) => q.topicId === t.id)));
    const out: Question[] = [];
    for (let i = 0; out.length < count; i++) {
      for (const list of byTopic) if (list[i] && out.length < count) out.push(list[i]);
    }
    return shuffle(out);
  }

  const lastQuadrant = new Map<string, Response["quadrant"]>();
  for (const r of [...reports].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    for (const resp of r.responses) lastQuadrant.set(resp.questionId, resp.quadrant);
  }
  const quadWeight: Record<Response["quadrant"], number> = { misinformed: 3, uninformed: 2, doubt: 1.5, mastery: 0.4 };
  const prio = new Map(standings.map((s) => [s.topicId, s.priority]));

  const scored = bank.map((q) => {
    const quad = lastQuadrant.get(q.id);
    const w = (prio.get(q.topicId) ?? 1) * (quad ? quadWeight[quad] : 1.2);
    return { q, key: w * (0.75 + Math.random() * 0.5) };
  });
  scored.sort((a, b) => b.key - a.key);
  return shuffle(scored.slice(0, count).map((s) => s.q));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}
