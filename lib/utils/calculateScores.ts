// Scoring system untuk security audit
// Berdasarkan berbagai kategori dengan weighted scoring

export interface Finding {
    severity: 'High' | 'Medium' | 'Low'
}

export interface CategoryScore {
    category: string
    score: number // 0-10
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    weight: number // percentage
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
}

export interface ScoringResult {
    overallScore: number // 0-100
    overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
    categoryScores: CategoryScore[]
    criticalIssuesCount: number
    highIssuesCount: number
    mediumIssuesCount: number
}

/**
 * Calculate score untuk Port Security
 */
function calculatePortScore(scanResults: any): CategoryScore {
    let score = 10
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    if (scanResults.ports) {
        const openPorts = scanResults.ports.open_ports || []

        // Deduct points for unnecessary open ports
        const unnecessaryPorts = openPorts.filter((p: any) =>
            !['80', '443'].includes(p.port?.toString())
        )

        if (unnecessaryPorts.length > 0) {
            score -= unnecessaryPorts.length * 0.5
            weaknesses.push(`${unnecessaryPorts.length} port tambahan terbuka: ${unnecessaryPorts.map((p: any) => p.port).join(', ')}`)
            recommendations.push(`Tutup port yang tidak diperlukan untuk mengurangi attack surface`)
        } else {
            strengths.push('Hanya port essential (80, 443) yang terbuka')
        }

        // Check for dangerous services
        const dangerousPorts = openPorts.filter((p: any) =>
            ['22', '3306', '5432', '27017', '6379', '3389'].includes(p.port?.toString())
        )

        if (dangerousPorts.length > 0) {
            score -= dangerousPorts.length * 2
            weaknesses.push(`Port berbahaya terbuka: ${dangerousPorts.map((p: any) => `${p.port} (${p.service})`).join(', ')}`)
            recommendations.push(`CRITICAL: Tutup port database dan management yang exposed`)
        } else {
            strengths.push('Tidak ada port database atau management yang exposed')
        }

        strengths.push('Surface attack minimal')
    }

    return {
        category: 'Port Security',
        score: Math.max(0, Math.min(10, score)),
        grade: getGrade(score),
        weight: 10,
        strengths,
        weaknesses,
        recommendations
    }
}

/**
 * Calculate score untuk SSL/TLS Configuration
 */
function calculateSSLScore(scanResults: any): CategoryScore {
    let score = 10
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    if (scanResults.ssl) {
        const ssl = scanResults.ssl

        // Certificate validity
        if (ssl.valid) {
            strengths.push('Sertifikat valid dan trusted')
        } else {
            score -= 5
            weaknesses.push('Sertifikat tidak valid atau expired')
            recommendations.push('Perbarui sertifikat SSL segera')
        }

        // Grade-based scoring
        const grade = ssl.grade?.toUpperCase()
        if (grade === 'A+' || grade === 'A') {
            score = Math.max(score, 9)
            strengths.push(`SSL Grade ${grade} - Excellent configuration`)
        } else if (grade === 'B') {
            score -= 2
            weaknesses.push(`SSL Grade B - Good but could be better`)
            recommendations.push('Upgrade ke Grade A dengan stronger ciphers')
        } else if (grade === 'C') {
            score -= 4
            weaknesses.push(`SSL Grade C - Needs improvement`)
            recommendations.push('Enable TLS 1.2/1.3, disable old protocols')
        } else if (grade === 'D' || grade === 'F') {
            score -= 7
            weaknesses.push(`SSL Grade ${grade} - Critical issues`)
            recommendations.push('URGENT: Fix SSL/TLS configuration immediately')
        }

        // Issues
        if (ssl.issues && ssl.issues.length > 0) {
            score -= ssl.issues.length * 0.5
            ssl.issues.slice(0, 3).forEach((issue: string) => {
                weaknesses.push(issue)
            })
        }
    } else {
        score = 0
        weaknesses.push('SSL/TLS scan tidak tersedia')
    }

    return {
        category: 'SSL/TLS Configuration',
        score: Math.max(0, Math.min(10, score)),
        grade: getGrade(score),
        weight: 20,
        strengths,
        weaknesses,
        recommendations
    }
}

/**
 * Calculate score untuk Security Headers
 */
