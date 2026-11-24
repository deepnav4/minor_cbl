"""Builds utils/presentation.pptx (StudySense minor-project deck).

Run from the repo root (needs python-pptx + Pillow):
    python utils/build_presentation.py
Title-slide details: SUBTITLE (main heading), TEAM, SUPERVISOR, DEPARTMENT below.
Theme: minimalist. White slides, dark text, one muted slate accent, light grey surfaces.
Title and closing slides follow the NIT Jalandhar example deck (light background image).
"""
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
SCREENS = ASSETS / "screens"
OUT = ROOT / "presentation.pptx"

TITLE = "STUDYSENSE"
SUBTITLE = "Confidence-Based Adaptive Learning with Iterative RAG"
TEAM = [("Navdeep Singh", "24124073"), ("Rajesh Swami", "24109082"), ("Jai Bansal", "24123042")]
SUPERVISOR = "Dr. Nisha Chaurasia"
DEPARTMENT = "Department of Information Technology"

# ---- minimalist palette -----------------------------------------------------
HEADING = RGBColor(0x11, 0x18, 0x27)   # near-black
INK = RGBColor(0x37, 0x41, 0x51)       # body text
MUTED = RGBColor(0x6B, 0x72, 0x80)
ACCENT = RGBColor(0x47, 0x55, 0x69)    # muted slate: rules, numbers, small labels
SOFT = RGBColor(0xF5, 0xF5, 0xF4)      # light surface
LINE = RGBColor(0xE5, 0xE7, 0xEB)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0, 0, 0)
# knowledge-quadrant colours (soft tints; meaning matches the app)
GREEN = RGBColor(0x2F, 0x7D, 0x55)
GOLD = RGBColor(0x9A, 0x6B, 0x1F)
RED = RGBColor(0xB4, 0x3F, 0x37)
GREY = RGBColor(0x6B, 0x72, 0x80)
TINT = {GREEN: "EAF4EE", GOLD: "F8F1E4", RED: "F7E7E5", GREY: "F0F1F3"}

FONT = "Arial"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
slide_no = 0


# ---- helpers -------------------------------------------------------------------
def text(slide, x, y, w, h, value, size=16, bold=False, color=INK, font=FONT, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, italic=False, gap=0):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.04)
    tf.margin_top = tf.margin_bottom = Inches(0.02)
    for i, line in enumerate(value if isinstance(value, list) else [value]):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if gap:
            p.space_after = Pt(gap)
        r = p.add_run()
        r.text = line
        r.font.name = font
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.italic = italic
        r.font.color.rgb = color
    return box


def bullets(slide, x, y, w, h, items, size=15, color=INK, gap=8):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap)
        m = p.add_run()
        m.text = "•  "
        m.font.name = FONT
        m.font.size = Pt(size)
        m.font.color.rgb = ACCENT
        r = p.add_run()
        r.text = item
        r.font.name = FONT
        r.font.size = Pt(size)
        r.font.color.rgb = color
    return box


