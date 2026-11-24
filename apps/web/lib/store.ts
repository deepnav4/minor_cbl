"use client";
// Phase-1 data layer: mock seed data + the user's own activity kept in localStorage.
// In phase 2 these functions become calls to apps/api; the pages don't need to change.
import { useEffect, useState } from "react";
import { seedReports, seedStudied, seedSubjects } from "./mock";
import type { Report, Subject } from "./types";

export interface State {
  subjects: Subject[];
  reports: Report[];
  studied: Record<string, string[]>;
}

interface Saved {
  subjects: Subject[];
  reports: Report[];
  studied: Record<string, string[]>;
}

const KEY = "studysense-v2";
const listeners = new Set<() => void>();
let saved: Saved | null = null;

function read(): Saved {
  if (saved) return saved;
  saved = { subjects: [], reports: [], studied: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) saved = { ...saved, ...JSON.parse(raw) };
  } catch {
    // storage unavailable: run on seed data only
  }
  return saved!;
}

function write(next: Saved) {
  saved = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

function snapshot(): State {
  const s = read();
  const studied: Record<string, string[]> = { ...seedStudied };
  for (const [k, v] of Object.entries(s.studied)) studied[k] = v;
  return {
    subjects: [...seedSubjects, ...s.subjects],
    reports: [...seedReports, ...s.reports].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    studied,
  };
}

/** Returns null until mounted on the client (avoids hydration mismatches). */
export function useStore(): State | null {
  const [state, setState] = useState<State | null>(null);
  useEffect(() => {
    const update = () => setState(snapshot());
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return state;
}

export function addReport(report: Report) {
  const s = read();
  write({ ...s, reports: [...s.reports, report] });
}

export function addSubject(subject: Subject) {
  const s = read();
  write({ ...s, subjects: [...s.subjects, subject] });
}

export function markStudied(subjectId: string, pageId: string) {
  const current = snapshot().studied[subjectId] ?? [];
  if (current.includes(pageId)) return;
  const s = read();
  write({ ...s, studied: { ...s.studied, [subjectId]: [...current, pageId] } });
}

export function resetDemo() {
  write({ subjects: [], reports: [], studied: {} });
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
