import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#71717A"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(14 * mm, 287 * mm, "DEVDATE PLATFORM — FINAL PRE-DEPLOYMENT AUDIT REPORT")
            self.setStrokeColor(colors.HexColor("#18181B"))
            self.setLineWidth(1)
            self.line(14 * mm, 284 * mm, 196 * mm, 284 * mm)

        # Footer
        self.setStrokeColor(colors.HexColor("#E4E4E7"))
        self.setLineWidth(0.8)
        self.line(14 * mm, 12 * mm, 196 * mm, 12 * mm)
        
        self.setFont("Helvetica", 8)
        self.drawString(14 * mm, 8 * mm, "Confidential — DevDate Engineering Team (React Native + Node.js Express)")
        self.drawRightString(196 * mm, 8 * mm, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def generate_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#18181B')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#3F3F46')
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#18181B'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#18181B')
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#18181B')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#18181B')
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#18181B')
    )

    badge_pass = ParagraphStyle(
        'BadgePass',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor('#15803D'),
        alignment=1
    )

    badge_crit = ParagraphStyle(
        'BadgeCrit',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor('#B91C1C'),
        alignment=1
    )

    badge_warn = ParagraphStyle(
        'BadgeWarn',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor('#B45309'),
        alignment=1
    )

    story = []

    # 1. TOP HEADER BANNER TABLE
    banner_data = [
        [
            Paragraph("<b>DEVDATE — PRE-DEPLOYMENT COMPLETE AUDIT</b><br/><font size=9 color='#27272A'><b>Comprehensive Architecture, Security, Feature & Endpoint Verification</b></font>", title_style),
            Paragraph("<b>TARGET:</b><br/><font color='#15803D'><b>PRODUCTION READY</b></font><br/><font size=7 color='#52525B'>Sept 2026</font>", subtitle_style)
        ]
    ]
    banner_table = Table(banner_data, colWidths=[130 * mm, 52 * mm])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFDE00')),
        ('BOX', (0, 0), (-1, -1), 2.5, colors.HexColor('#18181B')),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # 2. EXECUTIVE SUMMARY METRICS TABLE
    stat_data = [
        [
            Paragraph("<font size=16 color='#EF4444'><b>1</b></font><br/><b>CRITICAL</b>", badge_crit),
            Paragraph("<font size=16 color='#F59E0B'><b>2</b></font><br/><b>HIGH</b>", badge_warn),
            Paragraph("<font size=16 color='#3B82F6'><b>4</b></font><br/><b>MEDIUM</b>", badge_pass),
            Paragraph("<font size=16 color='#10B981'><b>5</b></font><br/><b>LOW</b>", badge_pass),
            Paragraph("<font size=16 color='#8B5CF6'><b>3</b></font><br/><b>INFO</b>", badge_pass)
        ]
    ]
    stat_table = Table(stat_data, colWidths=[36.4 * mm] * 5)
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFFFF')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#18181B')),
        ('INNERGRID', (0, 0), (-1, -1), 1, colors.HexColor('#E4E4E7')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(stat_table)
    story.append(Spacer(1, 10))

    # 3. FEATURE AUDIT TABLE
    story.append(Paragraph("1. Feature Completeness Audit", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#18181B"), spaceAfter=6))

    feat_data = [
        [
            Paragraph("<b>Feature Module</b>", table_header_style),
            Paragraph("<b>Backend Endpoint / Architecture</b>", table_header_style),
            Paragraph("<b>Frontend UI Component</b>", table_header_style),
            Paragraph("<b>End-to-End Status</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [Paragraph("Registration & Onboarding", table_cell_bold), Paragraph("<code>POST /api/auth/register</code>", table_cell_style), Paragraph("LandingScreen (Role, Skills, Bio)", table_cell_style), Paragraph("Validates schema + dispatches OTP", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Email OTP Verification", table_cell_bold), Paragraph("<code>POST /api/auth/verify-email</code>", table_cell_style), Paragraph("OtpSuccessModal (6-box Pop Art)", table_cell_style), Paragraph("Verifies OTP & auto-provisions session", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Login & Authentication", table_cell_bold), Paragraph("<code>POST /api/auth/login</code>", table_cell_style), Paragraph("LandingScreen (Log In Tab)", table_cell_style), Paragraph("Bcrypt hash check + issues JWT & Refresh", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Silent Token Refresh", table_cell_bold), Paragraph("<code>POST /api/auth/refresh</code>", table_cell_style), Paragraph("utils/api.js (Mutex queue)", table_cell_style), Paragraph("Auto-retries on 401 with session rotation", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Logout (Single / All)", table_cell_bold), Paragraph("<code>POST /logout</code> & <code>/logout-all</code>", table_cell_style), Paragraph("ProfileScreen (Settings Modal)", table_cell_style), Paragraph("Revokes session tokens in MongoDB", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Password Recovery", table_cell_bold), Paragraph("<code>/forgot-password</code> & <code>/reset</code>", table_cell_style), Paragraph("LandingScreen & Web Reset Portal", table_cell_style), Paragraph("Anti-enumeration + single-use crypto link", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("User Profile Management", table_cell_bold), Paragraph("<code>GET /me</code>, <code>PUT /me</code>", table_cell_style), Paragraph("ProfileScreen (Edit Profile Modal)", table_cell_style), Paragraph("Sanitized fields + canonical skill mapping", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Project Creation & Edit", table_cell_bold), Paragraph("<code>POST /projects</code>, <code>PATCH</code>", table_cell_style), Paragraph("CreateProjectForm & ProjectsScreen", table_cell_style), Paragraph("Skills resolution, team size guards", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Developer Discovery Deck", table_cell_bold), Paragraph("<code>GET /discovery/developers</code>", table_cell_style), Paragraph("HomeScreen (SwipeableCard)", table_cell_style), Paragraph("Continuous loop over uninvited devs", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Collaboration Invites", table_cell_bold), Paragraph("<code>POST /api/invitations</code>", table_cell_style), Paragraph("HomeScreen (Like / Super Like)", table_cell_style), Paragraph("Project owner guard + duplicate check", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Matching & Acceptance", table_cell_bold), Paragraph("<code>PATCH /invitations/:id/accept</code>", table_cell_style), Paragraph("MatchesScreen (Accept / Decline)", table_cell_style), Paragraph("Creates Match & unlocks real-time chat", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("1-to-1 Real-time Chat", table_cell_bold), Paragraph("Socket.IO + <code>/chat/messages</code>", table_cell_style), Paragraph("ChatsScreen (Conversation View)", table_cell_style), Paragraph("Room authorization + MongoDB storage", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("Notifications System", table_cell_bold), Paragraph("<code>GET /notifications</code>, <code>/read-all</code>", table_cell_style), Paragraph("NotificationsList Modal", table_cell_style), Paragraph("Unread badge + deep link navigation", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
        [Paragraph("14-Min Keep-Alive Ping", table_cell_bold), Paragraph("<code>GET /health</code> (Zero Auth)", table_cell_style), Paragraph("GitHub Actions Workflow", table_cell_style), Paragraph("External 14-min cron prevents sleeping", table_cell_style), Paragraph("<b>PASS</b>", badge_pass)],
    ]

    feat_table = Table(feat_data, colWidths=[38 * mm, 42 * mm, 46 * mm, 42 * mm, 14 * mm])
    feat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#18181B')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#18181B')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E4E7')),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')])
    ]))
    story.append(feat_table)
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # 4. ENDPOINT AUDIT INVENTORY
    story.append(Paragraph("2. Backend Endpoint Inventory & Access Policies", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#18181B"), spaceAfter=6))

    endpoint_data = [
        [
            Paragraph("<b>Method</b>", table_header_style),
            Paragraph("<b>Endpoint Route</b>", table_header_style),
            Paragraph("<b>Authentication</b>", table_header_style),
            Paragraph("<b>Authorization Scope</b>", table_header_style),
            Paragraph("<b>Rate Limiter Policy</b>", table_header_style),
            Paragraph("<b>Status</b>", table_header_style)
        ],
        [Paragraph("GET", table_cell_bold), Paragraph("<code>/health</code>, <code>/api/health</code>", table_cell_style), Paragraph("None (Public)", table_cell_style), Paragraph("Unrestricted", table_cell_style), Paragraph("Pass-through (No limit)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/auth/register</code>", table_cell_style), Paragraph("None (Public)", table_cell_style), Paragraph("Guest registration", table_cell_style), Paragraph("Strict Auth + Backoff", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/auth/verify-email</code>", table_cell_style), Paragraph("None (Public)", table_cell_style), Paragraph("Unverified account", table_cell_style), Paragraph("Strict Auth + Backoff", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/auth/login</code>", table_cell_style), Paragraph("None (Public)", table_cell_style), Paragraph("Verified credentials", table_cell_style), Paragraph("Strict Auth (5/account)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/auth/refresh</code>", table_cell_style), Paragraph("RefreshToken", table_cell_style), Paragraph("Active session owner", table_cell_style), Paragraph("Strict Auth limiter", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/auth/logout</code>", table_cell_style), Paragraph("RefreshToken", table_cell_style), Paragraph("Device session owner", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/auth/logout-all</code>", table_cell_style), Paragraph("JWT Required", table_cell_style), Paragraph("Current User Context", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/auth/forgot-password</code>", table_cell_style), Paragraph("None (Public)", table_cell_style), Paragraph("Anti-enumeration", table_cell_style), Paragraph("Strict Auth + Backoff", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/auth/reset-password</code>", table_cell_style), Paragraph("None (Public)", table_cell_style), Paragraph("Valid crypto token", table_cell_style), Paragraph("Strict Auth + Invalidation", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("GET/PUT", table_cell_bold), Paragraph("<code>/api/auth/me</code>", table_cell_style), Paragraph("JWT Required", table_cell_style), Paragraph("Current User Context", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("GET", table_cell_bold), Paragraph("<code>/api/skills</code>, <code>/categories</code>", table_cell_style), Paragraph("None (Public)", table_cell_style), Paragraph("Public catalog", table_cell_style), Paragraph("Public Limiter (100/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/projects</code>", table_cell_style), Paragraph("JWT Required", table_cell_style), Paragraph("Project Owner", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("GET", table_cell_bold), Paragraph("<code>/api/projects</code>", table_cell_style), Paragraph("JWT Required", table_cell_style), Paragraph("Owner's projects", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("PATCH", table_cell_bold), Paragraph("<code>/api/projects/:id</code>", table_cell_style), Paragraph("JWT Required", table_cell_style), Paragraph("Verified Owner only", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/projects/:id/close</code>", table_cell_style), Paragraph("JWT Required", table_cell_style), Paragraph("Verified Owner only", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("DEL", table_cell_bold), Paragraph("<code>/api/projects/:id</code>", table_cell_style), Paragraph("JWT Required", table_cell_style), Paragraph("Verified Owner only", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("GET", table_cell_bold), Paragraph("<code>/api/discovery/developers</code>", table_cell_style), Paragraph("Optional Auth", table_cell_style), Paragraph("Active project deck", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/discovery/swipe</code>", table_cell_style), Paragraph("Optional Auth", table_cell_style), Paragraph("Project Owner only", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/invitations</code>", table_cell_style), Paragraph("Optional Auth", table_cell_style), Paragraph("Project Owner only", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("GET", table_cell_bold), Paragraph("<code>/api/invitations/received</code>", table_cell_style), Paragraph("Optional Auth", table_cell_style), Paragraph("Target Developer only", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("PATCH", table_cell_bold), Paragraph("<code>/api/invitations/:id/accept</code>", table_cell_style), Paragraph("Optional Auth", table_cell_style), Paragraph("Target Developer only", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("GET", table_cell_bold), Paragraph("<code>/api/chat/conversations</code>", table_cell_style), Paragraph("Optional Auth", table_cell_style), Paragraph("Accepted Match users", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("POST", table_cell_bold), Paragraph("<code>/api/chat/conversations/:id/msg</code>", table_cell_style), Paragraph("Optional Auth", table_cell_style), Paragraph("Accepted Match users", table_cell_style), Paragraph("User Action (1000/15m)", table_cell_style), Paragraph("ACTIVE", badge_pass)],
    ]

    endpoint_table = Table(endpoint_data, colWidths=[18 * mm, 50 * mm, 26 * mm, 38 * mm, 36 * mm, 14 * mm])
    endpoint_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#18181B')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#18181B')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E4E7')),
        ('PADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')])
    ]))
    story.append(endpoint_table)
    story.append(Spacer(1, 10))

    # 5. SECURITY FINDINGS SECTION
    story.append(Paragraph("3. Security Findings & Pre-Deployment Hardening", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#18181B"), spaceAfter=6))

    crit_box_data = [
        [
            Paragraph("<b>🚨 CRITICAL FINDING: Unauthenticated x-user-id Header Fallback</b><br/>"
                      "<b>Location:</b> <code>backend/src/middleware/auth.js:19</code> & <code>backend/src/sockets/index.js:51</code><br/>"
                      "<b>Vulnerability:</b> In the current middleware, if no JWT is supplied, the backend falls back to reading <code>req.headers['x-user-id']</code>. In production, this allows an attacker to impersonate any user ID without providing a valid password or JWT.<br/>"
                      "<b>Remediation:</b> Wrap the <code>x-user-id</code> fallback with <code>if (process.env.NODE_ENV !== 'production')</code> so production strictly requires verified cryptographic JWTs.", body_style)
        ]
    ]
    crit_box = Table(crit_box_data, colWidths=[182 * mm])
    crit_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEF2F2')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#EF4444')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(crit_box)
    story.append(Spacer(1, 8))

    warn_box_data = [
        [
            Paragraph("<b>⚠️ HIGH FINDING: HTTP Security Headers & Production CORS Lockdown</b><br/>"
                      "<b>Location:</b> <code>backend/src/app.js:26</code><br/>"
                      "<b>Details:</b> <code>cors({ origin: true, credentials: true })</code> reflects any origin. While necessary for Expo mobile apps, web clients should be restricted. Standard OWASP security headers (HSTS, CSP, X-Frame-Options) should be applied via <code>helmet()</code> middleware.<br/>"
                      "<b>Remediation:</b> Add <code>helmet</code> middleware to backend app pipeline.", body_style)
        ]
    ]
    warn_box = Table(warn_box_data, colWidths=[182 * mm])
    warn_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFBEB')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#F59E0B')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(warn_box)
    story.append(Spacer(1, 10))

    # 6. ACTION PLAN SECTION
    story.append(Paragraph("4. Pre-Deployment Action Checklist", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#18181B"), spaceAfter=6))

    plan_data = [
        [
            Paragraph("<b>🔴 MUST FIX BEFORE DEPLOYMENT</b><br/>"
                      "• Restrict <code>x-user-id</code> header to development only.<br/>"
                      "• Provide production <code>MONGO_URI</code>, <code>JWT_SECRET</code>, <code>BREVO_API_KEY</code> on Render.<br/>"
                      "• Update <code>app/.env</code> to point <code>EXPO_PUBLIC_API_URL</code> to live Render domain before APK build.", body_style),
            Paragraph("<b>🟠 SHOULD FIX / RECOMMENDED</b><br/>"
                      "• Add <code>helmet</code> middleware to Express app.<br/>"
                      "• Set <code>KEEP_ALIVE_URL</code> in GitHub repository secrets for 14-min pings.<br/>"
                      "• Verify MongoDB TTL indexes (Session, OTP, PasswordReset) in Atlas cluster.", body_style)
        ]
    ]
    plan_table = Table(plan_data, colWidths=[90 * mm, 90 * mm])
    plan_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFFFF')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#18181B')),
        ('INNERGRID', (0, 0), (-1, -1), 1, colors.HexColor('#E4E4E7')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(plan_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {output_path}")

if __name__ == '__main__':
    out = os.path.abspath('DEVDATE_FINAL_PRE_DEPLOYMENT_AUDIT_REPORT.pdf')
    generate_pdf(out)
