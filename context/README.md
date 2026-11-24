# Context — read this first

This folder is the project's durable memory. If a chat/session is lost, a new
session (or a new teammate) should read these files in order to recover full context:

0. `handoff.md`: **start here**. Current state, open items, how the user likes to work
1. `project.md` — what this project is, structure, decisions, current status
2. `structured-pdf-data.md` — the external PDF microservice we depend on
3. `decisions.md` — log of decisions (append-only)

**Rule:** whenever something important is decided or built, update these files.

Also: `related-work-amplifire.md` (existing CBL LMS and how we differ), `architecture.md` (product flow from the user's diagram) and `confidence-based-learning.md` (core pedagogy).