function calculateHeadersScore(scanResults: any): CategoryScore {
    let score = 10
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    if (scanResults.headers) {
        const headers = scanResults.headers
        const requiredHeaders = [
            'Strict-Transport-Security',
            'Content-Security-Policy',
            'X-Frame-Options',
            'X-Content-Type-Options',
            'Referrer-Policy'
        ]

        const missingHeaders = requiredHeaders.filter(h =>
            !headers.headers || !headers.headers[h] || headers.headers[h].present === false
        )

        if (missingHeaders.length === 0) {
            score = 10
            strengths.push('Semua security headers essential dikonfigurasi')
        } else {
            score = 10 - (missingHeaders.length * 2)
            weaknesses.push(`${missingHeaders.length} security headers missing: ${missingHeaders.join(', ')}`)
            recommendations.push(`Implementasikan ${missingHeaders.length} security headers yang missing`)
        }

        // Additional headers
        if (headers.score === 0) {
            weaknesses.push('Tidak ada security headers sama sekali - CRITICAL')
            recommendations.push('Implementasikan minimal HSTS, CSP, dan X-Frame-Options')
        }
    } else {
        score = 0
        weaknesses.push('Security headers scan tidak tersedia')
    }

    return {
        category: 'Security Headers',
        score: Math.max(0, Math.min(10, score)),
        grade: getGrade(score),
        weight: 30,
        strengths,
        weaknesses,
        recommendations
    }
}

/**
 * Calculate score untuk Web Vulnerabilities
 */
function calculateWebVulnScore(scanResults: any): CategoryScore {
    let score = 10
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    if (scanResults.web) {
        const vulnCount = scanResults.web.vulnerability_count || 0

        if (vulnCount === 0) {
            score = 10
            strengths.push('Tidak ada kerentanan web yang terdeteksi oleh Nikto')
            strengths.push('Website bersih dari kerentanan umum')
        } else {
            score = Math.max(0, 10 - vulnCount)
            weaknesses.push(`${vulnCount} vulnerabilities detected`)

            if (scanResults.web.vulnerabilities) {
                scanResults.web.vulnerabilities.slice(0, 3).forEach((vuln: any) => {
                    weaknesses.push(vuln.description || vuln)
                })
            }

            recommendations.push(`Fix ${vulnCount} web vulnerabilities yang terdeteksi`)
        }

        if (scanResults.web.scan_depth === 'standard') {
            recommendations.push('Consider deep scan untuk comprehensive analysis')
        }
    } else {
        score = 5 // Neutral if no scan
    }

    return {
        category: 'Web Vulnerabilities',
        score: Math.max(0, Math.min(10, score)),
        grade: getGrade(score),
        weight: 15,
        strengths,
        weaknesses,
        recommendations
    }
}

/**
 * Calculate overall scores
 */
export function calculateAuditScores(scanResults: any, findings: Finding[]): ScoringResult {
    const categoryScores: CategoryScore[] = [
        calculatePortScore(scanResults),
        calculateSSLScore(scanResults),
        calculateHeadersScore(scanResults),
        calculateWebVulnScore(scanResults),
    ]

    // Calculate overall weighted score
    let overallScore = 0
    categoryScores.forEach(cat => {
        overallScore += (cat.score * cat.weight) / 100
    })
    overallScore = Math.round(overallScore * 10) // Convert to 0-100

    // Count issues by severity
    const criticalIssues = findings.filter(f => f.severity === 'High').length
    const highIssues = findings.filter(f => f.severity === 'Medium').length
    const mediumIssues = findings.filter(f => f.severity === 'Low').length

    // Determine risk level
    let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
    if (overallScore >= 80) riskLevel = 'Low'
    else if (overallScore >= 60) riskLevel = 'Moderate'
    else if (overallScore >= 40) riskLevel = 'High'
    else riskLevel = 'Critical'

    // Adjust risk level based on critical findings
    if (criticalIssues >= 5) riskLevel = 'Critical'
    else if (criticalIssues >= 3) riskLevel = 'High'

    return {
        overallScore,
        overallGrade: getGrade(overallScore / 10),
        riskLevel,
        categoryScores,
        criticalIssuesCount: criticalIssues,
        highIssuesCount: highIssues,
        mediumIssuesCount: mediumIssues
    }
}

/**
 * Convert score to letter grade
 */
function getGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 9.5) return 'A+'
    if (score >= 8.5) return 'A'
    if (score >= 7) return 'B'
    if (score >= 5) return 'C'
    if (score >= 3) return 'D'
    return 'F'
}