def rect(slide, x, y, w, h, fill=WHITE, line=LINE, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line
        s.line.width = Pt(1)
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = radius
    s.shadow.inherit = False
    return s


def card(slide, x, y, w, h, heading, body, number=None, head_size=16, body_size=13.5, two_line_head=False):
    """Plain bordered card; optional small number label above the heading."""
    rect(slide, x, y, w, h)
    ty = y + 0.22
    if number:
        text(slide, x + 0.25, ty, 1.0, 0.3, number, size=11, bold=True, color=ACCENT)
        ty += 0.34
    head_h = 0.78 if two_line_head else 0.45
    text(slide, x + 0.25, ty, w - 0.5, head_h, heading, size=head_size, bold=True, color=HEADING)
    by = ty + head_h + 0.05
    text(slide, x + 0.25, by, w - 0.5, y + h - by - 0.15, body, size=body_size, color=INK)


def arrow(slide, x1, y1, x2, y2, color=MUTED, width=1.5, dashed=False, head=True):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color
    c.line.width = Pt(width)
    ln = c.line._get_or_add_ln()
    if head:
        ln.append(ln.makeelement(qn("a:tailEnd"), {"type": "triangle", "w": "med", "len": "med"}))
    if dashed:
        ln.insert(0, ln.makeelement(qn("a:prstDash"), {"val": "dash"}))
    return c


def table(slide, x, y, w, rows, col_widths, size=13, row_h=0.42, first_col_bold=False, highlight_col=None):
    shape = slide.shapes.add_table(len(rows), len(rows[0]), Inches(x), Inches(y), Inches(w), Inches(row_h * len(rows)))
    t = shape.table
    for j, cw in enumerate(col_widths):
        t.columns[j].width = Inches(cw)
    for i, row in enumerate(rows):
        t.rows[i].height = Inches(row_h)
        for j, val in enumerate(row):
            cell = t.cell(i, j)
            cell.fill.solid()
            cell.fill.fore_color.rgb = SOFT if i == 0 or j == highlight_col else WHITE
            cell.margin_left = cell.margin_right = Inches(0.1)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf = cell.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = ""
            r = p.add_run()
            r.text = str(val)
            r.font.name = FONT
            r.font.size = Pt(size)
            r.font.bold = i == 0 or (first_col_bold and j == 0)
            r.font.color.rgb = HEADING if (i == 0 or j == highlight_col) else INK
    return shape


def caption(slide, x, y, w, value):
    text(slide, x, y, w, 0.3, value, size=10.5, color=MUTED, italic=True, align=PP_ALIGN.CENTER)


def content_slide(title):
    """White slide: title, thin slate rule, small logo top-right, page number bottom-right."""
    global slide_no
    slide_no += 1
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = WHITE
    text(s, 0.65, 0.42, 11.0, 0.7, title, size=28, bold=True, color=HEADING)
    rect(s, 0.68, 1.15, 0.7, 0.04, fill=ACCENT, line=None, shape=MSO_SHAPE.RECTANGLE)
    text(s, 12.25, 7.05, 0.6, 0.3, f"{slide_no:02d}", size=10, color=MUTED, align=PP_ALIGN.RIGHT)
    s.shapes.add_picture(str(ASSETS / "nitj-logo.png"), Inches(12.2), Inches(0.22), Inches(0.72), Inches(0.79))
    return s


def screenshot(slide, path, x, y, w, max_h):
    """Place a screenshot at width w, cropped from the bottom to at most max_h tall (no stretching)."""
    from PIL import Image

    W, H = Image.open(path).size
    keep = min(1.0, max_h * W / (w * H))
    pic = slide.shapes.add_picture(str(path), Inches(x), Inches(y), Inches(w), Inches(w * H * keep / W))
    pic.crop_bottom = 1 - keep
    pic.line.color.rgb = LINE
    pic.line.width = Pt(1)
    return pic


def note(slide, y, value, h=0.6):
    """Light grey takeaway strip."""
    rect(slide, 0.65, y, 11.95, h, fill=SOFT, line=None)
    text(slide, 0.9, y + 0.08, 11.5, h - 0.16, value, size=13, bold=True, color=HEADING, anchor=MSO_ANCHOR.MIDDLE)


# ============================================================================ 1. title (as in example deck)
s = prs.slides.add_slide(BLANK)
slide_no += 1
s.shapes.add_picture(str(ASSETS / "slide-bg.png"), 0, 0, prs.slide_width, prs.slide_height)
s.shapes.add_picture(str(ASSETS / "nitj-logo.png"), Inches(0.23), Inches(0.21), Inches(1.32), Inches(1.45))
text(s, 1.75, 0.55, 10.9, 0.9, ["DR B R AMBEDKAR NATIONAL INSTITUTE OF TECHNOLOGY", "JALANDHAR - 144008, PUNJAB (INDIA)"],
     size=22, color=BLACK, font="Times New Roman", align=PP_ALIGN.CENTER)
text(s, 0.5, 2.2, 12.33, 0.8, SUBTITLE, size=30, bold=True, color=HEADING, font="Times New Roman", align=PP_ALIGN.CENTER)
text(s, 2.5, 3.25, 8.33, 0.9, ["Minor Project Evaluation", "BACHELOR OF TECHNOLOGY"], size=18, bold=True,
     color=BLACK, font="Times New Roman", align=PP_ALIGN.CENTER)
text(s, 0.9, 4.65, 6.0, 1.6, ["Presented By:"] + [f"{n}  ({r})" for n, r in TEAM], size=16, bold=True,
     color=BLACK, font="Times New Roman")
text(s, 7.2, 4.65, 5.3, 1.6, ["Under the supervision of", SUPERVISOR, DEPARTMENT], size=16, bold=True,
     color=BLACK, font="Times New Roman", align=PP_ALIGN.RIGHT)

# ============================================================================ 2. the problem
s = content_slide("A score alone hides what a student knows")
text(s, 0.65, 1.5, 11.9, 0.45, "Same quiz, both get 7 of 10 right (70%). Each tile shows the certainty-based marks for one answer:",
     size=15, color=INK)


def student(slide, x, name, cells, prof, verdict, prof_color):
    rect(slide, x, 2.15, 5.85, 3.65)
    text(slide, x + 0.3, 2.35, 3, 0.45, name, size=18, bold=True, color=HEADING)
    text(slide, x + 3.6, 2.4, 2.0, 0.4, "Score 70%", size=13, color=MUTED, align=PP_ALIGN.RIGHT)
    for i, (col, lab) in enumerate(cells):
        tx = x + 0.3 + i * 0.53
        rect(slide, tx, 3.0, 0.45, 0.6, fill=RGBColor.from_string(TINT[col]), line=None, radius=0.12)
        text(slide, tx - 0.04, 3.12, 0.53, 0.4, lab, size=12, bold=True, color=col, align=PP_ALIGN.CENTER)
    text(slide, x + 0.3, 3.8, 5.3, 0.6, verdict, size=13, color=INK)
    rect(slide, x + 0.3, 4.6, 5.25, 0.95, fill=SOFT, line=None)
    text(slide, x + 0.5, 4.78, 2.8, 0.6, "Confidence-weighted proficiency", size=12.5, color=MUTED, anchor=MSO_ANCHOR.MIDDLE)
    text(slide, x + 3.3, 4.68, 2.1, 0.8, prof, size=30, bold=True, color=prof_color, align=PP_ALIGN.RIGHT)


student(s, 0.65, "Student A", [(GREEN, "+3")] * 7 + [(GREY, "0")] * 3, "70%",
        "7 known with confidence (+3 each), 3 honest gaps (0): 21 of 30 marks.", GREEN)
student(s, 6.75, "Student B", [(GREEN, "+3")] * 4 + [(GOLD, "+1")] * 3 + [(RED, "−6")] * 3, "0%",
        "4 known, 3 lucky guesses (+1), 3 confidently wrong (−6): below zero.", RED)
text(s, 0.65, 6.05, 11.9, 0.8,
     "A plain score treats them as identical. Confidence-based marking shows that Student B holds three misconceptions and "
     "guessed three more, which is exactly what needs fixing first.", size=14, color=INK)

# ============================================================================ 3. why CBL
s = content_slide("Why do we need confidence-based learning?")
reasons = [
    ("Guessing inflates scores", "With four options, a blind guess is right 25% of the time. Accuracy can't tell a guess from knowledge. [1]"),
    ("Confident errors are dangerous", "Confidently held misinformation is acted on without hesitation, in exams and in practice. [1, 10]"),
    ("Doubt hides in correct answers", "Correct-but-unsure answers look like mastery, yet that knowledge fails under pressure. [1, 9]"),
    ("Students misjudge themselves", "Low performers tend to overestimate their ability, so learners can't reliably pick what to revise. [5]"),
    ("Confidence tells us how to teach", "High-confidence errors are corrected readily once feedback is given, so they should be targeted first. [3]"),
    ("The goal is mastery, not a pass", "Iterating until mastery yields far larger gains than one-shot instruction. [6, 4]"),
]
for i, (h, b) in enumerate(reasons):
    card(s, 0.65 + (i % 3) * 4.05, 1.55 + (i // 3) * 2.7, 3.85, 2.5, h, b, number=f"0{i + 1}", head_size=15, body_size=13)

# ============================================================================ 4. quadrants
s = content_slide("The four knowledge quadrants")
text(s, 0.65, 1.5, 6.2, 0.4, "Correctness × confidence  [1]", size=15, bold=True, color=ACCENT)
qx, qy, qw, qh = 1.55, 2.45, 2.65, 1.8
text(s, qx, qy - 0.4, qw, 0.35, "Confident", size=12.5, bold=True, color=MUTED, align=PP_ALIGN.CENTER)
text(s, qx + qw + 0.15, qy - 0.4, qw, 0.35, "Not confident", size=12.5, bold=True, color=MUTED, align=PP_ALIGN.CENTER)
text(s, 0.65, qy + 0.7, 0.85, 0.4, "Correct", size=12.5, bold=True, color=MUTED)
text(s, 0.65, qy + qh + 0.85, 0.85, 0.4, "Wrong", size=12.5, bold=True, color=MUTED)
for cx, cy, col, label, hint in [
    (0, 0, GREEN, "Mastery", "Knows it, and knows that they know"),
    (1, 0, GOLD, "Doubt", "Right, but slow or hesitant"),
    (0, 1, RED, "Misinformed", "Wrong, yet answers with confidence"),
    (1, 1, GREY, "Uninformed", "Wrong and hesitant: an honest gap"),
]:
    x = qx + cx * (qw + 0.15)
    y = qy + cy * (qh + 0.15)
    rect(s, x, y, qw, qh, fill=RGBColor.from_string(TINT[col]), line=None, radius=0.06)
    text(s, x + 0.22, y + 0.35, qw - 0.4, 0.5, label, size=19, bold=True, color=col)
    text(s, x + 0.22, y + 0.95, qw - 0.4, 0.7, hint, size=12.5, color=INK)
text(s, 7.3, 1.5, 5.3, 0.4, "What each quadrant means for teaching", size=15, bold=True, color=HEADING)
bullets(s, 7.3, 2.05, 5.3, 4.6, [
    "Mastery: the only state that reliably turns into performance. Re-check occasionally for retention.",
    "Misinformed: the danger zone. Fix first, with direct corrective feedback.",
    "Doubt: fragile knowledge. Practise until it becomes automatic.",
    "Uninformed: teach it. The learner already knows it is missing.",
    "Diagnose → prescribe → learn → repeat, until every topic is in Mastery.",
], size=14, gap=12)

# ============================================================================ 5. literature
s = content_slide("Literature review")
lit = [
    ("Confidence-based learning", "Bruno's quadrants classify answers by correctness × confidence; learners iterate to mastery, not a pass mark.", "[1] BenchPrep; [6] Bloom (1984)"),
    ("Certainty-based marking", "Marks scale with certainty and confident errors are penalised, rewarding honest self-assessment.", "[2] Gardner-Medwin & Gahan (2003)"),
    ("Memory and metacognition", "Retrieval practice improves retention; high-confidence errors are hypercorrected; poor performers overestimate.", "[3] Butterfield & Metcalfe; [4] Roediger & Karpicke; [5] Kruger & Dunning"),
    ("Retrieval-augmented generation", "LLM output grounded in retrieved chunks; Docling converts PDFs to structured markdown.", "[7] Lewis et al. (2020); [8] Auer et al. (2024)"),
]
for i, (h, b, ref) in enumerate(lit):
    x = 0.65 + (i % 2) * 6.05
    y = 1.55 + (i // 2) * 2.4
    rect(s, x, y, 5.85, 2.2)
    text(s, x + 0.25, y + 0.2, 5.35, 0.4, h, size=16, bold=True, color=HEADING)
    text(s, x + 0.25, y + 0.68, 5.35, 1.0, b, size=13, color=INK)
    text(s, x + 0.25, y + 1.7, 5.35, 0.4, ref, size=10.5, color=MUTED, italic=True)
note(s, 6.4, "Gap: CBL tools rely on self-reported confidence and hand-authored content. Neither is learned from the student's own material.")

# ============================================================================ 6. Amplifire
s = content_slide("Existing system: Amplifire")
text(s, 0.65, 1.5, 11.9, 0.7,
     "A commercial adaptive-learning platform built on confidence-based testing, descended from Dr James Bruno's research at UCLA "
     "through Knowledge Factor. [10, 11]", size=14.5, color=INK)
amp = [
    ("Asks for confidence", "Learners commit to an answer with their confidence, or say they “don't know yet”. The confidence is self-reported. [10]"),
    ("Hunts misinformation", "Classifies confidently held misinformation and shows a “What You Need to Know” learning burst. [10]"),
    ("Adaptive to mastery", "Repeats until mastery, then sends smart refreshers some weeks later, because learning fades. [11]"),
    ("Authored courses", "Organisations build modules in its course-authoring tool. It is mostly used in healthcare, aviation and corporate training. [11]"),
]
for i, (h, b) in enumerate(amp):
    card(s, 0.65 + i * 3.02, 2.45, 2.85, 3.0, h, b, number=f"0{i + 1}", head_size=14.5, body_size=12.5)
note(s, 5.75, "Amplifire proves CBL works at scale. Its limits for students are that confidence must be self-reported and "
              "content must be authored in advance.", h=0.85)

# ============================================================================ 7. comparison
s = content_slide("StudySense vs Amplifire")
table(s, 0.65, 1.5, 11.95, [
    ["Capability", "Amplifire", "StudySense (ours)"],
    ["Confidence signal", "Self-reported by the learner", "Inferred from response time vs ideal time and answer changes"],
    ["Can confidence be gamed?", "Yes: the learner chooses it", "No: it comes from behaviour, with no extra click"],
    ["Learner's reading speed", "Not applicable", "Personal pace learned from past correct answers"],
    ["Where content comes from", "Courses authored by instructors", "Generated from the student's own PDF or syllabus photo"],
    ["Next-quiz selection", "Adaptive engine over an authored item bank", "Iterative RAG over all past evaluation reports"],
    ["Topic ranking", "Mastery state per item", "Proficiency + misconceptions + unstudied pages"],
    ["Audience and cost", "Enterprise: healthcare, aviation, corporate", "Students, any subject; open-source stack"],
], [3.0, 4.1, 4.85], size=12.5, row_h=0.6, first_col_bold=True, highlight_col=2)
note(s, 6.4, "StudySense keeps CBL's core idea (quadrants, marking and mastery loops) and removes both the self-report and the authoring steps.")

# ============================================================================ 8. problem + objectives
s = content_slide("Problem statement and objectives")
rect(s, 0.65, 1.5, 11.95, 1.4, fill=SOFT, line=None)
text(s, 0.95, 1.62, 11.4, 0.35, "Problem statement", size=13, bold=True, color=ACCENT)
text(s, 0.95, 1.97, 11.4, 0.9,
     "Turn a student's own material (a PDF, or just a syllabus photo) into study content and adaptive quizzes that measure what they "
     "know and how confidently they know it, without asking them, and keep re-targeting weak spots until mastery.",
     size=14, color=HEADING)
objs = [
    "Ingest PDFs via the structured-pdf-data microservice and syllabus photos via a vision model",
    "Generate paginated study content per topic and track what has been studied",
    "Run full-screen timed quizzes; infer confidence from behaviour instead of asking",
    "Score with certainty-based marks and the knowledge quadrants; rank topics by priority",
    "Store every report and generate each new quiz from all of them (iterative RAG)",
    "Show proficiency, quadrants and improvement on subject and main dashboards",
]
for i, o in enumerate(objs):
    x = 0.65 + (i % 2) * 6.05
    y = 3.2 + (i // 2) * 1.15
    rect(s, x, y, 5.85, 0.98)
    text(s, x + 0.25, y + 0.25, 0.6, 0.5, f"0{i + 1}", size=16, bold=True, color=ACCENT)
    text(s, x + 0.85, y + 0.12, 4.85, 0.78, o, size=13, color=INK, anchor=MSO_ANCHOR.MIDDLE)

# ============================================================================ 9. architecture
s = content_slide("System architecture")


def node(slide, x, y, w, h, title, sub):
    rect(slide, x, y, w, h)
    text(slide, x + 0.08, y + 0.12, w - 0.16, 0.35, title, size=12, bold=True, color=HEADING, align=PP_ALIGN.CENTER)
    text(slide, x + 0.1, y + 0.47, w - 0.2, h - 0.5, sub, size=10, color=MUTED, align=PP_ALIGN.CENTER)


node(s, 0.6, 3.15, 1.9, 1.1, "INPUT", "PDF notes or syllabus photo")
node(s, 3.0, 1.85, 2.3, 1.15, "IF PDF: RAG", "structured-pdf-data (Docling) → chunks → study content")
node(s, 3.0, 4.4, 2.3, 1.15, "IF PHOTO", "vision LLM extracts topics → AI study content")
node(s, 5.85, 3.1, 2.2, 1.2, "SUBJECT DASHBOARD", "status; a diagnostic test unlocks rankings")
node(s, 8.6, 1.7, 2.0, 1.1, "JUST STUDY", "paginated markdown; tracks pages")
node(s, 8.6, 4.5, 2.0, 1.25, "QUIZ", "full screen · timed · confidence from time")
node(s, 11.05, 4.5, 1.85, 1.25, "REPORT STORE", "every eval report kept")
node(s, 8.6, 6.1, 4.3, 0.8, "MAIN DASHBOARD", "all subjects · proficiency graphs · detailed reports")
arrow(s, 2.5, 3.55, 3.0, 2.45)
arrow(s, 2.5, 3.85, 3.0, 4.95)
arrow(s, 5.3, 2.45, 5.85, 3.45)
arrow(s, 5.3, 4.95, 5.85, 4.0)
arrow(s, 8.05, 3.4, 8.6, 2.3)
arrow(s, 8.05, 4.0, 8.6, 5.0)
arrow(s, 10.6, 5.1, 11.05, 5.1)
arrow(s, 11.97, 5.75, 11.97, 6.1)
arrow(s, 11.97, 4.5, 11.97, 4.05, color=ACCENT, dashed=True, head=False)
arrow(s, 11.97, 4.05, 10.25, 4.05, color=ACCENT, dashed=True, head=False)
arrow(s, 10.25, 4.05, 10.25, 4.5, color=ACCENT, dashed=True)
text(s, 10.35, 3.4, 2.6, 0.6, ["iterative RAG:", "all past reports → next quiz"], size=10.5, bold=True, color=ACCENT)
arrow(s, 9.6, 2.8, 9.6, 4.5, color=MUTED, width=1.0, dashed=True)
text(s, 9.65, 3.45, 1.0, 0.5, "re-rank", size=9.5, color=MUTED, italic=True)
caption(s, 0.6, 1.4, 7.0, "Figure 1. End-to-end flow, from the project's architecture diagram.")

# ============================================================================ 10. scoring (no formulas)
s = content_slide("Scoring and adaptive quizzes")
text(s, 0.65, 1.5, 5.7, 0.4, "Certainty-based marks [2]", size=15, bold=True, color=ACCENT)
table(s, 0.65, 2.0, 5.7, [
    ["Confidence (inferred)", "Correct", "Wrong"],
    ["High", "+3", "−6"],
    ["Medium", "+2", "−2"],
    ["Low", "+1", "0"],
], [2.7, 1.5, 1.5], size=14, row_h=0.52, first_col_bold=True)
text(s, 0.65, 4.3, 5.7, 1.8, [
    "Confidence is read from behaviour: answering within the ideal time with no changes reads as High; "
    "a much slower answer or repeated changes reads as Low.",
    "A fast wrong answer costs the most because it signals a misconception.",
], size=13, color=INK, gap=8)
for i, (h, b) in enumerate([
    ("Topic proficiency", "Marks earned as a share of the maximum, per topic, from the latest quiz."),
    ("Topic ranking", "Weak topics first, boosted by misconceptions, with a small boost for unstudied pages."),
    ("Next quiz", "Built from every past report: misconceptions, then gaps, then doubts, plus a few mastered items as retention checks."),
]):
    card(s, 6.75, 1.5 + i * 1.75, 5.85, 1.58, h, b, head_size=15, body_size=12.5)

# ============================================================================ 11. microservice
s = content_slide("PDF microservice: structured-pdf-data")
text(s, 0.65, 1.5, 11.9, 0.5, "FastAPI + Docling on Hugging Face Spaces (Docker) turns any PDF into LLM-ready markdown or chunks. [8]", size=14.5, color=INK)
table(s, 0.65, 2.15, 7.3, [
    ["Endpoint (GET, ?source=)", "Returns"],
    ["/", "health check"],
    ["/get-structured-data", "whole document as markdown"],
    ["/get-chunks", "chunks + slim metadata + markdown"],
    ["/get-chunks-all-meta", "chunks with full Docling metadata"],
    ["/process-document", "markdown if small, chunks if large"],
], [3.3, 4.0], size=12.5, row_h=0.5, first_col_bold=True)
card(s, 8.25, 2.15, 4.35, 1.85, "Size-aware output", "Under 30,000 characters: send all the markdown to the LLM. Otherwise, chunk it for batched RAG.", head_size=15, body_size=12.5)
card(s, 8.25, 4.2, 4.35, 1.85, "Token-aware chunks", "HybridChunker with the nemotron embed tokenizer, max 2048 tokens, headings and pages kept.", head_size=15, body_size=12.5)
text(s, 0.65, 5.4, 7.3, 1.0, ["Live: nvdp4-structured-pdf-data.hf.space",
                              "Called through the typed @minor/pdf-client package; the browser only talks to our API."],
     size=12.5, color=MUTED, gap=4)

# ============================================================================ 12. stack
s = content_slide("Technology stack")
stack = [
    ("Monorepo", "Turborepo + npm workspaces"),
    ("Web app", "Next.js 16, TypeScript, Recharts"),
    ("API", "Express 5 + TypeScript"),
    ("PDF parsing", "FastAPI + Docling microservice"),
    ("Database", "PostgreSQL + Prisma + pgvector"),
    ("LLM", "Provider-agnostic interface"),
]
for i, (h, b) in enumerate(stack):
    x = 0.65 + (i % 3) * 4.05
    y = 1.55 + (i // 3) * 1.7
    rect(s, x, y, 3.85, 1.45)
    text(s, x + 0.25, y + 0.25, 3.4, 0.35, h.upper(), size=10.5, bold=True, color=MUTED)
    text(s, x + 0.25, y + 0.6, 3.4, 0.8, b, size=15, bold=True, color=HEADING)
rect(s, 0.65, 5.15, 11.95, 1.5, fill=SOFT, line=None)
text(s, 0.95, 5.3, 3.2, 0.35, "Repository", size=13, bold=True, color=ACCENT)
text(s, 0.95, 5.68, 11.4, 0.9, [
    "apps/web · apps/api · packages/pdf-client · packages/config · context/ (project memory) · utils/ (report + slides)",
    "All scoring logic lives in one shared module, lib/cbl.ts, used by the quiz, the reports and the dashboards.",
], size=12.5, color=INK, gap=4)

# ============================================================================ 13. prototype: dashboards
s = content_slide("Prototype: dashboards")
screenshot(s, SCREENS / "dashboard.png", 0.65, 1.5, 5.85, 3.9)
screenshot(s, SCREENS / "subject.png", 6.75, 1.5, 5.85, 3.9)
caption(s, 0.65, 5.5, 5.85, "Figure 2. Main dashboard: subjects, proficiency and every report.")
caption(s, 6.75, 5.5, 5.85, "Figure 3. Subject dashboard: topics ranked by priority.")
text(s, 0.65, 6.05, 11.9, 0.7,
     "A subject is unranked until its first diagnostic test. After that, topics are re-ranked by weakness, misconceptions and "
     "unstudied content.", size=13, color=INK)

# ============================================================================ 14. prototype: quiz + report
s = content_slide("Prototype: quiz and evaluation report")
screenshot(s, SCREENS / "quiz-intro.png", 0.65, 1.5, 5.0, 3.55)
screenshot(s, SCREENS / "report.png", 5.95, 1.5, 6.65, 5.3)
caption(s, 0.65, 5.12, 5.0, "Figure 4. Quiz brief: confidence is measured, not asked.")
caption(s, 5.95, 6.85, 6.65, "Figure 5. Report: quadrants, summary, time vs ideal time.")
bullets(s, 0.65, 5.55, 5.0, 1.3, [
    "Full screen, with a time limit of 60 s per question",
    "Time and answer changes recorded per question",
    "Finish → report saved → dashboard with thanks",
], size=12, gap=3)

# ============================================================================ 15. conclusion
s = content_slide("Conclusion")
text(s, 0.65, 1.55, 11.9, 0.9,
     "StudySense brings confidence-based learning to any subject a student brings, with no self-rating and no course authoring.",
     size=20, bold=True, color=HEADING)
card(s, 0.65, 2.85, 3.85, 2.3, "What is built", "Full web prototype, PDF microservice, scoring engine and dashboards.")
card(s, 4.7, 2.85, 3.85, 2.3, "What is new", "Behaviour-based confidence, content from the student's own material, and quizzes driven by iterative RAG.")
card(s, 8.75, 2.85, 3.85, 2.3, "What comes next", "Database and LLM generation, then a pilot study to calibrate the timing model and measure learning gains.")
note(s, 5.6, "Core principle: keep iterating until mastery, not until a pass mark.")

# ============================================================================ 16. references
s = content_slide("References")
refs = [
    "[1] BenchPrep, “Why confidence-based learning improves performance,” blog.benchprep.com, accessed Nov. 2026.",
    "[2] A. R. Gardner-Medwin and M. Gahan, “Formative and summative confidence-based assessment,” Proc. 7th Int. CAA Conf., Loughborough, 2003.",
    "[3] B. Butterfield and J. Metcalfe, “Errors committed with high confidence are hypercorrected,” J. Exp. Psychol.: LMC, 27(6), 1491–1494, 2001.",
    "[4] H. L. Roediger and J. D. Karpicke, “Test-enhanced learning,” Psychological Science, 17(3), 249–255, 2006.",
    "[5] J. Kruger and D. Dunning, “Unskilled and unaware of it,” J. Pers. Soc. Psychol., 77(6), 1121–1134, 1999.",
    "[6] B. S. Bloom, “The 2 sigma problem,” Educational Researcher, 13(6), 4–16, 1984.",
    "[7] P. Lewis et al., “Retrieval-augmented generation for knowledge-intensive NLP tasks,” NeurIPS 33, 2020.",
    "[8] C. Auer et al., “Docling technical report,” arXiv:2408.09869, 2024.",
    "[9] A. C. Butler, J. D. Karpicke and H. L. Roediger, “Correcting a metacognitive error: feedback increases retention of low-confidence correct responses,” J. Exp. Psychol.: LMC, 34(4), 918–928, 2008.",
    "[10] Amplifire, “Confidently held misinformation,” white paper, amplifire.com, accessed Nov. 2026.",
    "[11] Software Advice, “Amplifire learning platform profile,” softwareadvice.com, accessed Nov. 2026.",
]
text(s, 0.65, 1.55, 11.9, 5.3, refs, size=12, color=INK, gap=6)

# ============================================================================ 17. thank you (as in example deck)
slide_no += 1
s = prs.slides.add_slide(BLANK)
s.shapes.add_picture(str(ASSETS / "slide-bg.png"), 0, 0, prs.slide_width, prs.slide_height)
s.shapes.add_picture(str(ASSETS / "nitj-logo.png"), Inches(12.14), Inches(0.16), Inches(0.97), Inches(1.06))
text(s, 3.0, 2.9, 7.33, 1.1, "Thank you", size=54, bold=True, color=HEADING, align=PP_ALIGN.CENTER)

prs.save(OUT)
print(f"wrote {OUT} ({slide_no} slides)")
