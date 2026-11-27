"""Builds docs/SmartLogix_Final_Presentation.pptx (SIA2 Final Lab Exam)."""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

BG = RGBColor(0x0B, 0x10, 0x1E)
PANEL = RGBColor(0x15, 0x1C, 0x30)
PANEL2 = RGBColor(0x1E, 0x27, 0x40)
INDIGO = RGBColor(0x63, 0x66, 0xF1)
CYAN = RGBColor(0x06, 0xB6, 0xD4)
GREEN = RGBColor(0x10, 0xB9, 0x81)
AMBER = RGBColor(0xF5, 0x9E, 0x0B)
RED = RGBColor(0xEF, 0x44, 0x44)
WHITE = RGBColor(0xF1, 0xF5, 0xF9)
MUTED = RGBColor(0x94, 0xA3, 0xB8)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
page = {"n": 0}


def new_slide(title, section=None, notes=None):
    s = prs.slides.add_slide(BLANK)
    page["n"] += 1
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = BG
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(0.18), prs.slide_height)
    bar.fill.solid(); bar.fill.fore_color.rgb = INDIGO; bar.line.fill.background()
    if section:
        text(s, section.upper(), 0.6, 0.3, 8, 0.3, 11, INDIGO, bold=True)
    text(s, title, 0.6, 0.55, 12, 0.8, 30, WHITE, bold=True)
    text(s, f"SmartLogix  |  SIA2 Final Lab Exam  |  {page['n']}", 8.3, 7.05, 4.7, 0.3, 10, MUTED, align=PP_ALIGN.RIGHT)
    if notes:
        s.notes_slide.notes_text_frame.text = notes
    return s


def text(s, t, x, y, w, h, size=16, color=WHITE, bold=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.05)
    lines = t if isinstance(t, list) else [t]
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        r = p.add_run(); r.text = ln
        r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color; r.font.name = "Segoe UI"
    return tb


def bullets(s, items, x, y, w, h, size=16, color=WHITE, gap=6):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap)
        if isinstance(it, tuple):
            r0 = p.add_run(); r0.text = "\u25B8 " + it[0] + ": "
            r0.font.bold = True; r0.font.size = Pt(size); r0.font.color.rgb = CYAN; r0.font.name = "Segoe UI"
            r1 = p.add_run(); r1.text = it[1]
            r1.font.size = Pt(size); r1.font.color.rgb = color; r1.font.name = "Segoe UI"
        else:
            r = p.add_run(); r.text = "\u25B8 " + it
            r.font.size = Pt(size); r.font.color.rgb = color; r.font.name = "Segoe UI"
    return tb


def box(s, label, x, y, w, h, fill=PANEL2, line=INDIGO, size=13, color=WHITE, sub=None, bold=True):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = 0.12
    sh.fill.solid(); sh.fill.fore_color.rgb = fill
    sh.line.color.rgb = line; sh.line.width = Pt(1.5)
    tf = sh.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = Inches(0.06); tf.margin_top = tf.margin_bottom = Inches(0.03)
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = label
    r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color; r.font.name = "Segoe UI"
    if sub:
        p2 = tf.add_paragraph(); p2.alignment = PP_ALIGN.CENTER
        r2 = p2.add_run(); r2.text = sub
        r2.font.size = Pt(size - 3); r2.font.color.rgb = MUTED; r2.font.name = "Segoe UI"
    return sh


def zone(s, label, x, y, w, h, color=INDIGO):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = 0.04
    sh.fill.solid(); sh.fill.fore_color.rgb = PANEL
    sh.line.color.rgb = color; sh.line.width = Pt(1.25); sh.line.dash_style = 4
    text(s, label, x + 0.1, y + 0.03, w - 0.2, 0.3, 11, color, bold=True)


def arrow(s, x1, y1, x2, y2, color=MUTED, label=None, both=False, dash=False):
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color; c.line.width = Pt(2)
    if dash:
        c.line.dash_style = 4
    ln = c.line._get_or_add_ln()
    tail = etree.SubElement(ln, qn("a:tailEnd")); tail.set("type", "triangle")
    if both:
        head = etree.SubElement(ln, qn("a:headEnd")); head.set("type", "triangle")
    if label:
        text(s, label, (x1 + x2) / 2 - 0.9, (y1 + y2) / 2 - 0.3, 1.8, 0.3, 10, color, align=PP_ALIGN.CENTER)


