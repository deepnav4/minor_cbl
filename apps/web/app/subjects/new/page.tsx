"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addSubject, newId } from "@/lib/store";
import type { SourceType } from "@/lib/types";

const STEPS: Record<SourceType, string[]> = {
  pdf: [
    "PDF is sent to the structured-pdf-data service (Docling): markdown, or token-aware chunks for large files",
    "Chunks are embedded and indexed for retrieval (RAG)",
    "Study content is generated per topic as paginated markdown",
    "A question bank is generated for confidence-based quizzes",
  ],
  "syllabus-image": [
    "The syllabus image is read by a vision model to extract units and topics",
    "Study content is generated with AI for each topic and stored as markdown",
    "A question bank is generated for confidence-based quizzes",
  ],
};

export default function NewSubject() {
  const router = useRouter();
  const [type, setType] = useState<SourceType>("pdf");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) return;
    const id = newId("s");
    addSubject({
      id,
      name: name.trim(),
      source: { type, filename: file.name },
      createdAt: new Date().toISOString(),
      status: "pending",
      topics: [],
      pages: [],
      questions: [],
    });
    router.push(`/subjects/${id}`);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="page-head">
        <div>
          <div className="small muted">
            <Link href="/">Dashboard</Link> / Add subject
          </div>
          <h1 style={{ marginTop: 4 }}>Add a subject</h1>
          <p>Upload your notes as a PDF, or just a photo of the syllabus.</p>
        </div>
      </div>

      <form className="card stack" onSubmit={submit} style={{ gap: 20 }}>
        <div className="field">
          <label htmlFor="name">Subject name</label>
          <input id="name" className="input" placeholder="e.g. Computer Networks" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>Source</label>
          <div className="segmented">
            <button type="button" className={type === "pdf" ? "active" : ""} onClick={() => { setType("pdf"); setFile(null); }}>
              PDF notes / book
            </button>
            <button
              type="button"
              className={type === "syllabus-image" ? "active" : ""}
              onClick={() => { setType("syllabus-image"); setFile(null); }}
            >
              Syllabus image
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="file">{type === "pdf" ? "PDF file" : "Syllabus image"}</label>
          <div className="dropzone">
            <input
              id="file"
              type="file"
              accept={type === "pdf" ? "application/pdf" : "image/*"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="small" style={{ marginTop: 8 }}>
              {file ? `Selected: ${file.name}` : type === "pdf" ? "Choose a .pdf file" : "Choose a .jpg / .png photo of the syllabus"}
            </div>
          </div>
        </div>

        <div>
          <div className="stat-label" style={{ marginBottom: 6 }}>What happens next</div>
          <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {STEPS[type].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="banner banner-info small" style={{ margin: 0 }}>
          Prototype: the subject is created now, and content generation is connected in phase 2. Try the demo subjects on the dashboard
          to see the full flow.
        </div>

        <div className="row">
          <span className="spacer" />
          <Link href="/" className="btn">Cancel</Link>
          <button className="btn btn-primary" type="submit" disabled={!name.trim() || !file}>
            Create subject
          </button>
        </div>
      </form>
    </div>
  );
}
