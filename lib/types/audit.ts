// Types for Audit API responses

export interface ScanResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export interface PortScanResult {
  open_ports?: number[]
  closed_ports?: number[]
  filtered_ports?: number[]
  host?: string
  scan_time?: number
  [key: string]: any
}

export interface SQLScanResult {
  vulnerable?: boolean
  payloads?: string[]
  database?: string
  tables?: string[]
  [key: string]: any
}

export interface WebScanResult {
  vulnerabilities?: Array<{
    id?: string
    title?: string
    severity?: string
    description?: string
    [key: string]: any
  }>
  server?: string
  [key: string]: any
}

export interface XSSScanResult {
  vulnerable?: boolean
  payloads?: string[]
  locations?: string[]
  [key: string]: any
}

export interface SSLScanResult {
  grade?: string
  valid?: boolean
  expires?: string
  issuer?: string
  [key: string]: any
}

export interface HeadersScanResult {
  headers?: Record<string, string>
  missing?: string[]
  recommendations?: string[]
  [key: string]: any
}

export interface TechScanResult {
  technologies?: Array<{
    name?: string
    version?: string
    [key: string]: any
  }>
  [key: string]: any
}

export interface SubdomainScanResult {
  subdomains?: string[]
  total?: number
  [key: string]: any
}

export interface MultiScanResult {
  ports?: PortScanResult
  sql?: SQLScanResult
  web?: WebScanResult
  xss?: XSSScanResult
  ssl?: SSLScanResult
  headers?: HeadersScanResult
  tech?: TechScanResult
  subdomains?: SubdomainScanResult
  [key: string]: any
}

export interface ScanRequest {
  url?: string
  target?: string
  host?: string
  [key: string]: any
}