def table(s, rows, x, y, w, col_w, row_h=0.42, size=12, header_fill=INDIGO):
    shp = s.shapes.add_table(len(rows), len(rows[0]), Inches(x), Inches(y), Inches(w), Inches(row_h * len(rows)))
    t = shp.table
    for i, cw in enumerate(col_w):
        t.columns[i].width = Inches(cw)
    for ri, row in enumerate(rows):
        t.rows[ri].height = Inches(row_h)
        for ci, val in enumerate(row):
            cell = t.cell(ri, ci)
            cell.fill.solid()
            cell.fill.fore_color.rgb = header_fill if ri == 0 else (PANEL if ri % 2 else PANEL2)
            cell.margin_left = cell.margin_right = Inches(0.08)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf = cell.text_frame; tf.word_wrap = True
            p = tf.paragraphs[0]
            r = p.add_run(); r.text = val
            r.font.size = Pt(size); r.font.name = "Segoe UI"
            r.font.bold = (ri == 0 or ci == 0)
            r.font.color.rgb = WHITE if ri == 0 else (CYAN if ci == 0 else WHITE)
    return t


# ============================================================ TITLE
s = prs.slides.add_slide(BLANK); page["n"] += 1
s.background.fill.solid(); s.background.fill.fore_color.rgb = BG
bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(0.5), prs.slide_height)
bar.fill.solid(); bar.fill.fore_color.rgb = INDIGO; bar.line.fill.background()
text(s, "SIA2 \u2014 FINAL LABORATORY EXAMINATION", 1.2, 1.3, 11, 0.4, 14, INDIGO, bold=True)
text(s, "SmartLogix", 1.2, 1.8, 11, 1.2, 66, WHITE, bold=True)
text(s, "Web-Based Logistics, Inventory & Asset Tracking System", 1.2, 3.1, 11, 0.6, 26, CYAN)
text(s, "Centro Escolar University (CEU)", 1.2, 3.8, 11, 0.5, 20, MUTED)
text(s, ["Part 1: MVP / System Demonstration", "Part 2: Enterprise & Business Plan"], 1.2, 4.7, 8, 0.9, 16, WHITE)
text(s, ["Carag, Kyle Ian David D.", "Miguel, Mark Ephraim Jr. B.", "Oloyede, Pelumi B."], 1.2, 5.9, 8, 1.0, 14, MUTED)
s.notes_slide.notes_text_frame.text = "Introduce the team and note the deck has two parts: the MVP demo and the enterprise plan. System documentation is submitted separately as a PDF."

# ============================================================ AGENDA
s = new_slide("Agenda & Exam Requirement Map", "Overview",
              "Show how every exam requirement maps to a slide. Documentation (requirement 3) is a separate PDF.")
table(s, [
    ["Exam Requirement", "Covered In", "Slides"],
    ["1. MVP / System Demonstration", "Overview, improvements, features, architecture, stack, data flows, live demo", "3 \u2013 11"],
    ["2. Enterprise / Business Plan", "Market, sustainability, scalability, reliability & security, enterprise architecture", "12 \u2013 17"],
    ["3. System Documentation", "Separate PDF: LastNameInitial_SmartLogix_Doc.pdf (due Nov 29, 2026)", "n/a"],
], 0.6, 1.7, 12.1, [3.6, 6.9, 1.6], row_h=0.75, size=14)
bullets(s, [
    "Consistency: the demo, business plan and documentation describe the same system and architecture",
    "Every technical and business decision is justified against SIA2 concepts",
], 0.6, 5.2, 12, 1.5, 16, MUTED)

# ============================================================ PART 1
s = new_slide("System Overview (Brief Recap)", "Part 1 \u2022 MVP Demonstration",
              "Keep this short; the overview was presented in the first demo.")
