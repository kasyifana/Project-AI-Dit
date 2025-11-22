import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug endpoint to test raw API responses
 * GET /api/debug-scan?url=https://example.com
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url') || 'https://andrisetiawan.com'
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://103.31.39.95:3000'
  
  try {
    // Test /scan/web endpoint
    const response = await fetch(`${API_BASE_URL}/scan/web`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: url,
        url: url,
      }),
    })

    const data = await response.json()
    
    // Return detailed debug info
    return NextResponse.json({
      debug: true,
      timestamp: new Date().toISOString(),
      request: {
        url: `${API_BASE_URL}/scan/web`,
        body: { target: url, url: url },
      },
      response: {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
      },
      analysis: {
        hasVulnerabilities: !!data.vulnerabilities,
        vulnerabilitiesIsArray: Array.isArray(data.vulnerabilities),
        vulnerabilitiesCount: data.vulnerabilities?.length || 0,
        hasIssuesCount: !!data.issues_count,
        issuesCount: data.issues_count,
        dataKeys: Object.keys(data),
        sampleVulnerability: data.vulnerabilities?.[0] || null,
      }
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
