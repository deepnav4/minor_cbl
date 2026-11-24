# Decisions log (append-only)

- **2026-11-24** — Monorepo with Turborepo + npm workspaces. Root holds `context/` and `utils/` alongside `apps/` and `packages/`.
- **2026-11-24** — PDF parsing is delegated to the existing structured-pdf-data microservice (HF Space); the monorepo talks to it over HTTP via `@minor/pdf-client`, configured by `PDF_SERVICE_URL`.
- **2026-11-24** — Stack: Next.js 16 for `apps/web`, Express 5 for `apps/api`, TypeScript everywhere. Started on Next 15, moved to 16 the same day because Next 15's postcss had a high-severity audit issue.
- **2026-11-24** — Internal packages (`@minor/pdf-client`) export TS source directly (no build step). The api runs on `tsx`. `build` only builds web; `typecheck` covers everything.
- **2026-11-24** — The browser never calls the PDF microservice directly; web → api (`/pdf/*`) → structured-pdf-data.
- **2026-11-24** — Phase 1 = frontend only, on mock data. The data layer stays behind one module so it can switch to the api later.
- **2026-11-24** — DB will be Postgres + Prisma (pgvector for RAG embeddings). LLM provider not decided yet.
- **2026-11-24** — Report (.tex) and deck (.pptx) follow the NIT Jalandhar format in `example_docs/` (B.Tech research report PDF + "Fine-Grained Hate Speech" deck).
- **2026-11-24** — App named **StudySense**.
- **2026-11-24** — Confidence is **never asked**. It is inferred from answer time vs an ideal time (with personal pace) and from answer changes. Formula in `confidence-based-learning.md`. Certainty-based marks and quadrants are unchanged.
- **2026-11-24** — Deck: compare against Amplifire (existing CBL LMS) and add a "why CBL" section. No formula slide and no status/roadmap slide (user request). New theme: indigo + amber.
- **2026-11-24** — Deck theme switched to **minimalist** (white, near-black text, single slate accent). Simple title and closing slides as in the example deck. The indigo/amber version was rejected as too loud.
- **2026-11-24** — The deck front page and the report title don't show "StudySense"; the title is the descriptive one. StudySense remains the app/system name inside the body and the UI.
- **2026-11-24** — Deck front page has no date; the last slide is just "Thank you" (no "Questions?"). User requests.
- **2026-11-24** — Chat deleted by the user after this point; `handoff.md` written as the recovery entry point.