text(s, "Purpose", 0.6, 1.5, 6, 0.4, 18, CYAN, bold=True)
text(s, "Replace paper logbooks, physical signatures and fragmented spreadsheets with one platform for borrowing, returning, reserving and tracking organizational assets.",
     0.6, 1.95, 6.0, 1.6, 15)
text(s, "Problem it solves", 0.6, 3.6, 6, 0.4, 18, CYAN, bold=True)
bullets(s, ["No accountability trail for who holds what", "Lost / overdue equipment goes unnoticed", "Manual approvals delay events"], 0.6, 4.05, 6.0, 2.2, 15)
text(s, "Target Users (Roles)", 7.2, 1.5, 5.5, 0.4, 18, CYAN, bold=True)
table(s, [
    ["Role", "Primary Responsibility"],
    ["Administrator", "System monitoring, oversight, audit"],
    ["Logistics / Property Officer", "Assets, releases, returns, fleet"],
    ["Borrower / Student", "Browse, request, track loans"],
    ["Approver (Dean / Chair)", "Approve or reject requests"],
], 7.2, 2.0, 5.6, [2.6, 3.0], row_h=0.62, size=13)

s = new_slide("What's New Since the Last Demo", "Part 1 \u2022 MVP Demonstration",
              "This is the focus slide for improvements. Each item is demonstrable in the live demo.")
items = [
    ("Role-based views", "switching roles now loads a dedicated portal, sidebar and actions per role"),
    ("Role permissions", "approve/reject, release/return, delete and fleet controls restricted by role"),
    ("Reservation calendar", "fixed the blank page after requesting an asset; added sidebar link"),
    ("Live health monitor", "Admin dashboard really probes the 4 services: Live / DB waiting / Fallback"),
    ("Graceful fallback", "app keeps working offline using the CEU local datastore"),
    ("Robust API config", "auto-adds https://, ignores placeholder URLs, defaults to Railway gateway"),
    ("CEU datasets & fleet UI", "real CEU assets, vehicles, notifications; vehicle UI fixes"),
    ("Automation", "overdue loans auto-flagged every 5 min with notifications; HMAC digital signatures"),
]
bullets(s, items, 0.6, 1.5, 12.2, 5.4, 16, gap=9)

s = new_slide("Core Features & Functionalities", "Part 1 \u2022 MVP Demonstration")
table(s, [
    ["Feature", "What it does", "Used by"],
    ["Asset Inventory + QR", "Catalog with status (Available, Reserved, Borrowed, Maintenance); QR label per asset", "Admin, Officer"],
    ["Digital Logbook", "Checkout / return with receipt ref, condition, HMAC digital signature, CSV export", "Officer, Admin"],
    ["Requests & Approvals", "Reservation request, conflict checks, approve / reject with reason", "Borrower, Approver"],
    ["Resource Calendar", "Schedule of bookings and live availability matrix", "All roles"],
    ["Fleet Management", "Vehicles, drivers, mileage, maintenance schedule and status", "Officer, Admin"],
    ["Notifications", "In-app alerts per user / role: approvals, releases, overdue", "All roles"],
    ["Analytics", "Utilization rate, status breakdown, categories, overdue counts", "Admin, Officer, Approver"],
    ["System Health", "Live microservice and database status with latency", "Admin"],
], 0.6, 1.5, 12.2, [2.8, 6.9, 2.5], row_h=0.57, size=12)

s = new_slide("Current System Architecture", "Part 1 \u2022 MVP Demonstration",
              "Be honest: four logical services (separate models and routes) are mounted behind one API gateway process today. The enterprise plan splits them into independently deployed services.")
