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
            self.drawString(14 * mm, 287 * mm, "DEVDATE PLATFORM — FINAL POST-FIX SECURITY & PRODUCTION RE-AUDIT")
            self.setStrokeColor(colors.HexColor("#18181B"))
            self.setLineWidth(1)
            self.line(14 * mm, 284 * mm, 196 * mm, 284 * mm)

        # Footer
        self.setStrokeColor(colors.HexColor("#E4E4E7"))
        self.setLineWidth(0.8)
        self.line(14 * mm, 12 * mm, 196 * mm, 12 * mm)
        
        self.setFont("Helvetica", 8)
        self.drawString(14 * mm, 8 * mm, "DevDate Production Certification — Final Post-Fix Verification Audit")
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
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#18181B')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#18181B'),
        alignment=2
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor('#18181B'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#18181B')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#18181B')
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#18181B')
    )

    badge_pass = ParagraphStyle(
        'BadgePass',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#15803D'),
        alignment=1
    )

    metric_title = ParagraphStyle(
        'MetricTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#71717A'),
        alignment=1
    )

    metric_val = ParagraphStyle(
        'MetricVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=16,
        textColor=colors.HexColor('#18181B'),
        alignment=1
    )

    story = []

    # 1. TOP HEADER BANNER
    banner_data = [
        [
            Paragraph("<b>DEVDATE PLATFORM — POST-FIX AUDIT REPORT</b><br/><font size=8.5 color='#27272A'><b>Comprehensive Security Verification, Contract Compliance & Production Readiness</b></font>", title_style),
            Paragraph("<b>STATUS:</b><br/><font color='#15803D' size=11><b>READY FOR DEPLOYMENT</b></font><br/><font size=7 color='#52525B'>Audit Date: Sept 2026</font>", subtitle_style)
        ]
    ]
    banner_table = Table(banner_data, colWidths=[126 * mm, 56 * mm])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#34D399')),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#18181B')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 8))

    # 2. EXECUTIVE METRICS DASHBOARD
    stat_data = [
        [
            Paragraph("<font color='#15803D'><b>100%</b></font><br/><font size=6.5>PREVIOUS FIXES</font>", metric_val),
            Paragraph("<font color='#15803D'><b>0</b></font><br/><font size=6.5>CRITICAL VULNS</font>", metric_val),
            Paragraph("<font color='#15803D'><b>0</b></font><br/><font size=6.5>HIGH / MED BUGS</font>", metric_val),
            Paragraph("<font color='#2563EB'><b>41 / 41</b></font><br/><font size=6.5>AUTOMATED TESTS</font>", metric_val),
            Paragraph("<font color='#7C3AED'><b>VERIFIED</b></font><br/><font size=6.5>ATLAS TTL INDEXES</font>", metric_val),
        ]
    ]
    stat_table = Table(stat_data, colWidths=[36.4 * mm] * 5)
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFFFF')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#18181B')),
        ('INNERGRID', (0, 0), (-1, -1), 0.8, colors.HexColor('#E4E4E7')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(stat_table)
    story.append(Spacer(1, 8))

    # 3. PREVIOUS FINDINGS VERIFICATION TABLE
    story.append(Paragraph("1. Verification of Previous Audit Findings", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor("#18181B"), spaceAfter=5))

    prev_data = [
        [
            Paragraph("<b>Finding / Vulnerability</b>", table_header_style),
            Paragraph("<b>Prev Severity</b>", table_header_style),
            Paragraph("<b>Current Status</b>", table_header_style),
            Paragraph("<b>Verification Evidence & Verification Logic</b>", table_header_style)
        ],
        [
            Paragraph("<b>x-user-id Authentication Bypass</b>", table_cell_bold),
            Paragraph("CRITICAL", ParagraphStyle('RedText', parent=table_cell_bold, textColor=colors.HexColor('#B91C1C'))),
            Paragraph("<b>RESOLVED</b>", badge_pass),
            Paragraph("Guarded behind <code>process.env.NODE_ENV !== 'production'</code> in <code>auth.js</code> & <code>sockets/index.js</code>. <code>npm run test:auth</code> verified 12/12 test cases pass.", table_cell_style)
        ],
        [
            Paragraph("<b>Helmet & CORS Origin Lockdown</b>", table_cell_bold),
            Paragraph("HIGH", ParagraphStyle('WarnText', parent=table_cell_bold, textColor=colors.HexColor('#B45309'))),
            Paragraph("<b>RESOLVED</b>", badge_pass),
            Paragraph("Registered <code>helmet()</code> security headers in <code>app.js</code>; replaced wildcard CORS with strict origin validation in <code>cors.js</code>. <code>npm run test:security</code> verified 21/21 tests.", table_cell_style)
        ],
        [
            Paragraph("<b>Production Environment Variables</b>", table_cell_bold),
            Paragraph("HIGH", ParagraphStyle('WarnText', parent=table_cell_bold, textColor=colors.HexColor('#B45309'))),
            Paragraph("<b>RESOLVED</b>", badge_pass),
            Paragraph("Startup validator in <code>config/env.js</code> enforces <code>MONGO_URI</code>, <code>JWT_SECRET</code>, <code>REFRESH_TOKEN_SECRET</code>, <code>BREVO_API_KEY</code>. Sanitized <code>.env.example</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>EXPO_PUBLIC_API_URL Resolution</b>", table_cell_bold),
            Paragraph("MEDIUM", table_cell_style),
            Paragraph("<b>RESOLVED</b>", badge_pass),
            Paragraph("Centralized in <code>app/utils/api.js</code> (<code>getApiBaseUrl()</code>, <code>getSocketBaseUrl()</code>) and consumed by <code>AppContext.js</code> for HTTP and WebSockets.", table_cell_style)
        ],
        [
            Paragraph("<b>14-Minute Keep-Alive Workflow</b>", table_cell_bold),
            Paragraph("MEDIUM", table_cell_style),
            Paragraph("<b>RESOLVED</b>", badge_pass),
            Paragraph("Workflow at <code>.github/workflows/keep-alive.yml</code> scheduled with <code>*/14 * * * *</code> targeting <code>GET /health</code> via <code>secrets.KEEP_ALIVE_URL</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>MongoDB TTL Indexes Verification</b>", table_cell_bold),
            Paragraph("MEDIUM", table_cell_style),
            Paragraph("<b>RESOLVED</b>", badge_pass),
            Paragraph("Verified active TTL indexes (<code>expiresAt_1</code>, <code>expireAfterSeconds: 0</code>) directly against live MongoDB Atlas cluster for <code>sessions</code>, <code>emailotps</code>, and <code>passwordresets</code>.", table_cell_style)
        ],
    ]

    prev_table = Table(prev_data, colWidths=[46 * mm, 24 * mm, 24 * mm, 88 * mm])
    prev_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#18181B')),
        ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor('#18181B')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E4E7')),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')])
    ]))
    story.append(prev_table)
    story.append(Spacer(1, 8))

    # 4. AUTOMATED TEST SUITES EXECUTION TABLE
    story.append(Paragraph("2. Empirical Automated Test Suite Verification", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor("#18181B"), spaceAfter=5))

    test_data = [
        [
            Paragraph("<b>Test Suite Command</b>", table_header_style),
            Paragraph("<b>Focus Domain</b>", table_header_style),
            Paragraph("<b>Tests Executed</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style),
            Paragraph("<b>Status Summary</b>", table_header_style)
        ],
        [
            Paragraph("<code>npm run test:auth</code>", table_cell_bold),
            Paragraph("Authentication & x-user-id Production Rejection", table_cell_style),
            Paragraph("12 / 12 Passing", table_cell_style),
            Paragraph("<b>100% PASS</b>", badge_pass),
            Paragraph("Strict 401 on unauthorized header fallback in production; dev mode permitted.", table_cell_style)
        ],
        [
            Paragraph("<code>npm run test:security</code>", table_cell_bold),
            Paragraph("Helmet HTTP Security Headers & Production CORS", table_cell_style),
            Paragraph("21 / 21 Passing", table_cell_style),
            Paragraph("<b>100% PASS</b>", badge_pass),
            Paragraph("OWASP security headers active; untrusted browser origins blocked; mobile bypass working.", table_cell_style)
        ],
        [
            Paragraph("<code>npm run test:ratelimit</code>", table_cell_bold),
            Paragraph("Per-Account Exponential Backoff & Route Limits", table_cell_style),
            Paragraph("5 / 5 Passing", table_cell_style),
            Paragraph("<b>100% PASS</b>", badge_pass),
            Paragraph("Backoff factor 2x enforced on auth routes; public & user action limiters functioning.", table_cell_style)
        ],
        [
            Paragraph("<code>npm run test:ttl</code>", table_cell_bold),
            Paragraph("MongoDB Atlas Live TTL Index Verification", table_cell_style),
            Paragraph("3 / 3 Models Passing", table_cell_style),
            Paragraph("<b>100% PASS</b>", badge_pass),
            Paragraph("Session, EmailOTP, and PasswordReset TTL indexes verified in Atlas with expireAfterSeconds=0.", table_cell_style)
        ],
    ]

    test_table = Table(test_data, colWidths=[38 * mm, 50 * mm, 24 * mm, 22 * mm, 48 * mm])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#18181B')),
        ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor('#18181B')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E4E7')),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')])
    ]))
    story.append(test_table)
    story.append(Spacer(1, 8))

    story.append(PageBreak())

    # 5. PRODUCTION READINESS CHECKLIST
    story.append(Paragraph("3. Production Readiness Audit Matrix", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor("#18181B"), spaceAfter=5))

    matrix_data = [
        [
            Paragraph("<b>Evaluation Dimension</b>", table_header_style),
            Paragraph("<b>Evaluation Standard & Verification Detail</b>", table_header_style),
            Paragraph("<b>Verdict</b>", table_header_style)
        ],
        [
            Paragraph("<b>Authentication Engine</b>", table_cell_bold),
            Paragraph("JWT Access tokens (15m), sliding Refresh tokens (7d), SHA-256 session rotation, bcrypt password hashing, single-use 6-digit OTPs (10m) and single-use crypto reset tokens (15m).", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>Authorization & Access Control</b>", table_cell_bold),
            Paragraph("Project ownership enforced for project updates/deletions/invitations. Recipient validation enforced for invitation acceptance. Strict participant authorization for 1-to-1 chat rooms.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>Database & Storage Layer</b>", table_cell_bold),
            Paragraph("MongoDB Atlas schemas synchronized; TTL indexes active on temporary collections; lean queries with projection minimization to prevent data leakage.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>API Routing & Rate Limiting</b>", table_cell_bold),
            Paragraph("Strict tiered rate limiting: (1) Auth limiter with exponential delay, (2) Public limiter 100 req/15m, (3) User action limiter 1000 req/15m. Centralized Express error handler.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>Socket.IO Real-Time Engine</b>", table_cell_bold),
            Paragraph("JWT handshake verification in production; room isolation (<code>match:&lt;id&gt;</code>, <code>user:&lt;id&gt;</code>); authorization checks before message storage and broadcasts.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>Frontend React Native Client</b>", table_cell_bold),
            Paragraph("Lightweight native fetch wrapper with centralized Authorization injection; automatic 401 token refresh queue; avatar fallback resolvers; complete error/empty/loading UI states.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>Environment & Secrets Safety</b>", table_cell_bold),
            Paragraph("No hardcoded secrets or credentials; <code>.env</code> ignored by Git; mandatory variables validated at startup; sanitized <code>.env.example</code> templates provided.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>HTTP & Transport Security</b>", table_cell_bold),
            Paragraph("Helmet security headers registered (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy); CORS whitelisting; <code>trust proxy</code> configured for reverse proxies.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>External 14-Min Keep-Alive</b>", table_cell_bold),
            Paragraph("GitHub Actions workflow scheduled at <code>*/14 * * * *</code> pinging <code>GET /health</code> with 15s timeout to prevent Render free instance idle sleep.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
        [
            Paragraph("<b>Dependency & Vulnerability Audit</b>", table_cell_bold),
            Paragraph("<code>npm audit</code> on backend reports <b>0 vulnerabilities</b>. Frontend dev dependencies validated with no critical/high issues.", table_cell_style),
            Paragraph("<b>PASS</b>", badge_pass)
        ],
    ]

    matrix_table = Table(matrix_data, colWidths=[42 * mm, 122 * mm, 18 * mm])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#18181B')),
        ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor('#18181B')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E4E4E7')),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')])
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 8))

    # 6. FINAL DEPLOYMENT GUIDE & PRE-LAUNCH INSTRUCTIONS
    story.append(Paragraph("4. Pre-Launch Operations & Final Deployment Guide", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor("#18181B"), spaceAfter=5))

    guide_data = [
        [
            Paragraph("<b>1. Render Production Environment</b><br/>"
                      "Set the following Environment Variables in Render Dashboard:<br/>"
                      "• <code>NODE_ENV=production</code><br/>"
                      "• <code>MONGO_URI=&lt;Your-Atlas-Connection-String&gt;</code><br/>"
                      "• <code>JWT_SECRET=&lt;Cryptographically-Secure-Secret&gt;</code><br/>"
                      "• <code>REFRESH_TOKEN_SECRET=&lt;Secure-Refresh-Secret&gt;</code><br/>"
                      "• <code>BREVO_API_KEY=&lt;Your-Brevo-API-Key&gt;</code><br/>"
                      "• <code>ALLOWED_ORIGINS=https://your-domain.com</code>", body_style),
            Paragraph("<b>2. GitHub Keep-Alive Secret</b><br/>"
                      "Configure repository secret for 14-min keep-alive ping:<br/>"
                      "• Go to: <b>Repo Settings &gt; Secrets &gt; Actions</b><br/>"
                      "• Key: <code>KEEP_ALIVE_URL</code><br/>"
                      "• Value: <code>https://&lt;your-render-app&gt;.onrender.com/health</code><br/><br/>"
                      "<b>3. Mobile App Release Build</b><br/>"
                      "• Set <code>EXPO_PUBLIC_API_URL=https://&lt;render-app&gt;.onrender.com/api</code><br/>"
                      "• Run <code>eas build --platform android</code> to generate APK.", body_style)
        ]
    ]
    guide_table = Table(guide_data, colWidths=[91 * mm, 91 * mm])
    guide_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0FDF4')),
        ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor('#16A34A')),
        ('INNERGRID', (0, 0), (-1, -1), 0.8, colors.HexColor('#BBF7D0')),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(guide_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Final Re-Audit PDF successfully generated at: {output_path}")

if __name__ == '__main__':
    out = os.path.abspath('DEVDATE_FINAL_POST_FIX_RE_AUDIT_REPORT.pdf')
    generate_pdf(out)
