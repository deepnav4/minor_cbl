export type SourceType = "pdf" | "syllabus-image";

/** Inferred from answer time, never asked: 1 = Low, 2 = Medium, 3 = High */
export type Confidence = 1 | 2 | 3;

export type Quadrant = "mastery" | "doubt" | "misinformed" | "uninformed";

export interface Topic {
  id: string;
  name: string;
}

export interface StudyPage {
  id: string;
  topicId: string;
  title: string;
  markdown: string;
}

export interface Question {
  id: string;
  topicId: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  /** 1 = recall, 2 = understanding, 3 = calculation / multi-step. Defaults to 2. */
  difficulty?: 1 | 2 | 3;
}

export interface Subject {
  id: string;
  name: string;
  source: { type: SourceType; filename: string };
  createdAt: string;
  /** "ready" once study content + question bank have been generated. */
  status: "ready" | "pending";
  topics: Topic[];
  pages: StudyPage[];
  questions: Question[];
}

export interface Response {
  questionId: string;
  topicId: string;
  /** null = not answered before time ran out */
  chosen: number | null;
  correct: boolean;
  /** Time actually taken on the question. */
  timeSec: number;
  /** Expected time for a prepared student (see idealTimeSec). */
  idealSec: number;
  /** How many times the answer was changed before moving on. */
  switches: number;
  /** Inferred confidence in [0, 1]; null when unanswered. */
  confidenceScore: number | null;
  confidence: Confidence | null;
  marks: number;
  quadrant: Quadrant;
}

export interface TopicResult {
  topicId: string;
  questions: number;
  correct: number;
  marks: number;
  proficiency: number;
  quadrants: Record<Quadrant, number>;
}

export interface Report {
  id: string;
  subjectId: string;
  createdAt: string;
  kind: "diagnostic" | "practice";
  timeLimitSec: number;
  totalTimeSec: number;
  responses: Response[];
  topics: TopicResult[];
  accuracy: number;
  proficiency: number;
  marks: number;
  maxMarks: number;
  quadrants: Record<Quadrant, number>;
}