zone(s, "CLIENT (Vercel / Netlify)", 0.5, 1.5, 3.3, 5.2, CYAN)
box(s, "React 19 SPA", 0.8, 1.95, 2.7, 0.8, sub="Vite, React Router 7")
box(s, "Role-based UI", 0.8, 2.95, 2.7, 0.7, sub="Admin / Officer / Borrower / Approver")
box(s, "api.js client", 0.8, 3.85, 2.7, 0.8, sub="timeouts, URL normalization")
box(s, "Local CEU Datastore", 0.8, 4.95, 2.7, 0.8, fill=PANEL2, line=AMBER, sub="localStorage fallback")
zone(s, "API GATEWAY (Railway, Node.js + Express)", 4.4, 1.5, 4.6, 5.2, INDIGO)
box(s, "/health  \u2022  CORS  \u2022  JSON", 4.7, 1.95, 4.0, 0.6, size=12)
box(s, "auth-service", 4.7, 2.75, 1.9, 0.75, sub="/api/auth")
box(s, "inventory-service", 6.8, 2.75, 1.9, 0.75, sub="/api/inventory")
box(s, "vehicle-service", 4.7, 3.7, 1.9, 0.75, sub="/api/vehicles")
box(s, "notification-service", 6.8, 3.7, 1.9, 0.75, sub="/api/notifications")
box(s, "Sequelize ORM + migrate + seed", 4.7, 4.75, 4.0, 0.6, size=12)
box(s, "Overdue scheduler (5 min)", 4.7, 5.55, 4.0, 0.6, size=12, line=GREEN)
zone(s, "DATA (Railway)", 9.6, 1.5, 3.2, 5.2, GREEN)
box(s, "PostgreSQL", 9.9, 2.3, 2.6, 1.1, line=GREEN, sub="users, assets, transactions, reservations, vehicles, notification_logs", size=14)
box(s, "Hosting", 9.9, 4.0, 2.6, 1.3, line=MUTED, sub="Vercel / Netlify (UI) Railway (API + DB) GitHub Actions CI", size=14)
arrow(s, 3.8, 3.4, 4.4, 3.4, CYAN, "REST / JSON", both=True)
arrow(s, 9.0, 3.0, 9.6, 3.0, GREEN, "SQL", both=True)
arrow(s, 2.15, 4.65, 2.15, 4.95, AMBER, dash=True)

s = new_slide("Technology Stack", "Part 1 \u2022 MVP Demonstration")
table(s, [
    ["Layer", "Technology", "Why we chose it"],
    ["Frontend", "React 19, Vite 8, React Router 7, lucide-react, qrcode.react", "Fast SPA, component reuse per role, QR rendering"],
    ["Backend", "Node.js >= 18, Express 4, cors, dotenv", "Lightweight REST APIs, one language across the stack"],
    ["Database", "PostgreSQL via Sequelize 6 (pg)", "Relational integrity for loans, reservations, audit trail"],
    ["Security", "HMAC-SHA256 handoff signatures, CORS allow-list, input whitelisting", "Tamper-evident digital logbook"],
    ["DevOps", "GitHub Actions CI, Dockerfile, Railway, Vercel / Netlify", "Automatic build, deploy and health checks"],
    ["Quality", "oxlint, production build check, /health endpoint", "Catches errors before deployment"],
], 0.6, 1.6, 12.2, [1.9, 5.6, 4.7], row_h=0.78, size=13)

s = new_slide("Major Data Flow 1: Request to Return Lifecycle", "Part 1 \u2022 MVP Demonstration",
              "Walk through this with the live demo: each step is performed by a different role.")
steps = [
    ("1  Borrower", "submits reservation", CYAN),
    ("2  Gateway", "validates dates, checks conflicts, saves Pending", INDIGO),
    ("3  Approver", "approves; asset becomes Reserved", AMBER),
    ("4  Officer", "QR scan, releases asset", INDIGO),
    ("5  Logbook", "receipt + HMAC signature, asset Borrowed", GREEN),
    ("6  Return", "check-in, condition, asset Available / Maintenance", GREEN),
]
x = 0.5
for i, (a, b, c) in enumerate(steps):
    box(s, a, x, 2.1, 1.95, 1.7, line=c, sub=b, size=14)
    if i < len(steps) - 1:
        arrow(s, x + 1.95, 2.95, x + 2.1, 2.95, c)
    x += 2.1
zone(s, "Side effects handled automatically by the gateway", 0.5, 4.3, 12.3, 2.4, GREEN)
bullets(s, [
    ("Notifications", "approver is alerted on new request; borrower on approve / reject / release; officer on return"),
    ("Overdue", "scheduler flags loans past due date and notifies officer and borrower once"),
    ("Integrity", "row locks and DB transactions prevent double checkout or double approval"),
], 0.7, 4.75, 12.0, 1.9, 14)

