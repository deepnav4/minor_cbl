"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loading, ProgressBar } from "@/components/ui";
import { markStudied, useStore } from "@/lib/store";

export default function Study({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useStore();
  const [index, setIndex] = useState(0);
  if (!state) return <Loading />;

  const subject = state.subjects.find((s) => s.id === id);
  if (!subject) notFound();
  const pages = subject.pages;
  const studied = state.studied[id] ?? [];

  if (!pages.length) {
    return (
      <div className="card empty">
        No study content yet. <Link href={`/subjects/${id}`}>Back to subject</Link>
      </div>
    );
  }

  const page = pages[index];
  const topic = subject.topics.find((t) => t.id === page.topicId);
  const isDone = studied.includes(page.id);
  const pct = Math.round((studied.length / pages.length) * 100);

  const go = (i: number) => {
    setIndex(i);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="small muted">
            <Link href="/">Dashboard</Link> / <Link href={`/subjects/${id}`}>{subject.name}</Link> / Study
          </div>
          <h1 style={{ marginTop: 4 }}>Study: {subject.name}</h1>
        </div>
        <div style={{ minWidth: 220 }}>
          <div className="row small muted" style={{ justifyContent: "space-between", marginBottom: 4 }}>
            <span>Progress</span>
            <span>
              {studied.length}/{pages.length} pages
            </span>
          </div>
          <ProgressBar value={pct} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="pager" aria-label="Pages">
            {pages.map((p, i) => (
              <button
                key={p.id}
                className={`${i === index ? "active" : ""} ${studied.includes(p.id) ? "done" : ""}`}
                onClick={() => go(i)}
                title={p.title}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <span className="small muted">Outlined pages are studied</span>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 14 }}>
          <span className="badge badge-accent">{topic?.name}</span>
          <span className="small muted">
            Page {index + 1} of {pages.length}
          </span>
          <span className="spacer" />
          {isDone ? <span className="badge q-mastery">Studied ✓</span> : null}
        </div>
        <article className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.markdown}</ReactMarkdown>
        </article>
        <div className="row" style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <button className="btn" disabled={index === 0} onClick={() => go(index - 1)}>
            ← Previous
          </button>
          <span className="spacer" />
          {!isDone ? (
            <button className="btn" onClick={() => markStudied(id, page.id)}>
              Mark as studied
            </button>
          ) : null}
          {index < pages.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                markStudied(id, page.id);
                go(index + 1);
              }}
            >
              Next →
            </button>
          ) : (
            <Link
              href={`/subjects/${id}/quiz`}
              className="btn btn-primary"
              onClick={() => markStudied(id, page.id)}
            >
              Finish & test yourself →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
