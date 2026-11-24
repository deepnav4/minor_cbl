# StudySense: product architecture (from the user's hand-drawn diagram, 2026-11-24)

An AI study platform built on **confidence-based learning** (see `confidence-based-learning.md`).

## Flow
1. **Input** — the user adds a subject's material: a **PDF**, or just an **image of the syllabus**.
2. **Content generation**
   - **If PDF** → RAG system. PDF goes to the structured-pdf-data microservice (`structured-pdf-data.md`)
     for markdown/chunks → generate proper study content → present as **markdown with pagination**.
   - **If not a PDF** (syllabus image) → generate study content with AI → store the response as **markdown**.
3. **Subject dashboard** (one per subject) — shows the current learning status.
   Initially there are **no rankings or proficiency** values: the student must take **one test first** to get rankings.
   From here, two paths:
   - **Just study** through the provided content → track how much is studied and which topics are left;
     re-rank topics with small factors from that.
   - **Give evaluation / quiz** → Quiz evaluation (below).
4. **Quiz evaluation**
   - Proper **full screen**, with a **proper time limit**.
   - Uses **CBA (confidence-based assessment)** and **CBL (confidence-based learning)**. Confidence is **not asked**: it is inferred
     from **how much time the user takes** compared with the question's ideal time, and from answer changes
     (formula in `confidence-based-learning.md`).
   - After finishing → **generate report** → redirect to the dashboard with a thank-you message.
5. **Evaluation reports store (iterative RAG)**
   - Keep the full content of **every previous evaluation** stored as a report.
   - Whenever a new quiz is generated, feed **all previous evaluation reports** into the generator, so the
     quiz targets what still needs improvement. This is the "iterative RAG" loop.
6. **Main dashboard** — shows all included subjects, with proficiency per subject shown through **graphs** and other small details.
   - All previous study reports for the subject and all topics given so far.
   - **All evaluation report details**. A report says which topics are good, which are bad, and which answers were correct or incorrect;
     graphs show improvement over time.
   - Clicking a report opens a **detailed report** of what happened in that quiz.

## Mapping to the monorepo
- `apps/web` (Next.js): upload, subject dashboard, study reader (paginated markdown), full-screen quiz, reports, main dashboard.
- `apps/api` (Express): orchestration, LLM calls, RAG, persistence.
- structured-pdf-data (external): PDF → markdown/chunks.