s = new_slide("Major Data Flow 2: Component Communication & Fallback", "Part 1 \u2022 MVP Demonstration",
              "This is the answer to how components communicate and what happens when one fails.")
box(s, "React UI (role portal)", 0.5, 2.2, 2.4, 1.0, line=CYAN)
box(s, "api.js request()", 3.6, 2.2, 2.4, 1.0, sub="6 s timeout")
box(s, "API Gateway", 6.8, 2.2, 2.2, 1.0, line=INDIGO)
box(s, "PostgreSQL", 10.0, 2.2, 2.4, 1.0, line=GREEN)
arrow(s, 2.9, 2.7, 3.6, 2.7, CYAN)
arrow(s, 6.0, 2.7, 6.8, 2.7, INDIGO, "fetch JSON")
arrow(s, 9.0, 2.7, 10.0, 2.7, GREEN, "SQL")
box(s, "Local CEU Datastore\n(localStorage)", 3.6, 4.4, 2.4, 1.0, line=AMBER)
arrow(s, 4.8, 3.2, 4.8, 4.4, AMBER, "on failure", dash=True)
table(s, [
    ["Condition", "Admin dashboard shows", "User experience"],
    ["Gateway + DB healthy", "Green: Live API Online (4 / 4)", "Live shared data"],
    ["Gateway up, one route or DB failing", "Amber: DB Waiting (Fallback)", "Failing part uses local data, rest stays live"],
    ["Gateway unreachable", "Blue: Fallback Mode (0 / 4)", "Whole app keeps working offline"],
], 0.5, 5.5, 12.3, [3.6, 4.2, 4.5], row_h=0.38, size=12)

s = new_slide("Live Demo Script (Role by Role)", "Part 1 \u2022 MVP Demonstration",
              "Suggested order, about 8 to 10 minutes. Use the role dropdown (top right) to switch personas.")
table(s, [
    ["#", "Role to switch to", "Show", "Point to make"],
    ["1", "Administrator", "Admin console, Test Live Endpoints", "Live health of 4 services and PostgreSQL"],
    ["2", "Borrower / Student", "Browse Equipment, Request, Calendar", "Request lands on Calendar; own loans only"],
    ["3", "Approver", "Approval Queue, Notifications bell", "Approve or reject with reason"],
    ["4", "Logistics Officer", "QR Handoff, Logbook, Fleet", "Release, signature, return, vehicle status"],
    ["5", "Administrator", "Block a service in DevTools", "Amber fallback while the app stays usable"],
], 0.6, 1.6, 12.2, [0.6, 2.6, 4.6, 4.4], row_h=0.8, size=13)
text(s, "Outage test: DevTools > Network > right-click a request > Block request URL, then Test Live Endpoints (affects only your own browser).",
     0.6, 6.5, 12, 0.5, 12, MUTED)

# ============================================================ PART 2
s = new_slide("Market Strategy", "Part 2 \u2022 Enterprise & Business Plan",
              "Start with the home campus, then expand through references. Keep claims realistic.")
text(s, "Target segments", 0.6, 1.5, 6, 0.4, 18, CYAN, bold=True)
bullets(s, [
    "Phase 1: CEU campuses (Manila, Makati, Malolos) as pilot",
    "Phase 2: other universities and colleges in the Philippines",
    "Phase 3: schools, LGUs, hospitals, SMEs with shared equipment or fleets",
], 0.6, 1.95, 6.0, 3.0, 15)
text(s, "How we attract users", 7.0, 1.5, 6, 0.4, 18, CYAN, bold=True)
bullets(s, [
    ("Pilot first", "free semester at CEU produces data and testimonials"),
    ("Word of mouth", "property custodians and deans network across schools"),
    ("Demos", "campus IT and logistics conferences, school fairs"),
    ("Digital", "landing page, short demo videos, case study"),
    ("Partnerships", "equipment vendors and QR label printers"),
], 7.0, 1.95, 5.8, 3.5, 14)
zone(s, "Differentiators", 0.6, 5.0, 12.2, 1.7, INDIGO)
text(s, "One platform for assets, reservations, fleet and approvals  \u2022  QR identification  \u2022  tamper-evident digital logbook  \u2022  keeps working during outages  \u2022  local CEU workflows built in",
     0.8, 5.45, 11.8, 1.2, 15)

