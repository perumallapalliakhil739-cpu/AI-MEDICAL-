import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdfSummary = (reportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const primaryTeal = [13, 148, 136]; // #0d9488
  const darkSlate = [15, 23, 42]; // #0f172a
  const mutedGray = [100, 116, 139]; // #64748b
  const warningRed = [225, 29, 72]; // #e11d48
  const lightTeal = [240, 253, 250]; // #f0fdfa

  const reportType = reportData.report_type || reportData.fileName || 'Clinical Laboratory Report';
  const reportDate = reportData.report_date || new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const labName = reportData.lab_name || 'Not specified';
  const analysis = reportData.analysis || {};
  const urgentAlert = analysis.urgent_alert;
  const mainFindings = analysis.main_findings || [];
  const precautions = analysis.precautions || [];
  const medicines = analysis.medicines || [];
  const seeDoctorIf = analysis.see_a_doctor_if || [];
  const tests = reportData.tests || [];

  // Filter abnormal tests
  const abnormalTests = tests.filter(t => {
    const s = String(t.status || '').toLowerCase().trim();
    return s === 'high' || s === 'low';
  });

  let cursorY = 22;

  // Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...darkSlate);
  doc.text('Clinical Summary & Guideline Review', margin, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedGray);
  doc.text('Indian Council of Medical Research (ICMR) Standard Treatment Workflow Analysis', margin, cursorY);
  cursorY += 8;

  // Metadata Card
  doc.setFillColor(...lightTeal);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 18, 2, 2, 'F');
  doc.setDrawColor(...primaryTeal);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 18, 2, 2, 'D');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkSlate);
  doc.text('Report Type:', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(String(reportType), margin + 26, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Report Date:', margin + 110, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(String(reportDate), margin + 132, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Laboratory:', margin + 4, cursorY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(String(labName), margin + 24, cursorY + 13);

  cursorY += 24;

  // Urgent Alert if present
  if (urgentAlert) {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 16, 2, 2, 'F');
    doc.setDrawColor(...warningRed);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 16, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...warningRed);
    doc.text('CRITICAL NOTICE: Urgent Medical Attention Recommended', margin + 4, cursorY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(159, 18, 57);
    const alertLines = doc.splitTextToSize(String(urgentAlert), pageWidth - margin * 2 - 8);
    doc.text(alertLines, margin + 4, cursorY + 11);

    cursorY += 22;
  }

  // Section 1: Abnormal Values Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkSlate);
  doc.text('1. Out-of-Range & Abnormal Biomarkers', margin, cursorY);
  cursorY += 4;

  const tableData = (abnormalTests.length > 0 ? abnormalTests : tests).map(t => [
    t.name || 'Unnamed Parameter',
    t.value !== null && t.value !== undefined ? String(t.value) : 'N/A',
    t.unit || '-',
    t.reference_range || 'Not specified',
    String(t.status || 'unknown').toUpperCase(),
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['Test Parameter', 'Result Value', 'Unit', 'Reference Interval', 'Status']],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: primaryTeal,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkSlate,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 45, halign: 'center' },
      4: { cellWidth: 27, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw).toUpperCase();
        if (text === 'HIGH') {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fillColor = [255, 241, 242];
        } else if (text === 'LOW') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fillColor = [254, 243, 199];
        } else if (text === 'NORMAL') {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    },
  });

  cursorY = doc.lastAutoTable.finalY + 10;

  // Helper function to check page overflow
  const checkNewPage = (neededSpace = 30) => {
    if (cursorY + neededSpace > pageHeight - 20) {
      doc.addPage();
      cursorY = 22;
    }
  };

  // Section 2: Main Clinical Findings (ICMR STWs)
  checkNewPage(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkSlate);
  doc.text('2. Main Findings & Relevant Guidelines', margin, cursorY);
  cursorY += 6;

  if (mainFindings.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedGray);
    doc.text('All test values analyzed are within standard physiological reference ranges.', margin, cursorY);
    cursorY += 8;
  } else {
    mainFindings.forEach((f) => {
      checkNewPage(35);
      const conditionName = f.possible_condition || 'Clinical Observation';
      const sourceStw = f.source?.stw_id ? `Source: ICMR STW - ${f.source.stw_id}` : 'Source: ICMR Clinical Guideline';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...darkSlate);
      doc.text(`* ${conditionName}`, margin + 2, cursorY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...primaryTeal);
      doc.text(`[${sourceStw}]`, margin + 8 + doc.getTextWidth(`* ${conditionName} `), cursorY);
      cursorY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const summaryLines = doc.splitTextToSize(f.summary || '', pageWidth - margin * 2 - 6);
      doc.text(summaryLines, margin + 4, cursorY);
      cursorY += summaryLines.length * 4.5 + 4;
    });
  }

  // Section 3: Lifestyle & Clinical Precautions
  checkNewPage(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkSlate);
  doc.text('3. Lifestyle & Dietary Precautions (ICMR STW Guidelines)', margin, cursorY);
  cursorY += 6;

  precautions.slice(0, 5).forEach((p) => {
    checkNewPage(16);
    const text = typeof p === 'string' ? p : p.text || '';
    const stwId = p.source_stw_id ? ` (Source: ICMR ${p.source_stw_id})` : '';

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const pLines = doc.splitTextToSize(`- ${text}${stwId}`, pageWidth - margin * 2 - 4);
    doc.text(pLines, margin + 2, cursorY);
    cursorY += pLines.length * 4.2 + 2;
  });

  // Section 4: Medicines (Discuss with your doctor - NO DOSES)
  if (medicines.length > 0) {
    checkNewPage(35);
    cursorY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...darkSlate);
    doc.text('4. First-Line Medicines Mentioned in STW (For Doctor Discussion Only)', margin, cursorY);
    cursorY += 6;

    medicines.slice(0, 4).forEach((m) => {
      checkNewPage(18);
      const medName = m.name || 'Therapeutic Agent';
      const purpose = m.purpose ? ` - ${m.purpose}` : '';
      const notes = m.notes ? ` (${m.notes})` : '';
      const source = m.source_stw_id ? ` [ICMR STW: ${m.source_stw_id}]` : '';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...darkSlate);
      doc.text(`- ${medName}`, margin + 2, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const medLines = doc.splitTextToSize(`${purpose}${notes}${source}`, pageWidth - margin * 2 - 35);
      doc.text(medLines, margin + 30, cursorY);
      cursorY += Math.max(medLines.length * 4.2, 5) + 2;
    });
  }

  // Section 5: When to See a Doctor
  checkNewPage(30);
  cursorY += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...warningRed);
  doc.text('5. When to Seek Medical Attention', margin, cursorY);
  cursorY += 6;

  seeDoctorIf.forEach((item) => {
    checkNewPage(14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(159, 18, 57);
    const doctorLines = doc.splitTextToSize(`! ${item}`, pageWidth - margin * 2 - 4);
    doc.text(doctorLines, margin + 2, cursorY);
    cursorY += doctorLines.length * 4.2 + 2;
  });

  // Stamp Headers and Footers on Every Page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top Header Banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryTeal);
    doc.text('Generated by MedScan AI. Not a medical diagnosis.', margin, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedGray);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, 10);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Bottom Footer Medical Disclaimer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...warningRed);
    doc.text('IMPORTANT DISCLAIMER:', margin, pageHeight - 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedGray);
    doc.text(
      'This summary is generated for educational information only and does not constitute medical advice or diagnosis. Consult a qualified doctor.',
      margin + 36,
      pageHeight - 7.5
    );
  }

  const cleanFileName = (reportType || 'MedScan_Summary')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');

  doc.save(`${cleanFileName}_summary.pdf`);
};

