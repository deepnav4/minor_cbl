"use client";
import Link from "next/link";
import { QuadrantMatrix } from "@/components/ui";
import { resetDemo } from "@/lib/store";

export default function About() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }} className="stack">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <h1>How confidence-based learning works</h1>
          <p>How StudySense measures what you know <em>and</em> how sure you are, without asking.</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 8 }}>The problem with normal tests</h2>
        <p style={{ margin: 0 }}>
          A normal score can&rsquo;t tell a lucky guess from real knowledge. Two students can both score 70%, while one of them knows the
          material and the other guessed half of it, or is confidently wrong about key ideas. Confidence-based learning (CBL) measures two
          things for every answer: <strong>is it correct</strong>, and <strong>how confident are you</strong>. StudySense never asks you to rate
          your confidence. It reads it from your behaviour: how long you take compared with the ideal time, and whether you keep changing
          your answer.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 12 }}>The four knowledge quadrants</h2>
        <QuadrantMatrix counts={{ mastery: 0, doubt: 0, misinformed: 0, uninformed: 0 }} />
        <ul className="small" style={{ marginBottom: 0 }}>
          <li><strong>Mastery</strong>: the only state that reliably turns into performance.</li>
          <li><strong>Doubt</strong>: correct, but slow or hesitant. You&rsquo;d hesitate under pressure. Practice turns it into mastery.</li>
          <li><strong>Misinformed</strong>: wrong, but answered quickly and without hesitation. A misconception you&rsquo;d act on without realising, so these are fixed first.</li>
          <li><strong>Uninformed</strong>: wrong and hesitant. An honest gap, and the easiest kind to fill.</li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Measuring confidence from time</h2>
        <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>
          <li>
            <strong>Ideal time</strong> for each question = 4 s + (words in the question and options ÷ 3.5 words/s) + thinking time
            (6 s recall, 12 s understanding, 30 s calculation).
          </li>
          <li>
            <strong>Your pace</strong> = median of (your time ÷ ideal time) over your earlier correct answers, kept between 0.7 and 1.5.
            Naturally slow readers aren&rsquo;t marked as unsure.
          </li>
          <li>
            <strong>Time ratio</strong> r = your time ÷ (ideal time × your pace).
          </li>
          <li>
            <strong>Time factor</strong>: 1 when r ≤ 1, falling linearly to 0 at r = 2.5. Answers faster than a quarter of the ideal time
            (r &lt; 0.25) get 0.35, because nobody can read the question that fast.
          </li>
          <li>
            <strong>Hesitation factor</strong> = 0.7 for every time you change your answer.
          </li>
          <li>
            <strong>Confidence</strong> = time factor × hesitation factor. <strong>High</strong> ≥ 0.7, <strong>Medium</strong> ≥ 0.4,
            otherwise <strong>Low</strong>. High and Medium count as confident.
          </li>
        </ol>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Scoring (certainty-based marking)</h2>
        <table className="table">
          <thead>
            <tr><th>Inferred confidence</th><th>Correct</th><th>Wrong</th></tr>
          </thead>
          <tbody>
            <tr><td>High</td><td className="ok">+3</td><td className="bad">−6</td></tr>
            <tr><td>Medium</td><td className="ok">+2</td><td className="bad">−2</td></tr>
            <tr><td>Low</td><td className="ok">+1</td><td>0</td></tr>
          </tbody>
        </table>
        <p className="small muted" style={{ marginBottom: 0 }}>
          A fast wrong answer costs the most because it signals a misconception. Topic proficiency = marks earned ÷ maximum marks, floored
          at 0.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 8 }}>The learning loop</h2>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li><strong>Diagnose</strong>: your first test covers every topic and sets your rankings.</li>
          <li><strong>Prescribe</strong>: topics are ranked by weakness, misconceptions and how much you have studied.</li>
          <li><strong>Learn</strong>: study the generated content page by page.</li>
          <li>
            <strong>Iterate</strong>: every report is stored, and each new quiz is generated from <em>all</em> previous reports
            (iterative RAG). You keep going until you reach mastery, not just a pass mark.
          </li>
        </ol>
      </div>

      <div className="row small muted">
        <span>Demo data is kept in this browser only.</span>
        <button
          className="btn"
          onClick={() => {
            resetDemo();
            alert("Demo data reset.");
          }}
        >
          Reset demo data
        </button>
        <span className="spacer" />
        <Link href="/">Back to dashboard</Link>
      </div>
    </div>
  );
}