s = new_slide("Business Sustainability", "Part 2 \u2022 Enterprise & Business Plan",
              "Prices are proposed estimates for discussion, not market-validated figures.")
text(s, "Revenue model: SaaS subscription per institution (proposed)", 0.6, 1.45, 12, 0.4, 16, CYAN, bold=True)
table(s, [
    ["Plan", "Target", "Includes", "Est. price / year"],
    ["Starter", "Small school, 1 campus", "Inventory, logbook, requests, 5 staff users", "PHP 30,000"],
    ["Campus", "University, up to 3 campuses", "+ Fleet, calendar, analytics, SSO", "PHP 90,000"],
    ["Enterprise", "Multi-campus / LGU", "+ SLA, custom integrations, dedicated hosting", "Custom quote"],
], 0.6, 1.95, 12.2, [1.9, 3.2, 4.8, 2.3], row_h=0.55, size=13)
text(s, "Additional revenue", 0.6, 4.4, 6, 0.4, 16, CYAN, bold=True)
bullets(s, ["Onboarding and data-migration fee", "QR label / tag kits", "Paid training and support add-ons"], 0.6, 4.85, 6, 2, 14)
text(s, "Cost sustainability", 7.0, 4.4, 6, 0.4, 16, CYAN, bold=True)
bullets(s, [
    "Hosting scales with usage (Railway / cloud): low fixed cost at start",
    "Single codebase serves all tenants (multi-tenant)",
    "Break-even target: about 3 Campus-tier clients cover hosting, support and maintenance",
], 7.0, 4.85, 5.8, 2.2, 14)

s = new_slide("Scalability Architecture", "Part 2 \u2022 Enterprise & Business Plan",
              "Concepts applied: horizontal scaling, load balancing, caching, read replicas, async messaging, stateless services.")
box(s, "Users (web / mobile)", 0.4, 3.2, 1.7, 0.9, line=CYAN)
box(s, "CDN + WAF", 2.4, 3.2, 1.5, 0.9, line=CYAN, sub="static assets")
box(s, "Load Balancer", 4.2, 3.2, 1.6, 0.9, line=INDIGO)
arrow(s, 2.1, 3.65, 2.4, 3.65, CYAN); arrow(s, 3.9, 3.65, 4.2, 3.65, CYAN); arrow(s, 5.8, 3.65, 6.2, 2.2, INDIGO); arrow(s, 5.8, 3.65, 6.2, 3.65, INDIGO); arrow(s, 5.8, 3.65, 6.2, 5.1, INDIGO)
zone(s, "Auto-scaled services", 6.2, 1.5, 3.1, 4.6, INDIGO)
box(s, "Auth  x N", 6.4, 1.95, 2.7, 0.7)
box(s, "Inventory  x N", 6.4, 2.85, 2.7, 0.7)
box(s, "Vehicle  x N", 6.4, 3.75, 2.7, 0.7)
box(s, "Notification  x N", 6.4, 4.65, 2.7, 0.7)
zone(s, "Data tier", 9.7, 1.5, 3.2, 4.6, GREEN)
box(s, "PostgreSQL primary", 9.9, 1.95, 2.8, 0.7, line=GREEN)
box(s, "Read replicas", 9.9, 2.85, 2.8, 0.7, line=GREEN, sub="reports, calendar")
box(s, "Redis cache", 9.9, 3.75, 2.8, 0.7, line=AMBER, sub="sessions, hot lists")
box(s, "Message queue", 9.9, 4.65, 2.8, 0.7, line=AMBER, sub="notifications, jobs")
arrow(s, 9.3, 2.3, 9.9, 2.3, GREEN, both=True)
bullets(s, [
    "Split the gateway into independently deployed services and scale only the busy one",
    "Multi-tenancy: tenant_id per institution, partition large tables by tenant / date",
    "Async jobs (queue) for email / SMS and overdue scans",
], 0.5, 6.15, 12.4, 0.9, 13, gap=2)

