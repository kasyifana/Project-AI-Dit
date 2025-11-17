// API Service for Audit Tools Integration

import type {
  ScanResponse,
  PortScanResult,
  SQLScanResult,
  WebScanResult,
  XSSScanResult,
  SSLScanResult,
  HeadersScanResult,
  TechScanResult,
  SubdomainScanResult,
  MultiScanResult,
  ScanRequest,
} from '../types/audit'
import { API_CONFIG } from '../config/api'

const API_BASE_URL = API_CONFIG.BASE_URL

/**
 * Generic function to call API endpoints
 * Uses Next.js API route as proxy to avoid CORS issues
 */
async function callApi<T>(
  endpoint: string,
  data: ScanRequest
): Promise<ScanResponse & { data?: T }> {
  try {
    // Use Next.js API route as proxy (server-side, no CORS issues)
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        data,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: response.statusText,
      }))
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const result = await response.json()
    return {
      success: result.success,
      data: result.data,
      error: result.error,
    }
  } catch (error) {
    console.error('API call error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Port Scan (Nmap)
 * POST /scan/ports
 */
export async function scanPorts(
  target: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: PortScanResult }> {
  return callApi<PortScanResult>('/scan/ports', {
    target,
    host: target,
    ...options,
  })
}

/**
 * SQL Injection Scan (SQLMap)
 * POST /scan/sql
 */
export async function scanSQL(
  url: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: SQLScanResult }> {
  return callApi<SQLScanResult>('/scan/sql', {
    url,
    target: url,
    ...options,
  })
}

/**
 * Web Vulnerability Scan (Nikto)
 * POST /scan/web
 */
export async function scanWeb(
  url: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: WebScanResult }> {
  return callApi<WebScanResult>('/scan/web', {
    url,
    target: url,
    ...options,
  })
}

/**
 * XSS Vulnerability Test
 * POST /scan/xss
 */
export async function scanXSS(
  url: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: XSSScanResult }> {
  return callApi<XSSScanResult>('/scan/xss', {
    url,
    target: url,
    ...options,
  })
}

/**
 * SSL Certificate Check
 * POST /scan/ssl
 */
export async function scanSSL(
  url: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: SSLScanResult }> {
  return callApi<SSLScanResult>('/scan/ssl', {
    url,
    target: url,
    ...options,
  })
}

/**
 * Security Headers Check
 * POST /scan/headers
 */
export async function scanHeaders(
  url: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: HeadersScanResult }> {
  return callApi<HeadersScanResult>('/scan/headers', {
    url,
    target: url,
    ...options,
  })
}

/**
 * Technology Detection
 * POST /scan/tech
 */
export async function scanTech(
  url: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: TechScanResult }> {
  return callApi<TechScanResult>('/scan/tech', {
    url,
    target: url,
    ...options,
  })
}

/**
 * Subdomain Enumeration
 * POST /scan/subdomains
 */
export async function scanSubdomains(
  domain: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: SubdomainScanResult }> {
  return callApi<SubdomainScanResult>('/scan/subdomains', {
    domain,
    target: domain,
    ...options,
  })
}

/**
 * Multi-Scan (All scans in one)
 * POST /scan/multi
 */
export async function scanMulti(
  url: string,
  options?: Record<string, any>
): Promise<ScanResponse & { data?: MultiScanResult }> {
  // Extract hostname from URL for target
  let target = url
  try {
    const urlObj = new URL(url)
    target = urlObj.hostname
  } catch {
    // If URL parsing fails, use as-is
  }
  
  return callApi<MultiScanResult>('/scan/multi', {
    target,
    ...options,
  })
}

/**
 * Helper function to extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * Helper function to extract hostname/IP from URL
 */
export function extractHost(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

