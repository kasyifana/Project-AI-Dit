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

  // Log scan results for debugging
  console.log('Processing scan results:', JSON.stringify(scanResults, null, 2))
  console.log('Web data:', scanResults.web)
  console.log('Web vulnerabilities:', scanResults.web?.vulnerabilities)
  console.log('Web vulnerabilities count:', scanResults.web?.vulnerabilities?.length || 0)
  console.log('Web vulnerabilities type:', Array.isArray(scanResults.web?.vulnerabilities) ? 'array' : typeof scanResults.web?.vulnerabilities)

  // Process SSL Results
  if (scanResults.ssl) {
    const grade = scanResults.ssl.grade || 'Unknown'
    const issues = scanResults.ssl.issues || []

    if (!scanResults.ssl.valid || grade === 'F' || grade === 'D' || grade === 'C') {
      let sslDescription = `SSL/TLS Certificate mendapat grade ${grade}.`

      // Add detailed certificate information
      if (scanResults.ssl.certificate) {
        const cert = scanResults.ssl.certificate
        sslDescription += `\n\n**Certificate Details:**`
        sslDescription += `\n- Subject: ${cert.subject}`
        sslDescription += `\n- Issuer: ${cert.issuer}`
        sslDescription += `\n- Valid From: ${cert.not_before}`
        sslDescription += `\n- Valid Until: ${cert.not_after}`
        sslDescription += `\n- Algorithm: ${cert.signature_algorithm}`
        sslDescription += `\n- Key Size: ${cert.key_size} bits`
        if (cert.san) {
          sslDescription += `\n- Subject Alternative Names: ${cert.san.join(', ')}`
        }
      }

      // Add issues found
      if (issues.length > 0) {
        sslDescription += `\n\n**Issues Detected:**`
        issues.forEach((issue: string, idx: number) => {
          sslDescription += `\n${idx + 1}. ${issue}`
        })
      }

      sslDescription += `\n\n**Security Impact:**\nSSL/TLS configuration yang lemah memungkinkan attacker melakukan man-in-the-middle attacks, decrypt encrypted traffic, intercept sensitive data seperti passwords dan credit card information. Grade ${grade} menunjukkan ada protocol/cipher yang outdated atau insecure yang masih di-support, atau key size yang insufficient.`

      sslDescription += `\n\n**Remediation Steps:**\n1. Disable semua protocol lama (SSLv2, SSLv3, TLS 1.0, TLS 1.1)\n2. Enable hanya TLS 1.2 dan TLS 1.3\n3. Gunakan strong cipher suites (ECDHE+AESGCM, ChaCha20-Poly1305)\n4. Upgrade ke certificate dengan key size minimum 2048 bits (recommended 4096 bits untuk RSA)\n5. Untuk ECC certificates, gunakan minimum 256-bit ECDSA keys\n6. Enable OCSP Stapling untuk faster certificate validation\n7. Test configuration di SSL Labs (ssllabs.com/ssltest/)`

      findings.push({
        id: 'ssl-1',
        title: `SSL/TLS Configuration Issue - Grade ${grade}`,
        severity: grade === 'F' || grade === 'D' ? 'High' : 'Medium',
        description: sslDescription,
        impact: `Website tidak menggunakan encryption yang optimal. Risiko: Man-in-the-middle attacks, traffic decryption, data interception. Grade ${grade} tidak memenuhi standar security modern dan dapat mengurangi trust indicator di browser (dapat muncul warning di beberapa browser).`,
      })

      recommendations.push('⚠️ Upgrade SSL/TLS configuration untuk mencapai Grade A atau A+ di SSL Labs')
      recommendations.push('Implementasikan TLS 1.3 untuk performance dan security yang optimal')

      actionItems.push({
        id: 'ssl-action-1',
        task: `Perbaiki SSL/TLS configuration: disable old protocols, enable TLS 1.3, use strong ciphers, upgrade certificate key size`,
        priority: grade === 'F' || grade === 'D' ? 'High' : 'Medium',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
  }

  // Process Headers Results
  if (scanResults.headers) {
    const missingHeaders: string[] = []
    const headerDetails: Array<{ name: string, impact: string, severity: string, remediation: string }> = []
    const recommendedHeaders = [
      {
        name: 'Content-Security-Policy',
        impact: 'Tanpa CSP, website rentan terhadap XSS attacks, data injection, clickjacking, dan code execution. Attacker dapat inject malicious scripts yang akan dieksekusi di browser user, mencuri cookies, session tokens, atau melakukan phishing attacks. CSP memungkinkan Anda menentukan sumber yang diizinkan untuk content seperti scripts, styles, images, dll.',
        severity: 'High',
        remediation: 'Implementasikan Content-Security-Policy header dengan directive yang ketat. Contoh: "Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://trusted-cdn.com; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; font-src \'self\' https://fonts.gstatic.com; connect-src \'self\' https://api.yourdomain.com; frame-ancestors \'none\'; base-uri \'self\'; form-action \'self\';"'
      },
      {
        name: 'Strict-Transport-Security',
        impact: 'Tanpa HSTS, website rentan terhadap man-in-the-middle attacks, SSL stripping, dan protocol downgrade attacks. Attacker dapat memaksa browser menggunakan HTTP instead of HTTPS, mengintercept traffic, dan mencuri credentials atau sensitive data. HSTS memastikan browser SELALU menggunakan HTTPS untuk komunikasi dengan server.',
        severity: 'High',
        remediation: 'Set Strict-Transport-Security header dengan max-age yang cukup lama dan includeSubDomains. Contoh: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload". Pertimbangkan untuk mendaftar domain ke HSTS preload list di hstspreload.org untuk proteksi maksimal.'
      },
      {
        name: 'X-Frame-Options',
        impact: 'Tanpa X-Frame-Options, website dapat di-embed dalam iframe oleh attacker untuk melakukan clickjacking attacks. User bisa ditipu untuk mengklik elemen tersembunyi yang melakukan aksi tidak diinginkan seperti transfer uang, ubah password, atau grant permissions. Clickjacking sangat berbahaya untuk aplikasi yang memerlukan interaksi user sensitif.',
        severity: 'Medium',
        remediation: 'Set X-Frame-Options header untuk mencegah framing. Gunakan "X-Frame-Options: DENY" untuk melarang semua framing, atau "X-Frame-Options: SAMEORIGIN" jika perlu embed dari same origin. Alternatif modern: gunakan CSP frame-ancestors directive.'
      },
      {
        name: 'X-Content-Type-Options',
        impact: 'Tanpa nosniff, browser dapat melakukan MIME type sniffing yang memungkinkan attacker mengeksekusi malicious content dengan mengeksploitasi browser interpretation. File yang di-upload sebagai image bisa diinterpretasikan sebagai HTML/JavaScript dan dieksekusi. Ini membuka celah untuk XSS dan code injection attacks.',
        severity: 'Medium',
        remediation: 'Set header "X-Content-Type-Options: nosniff" untuk memaksa browser respect declared Content-Type dan tidak melakukan MIME sniffing. Ini critical terutama untuk aplikasi yang allow user uploads.'
      },
      {
        name: 'Referrer-Policy',
        impact: 'Tanpa Referrer-Policy yang proper, sensitive information di URL (seperti session tokens, user IDs, atau search queries) dapat bocor ke third-party sites melalui Referer header. Ini adalah information disclosure vulnerability yang dapat dieksploitasi untuk tracking, profiling, atau bahkan session hijacking jika tokens ter-expose.',
        severity: 'Medium',
        remediation: 'Implementasikan Referrer-Policy yang ketat. Recommended: "Referrer-Policy: strict-origin-when-cross-origin" untuk balance antara functionality dan security, atau "no-referrer" untuk maximum privacy tetapi dapat break beberapa third-party integrations.'
      },
    ]

    recommendedHeaders.forEach((header) => {
      if (!scanResults.headers?.headers?.[header.name]) {
        missingHeaders.push(header.name)
        headerDetails.push(header)
      }
    })

    if (missingHeaders.length > 0) {
      // Create individual detailed findings for each missing header
      headerDetails.forEach((header, idx) => {
        findings.push({
          id: `headers-${idx + 1}`,
          title: `Missing Critical Security Header: ${header.name}`,
          severity: header.severity as 'High' | 'Medium' | 'Low',
          description: `Header "${header.name}" tidak ditemukan di response server. ${header.impact}\n\n**Remediation:** ${header.remediation}\n\n**OWASP Reference:** Security headers adalah bagian dari OWASP Top 10 - A05:2021 Security Misconfiguration. Missing security headers merupakan misconfiguration yang sangat umum dan easily exploitable.`,
          impact: header.impact,
        })
      })

      // Add summary recommendation
      recommendations.push(`⚠️ CRITICAL: Implementasikan ${missingHeaders.length} security headers yang missing untuk proteksi komprehensif terhadap common web attacks (XSS, Clickjacking, MITM, Information Disclosure)`)

      actionItems.push({
        id: 'headers-action-comprehensive',
        task: `Konfigurasi ${missingHeaders.length} security headers di web server atau application level (nginx.conf, next.config.js, Express middleware, dll)`,
        priority: missingHeaders.some(h => h.includes('Content-Security-Policy') || h.includes('Strict-Transport-Security')) ? 'High' : 'Medium',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
  }

  // Process Web Scan Results (Nikto)
  if (scanResults.web) {
    // Check for vulnerabilities or issues_count
    let vulnerabilities = scanResults.web.vulnerabilities || []

    // Log raw web data
    console.log('Raw web data structure:', scanResults.web)

    // Check if there's an issues_count field
    if (scanResults.web.issues_count && vulnerabilities.length === 0) {
      console.log(`Found issues_count: ${scanResults.web.issues_count}, but no vulnerabilities array`)
      // Create placeholder vulnerabilities based on count
      for (let i = 0; i < scanResults.web.issues_count; i++) {
        vulnerabilities.push({
          title: `Web Vulnerability #${i + 1}`,
          severity: 'Medium',
          description: 'Vulnerability ditemukan pada web scan (detail tidak tersedia)',
        })
      }
    }

    // Ensure vulnerabilities is an array
    if (!Array.isArray(vulnerabilities)) {
      console.log('Vulnerabilities is not an array, attempting to convert:', vulnerabilities)
      // Try to convert to array if it's an object
      if (typeof vulnerabilities === 'object') {
        vulnerabilities = Object.values(vulnerabilities)
      } else {
        vulnerabilities = []
      }
    }

    if (vulnerabilities.length > 0) {
      console.log(`Processing ${vulnerabilities.length} web vulnerabilities`)

      // Process each vulnerability individually with full details
      vulnerabilities.forEach((vuln, index) => {
        // Normalize severity - handle various formats
        let severity = vuln.severity || vuln.Severity || 'Medium'
        if (typeof severity === 'string') {
          severity = severity.trim()
          // Map common severity levels
          if (severity.toLowerCase().includes('high') || severity.toLowerCase().includes('critical')) {
            severity = 'High'
          } else if (severity.toLowerCase().includes('medium') || severity.toLowerCase().includes('moderate')) {
            severity = 'Medium'
          } else if (severity.toLowerCase().includes('low') || severity.toLowerCase().includes('info')) {
            severity = 'Low'
          } else {
            severity = 'Medium' // default
          }
        }

        const finding = {
          id: `web-${index + 1}`,
          title: vuln.title || vuln.Title || vuln.id || vuln.Id || `Web Vulnerability #${index + 1}`,
          severity: severity as 'High' | 'Medium' | 'Low',
          description: vuln.description || vuln.Description || vuln.message || vuln.Message || `Vulnerability ditemukan: ${vuln.title || vuln.id || 'Unknown'}`,
          impact: vuln.impact || vuln.Impact || (severity === 'High'
            ? 'Website rentan terhadap serangan dan eksploitasi.'
            : severity === 'Medium'
              ? 'Dapat menjadi celah keamanan jika tidak ditangani.'
              : 'Risiko rendah, namun sebaiknya tetap diperbaiki.'),
        }

        console.log(`Adding finding: ${finding.title} (${finding.severity})`)
        findings.push(finding)
      })

      // Add summary recommendations and action items
      const highSeverityVulns = vulnerabilities.filter((v: any) => {
        const sev = v.severity || v.Severity || ''
        return sev.toLowerCase().includes('high') || sev.toLowerCase().includes('critical')
      })
      const mediumSeverityVulns = vulnerabilities.filter((v: any) => {
        const sev = v.severity || v.Severity || ''
        return sev.toLowerCase().includes('medium') || sev.toLowerCase().includes('moderate')
      })

      if (highSeverityVulns.length > 0) {
        recommendations.push(`Segera perbaiki ${highSeverityVulns.length} vulnerability berisiko tinggi yang ditemukan`)
        actionItems.push({
          id: 'web-action-1',
          task: `Review dan perbaiki ${highSeverityVulns.length} vulnerability berisiko tinggi`,
          priority: 'High',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
      }

      if (mediumSeverityVulns.length > 0) {
        recommendations.push(`Tangani ${mediumSeverityVulns.length} vulnerability berisiko sedang`)
        actionItems.push({
          id: 'web-action-2',
          task: `Review dan perbaiki ${mediumSeverityVulns.length} vulnerability berisiko sedang`,
          priority: 'Medium',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
      }
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

  // Process CDN Bypass Results
  if (scanResults.cdn) {
    // Handle real_vulnerabilities array from CDN bypass scan
    if (scanResults.cdn.real_vulnerabilities && Array.isArray(scanResults.cdn.real_vulnerabilities)) {
      console.log(`Processing ${scanResults.cdn.real_vulnerabilities.length} CDN bypass vulnerabilities`)

      // Add CDN context finding first
      if (scanResults.cdn.cdn_detected) {
        const cdnInfo = `**CDN Detected:** ${scanResults.cdn.cdn_provider || 'Yes'}\n\n`
        const originIPs = scanResults.cdn.origin_ips ? `\n**Origin Server IPs:** ${scanResults.cdn.origin_ips.join(', ')}` : ''

        findings.push({
          id: 'cdn-context',
          title: `CDN Protection Active - ${scanResults.cdn.cdn_provider || 'CDN'} Detected`,
          severity: 'Low',
          description: `${cdnInfo}Website menggunakan CDN (Content Delivery Network) untuk protection dan performance. Namun, CDN tidak menggantikan security measures di origin server.${originIPs}\n\n**⚠️ PENTING:** Vulnerabilities berikut terdeteksi di ORIGIN SERVER dan tetap exploitable meskipun ada CDN protection. Jika attacker bypass CDN dan akses origin server langsung, semua vulnerabilities ini dapat dieksploitasi.\n\n**Attack Vector:** Attacker dapat discover origin IP melalui:\n- Historical DNS records (SecurityTrails, DNSdumpster)\n- Certificate transparency logs\n- Subdomain enumeration\n- Email headers dari server\n- Direct IP scanning\n\nSetelah origin IP ditemukan, attacker dapat bypass CDN dengan:\n1. Modify local hosts file\n2. Direct HTTP request ke IP\n3. DNS rebinding attacks`,
          impact: 'CDN protection dapat di-bypass. Origin server harus memiliki security measures sendiri.',
        })
      }

      scanResults.cdn.real_vulnerabilities.forEach((vuln: any, index: number) => {
        // Map severity from backend format (HIGH/MEDIUM/LOW) to frontend format
        let severity: 'High' | 'Medium' | 'Low' = 'Medium'
        if (vuln.severity === 'HIGH' || vuln.severity === 'CRITICAL') {
          severity = 'High'
        } else if (vuln.severity === 'MEDIUM' || vuln.severity === 'MODERATE') {
          severity = 'Medium'
        } else if (vuln.severity === 'LOW' || vuln.severity === 'INFO') {
          severity = 'Low'
        }

        const headerName = vuln.header || 'unknown'
        const headerNameFormatted = headerName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('-')

        let detailedDescription = `Security header "${headerNameFormatted}" tidak ditemukan di origin server.\n\n`
        detailedDescription += `**${vuln.description}**\n\n`
        detailedDescription += `**Detailed Impact:** ${vuln.impact}\n\n`

        // Add header-specific technical details
        const headerDetails: Record<string, string> = {
          'strict-transport-security': `**Technical Details:**\nHTTP Strict Transport Security (HSTS) adalah security mechanism yang memproteksi website dari protocol downgrade attacks dan cookie hijacking. Tanpa HSTS:\n- Browser dapat di-redirect ke HTTP version (SSL stripping)\n- Man-in-the-middle attacker dapat intercept initial HTTP request\n- User dapat click atau type insecure HTTP link secara manual\n\n**Configuration Example:**\n\`\`\`\nStrict-Transport-Security: max-age=31536000; includeSubDomains; preload\n\`\`\`\n\n**Best Practices:**\n- Set max-age minimal 1 year (31536000 seconds)\n- Include subdomains jika semua subdomain support HTTPS\n- Submit ke HSTS preload list untuk browser built-in protection`,

          'content-security-policy': `**Technical Details:**\nContent Security Policy (CSP) adalah powerful defense-in-depth mechanism untuk prevent XSS, data injection, dan clickjacking attacks. CSP bekerja dengan:\n- Whitelist sources untuk content (scripts, styles, images, fonts, etc)\n- Block inline scripts/styles by default\n- Disable dangerous features seperti eval()\n- Report violations untuk monitoring\n\n**Configuration Example:**\n\`\`\`\nContent-Security-Policy: default-src 'self'; \n  script-src 'self' https://trusted-cdn.com; \n  style-src 'self' 'unsafe-inline'; \n  img-src 'self' data: https:; \n  font-src 'self' https://fonts.gstatic.com; \n  connect-src 'self' https://api.yourdomain.com; \n  frame-ancestors 'none'; \n  base-uri 'self'; \n  form-action 'self'; \n  report-uri /csp-report\n\`\`\`\n\n**Phased Implementation:**\n1. Start dengan Content-Security-Policy-Report-Only mode\n2. Monitor violations via report-uri\n3. Adjust policy based on violations\n4. Switch to enforcement mode`,

          'x-frame-options': `**Technical Details:**\nX-Frame-Options protects against clickjacking attacks dimana attacker embed website dalam invisible iframe untuk trick users. Attack scenarios:\n- Overlay transparent iframe di atas legitimate site\n- User thinks mereka click button A, tapi actually click button B\n- Dapat digunakan untuk unauthorized transactions, privilege escalation, etc\n\n**Configuration Options:**\n- \`DENY\` - Prevent all framing (recommended untuk most cases)\n- \`SAMEORIGIN\` - Allow framing hanya dari same origin\n\n**Modern Alternative:**\nCSP frame-ancestors directive lebih flexible:\n\`\`\`\nContent-Security-Policy: frame-ancestors 'none'\n\`\`\``,

          'x-content-type-options': `**Technical Details:**\nX-Content-Type-Options: nosniff prevents MIME type sniffing yang dapat lead ke XSS attacks. Browser biasanya "sniff" content untuk determine type, tapi ini dangerous karena:\n- Uploaded file (claimed as image) bisa contain HTML/JavaScript\n- Browser sniff dan execute the malicious code\n- Bypass file upload restrictions\n\n**Attack Example:**\n1. Attacker upload file "image.jpg" yang contain \`<script>alert('XSS')</script>\`\n2. Without nosniff: browser detect HTML content dan execute script\n3. With nosniff: browser respect Content-Type header dan treat as image only\n\n**Configuration:**\n\`\`\`\nX-Content-Type-Options: nosniff\n\`\`\`\n\n**Critical untuk:**\n- File upload functionality\n- User-generated content\n- Dynamic content serving`,
        }

        if (headerDetails[headerName]) {
          detailedDescription += headerDetails[headerName]
        }

        detailedDescription += `\n\n**OWASP Reference:** Missing security headers masuk dalam OWASP Top 10 2021 - A05: Security Misconfiguration`
        detailedDescription += `\n\n**Compliance Impact:** Beberapa compliance standards (PCI DSS, HIPAA, SOC 2) require proper security headers implementation`

        findings.push({
          id: `cdn-vuln-${index + 1}`,
          title: `[ORIGIN SERVER] Missing ${headerNameFormatted} Header (${severity} Severity)`,
          severity: severity,
          description: detailedDescription,
          impact: `${vuln.impact}\n\n⚠️ CRITICAL: Vulnerability ini ada di ORIGIN SERVER. CDN tidak menambahkan header ini, sehingga jika CDN di-bypass, vulnerability langsung exploitable. Origin server HARUS memiliki security measures sendiri, tidak boleh fully depend on CDN.`,
        })
      })

      // Add recommendations based on vulnerability count
      const highVulns = scanResults.cdn.real_vulnerabilities.filter((v: any) => v.severity === 'HIGH')
      const mediumVulns = scanResults.cdn.real_vulnerabilities.filter((v: any) => v.severity === 'MEDIUM')

      if (highVulns.length > 0) {
        recommendations.push(`🚨 URGENT: ${highVulns.length} HIGH severity security headers missing di origin server - implementasi SEGERA diperlukan`)
        recommendations.push(`Configure security headers di application level (Next.js, Express, nginx, Apache) TIDAK cukup rely on CDN`)
        actionItems.push({
          id: 'cdn-headers-action-high',
          task: `【HIGH PRIORITY】Implementasi ${highVulns.length} critical security headers di origin server configuration (nginx/Apache/application middleware)`,
          priority: 'High',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
      }

      if (mediumVulns.length > 0) {
        recommendations.push(`Add ${mediumVulns.length} additional security headers untuk defense-in-depth protection`)
        actionItems.push({
          id: 'cdn-headers-action-medium',
          task: `Implementasi ${mediumVulns.length} MEDIUM severity security headers untuk comprehensive protection`,
          priority: 'Medium',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
      }

      if (scanResults.cdn.security_analysis?.recommendation) {
        // Add security recommendations from CDN analysis
        scanResults.cdn.security_analysis.recommendation.forEach((rec: string) => {
          if (!recommendations.includes(rec)) {
            recommendations.push(rec)
          }
        })
      }

      // Add comprehensive action item for CDN security
      actionItems.push({
        id: 'cdn-comprehensive-action',
        task: `Setup comprehensive origin server security: (1) Implement all missing headers, (2) Configure firewall to only accept CDN IPs, (3) Setup rate limiting, (4) Enable origin authentication`,
        priority: 'High',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })

    } else if (scanResults.cdn.bypassed || scanResults.cdn.real_ip) {
      // Fallback to old logic if real_vulnerabilities not available
      findings.push({
        id: 'cdn-1',
        title: 'CDN Bypass Terdeteksi',
        severity: 'Medium',
        description: scanResults.cdn.real_ip
          ? `Real IP server ditemukan: ${scanResults.cdn.real_ip}`
          : 'CDN dapat di-bypass untuk mengakses server langsung.',
        impact: 'Penyerang dapat menemukan IP server asli dan melakukan serangan langsung.',
      })
      recommendations.push('Pastikan server origin tidak dapat diakses langsung, hanya melalui CDN')
      actionItems.push({
        id: 'cdn-action-1',
        task: 'Konfigurasi firewall untuk hanya menerima traffic dari CDN',
        priority: 'Medium',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
  }

  // Generate summary
  const totalFindings = findings.length
  const highFindings = findings.filter((f) => f.severity === 'High').length
  const summary = `Audit website selesai. Ditemukan ${totalFindings} temuan, dengan ${highFindings} temuan berisiko tinggi. ${highFindings > 0
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