s = new_slide("Reliability & Security", "Part 2 \u2022 Enterprise & Business Plan",
              "Concepts applied: high availability, health checks, auto-recovery, backup and DR, least privilege, encryption, audit.")
zone(s, "HIGH AVAILABILITY & RECOVERY", 0.5, 1.5, 6.1, 5.3, GREEN)
box(s, "Multi-AZ load balancer", 0.8, 2.0, 2.6, 0.7, line=GREEN)
box(s, "Health checks /health", 3.7, 2.0, 2.6, 0.7, line=GREEN)
box(s, "Auto-restart & rollback", 0.8, 2.95, 2.6, 0.7, line=GREEN)
box(s, "DB failover (standby)", 3.7, 2.95, 2.6, 0.7, line=GREEN)
box(s, "Daily backups + PITR", 0.8, 3.9, 2.6, 0.7, line=GREEN)
box(s, "Monitoring & alerts", 3.7, 3.9, 2.6, 0.7, line=GREEN)
box(s, "Client fallback (already built)", 0.8, 4.85, 5.5, 0.7, line=AMBER, sub="app continues with local data during outages")
text(s, "Targets: 99.9% uptime, RPO 15 min, RTO 1 hour", 0.8, 5.85, 5.6, 0.6, 14, CYAN, bold=True)
zone(s, "SECURITY & DATA PROTECTION", 6.9, 1.5, 5.9, 5.3, RED)
box(s, "SSO / OAuth2 + JWT", 7.2, 2.0, 2.5, 0.7, line=RED)
box(s, "Server-side RBAC", 9.9, 2.0, 2.6, 0.7, line=RED)
box(s, "HTTPS / TLS everywhere", 7.2, 2.95, 2.5, 0.7, line=RED)
box(s, "Encrypted DB & backups", 9.9, 2.95, 2.6, 0.7, line=RED)
box(s, "Rate limiting + WAF", 7.2, 3.9, 2.5, 0.7, line=RED)
box(s, "Audit log + HMAC signatures", 9.9, 3.9, 2.6, 0.7, line=RED)
box(s, "Secrets vault, input validation", 7.2, 4.85, 5.3, 0.7, line=RED)
text(s, "Compliance: Data Privacy Act of 2012 (RA 10173)", 7.2, 5.85, 5.4, 0.6, 14, CYAN, bold=True)

s = new_slide("Proposed Enterprise Architecture", "Part 2 \u2022 Enterprise & Business Plan",
              "Future state. Implementation is not required for the exam; this is the vision that evolves the current MVP.")
box(s, "Web App (React)", 0.4, 1.6, 1.9, 0.8, line=CYAN)
box(s, "Mobile / PWA QR scanner", 0.4, 2.7, 1.9, 0.8, line=CYAN)
box(s, "Admin Console", 0.4, 3.8, 1.9, 0.8, line=CYAN)
box(s, "CDN / WAF", 2.7, 2.7, 1.4, 0.8, line=CYAN)
box(s, "API Gateway\nAuth, rate limit", 4.4, 2.7, 1.9, 0.8, line=INDIGO)
for yy in (2.0, 3.1, 4.2):
    arrow(s, 2.3, yy, 2.7, 3.1, CYAN)
