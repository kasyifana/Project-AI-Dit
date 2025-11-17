// Next.js API Route sebagai proxy untuk menghindari CORS issues
// Route: /api/scan

import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://103.31.39.95:3000'
const TIMEOUT = 300000 // 5 minutes

/**
 * Extract scan data from error logs
 * MCP server sometimes completes scan but fails to send response properly
 */
function extractScanDataFromLogs(errorLog: string, target: string): any {
  const result: any = {}
  
  try {
    // Extract SSL grade
    const sslMatch = errorLog.match(/SSL analysis completed for (.+?): Grade ([A-F])/i)
    if (sslMatch) {
      result.ssl = {
        grade: sslMatch[2],
        valid: sslMatch[2] !== 'F',
        host: sslMatch[1] || target,
      }
    }

    // Extract port scan results
    const portMatch = errorLog.match(/Scan completed for (.+?): (\d+) open ports found/i)
    if (portMatch) {
      result.ports = {
        open_ports: parseInt(portMatch[2]) > 0 ? [80, 443] : [], // Approximate
        host: portMatch[1] || target,
      }
    }

    // Extract Nikto results
    const niktoMatch = errorLog.match(/Nikto scan completed: (\d+) issues found/i)
    if (niktoMatch) {
      const issueCount = parseInt(niktoMatch[1])
      result.web = {
        vulnerabilities: issueCount > 0 ? [{ severity: 'Medium', title: 'Web vulnerabilities found' }] : [],
        issues_count: issueCount,
      }
    }

    // Extract header analysis score
    const headerMatch = errorLog.match(/Header analysis completed for (.+?): Score (\d+)\/100/i)
    if (headerMatch) {
      const score = parseInt(headerMatch[2])
      result.headers = {
        score,
        headers: {},
        missing: score < 50 ? ['Content-Security-Policy', 'Strict-Transport-Security'] : [],
      }
    }

    // Extract technologies - handle both dict format and simple format
    const techMatch1 = errorLog.match(/Technologies found for (.+?): ({[^}]+})/i)
    const techMatch2 = errorLog.match(/Technologies found for (.+?):\s*({[^}]+})/i)
    const techMatch = techMatch1 || techMatch2
    
    if (techMatch) {
      try {
        let techStr = techMatch[2]
        // Replace single quotes with double quotes for JSON parsing
        techStr = techStr.replace(/'/g, '"')
        const techObj = JSON.parse(techStr)
        result.tech = {
          technologies: Object.entries(techObj).map(([name, version]) => ({
            name,
            version: version || '',
          })),
        }
      } catch {
        // If parsing fails, try to extract individual technologies
        const serverMatch = errorLog.match(/['"]server['"]:\s*['"]([^'"]+)['"]/i)
        const phpMatch = errorLog.match(/['"]x-powered-by['"]:\s*['"]([^'"]+)['"]/i)
        
        const technologies: any[] = []
        if (serverMatch) {
          technologies.push({ name: serverMatch[1] })
        }
        if (phpMatch) {
          technologies.push({ name: phpMatch[1] })
        }
        
        if (technologies.length > 0) {
          result.tech = { technologies }
        }
      }
    } else {
      // Try alternative pattern for technologies
      const altTechMatch = errorLog.match(/server['"]:\s*['"]([^'"]+)['"]/i)
      if (altTechMatch) {
        result.tech = {
          technologies: [{ name: altTechMatch[1] }],
        }
      }
    }

    // Only return if we extracted something useful
    if (Object.keys(result).length > 0) {
      return result
    }
  } catch (error) {
    console.error('Error extracting scan data from logs:', error)
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, data } = body

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint is required' },
        { status: 400 }
      )
    }

    // Validate endpoint to prevent SSRF
    const allowedEndpoints = [
      '/scan/ports',
      '/scan/sql',
      '/scan/web',
      '/scan/xss',
      '/scan/ssl',
      '/scan/headers',
      '/scan/tech',
      '/scan/subdomains',
      '/scan/multi',
    ]

    if (!allowedEndpoints.includes(endpoint)) {
      return NextResponse.json(
        { success: false, error: 'Invalid endpoint' },
        { status: 400 }
      )
    }

    // Make request to backend API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {}),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Try to parse response even if status is not OK
      // Sometimes MCP server returns error but scan data is still available
      const responseText = await response.text()
      let parsedResponse: any = null
      
      try {
        parsedResponse = JSON.parse(responseText)
      } catch {
        // If not JSON, treat as error text
      }

      if (!response.ok) {
        // Check if error response contains useful data
        // Sometimes MCP server errors but scan results are in the response
        if (parsedResponse && typeof parsedResponse === 'object') {
          // Look for scan results in error response
          const hasScanData = 
            parsedResponse.ports ||
            parsedResponse.ssl ||
            parsedResponse.headers ||
            parsedResponse.web ||
            parsedResponse.tech ||
            parsedResponse.xss ||
            parsedResponse.sql ||
            parsedResponse.subdomains

          if (hasScanData) {
            // Scan completed but response error occurred
            // Return the data anyway
            console.warn('MCP server error but scan data available:', parsedResponse)
            return NextResponse.json({
              success: true,
              data: parsedResponse,
              warning: 'Scan completed but server reported an error during response',
            })
          }

          // Try to extract scan information from error detail/logs
          const errorDetail = parsedResponse.detail || parsedResponse.error || responseText
          if (typeof errorDetail === 'string' && errorDetail.includes('analysis completed')) {
            // Scan completed but MCP server had error sending response
            // Extract partial data from logs
            const extractedData = extractScanDataFromLogs(errorDetail, data?.target || '')
            
            if (extractedData && Object.keys(extractedData).length > 0) {
              console.warn('Extracted partial scan data from error logs:', extractedData)
              return NextResponse.json({
                success: true,
                data: extractedData,
                warning: 'Scan completed but server error occurred. Partial data extracted from logs.',
                partial: true,
              })
            }
          }
        }

        return NextResponse.json(
          {
            success: false,
            error: `HTTP ${response.status}: ${responseText.substring(0, 500)}`,
            rawError: responseText,
          },
          { status: response.status }
        )
      }

      // Response is OK, return parsed data
      const result = parsedResponse || JSON.parse(responseText)
      return NextResponse.json({
        success: true,
        data: result,
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout' },
          { status: 504 }
        )
      }
      throw fetchError
    }
  } catch (error: any) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

