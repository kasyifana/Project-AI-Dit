// Utility to parse markdown report from /scan/multi endpoint
// The API returns a markdown string with embedded Python dict strings

export interface ParsedScanData {
    ports?: any
    web?: any
    ssl?: any
    headers?: any
    tech?: any
}

/**
 * Parse the markdown multi-scan report into structured data
 * The report contains sections with Python dict strings that need to be parsed
 */
export function parseMultiScanMarkdownReport(markdownReport: string): ParsedScanData {
    const result: ParsedScanData = {}

    try {
        // Extract Port Scan section
        const portMatch = markdownReport.match(/## Port Scan\n\n([\s\S]+?)\n\n---/)
        if (portMatch) {
            result.ports = parsePythonDict(portMatch[1])
        }

        // Extract Web Vulnerabilities section
        const webMatch = markdownReport.match(/## Web Vulnerabilities\n\n([\s\S]+?)\n\n---/)
        if (webMatch) {
            const webData = parsePythonDict(webMatch[1])
            // Transform to expected format
            result.web = {
                vulnerabilities: webData.vulnerabilities || [],
                vulnerability_count: webData.vulnerability_count || 0,
                scan_depth: webData.scan_depth || 'standard'
            }
        }

        // Extract SSL Check section
        const sslMatch = markdownReport.match(/## SSL Check\n\n([\s\S]+?)\n\n---/)
        if (sslMatch) {
            const sslData = parsePythonDict(sslMatch[1])
            // Transform to frontend format
            result.ssl = {
                grade: sslData.grade || 'Unknown',
                valid: !sslData.certificate?.expired,
                issues: sslData.issues || [],
                certificate: sslData.certificate
            }
        }

        // Extract Security Headers section
        const headersMatch = markdownReport.match(/## Security Headers\n\n([\s\S]+?)(?:\n\n---|$)/)
        if (headersMatch) {
            const headersData = parsePythonDict(headersMatch[1])
            result.headers = {
                score: headersData.score || 0,
                headers: headersData.headers || {},
                issues: headersData.issues || [],
                missing: extractMissingHeaders(headersData)
            }
        }

        // Extract Technology Detection section (if present)
        const techMatch = markdownReport.match(/## Technology Detection\n\n([\s\S]+?)(?:\n\n---|$)/)
        if (techMatch) {
            result.tech = parsePythonDict(techMatch[1])
        }

        console.log('Parsed markdown report:', result)
        return result
    } catch (error) {
        console.error('Error parsing markdown report:', error)
        return result
    }
}

/**
 * Parse Python dict string to JavaScript object
 * Handles Python-style dicts with single quotes
 */
function parsePythonDict(pythonDictStr: string): any {
    try {
        // Replace Python booleans with JavaScript booleans
        let jsonStr = pythonDictStr
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false')
            .replace(/\bNone\b/g, 'null')
            .replace(/'/g, '"') // Replace single quotes with double quotes

        // Try to parse as JSON
        return JSON.parse(jsonStr)
    } catch (error) {
        // If direct parsing fails, try a more robust approach
        console.warn('Failed to parse Python dict, using eval fallback:', error)

        // Use a safer evaluation approach
        try {
            // Clean up the string
            let cleaned = pythonDictStr
                .replace(/\bTrue\b/g, 'true')
                .replace(/\bFalse\b/g, 'false')
                .replace(/\bNone\b/g, 'null')

            // Try parsing with relaxed JSON
            return JSON.parse(cleaned.replace(/'/g, '"'))
        } catch (e2) {
            console.error('Could not parse dict string:', pythonDictStr.substring(0, 200))
            return {}
        }
    }
}

/**
 * Extract missing headers from headers data
 */
function extractMissingHeaders(headersData: any): string[] {
    const missing: string[] = []

    if (headersData.issues && Array.isArray(headersData.issues)) {
        headersData.issues.forEach((issue: string) => {
            const match = issue.match(/Missing (.+)/)
            if (match) {
                missing.push(match[1])
            }
        })
    }

    return missing
}