arrow(s, 4.1, 3.1, 4.4, 3.1, INDIGO)
zone(s, "Microservices (containers)", 6.7, 1.4, 3.3, 4.2, INDIGO)
box(s, "Auth / Identity", 6.9, 1.85, 2.9, 0.6)
box(s, "Inventory & Reservation", 6.9, 2.6, 2.9, 0.6)
box(s, "Fleet", 6.9, 3.35, 2.9, 0.6)
box(s, "Notification", 6.9, 4.1, 2.9, 0.6)
box(s, "Analytics / Reports", 6.9, 4.85, 2.9, 0.6)
arrow(s, 6.3, 3.1, 6.7, 3.1, INDIGO)
zone(s, "Data & messaging", 10.3, 1.4, 2.7, 4.2, GREEN)
box(s, "PostgreSQL HA + replicas", 10.45, 1.85, 2.4, 0.7, line=GREEN, size=12)
box(s, "Redis cache", 10.45, 2.7, 2.4, 0.6, line=GREEN, size=12)
box(s, "Message queue", 10.45, 3.45, 2.4, 0.6, line=GREEN, size=12)
box(s, "Object storage\n(QR, reports)", 10.45, 4.2, 2.4, 0.8, line=GREEN, size=12)
arrow(s, 10.0, 3.1, 10.3, 3.1, GREEN, both=True)
zone(s, "External integrations", 0.4, 5.85, 8.0, 1.1, AMBER)
box(s, "University SSO", 0.6, 6.25, 1.7, 0.55, line=AMBER, size=11)
box(s, "Email (SendGrid)", 2.5, 6.25, 1.7, 0.55, line=AMBER, size=11)
box(s, "SMS (Semaphore)", 4.4, 6.25, 1.7, 0.55, line=AMBER, size=11)
box(s, "Student / HR system", 6.3, 6.25, 1.9, 0.55, line=AMBER, size=11)
zone(s, "Operations", 8.7, 5.85, 4.3, 1.1, MUTED)
text(s, "CI/CD  \u2022  Logs & metrics  \u2022  Alerts  \u2022  Backups  \u2022  IaC", 8.85, 6.3, 4.1, 0.5, 13)

s = new_slide("SIA2 Concepts Applied & Rollout Roadmap", "Part 2 \u2022 Enterprise & Business Plan")
table(s, [
    ["SIA2 Concept", "Where it appears in SmartLogix"],
    ["Microservices & API gateway", "4 logical services behind one gateway now; independent deployment later"],
    ["Integration & data flow", "REST / JSON, SQL, notification events, future SSO / email / SMS"],
    ["Scalability", "Stateless services, load balancer, cache, replicas, queue"],
    ["Reliability / fault tolerance", "Health checks, graceful degradation, backups, failover"],
    ["Security", "RBAC, HMAC signatures, TLS, SSO, audit trail, RA 10173"],
], 0.6, 1.5, 7.3, [2.7, 4.6], row_h=0.78, size=12)
text(s, "Roadmap", 8.3, 1.5, 4.5, 0.4, 18, CYAN, bold=True)
table(s, [
    ["Phase", "Milestone"],
    ["Now (MVP)", "CEU pilot on Railway + Vercel"],
    ["0 - 6 mo", "Real auth (SSO + JWT), server RBAC, tests"],
    ["6 - 12 mo", "Split services, cache, queue, monitoring"],
    ["12 - 24 mo", "Multi-tenant SaaS, HA database, mobile app"],
], 8.3, 2.0, 4.5, [1.4, 3.1], row_h=0.78, size=12)

s = new_slide("Conclusion & Next Steps", "Wrap-up",
              "Close by restating consistency across demo, plan and documentation, then take questions.")
text(s, "What we built", 0.6, 1.5, 6, 0.4, 18, CYAN, bold=True)
bullets(s, [
    "A working, deployed MVP: React + Node / Express + PostgreSQL",
    "Role-based portals, QR logbook, approvals, fleet, notifications",
    "Live health monitoring with graceful fallback",
], 0.6, 1.95, 6.0, 3, 15)
text(s, "Known limitations (honest)", 7.0, 1.5, 6, 0.4, 18, AMBER, bold=True)
bullets(s, [
    "Role switcher is a simulated login: no real authentication yet",
    "Permissions are enforced in the UI; server-side RBAC is planned",
    "Services share one gateway process and one database",
    "No automated test suite yet",
], 7.0, 1.95, 5.8, 3, 15)
zone(s, "Next steps", 0.6, 4.9, 12.2, 1.7, INDIGO)
text(s, "SSO + JWT  \u2022  server-side RBAC  \u2022  automated tests  \u2022  split into deployable services  \u2022  email / SMS integration  \u2022  CEU pilot rollout",
     0.8, 5.4, 11.8, 1.0, 16)
text(s, "Thank you. Questions?", 0.6, 6.7, 8, 0.4, 16, WHITE, bold=True)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "SmartLogix_Final_Presentation.pptx")
prs.save(out)
print("Saved", out, "slides:", len(prs.slides))

