# Related work: Amplifire (existing CBL platform)

Researched 2026-11-24. These facts come mostly from Amplifire's own materials and software-directory profiles, not independent studies.

- **What it is:** a commercial adaptive-learning platform built on confidence-based testing. Lineage: Dr James Bruno (UCLA) → Knowledge Factor → Amplifire.
- **Confidence:** **self-reported**. The learner commits to an answer with confidence, or says "I don't know yet".
- **Core idea:** find and fix **"confidently held misinformation"**. A wrong-but-confident answer triggers a "What You Need to Know" learning burst.
- **Adaptive to mastery**, plus "smart refreshers" a few weeks after first learning (learning fades and misinformation returns).
- **Content:** built by organisations in its course-authoring tool. Mostly healthcare, aviation, telecom and corporate training (enterprise).

## What StudySense adds (used on deck slide 7)
| Capability | Amplifire | StudySense |
|---|---|---|
| Confidence signal | self-reported | inferred from response time vs ideal time + answer changes |
| Gameable? | yes (learner picks it) | no (behavioural, no extra click) |
| Reading speed | n/a | personal pace learned from past correct answers |
| Content source | authored courses | generated from the student's own PDF / syllabus photo |
| Next quiz | adaptive engine over an authored item bank | iterative RAG over all past eval reports |
| Topic ranking | mastery state per item | proficiency + misconceptions + unstudied pages |
| Audience | enterprise | students, any subject, open-source stack |

## Sources
- Amplifire, "Confidently Held Misinformation" white paper: https://amplifire.com/wp-content/uploads/2024/04/Confidently-Held-Misinformation-1.pdf
- Software Advice profile: https://www.softwareadvice.com/lms/amplifire-learning-platform-profile/
- Confidence-based learning (Bruno lineage): https://www.wikipedia.org/wiki/Confidence-based_learning
