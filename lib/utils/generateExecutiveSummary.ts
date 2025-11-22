// Executive Summary Generator
// Creates comprehensive executive summary untuk audit report

import { ScoringResult } from './calculateScores'

export interface ExecutiveSummary {
    targetUrl: string
    auditDate: string
    auditor: string
    methodology: string[]
    overallScore: number
    scoreOutOf: number
    riskStatus: string
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
    keyFindings: string[]
    criticalIssues: number
    recommendations: string[]
    nextSteps: string[]
}

/**
 * Generate executive summary from scoring results and findings
 */
export function generateExecutiveSummary(
    targetUrl: string,
    scoringResult: ScoringResult,
    scanResults: any
): ExecutiveSummary {
    const auditDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    // Generate key findings based on scores
    const keyFindings: string[] = []

    // Add findings from category scores
    scoringResult.categoryScores.forEach(cat => {
        if (cat.score < 5) {
            keyFindings.push(`${cat.category}: Score rendah (${cat.score}/10) - ${cat.weaknesses[0] || 'Memerlukan perbaikan'}`)
        } else if (cat.score >= 9) {
            keyFindings.push(`${cat.category}: Excellent (${cat.score}/10)`)
        }
    })

    // Infrastructure analysis
    if (scanResults.cdn?.cdn_detected) {
        keyFindings.push(`Website menggunakan ${scanResults.cdn.cdn_provider || 'CDN'} untuk proteksi dan performance`)
    }

    // Technology stack
    if (scanResults.tech?.technologies) {
        const techs = scanResults.tech.technologies.map((t: any) => t.name || t).join(', ')
        keyFindings.push(`Technology Stack: ${techs}`)
    }

    // Vulnerability summary
    if (scoringResult.criticalIssuesCount > 0) {
        keyFindings.push(`⚠️ ${scoringResult.criticalIssuesCount} kelemahan kritis terdeteksi yang memerlukan perbaikan segera`)
    }

    // Generate top recommendations
    const recommendations: string[] = []
    scoringResult.categoryScores
        .filter(cat => cat.score < 7)
        .sort((a, b) => a.score - b.score) // Lowest score first
        .slice(0, 3)
        .forEach(cat => {
            if (cat.recommendations.length > 0) {
                recommendations.push(cat.recommendations[0])
            }
        })

    // Generate next steps
    const nextSteps: string[] = []

    if (scoringResult.riskLevel === 'Critical' || scoringResult.riskLevel === 'High') {
        nextSteps.push('🔴 URGENT: Implementasi perbaikan kritis dalam 24-48 jam')
        nextSteps.push('Fokus pada kelemahan dengan severity HIGH')
    }

    if (scoringResult.categoryScores.find(c => c.category === 'Security Headers' && c.score < 3)) {
        nextSteps.push('Implementasi security headers sebagai prioritas utama')
    }

    if (scoringResult.categoryScores.find(c => c.category === 'SSL/TLS Configuration' && c.score < 7)) {
        nextSteps.push('Perbaiki konfigurasi SSL/TLS untuk mencapai Grade A+')
    }

    nextSteps.push('Setup monitoring berkelanjutan untuk deteksi dini')
    nextSteps.push('Schedule audit ulang dalam 1 bulan')

    // Risk status description
    const riskStatus = getRiskStatusDescription(
        scoringResult.riskLevel,
        scoringResult.overallScore
    )

    return {
        targetUrl,
        auditDate,
        auditor: 'Gemini Security Analysis',
        methodology: [
            'OWASP Testing Framework',
            'NIST Cybersecurity Framework',
            'Multi-Tool Security Scanning'
        ],
        overallScore: scoringResult.overallScore,
        scoreOutOf: 100,
        riskStatus,
        riskLevel: scoringResult.riskLevel,
        keyFindings: keyFindings.slice(0, 5), // Top 5 findings
        criticalIssues: scoringResult.criticalIssuesCount,
        recommendations: recommendations.length > 0 ? recommendations : ['Maintain current security posture'],
        nextSteps
    }
}

/**
 * Get risk status description based on risk level and score
 */
function getRiskStatusDescription(riskLevel: string, score: number): string {
    switch (riskLevel) {
        case 'Critical':
            return 'CRITICAL RISK - Memerlukan Tindakan Segera'
        case 'High':
            return 'HIGH RISK - Perbaikan Urgent Diperlukan'
        case 'Moderate':
            return `MODERATE RISK - Memerlukan Perbaikan Segera (Score: ${score}/100)`
        case 'Low':
            return `LOW RISK - Security Posture Baik (Score: ${score}/100)`
        default:
            return 'Status Unknown'
    }
}

/**
 * Get risk level color for UI display
 */
export function getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel) {
        case 'Critical':
            return 'text-red-700 bg-red-100 border-red-300'
        case 'High':
            return 'text-orange-700 bg-orange-100 border-orange-300'
        case 'Moderate':
            return 'text-yellow-700 bg-yellow-100 border-yellow-300'
        case 'Low':
            return 'text-green-700 bg-green-100 border-green-300'
        default:
            return 'text-gray-700 bg-gray-100 border-gray-300'
    }
}

/**
 * Get score color for UI display
 */
export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
}
