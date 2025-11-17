// Utility to transform API scan results into AuditResult format

import type { MultiScanResult, ScanResponse } from '../types/audit'
import type { AuditResult, Finding, ActionItem } from '@/context/PaymentContext'
import { analyzeWithLLM } from '../services/llmService'

/**
 * Transform API scan results into AuditResult format for display
 * Uses LLM for intelligent analysis if available, otherwise falls back to rule-based
 */
export async function transformScanResultsToAuditResult(
  url: string,
  scanResults: MultiScanResult | null,
  scanResponses: Record<string, ScanResponse>,
  options?: {
    focusArea?: string
    notes?: string
    useLLM?: boolean
  }
): Promise<AuditResult> {
  const findings: Finding[] = []
  const recommendations: string[] = []
  const actionItems: ActionItem[] = []

  if (!scanResults) {
    // If no results, create a basic result structure
    return {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      type: 'Website Blackbox Audit',
      summary: 'Audit selesai. Hasil scan sedang diproses.',
      findings: [],
      recommendations: [],
      actionItems: [],
    }
  }

  // Try LLM analysis first if enabled
  if (options?.useLLM !== false) {
    try {
      const llmAnalysis = await analyzeWithLLM({
        scanResults,
        url,
        focusArea: options?.focusArea,
        notes: options?.notes,
      })

      if (llmAnalysis) {
        // Use LLM analysis results
        return {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          type: 'Website Blackbox Audit (AI-Powered)',
          summary: llmAnalysis.summary,
          findings: llmAnalysis.findings.map((f, idx) => ({
            id: `llm-finding-${idx}`,
            ...f,
          })),
          recommendations: llmAnalysis.recommendations,
          actionItems: llmAnalysis.actionItems.map((a, idx) => ({
            id: `llm-action-${idx}`,
            ...a,
          })),
        }
      }
    } catch (error) {
      console.warn('LLM analysis failed, falling back to rule-based:', error)
      // Continue with rule-based analysis
    }
  }

  // Fallback to rule-based analysis

  // Process SSL Results
  if (scanResults.ssl) {
    if (!scanResults.ssl.valid || scanResults.ssl.grade === 'F' || scanResults.ssl.grade === 'D') {
      findings.push({
        id: 'ssl-1',
        title: 'Masalah Sertifikat SSL',
        severity: 'High',
        description: `Sertifikat SSL memiliki masalah. Grade: ${scanResults.ssl.grade || 'Unknown'}`,
        impact: 'Website tidak aman dan dapat menurunkan kepercayaan pengguna.',
      })
      recommendations.push('Perbaiki konfigurasi SSL dan pastikan sertifikat valid')
      actionItems.push({
        id: 'ssl-action-1',
        task: 'Perbaiki konfigurasi SSL dan perbarui sertifikat',
        priority: 'High',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
  }

  // Process Headers Results
  if (scanResults.headers) {
    const missingHeaders: string[] = []
    const recommendedHeaders = [
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
    ]

    recommendedHeaders.forEach((header) => {
      if (!scanResults.headers?.headers?.[header]) {
        missingHeaders.push(header)
      }
    })

    if (missingHeaders.length > 0) {
      findings.push({
        id: 'headers-1',
        title: 'Security Headers Tidak Lengkap',
        severity: missingHeaders.length >= 3 ? 'High' : 'Medium',
        description: `Header keamanan berikut tidak ditemukan: ${missingHeaders.join(', ')}`,
        impact: 'Meningkatkan risiko serangan XSS, clickjacking, dan downgrade SSL.',
      })
      recommendations.push(`Tambahkan security headers: ${missingHeaders.join(', ')}`)
      actionItems.push({
        id: 'headers-action-1',
        task: `Konfigurasi security headers di server (${missingHeaders.length} headers)`,
        priority: missingHeaders.length >= 3 ? 'High' : 'Medium',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
  }

  // Process Web Scan Results (Nikto)
  if (scanResults.web?.vulnerabilities && scanResults.web.vulnerabilities.length > 0) {
    const highSeverityVulns = scanResults.web.vulnerabilities.filter(
      (v) => v.severity === 'High' || v.severity === 'high'
    )
    const mediumSeverityVulns = scanResults.web.vulnerabilities.filter(
      (v) => v.severity === 'Medium' || v.severity === 'medium'
    )

    if (highSeverityVulns.length > 0) {
      findings.push({
        id: 'web-1',
        title: `Ditemukan ${highSeverityVulns.length} Vulnerability Berisiko Tinggi`,
        severity: 'High',
        description: `Nikto scan menemukan ${highSeverityVulns.length} vulnerability berisiko tinggi pada website.`,
        impact: 'Website rentan terhadap serangan dan eksploitasi.',
      })
      recommendations.push('Segera perbaiki vulnerability yang ditemukan oleh Nikto scan')
      actionItems.push({
        id: 'web-action-1',
        task: 'Review dan perbaiki vulnerability yang ditemukan',
        priority: 'High',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }

    if (mediumSeverityVulns.length > 0) {
      findings.push({
        id: 'web-2',
        title: `Ditemukan ${mediumSeverityVulns.length} Vulnerability Berisiko Sedang`,
        severity: 'Medium',
        description: `Nikto scan menemukan ${mediumSeverityVulns.length} vulnerability berisiko sedang.`,
        impact: 'Dapat menjadi celah keamanan jika tidak ditangani.',
      })
    }
  }

  // Process XSS Results
  if (scanResults.xss?.vulnerable) {
    findings.push({
      id: 'xss-1',
      title: 'Vulnerability XSS Ditemukan',
      severity: 'High',
      description: 'Website rentan terhadap serangan Cross-Site Scripting (XSS).',
      impact: 'Penyerang dapat mengeksekusi script berbahaya di browser pengguna.',
    })
    recommendations.push('Implementasikan input validation dan output encoding untuk mencegah XSS')
    actionItems.push({
      id: 'xss-action-1',
      task: 'Perbaiki vulnerability XSS dengan input validation',
      priority: 'High',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }

  // Process SQL Injection Results
  if (scanResults.sql?.vulnerable) {
    findings.push({
      id: 'sql-1',
      title: 'Vulnerability SQL Injection Ditemukan',
      severity: 'High',
      description: 'Website rentan terhadap serangan SQL Injection.',
      impact: 'Penyerang dapat mengakses atau memanipulasi database.',
    })
    recommendations.push('Gunakan prepared statements dan parameterized queries')
    actionItems.push({
      id: 'sql-action-1',
      task: 'Perbaiki vulnerability SQL Injection dengan prepared statements',
      priority: 'High',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }

  // Process Port Scan Results
  if (scanResults.ports?.open_ports && scanResults.ports.open_ports.length > 0) {
    const riskyPorts = scanResults.ports.open_ports.filter((port) => {
      // Common risky ports: 21 (FTP), 23 (Telnet), 3306 (MySQL), 5432 (PostgreSQL), etc.
      const riskyPortList = [21, 23, 3306, 5432, 1433, 3389]
      return riskyPortList.includes(port)
    })

    if (riskyPorts.length > 0) {
      findings.push({
        id: 'ports-1',
        title: `Port Berisiko Terbuka: ${riskyPorts.join(', ')}`,
        severity: 'Medium',
        description: `Port ${riskyPorts.join(', ')} terbuka dan dapat menjadi celah keamanan.`,
        impact: 'Port terbuka dapat dieksploitasi jika tidak dikonfigurasi dengan benar.',
      })
      recommendations.push(`Tutup atau amankan port yang tidak diperlukan: ${riskyPorts.join(', ')}`)
    }
  }

  // Process Technology Detection
  if (scanResults.tech?.technologies && scanResults.tech.technologies.length > 0) {
    const techList = scanResults.tech.technologies
      .map((tech) => `${tech.name}${tech.version ? ` ${tech.version}` : ''}`)
      .join(', ')
    recommendations.push(`Pastikan semua teknologi terdeteksi (${techList}) selalu up-to-date`)
  }

  // Process Subdomain Results
  if (scanResults.subdomains?.subdomains && scanResults.subdomains.subdomains.length > 0) {
    recommendations.push(
      `Monitor dan audit ${scanResults.subdomains.subdomains.length} subdomain yang ditemukan`
    )
  }

  // Generate summary
  const totalFindings = findings.length
  const highFindings = findings.filter((f) => f.severity === 'High').length
  const summary = `Audit website selesai. Ditemukan ${totalFindings} temuan, dengan ${highFindings} temuan berisiko tinggi. ${
    highFindings > 0
      ? 'Segera perbaiki temuan berisiko tinggi untuk meningkatkan keamanan website.'
      : 'Website relatif aman, namun masih ada beberapa area yang dapat ditingkatkan.'
  }`

  return {
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    type: 'Website Blackbox Audit',
    summary,
    findings,
    recommendations,
    actionItems,
  }
}

