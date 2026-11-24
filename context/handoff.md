# Handoff — state at end of the first build session (2026-11-24)

The original chat was deleted. This file plus the rest of `context/` is everything you need.

## What exists right now
| Thing | Where | State |
|---|---|---|
| Monorepo | `~/Desktop/minor` | Turborepo + npm workspaces; deps installed; **not a git repo yet** (nothing committed) |
| Web app (StudySense) | `apps/web` | Next.js 16, all screens working on **mock data** (no backend calls yet). Verified in the browser: dashboard, subject page, study reader, full-screen quiz → report → redirect with thanks |
| API | `apps/api` | Express 5: `/health`, `/pdf/health`, `/pdf/process?source=` → proxies the live PDF microservice (verified) |
| PDF client | `packages/pdf-client` | Typed fetch client for structured-pdf-data |
| PDF microservice | `~/Desktop/structured-pdf-data` (separate repo) | Live at https://nvdp4-structured-pdf-data.hf.space, see `structured-pdf-data.md` |
| Report | `utils/project-report.tex` | Full report (≈1,340 lines), NIT Jalandhar format. **Never compiled**: no LaTeX on this Mac, so use Overleaf (upload the .tex + `utils/assets/nitj-logo.png`) |
| Deck | `utils/presentation.pptx` | 17 slides, minimalist; built by `utils/build_presentation.py` |
| Example docs (format reference) | `example_docs/` | NIT Jalandhar B.Tech research report PDF + "Fine-Grained Hate Speech" pptx the user wants us to match |

## Web app screens (apps/web/app)
- `/` main dashboard: stats, subject cards, proficiency-over-time chart, all eval reports
- `/subjects/new`: add subject (PDF or syllabus image). Creates a `pending` subject; generation isn't wired up yet
- `/subjects/[id]`: subject dashboard: rankings table (priority order), improvement chart, quadrant trend, reports, still-to-study list; `?thanks=<reportId>` banner
- `/subjects/[id]/study`: paginated markdown reader, marks pages studied
- `/subjects/[id]/quiz`: full-screen timed quiz (10 Q × 60 s), **no confidence prompt**; tracks time and answer changes
- `/reports/[id]`: quadrant matrix, summary, time-vs-ideal chart, per-topic table, question review
- `/about`: "How it works" (CBL + timing formula + marks)
- Key code: `lib/cbl.ts` (all scoring/inference), `lib/store.ts` (data layer; localStorage key `studysense-v2`), `lib/mock.ts` (seed data: OS with 3 reports 37→53→73%, DBMS with none)

## Deck (utils/presentation.pptx) — current slide list
1 Title (NIT Jalandhar layout; heading **"Confidence-Based Adaptive Learning with Iterative RAG"**, no "StudySense", **no date**; Presented by 3 students; Under the supervision of Dr. Nisha Chaurasia, Department of Information Technology) ·
2 A score alone hides what a student knows (Student A 70% vs Student B 0%) · 3 Why do we need CBL (6 reasons) ·
4 Four knowledge quadrants · 5 Literature review · 6 Existing system: Amplifire · 7 StudySense vs Amplifire (table) ·
8 Problem statement and objectives · 9 System architecture · 10 Scoring and adaptive quizzes (marks table, **no formulas**) ·
11 PDF microservice · 12 Technology stack · 13 Prototype: dashboards · 14 Prototype: quiz and report ·
15 Conclusion · 16 References [1]–[11] · 17 Thank you (just "Thank you" + logo, **no "Questions?"**)

**User asked to remove:** the formula slide, the status/roadmap slide, the date on the front page, and "Questions?" on the last slide. Don't re-add them.

Tooling:
- Rebuild: `/Users/navdeep/Desktop/structured-pdf-data/.venv/bin/python utils/build_presentation.py` (that venv has python-pptx + Pillow)
- Preview without PowerPoint: `... python utils/preview_deck.py utils/presentation.pptx /tmp/deck` (PNG per slide + overflow warnings)
- Refresh app screenshots: `utils/capture_screens.sh` (stop `npm run dev` first)
- No PowerPoint/Keynote/LibreOffice on this Mac, so the deck has only been checked through previews

## Report (utils/project-report.tex)
- Title: "A Confidence-Based Adaptive Learning Platform with Iterative Retrieval-Augmented Generation" (no STUDYSENSE on the title page, declaration, certificate or PDF metadata; the body still calls the system StudySense)
- Supervisor: Dr. Nisha Chaurasia, Assistant Professor (designation taken from the example deck), Department of Information Technology
- Chapters: 1 Introduction · 2 Background & Literature Review · 3 Proposed System & Methodology (incl. §3.6.1 inferred-confidence equations 3.1–3.6) · 4 Implementation (+ Evaluation Plan, **no fabricated results**) · 5 Conclusion & Future Work · Bibliography
- **Still has "November 2026" on its title page.** The deck's date was removed; the user didn't say whether to remove it from the report (ask).
- **Not yet in the report:** the Amplifire comparison and the "why CBL" two-students example, which exist only in the deck (offered, not done).
- After the first Overleaf compile, check: TikZ figure spacing (Fig 3.1, iterative-RAG loop), the Turborepo URL (`turborepo.com/docs` vs `turbo.build`), the Express citation (OpenJS Foundation)

## Open items / next steps
1. Compile the report in Overleaf and fix any layout issues
2. Ask: remove the date from the report title page? Add the Amplifire / why-CBL material to the report?
3. `git init` + first commit (the user hasn't asked yet; offer it)
4. Phase 2: Postgres + Prisma + pgvector; choose an LLM provider (undecided); generate study content, question bank and quizzes from past reports (iterative RAG); replace `lib/store.ts` with api calls
5. Pilot study to calibrate the timing-based confidence constants against self-reported confidence

## How this user likes to work
- **Ask before building when there's any doubt** (said explicitly). Use quick multiple-choice questions.
- Prefers **simple, minimal, classic** design: no loud blue, no multi-colour themes. Applies to the deck and likely the app too.
- Writes short, informal messages with typos; infer intent, confirm only real ambiguity.
- Wants `context/` kept up to date so chats can be deleted.
