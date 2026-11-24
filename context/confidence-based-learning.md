# Confidence-Based Learning (CBL) — core idea of this project

Source read: BenchPrep blog, "Why confidence-based learning improves performance"
(https://blog.benchprep.com/why-confidence-based-learning-improves-performance). It is a vendor blog,
so treat it as background. It cites J. E. Bruno's knowledge-quadrant theory, ERIC ED562245, and
doi:10.15394/jaaer.2017.1717.

## What it is
A learner answers each question **and** rates how confident they are in that answer.
Assessment then uses two dimensions, **correctness × confidence**, not just a score. Ordinary tests reward
lucky guesses. CBL shows the difference between *knowing* and *guessing right*.

## The four knowledge quadrants (Bruno)
|                 | Confident          | Not confident        |
|-----------------|--------------------|----------------------|
| **Correct**     | **Mastery**        | **Doubt** (unsure)   |
| **Incorrect**   | **Misinformed** ⚠️  | **Uninformed**       |

- **Mastery**: the only state that reliably turns into real performance.
- **Misinformed** (confidently wrong): the "danger zone". Highest priority to fix.
- **Doubt** (right but unsure): knowledge is there but fragile. Under pressure the learner may hesitate or not act.
  A normal score can't detect this.
- **Uninformed** (wrong and knows it): a plain knowledge gap. Easiest to fix, since the learner already knows it's missing.
- The article names only Mastery, Misinformed and Doubtful. "Uninformed" is the standard name for the 4th quadrant in CBL literature.

## The learning cycle
**Diagnose → Prescribe → Learn → Iterate until mastery.**
A diagnostic test finds the gaps and the low-confidence areas, a personal plan follows, then practice, then repeat.
The goal is mastery in every topic, not a pass mark like 70%.

## CBA vs CBL (as used in this project)
- **CBA (confidence-based assessment)**: the *measurement*. Each quiz answer gets a confidence value **inferred from behaviour**:
  answer time compared with an ideal time, plus answer changes. The student is never asked to rate confidence
  (user decision, 2026-11-24).
- **CBL (confidence-based learning)**: the *loop*. Quadrant results drive the next study content and the next quiz.
  This is our "iterative RAG" over past eval reports.

## Implicit confidence formula (source of truth: `apps/web/lib/cbl.ts`)
1. **Ideal time** T_ideal = 4 s + W / 3.5 + T_think(d)
   - W = words in the prompt and all options (3.5 words/s ≈ 210 wpm)
   - T_think = 6 / 12 / 30 s for difficulty d = 1 recall / 2 understanding (default) / 3 calculation
2. **Personal pace** p = median(t / T_ideal) over the student's previous *correct* answers, clamped to [0.7, 1.5]. 1 if there are fewer than 5 samples.
3. **Time ratio** r = t / (T_ideal · p)
4. **Time factor** f_t = 0.35 if r < 0.25 (rushed); 1 if r ≤ 1; 1 − (r−1)/1.5 if 1 < r < 2.5; 0 if r ≥ 2.5
5. **Hesitation factor** f_s = 0.7^(answer changes)
6. **Confidence** c = f_t · f_s → **High** ≥ 0.7, **Medium** ≥ 0.4, else **Low**. Confident means High or Medium. Unanswered gets 0 marks and counts as Uninformed.

## Scoring (certainty-based marking, Gardner-Medwin)
| Inferred confidence | Correct | Wrong |
|---|---|---|
| High | +3 | −6 |
| Medium | +2 | −2 |
| Low | +1 | 0 |

- Topic proficiency = max(0, Σ marks) / (3 × questions) × 100
- Topic priority = (1 − proficiency/100) + 0.5 × misinformed share + 0.1 × unstudied fraction
- Next-quiz question weights by last quadrant: Misinformed 3, Uninformed 2, Doubt 1.5, Mastery 0.4 (retention re-check), untested 1.2
- Quadrant meanings in the UI: Doubt = "correct but slow/hesitant", Misinformed = "answered quickly but wrongly", Uninformed = "wrong and hesitant"
