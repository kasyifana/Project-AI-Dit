// PDF Generator for comprehensive security audit reports
// Generates professional PDF matching the example format

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PDFGeneratorOptions {
    targetUrl: string
    auditResult: any
    scoringResult: any
    executiveSummary: any
    scanResults: any
}

/**
 * Generate comprehensive PDF audit report
 */
export async function generateAuditPDF(options: PDFGeneratorOptions): Promise<void> {
    const { targetUrl, auditResult, scoringResult, executiveSummary, scanResults } = options

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    let yPos = 20

    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('🔒 LAPORAN AUDIT KEAMANAN KOMPREHENSIF', 105, yPos, { align: 'center' })

    yPos += 15
    doc.setFontSize(16)
    doc.text(targetUrl, 105, yPos, { align: 'center' })

    yPos += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tanggal Audit: ${executiveSummary.auditDate}`, 20, yPos)
    yPos += 5
    doc.text(`Auditor: ${executiveSummary.auditor}`, 20, yPos)
    yPos += 5
    doc.text(`Tingkat Audit: Critical Deep Inspection`, 20, yPos)
    yPos += 5
    doc.text(`Metodologi: ${executiveSummary.methodology.join(', ')}`, 20, yPos)

    // Executive Summary
    yPos += 15
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('📋 EXECUTIVE SUMMARY', 20, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const summaryText = `Website ${targetUrl} telah diaudit secara komprehensif menggunakan berbagai security tools. Hasil audit menunjukkan ${executiveSummary.keyFindings.length} temuan utama yang memerlukan perhatian.`
    const splitSummary = doc.splitTextToSize(summaryText, 170)
    doc.text(splitSummary, 20, yPos)
    yPos += splitSummary.length * 5 + 5

    doc.setFont('helvetica', 'bold  ')
    doc.text(`Overall Security Score: ${executiveSummary.overallScore}/100 ⚠️`, 20, yPos)
    yPos += 7
    doc.text(`Status: ${executiveSummary.riskStatus}`, 20, yPos)

    // Category Scores Table
    yPos += 15
    doc.setFontSize(14)
    doc.text('📊 SCORING BREAKDOWN', 20, yPos)
    yPos += 10

    const scoreTableData = scoringResult.categoryScores.map((cat: any) => [
        cat.category,
        `${cat.score}/10`,
        cat.grade,
        `${cat.weight}%`,
        `${Math.round(cat.score * cat.weight / 10)}/100`
    ])

    scoreTableData.push([
        'TOTAL',
        '',
        scoringResult.overallGrade,
        '100%',
        `${scoringResult.overallScore}/100`
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['Kategori', 'Skor', 'Bobot', 'Total']],
        body: scoreTableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Key Findings
    if (yPos > 250) {
        doc.addPage()
        yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('🎯 KEY FINDINGS', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    executiveSummary.keyFindings.forEach((finding: string, idx: number) => {
        if (yPos > 270) {
            doc.addPage()
            yPos = 20
        }
        const findingLines = doc.splitTextToSize(`${idx + 1}. ${finding}`, 170)
        doc.text(findingLines, 20, yPos)
        yPos += findingLines.length * 5 + 3
    })

    // Detailed Findings
    doc.addPage()
    yPos = 20

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('🔍 TEMUAN DETAIL', 20, yPos)
    yPos += 10

    auditResult.findings.forEach((finding: any, idx: number) => {
        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`${idx + 1}. ${finding.title}`, 20, yPos)
        yPos += 7

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')

        // Severity badge
        const severityColor = finding.severity === 'High' ? [231, 76, 60] :
            finding.severity === 'Medium' ? [230, 126, 34] : [46, 204, 113]
        doc.setFillColor(severityColor[0], severityColor[1], severityColor[2])
        doc.rect(160, yPos - 4, 30, 5, 'F')
        doc.setTextColor(255, 255, 255)
        doc.text(finding.severity, 175, yPos, { align: 'center' })
        doc.setTextColor(0, 0, 0)
        yPos += 7

        // Description
        const descLines = doc.splitTextToSize(finding.description.substring(0, 300), 170)
        doc.text(descLines, 20, yPos)
        yPos += Math.min(descLines.length, 10) * 4 + 5
    })

    // Action Plan
    doc.addPage()
    yPos = 20

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('🎯 ACTION PLAN (PRIORITIZED)', 20, yPos)
    yPos += 10

    const criticalActions = auditResult.actionItems.filter((a: any) => a.priority === 'High')
    const mediumActions = auditResult.actionItems.filter((a: any) => a.priority === 'Medium')

    if (criticalActions.length > 0) {
        doc.setFontSize(12)
        doc.setTextColor(220, 53, 69)
        doc.text('🔴 CRITICAL (24-48 jam)', 20, yPos)
        doc.setTextColor(0, 0, 0)
        yPos += 8

        doc.setFontSize(10)
        criticalActions.forEach((action: any, idx: number) => {
            if (yPos > 265) {
                doc.addPage()
                yPos = 20
            }
            const actionText = doc.splitTextToSize(`${idx + 1}. ${action.task}`, 170)
            doc.text(actionText, 25, yPos)
            yPos += actionText.length * 5 + 5
        })
    }

    yPos += 5
    if (mediumActions.length > 0) {
        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(12)
        doc.setTextColor(255, 193, 7)
        doc.text('🟡 HIGH PRIORITY (1 minggu)', 20, yPos)
        doc.setTextColor(0, 0, 0)
        yPos += 8

        doc.setFontSize(10)
        mediumActions.slice(0, 5).forEach((action: any, idx: number) => {
            if (yPos > 265) {
                doc.addPage()
                yPos = 20
            }
            const actionText = doc.splitTextToSize(`${idx + 1}. ${action.task}`, 170)
            doc.text(actionText, 25, yPos)
            yPos += actionText.length * 5 + 5
        })
    }

    // Footer on last page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' })
        doc.text('Generated by Gemini Security Audit System', 105, 292, { align: 'center' })
    }

    // Download
    doc.save(`security-audit-${targetUrl.replace(/https?:\/\//, '').replace(/\//g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
}
