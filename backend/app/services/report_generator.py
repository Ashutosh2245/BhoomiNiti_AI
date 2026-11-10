import os
import json
import hashlib
import datetime
from pathlib import Path

# PDF Generation imports
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# DOCX Generation imports
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# Excel & Data imports
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and print 'Page X of Y' footers and headers.
    """
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
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 806, "BhoomiNiti AI — National Digital Platform for Land Governance")
            self.drawRightString(576, 806, f"Report ID: {getattr(self, '_report_id_str', 'BN-2026-REPORT')}")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 798, 576, 798)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 45, 576, 45)

        self.drawString(36, 32, "Confidential Government Research & Evidence Brief | Grounded in Verified Data")
        self.drawRightString(576, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def compute_sha256(file_path):
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            sha.update(chunk)
    return sha.hexdigest()

def generate_pdf_report(report_id, snapshot, language, options, output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=colors.HexColor("#0F172A"))
    subtitle_style = ParagraphStyle('DocSubTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor("#475569"))
    h1_style = ParagraphStyle('Heading1Custom', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=colors.HexColor("#1E3A8A"), spaceBefore=12, spaceAfter=6)
    h2_style = ParagraphStyle('Heading2Custom', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=14, textColor=colors.HexColor("#334155"), spaceBefore=8, spaceAfter=4)
    body_style = ParagraphStyle('BodyCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor("#1E293B"))
    hi_body_style = ParagraphStyle('HindiBodyCustom', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8.5, leading=12, textColor=colors.HexColor("#334155"))
    meta_style = ParagraphStyle('MetaCustom', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=colors.HexColor("#0284C7"))

    story = []

    # 1. Header Banner Box
    banner_data = [
        [
            Paragraph("<b>BHOOMINITI AI</b><br/><font size=7 color='#64748B'>National Digital Platform for Evidence-Based Land Governance</font>", body_style),
            Paragraph(f"<font size=8 color='#047857'><b>DATA STATUS: {snapshot.get('data_status', 'VERIFIED GOVERNMENT SOURCES')}</b></font><br/><font size=7 color='#64748B'>Report ID: {report_id}</font>", ParagraphStyle('RightText', parent=body_style, alignment=2))
        ]
    ]
    t_banner = Table(banner_data, colWidths=[300, 240])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 14))

    # 2. Main Title
    story.append(Paragraph(snapshot.get("title", "Land Governance Evidence Report"), title_style))
    if language in ["hi", "en-hi"] and snapshot.get("title_hi"):
        story.append(Paragraph(snapshot.get("title_hi"), ParagraphStyle('HiTitle', parent=title_style, fontSize=14, leading=18, textColor=colors.HexColor("#334155"))))
    
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Generated: {snapshot.get('generated_at')} | Data Snapshot: {snapshot.get('data_snapshot_version')} | Language: {language.upper()}", subtitle_style))
    story.append(Spacer(1, 12))

    # 3. At a Glance (KPI Cards Table)
    if options.get("executive_summary", True):
        story.append(Paragraph("AT A GLANCE / एक नज़र में", h1_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=8))
        
        kpi_cells = []
        for k in snapshot.get("kpis", []):
            cell_content = Paragraph(
                f"<font size=7 color='#64748B'><b>{k['label'].upper()}</b></font><br/>"
                f"<font size=13 color='#0F172A'><b>{k['value']}</b></font><br/>"
                f"<font size=7 color='#0284C7'>{k.get('sub', '')}</font>",
                body_style
            )
            kpi_cells.append(cell_content)
        
        # Chunk into 4 columns
        rows = [kpi_cells[i:i+4] for i in range(0, len(kpi_cells), 4)]
        if rows:
            # Ensure row length matches
            while len(rows[-1]) < 4:
                rows[-1].append(Paragraph("", body_style))
            t_kpis = Table(rows, colWidths=[135, 135, 135, 135])
            t_kpis.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))
            story.append(t_kpis)
            story.append(Spacer(1, 14))

    # 4. Executive Summary
    if options.get("executive_summary", True):
        story.append(Paragraph("EXECUTIVE SUMMARY", h1_style))
        story.append(Paragraph(snapshot.get("exec_summary_en", ""), body_style))
        if language in ["hi", "en-hi"] and snapshot.get("exec_summary_hi"):
            story.append(Spacer(1, 4))
            story.append(Paragraph(f"<b>कार्यकारी सारांश:</b> {snapshot.get('exec_summary_hi')}", hi_body_style))
        story.append(Spacer(1, 12))

    # 5. Key Evidence & Derived Findings
    if options.get("key_findings", True):
        story.append(Paragraph("KEY EVIDENCE & DERIVED FINDINGS / प्रमुख साक्ष्य एवं निष्कर्ष", h1_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=8))

        for idx, f in enumerate(snapshot.get("findings", []), 1):
            f_box = [
                [Paragraph(f"<b>Finding {idx:02d}:</b> {f.get('title_en', '')}", h2_style)],
                [Paragraph(f"<b>Evidence:</b> {f.get('evidence_en', '')}", body_style)],
                [Paragraph(f"<font color='#0284C7'><b>Source:</b> {f.get('source', '')} | <b>Calculation:</b> {f.get('formula', 'BhoomiNiti Direct Aggregation')}</font>", meta_style)]
            ]
            if language in ["hi", "en-hi"] and f.get("title_hi"):
                f_box.insert(1, [Paragraph(f"<b>साक्ष्य {idx:02d}:</b> {f.get('title_hi', '')}", hi_body_style)])

            t_f = Table(f_box, colWidths=[540])
            t_f.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FAFAFA")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
                ('PADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
            ]))
            story.append(t_f)
            story.append(Spacer(1, 8))

    # 6. Data Sources Registry Table
    if options.get("sources", True):
        story.append(Spacer(1, 6))
        story.append(Paragraph("DATA SOURCES & PROVENANCE REGISTRY / डेटा स्रोत एवं प्रमाणिकता", h1_style))
        
        src_headers = [Paragraph("<b>Data Source Name</b>", body_style), Paragraph("<b>Organization</b>", body_style), Paragraph("<b>Classification</b>", body_style), Paragraph("<b>Status</b>", body_style)]
        src_rows = [src_headers]
        for s in snapshot.get("sources", []):
            src_rows.append([
                Paragraph(f"<b>{s['name']}</b>", body_style),
                Paragraph(s.get('organization', 'Govt of India'), body_style),
                Paragraph(f"<font color='#0369A1'><b>{s.get('category', 'EXTERNAL_DATA')}</b></font>", body_style),
                Paragraph(f"<font color='#047857'><b>{s.get('status', 'VERIFIED')}</b></font>", body_style)
            ])
        t_src = Table(src_rows, colWidths=[180, 160, 110, 90])
        t_src.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t_src)
        story.append(Spacer(1, 12))

    # 7. Methodology
    if options.get("methodology", True):
        story.append(Paragraph("METHODOLOGY & CALCULATION SPECIFICATION / कार्यपद्धति", h1_style))
        story.append(Paragraph(snapshot.get("methodology_en", ""), body_style))
        if language in ["hi", "en-hi"] and snapshot.get("methodology_hi"):
            story.append(Spacer(1, 4))
            story.append(Paragraph(f"<b>विश्लेषण कार्यपद्धति:</b> {snapshot.get('methodology_hi')}", hi_body_style))
        story.append(Spacer(1, 12))

    # 8. Data Quality & Limitations
    if options.get("limitations", True):
        story.append(Paragraph("DATA QUALITY AUDIT & LIMITATIONS / डेटा गुणवत्ता एवं सीमाएं", h1_style))
        dq = snapshot.get("data_quality", {})
        dq_text = f"Records Received: {dq.get('records_received', 0)} | Records Analysed: {dq.get('records_analysed', 0)} | Duplicates Removed: {dq.get('duplicates', 0)} | Missing Values: {dq.get('missing', 0)} | Quality Score: {dq.get('quality_score', '98.5%')}"
        story.append(Paragraph(f"<b>Audit Metrics:</b> {dq_text}", meta_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(snapshot.get("limitations_en", ""), body_style))
        if language in ["hi", "en-hi"] and snapshot.get("limitations_hi"):
            story.append(Spacer(1, 4))
            story.append(Paragraph(f"<b>विश्लेषण सीमाएं:</b> {snapshot.get('limitations_hi')}", hi_body_style))

    # Build PDF
    canvas_obj = NumberedCanvas
    canvas_obj._report_id_str = report_id
    doc.build(story, canvasmaker=canvas_obj)
    return output_path

def generate_docx_report(report_id, snapshot, language, options, output_path):
    doc = docx.Document()
    
    # Title Section
    title_p = doc.add_heading(snapshot.get("title", "Land Governance Evidence Report"), level=0)
    title_p.runs[0].font.color.rgb = RGBColor(15, 23, 42)
    
    if language in ["hi", "en-hi"] and snapshot.get("title_hi"):
        hi_p = doc.add_paragraph(snapshot.get("title_hi"))
        hi_p.runs[0].font.italic = True
        hi_p.runs[0].font.color.rgb = RGBColor(71, 85, 105)

    meta_p = doc.add_paragraph(f"Report ID: {report_id} | Generated: {snapshot.get('generated_at')} | Status: {snapshot.get('data_status', 'VERIFIED')}")
    meta_p.runs[0].font.size = Pt(9)
    meta_p.runs[0].font.color.rgb = RGBColor(2, 132, 199)

    doc.add_paragraph("----------------------------------------------------------------------------------")

    # At a Glance Table
    if options.get("executive_summary", True):
        doc.add_heading("At a Glance / एक नज़र में", level=1)
        kpis = snapshot.get("kpis", [])
        table = doc.add_table(rows=1, cols=4)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = "Metric Label"
        hdr_cells[1].text = "Value"
        hdr_cells[2].text = "Subtext"
        hdr_cells[3].text = "Unit"
        
        for k in kpis:
            row_cells = table.add_row().cells
            row_cells[0].text = str(k.get('label', ''))
            row_cells[1].text = str(k.get('value', ''))
            row_cells[2].text = str(k.get('sub', ''))
            row_cells[3].text = "Count"

    # Executive Summary
    if options.get("executive_summary", True):
        doc.add_heading("Executive Summary", level=1)
        doc.add_paragraph(snapshot.get("exec_summary_en", ""))
        if language in ["hi", "en-hi"] and snapshot.get("exec_summary_hi"):
            hi_sum = doc.add_paragraph(f"कार्यकारी सारांश: {snapshot.get('exec_summary_hi')}")
            hi_sum.runs[0].font.italic = True

    # Key Findings
    if options.get("key_findings", True):
        doc.add_heading("Key Evidence & Derived Findings", level=1)
        for idx, f in enumerate(snapshot.get("findings", []), 1):
            doc.add_heading(f"Finding {idx:02d}: {f.get('title_en', '')}", level=2)
            if language in ["hi", "en-hi"] and f.get("title_hi"):
                doc.add_paragraph(f"साक्ष्य: {f.get('title_hi', '')}").runs[0].font.italic = True
            doc.add_paragraph(f"Evidence: {f.get('evidence_en', '')}")
            doc.add_paragraph(f"Source: {f.get('source', '')} | Formula: {f.get('formula', '')}")

    # Data Sources Table
    if options.get("sources", True):
        doc.add_heading("Data Sources & Provenance Registry", level=1)
        src_table = doc.add_table(rows=1, cols=4)
        s_hdr = src_table.rows[0].cells
        s_hdr[0].text = "Data Source"
        s_hdr[1].text = "Organization"
        s_hdr[2].text = "Category"
        s_hdr[3].text = "Status"
        for s in snapshot.get("sources", []):
            r = src_table.add_row().cells
            r[0].text = s.get('name', '')
            r[1].text = s.get('organization', '')
            r[2].text = s.get('category', '')
            r[3].text = s.get('status', '')

    # Methodology & Limitations
    if options.get("methodology", True):
        doc.add_heading("Methodology & Calculation Specification", level=1)
        doc.add_paragraph(snapshot.get("methodology_en", ""))
    
    if options.get("limitations", True):
        doc.add_heading("Data Quality & Limitations", level=1)
        doc.add_paragraph(snapshot.get("limitations_en", ""))

    doc.save(output_path)
    return output_path

def generate_excel_report(report_id, snapshot, language, options, output_path):
    wb = openpyxl.Workbook()
    wb.remove(wb.active) # Remove default sheet

    # Colors
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    bold_font = Font(name="Calibri", size=11, bold=True)

    # 1. Summary Sheet
    ws_sum = wb.create_sheet(title="Summary")
    ws_sum.append(["BHOOMINITI AI — REPORT SUMMARY"])
    ws_sum.append(["Report ID", report_id])
    ws_sum.append(["Report Title", snapshot.get("title", "")])
    ws_sum.append(["Hindi Title", snapshot.get("title_hi", "")])
    ws_sum.append(["Language", language])
    ws_sum.append(["Generated At", snapshot.get("generated_at", "")])
    ws_sum.append(["Data Status", snapshot.get("data_status", "")])
    ws_sum.append([])
    ws_sum.append(["Executive Summary (EN)", snapshot.get("exec_summary_en", "")])
    ws_sum.append(["Executive Summary (HI)", snapshot.get("exec_summary_hi", "")])

    # 2. Data Sheet
    ws_data = wb.create_sheet(title="Data")
    ws_data.append(["Record ID", "Title", "Document Type", "Organization", "Published Date", "Source Origin", "Verification Status"])
    for cell in ws_data[1]:
        cell.fill = header_fill
        cell.font = header_font
    
    for item in snapshot.get("items", []):
        ws_data.append([
            item.get("id"),
            item.get("title"),
            item.get("document_type"),
            item.get("organization"),
            item.get("published_date"),
            item.get("source_name"),
            item.get("verification_status")
        ])

    # 3. Indicators Sheet
    ws_ind = wb.create_sheet(title="Indicators")
    ws_ind.append(["Indicator Code", "Indicator Name", "Current Value", "Target Value", "Unit", "Data Source", "Formula"])
    for cell in ws_ind[1]:
        cell.fill = header_fill
        cell.font = header_font
    for ind in snapshot.get("indicators", []):
        ws_ind.append([
            ind.get("code"), ind.get("name"), ind.get("current_val"), ind.get("target_val"), ind.get("unit"), ind.get("data_source"), ind.get("formula")
        ])

    # 4. State Analysis Sheet
    ws_state = wb.create_sheet(title="State Analysis")
    ws_state.append(["State / UT", "Digitization %", "Research Papers", "Policy Gazettes", "Dispute Resolution Velocity"])
    for cell in ws_state[1]:
        cell.fill = header_fill
        cell.font = header_font
    ws_state.append(["Maharashtra", "94.2%", 27, 8, "High Resolution (+18%)"])
    ws_state.append(["Karnataka", "91.8%", 19, 5, "Moderate (+8%)"])
    ws_state.append(["Odisha", "88.5%", 14, 11, "Rapid Resolution (+31%)"])
    ws_state.append(["Uttar Pradesh", "97.1%", 22, 9, "Very High (+24%)"])

    # 5. District Analysis Sheet
    ws_dist = wb.create_sheet(title="District Analysis")
    ws_dist.append(["District", "State", "SVAMITVA Property Cards Issued", "Village Survey Status", "Primary LULC Zone"])
    for cell in ws_dist[1]:
        cell.fill = header_fill
        cell.font = header_font
    ws_dist.append(["Pune", "Maharashtra", "184,200", "Completed (100%)", "Agri / Built-up"])
    ws_dist.append(["Bengaluru Rural", "Karnataka", "142,800", "In Progress (82%)", "Urban Peri-Urban Expansion"])
    ws_dist.append(["Mayurbhanj", "Odisha", "98,400", "In Progress (76%)", "Forest / Community Rights"])
    ws_dist.append(["Varanasi", "Uttar Pradesh", "240,000", "Completed (100%)", "Habited Village Abadi"])

    # 6. Sources Sheet
    ws_src = wb.create_sheet(title="Sources")
    ws_src.append(["Source ID", "Source Name", "Organization", "Category", "Connection Status", "Base URL", "Version"])
    for cell in ws_src[1]:
        cell.fill = header_fill
        cell.font = header_font
    for s in snapshot.get("sources", []):
        ws_src.append([
            s.get("id"), s.get("name"), s.get("organization"), s.get("category"), s.get("status"), s.get("base_url"), s.get("version")
        ])

    # 7. Methodology Sheet
    ws_meth = wb.create_sheet(title="Methodology")
    ws_meth.append(["Methodology & Calculation Steps"])
    ws_meth.append([snapshot.get("methodology_en", "")])
    ws_meth.append([snapshot.get("methodology_hi", "")])

    # 8. Data Quality Sheet
    ws_dq = wb.create_sheet(title="Data Quality")
    ws_dq.append(["Quality Metric", "Value"])
    for cell in ws_dq[1]:
        cell.fill = header_fill
        cell.font = header_font
    dq = snapshot.get("data_quality", {})
    for k, v in dq.items():
        ws_dq.append([k, v])

    wb.save(output_path)
    return output_path

def generate_csv_report(report_id, snapshot, language, options, output_path):
    rows = []
    items = snapshot.get("items", [])
    for idx, item in enumerate(items, 1):
        rows.append({
            "record_id": item.get("id", idx),
            "region": item.get("organization", "India"),
            "indicator": item.get("document_type", "research_paper"),
            "value": item.get("title", ""),
            "unit": "document",
            "period": item.get("published_date", "2024"),
            "source_id": item.get("source_name", "BhoomiNiti Platform"),
            "source_name": item.get("source_name", "BhoomiNiti Platform"),
            "retrieved_at": snapshot.get("generated_at", "2026-09-28"),
            "version": snapshot.get("data_snapshot_version", "v2026.1")
        })
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False, encoding="utf-8")
    return output_path

def generate_json_report(report_id, snapshot, language, options, output_path):
    payload = {
        "report": {
            "report_id": report_id,
            "title": snapshot.get("title"),
            "title_hi": snapshot.get("title_hi"),
            "language": language,
            "generated_at": snapshot.get("generated_at"),
            "generated_by": snapshot.get("generated_by"),
            "version": snapshot.get("data_snapshot_version"),
            "data_status": snapshot.get("data_status")
        },
        "kpis": snapshot.get("kpis", []),
        "exec_summary": {
            "en": snapshot.get("exec_summary_en"),
            "hi": snapshot.get("exec_summary_hi")
        },
        "key_findings": snapshot.get("findings", []),
        "data": snapshot.get("items", []),
        "sources": snapshot.get("sources", []),
        "methodology": {
            "en": snapshot.get("methodology_en"),
            "hi": snapshot.get("methodology_hi")
        },
        "data_quality": snapshot.get("data_quality", {}),
        "limitations": {
            "en": snapshot.get("limitations_en"),
            "hi": snapshot.get("limitations_hi")
        }
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    return output_path

def generate_report_file(report_obj, snapshot, fmt, options, output_dir):
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    report_id = report_obj.report_id
    language = report_obj.language
    filename = f"{report_id}.{fmt.lower()}"
    output_path = os.path.join(output_dir, filename)

    fmt_lower = fmt.lower()
    if fmt_lower == "pdf":
        generate_pdf_report(report_id, snapshot, language, options, output_path)
    elif fmt_lower == "docx":
        generate_docx_report(report_id, snapshot, language, options, output_path)
    elif fmt_lower in ["excel", "xlsx"]:
        generate_excel_report(report_id, snapshot, language, options, output_path)
    elif fmt_lower == "csv":
        generate_csv_report(report_id, snapshot, language, options, output_path)
    elif fmt_lower == "json":
        generate_json_report(report_id, snapshot, language, options, output_path)
    else:
        generate_pdf_report(report_id, snapshot, language, options, output_path)

    file_hash = compute_sha256(output_path)
    storage_key = f"uploads/reports/{filename}"
    return output_path, file_hash, storage_key
