'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { usePayment } from '@/context/PaymentContext'
import { useToast } from '@/components/Toast'
import { 
  scanPorts, 
  scanSQL, 
  scanWeb, 
  scanXSS, 
  scanSSL, 
  scanHeaders, 
  scanTech, 
  scanSubdomains,
  scanCDNBypass 
} from '@/lib/services/auditApi'
import { transformScanResultsToAuditResult } from '@/lib/utils/transformResults'
import { 
  CheckCircle, 
  Brain, 
  ArrowRight,
  History,
  Sparkles,
  Link as LinkIcon,
  Shield,
  Gauge,
  Accessibility,
  HelpCircle,
  Loader2
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { paymentState, setAuditResult } = usePayment()
  const { showToast } = useToast()

  const [auditData, setAuditData] = useState({
    url: paymentState.orderData?.websiteUrl || '',
    focusArea: paymentState.orderData?.auditType || '',
    notes: '',
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [showFocusInfo, setShowFocusInfo] = useState(false)
  const [scanProgress, setScanProgress] = useState<string>('')
  const [currentScan, setCurrentScan] = useState<string>('')
  const [completedScans, setCompletedScans] = useState<string[]>([])
  const [scanResults, setScanResults] = useState<any>({})
  const [quickMode, setQuickMode] = useState(true) // Quick mode by default

  useEffect(() => {
    if (!paymentState.isPaid || paymentState.paymentStatus !== 'verified') {
      showToast('Anda harus menyelesaikan pembayaran terlebih dahulu', 'error')
      router.push('/pricing')
      return
    }
  }, [paymentState, router, showToast])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuditData({ ...auditData, url: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auditData.url.trim()) {
      showToast('Masukkan URL website yang akan diaudit', 'error')
      return
    }

    // Validate URL format
    try {
      new URL(auditData.url)
    } catch {
      showToast('Format URL tidak valid. Pastikan URL diawali dengan http:// atau https://', 'error')
      return
    }

    setIsProcessing(true)
    setScanProgress('Memulai scan...')
    setCompletedScans([])
    setScanResults({})

    try {
      const results: any = {}
      
      // Define all available scans
      const allScans = [
        { name: 'SSL Certificate', key: 'ssl', fn: () => scanSSL(auditData.url), icon: '🔒', timeout: 30000, essential: true },
        { name: 'Security Headers', key: 'headers', fn: () => scanHeaders(auditData.url), icon: '🛡️', timeout: 20000, essential: true },
        { name: 'Port Scan', key: 'ports', fn: () => scanPorts(auditData.url), icon: '🔍', timeout: 60000, essential: true },
        { name: 'Web Vulnerabilities', key: 'web', fn: () => scanWeb(auditData.url), icon: '🌐', timeout: 120000, essential: true },
        { name: 'XSS Testing', key: 'xss', fn: () => scanXSS(auditData.url), icon: '⚠️', timeout: 45000, essential: true },
        { name: 'SQL Injection', key: 'sql', fn: () => scanSQL(auditData.url, { quick: true }), icon: '💉', timeout: 60000, essential: false },
        { name: 'Technology Detection', key: 'tech', fn: () => scanTech(auditData.url), icon: '⚙️', timeout: 30000, essential: true },
        { name: 'Subdomain Enumeration', key: 'subdomains', fn: () => scanSubdomains(auditData.url), icon: '🔗', timeout: 45000, essential: true },
        { name: 'CDN Bypass', key: 'cdn', fn: () => scanCDNBypass(auditData.url), icon: '🌩️', timeout: 30000, essential: true },
      ]
      
      // Filter scans based on quick mode
      const scans = quickMode 
        ? allScans.filter(scan => scan.essential)
        : allScans

      // Run scans sequentially
      for (const scan of scans) {
        setCurrentScan(scan.name)
        setScanProgress(`${scan.icon} Scanning ${scan.name}...`)
        
        try {
          // Create timeout promise
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), scan.timeout)
          )
          
          // Race between scan and timeout
          const response = await Promise.race([
            scan.fn(),
            timeoutPromise
          ]) as any
          
          // Enhanced logging for debugging
          console.group(`📊 ${scan.name} Results`)
          console.log('Full Response:', response)
          console.log('Response Success:', response.success)
          console.log('Response Data:', response.data)
          
          // Special logging for web scan
          if (scan.key === 'web') {
            console.log('🌐 WEB SCAN DETAILS:')
            console.log('- Vulnerabilities Array:', response.data?.vulnerabilities)
            console.log('- Vulnerabilities Count:', response.data?.vulnerabilities?.length || 0)
            console.log('- Issues Count Field:', response.data?.issues_count)
            console.log('- Raw Web Object:', JSON.stringify(response.data, null, 2))
            
            // Log each vulnerability
            if (response.data?.vulnerabilities && Array.isArray(response.data.vulnerabilities)) {
              console.log(`📋 Found ${response.data.vulnerabilities.length} vulnerabilities:`)
              response.data.vulnerabilities.forEach((vuln: any, idx: number) => {
                console.log(`  ${idx + 1}. ${vuln.title || vuln.id || 'Unknown'} (${vuln.severity || 'Unknown'})`)
              })
            }
          }
          console.groupEnd()
          
          // Store result even if not successful (might have partial data)
          if (response.success || response.data) {
            results[scan.key] = response.data
            console.log(`✅ ${scan.name} - Data stored in results`)
          } else {
            console.warn(`⚠️ ${scan.name} - No data received:`, response.error)
          }
          
          // Mark as completed
          setCompletedScans(prev => [...prev, scan.name])
          setScanResults(results)
          
          // Small delay for better UX
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error) {
          console.error(`Error in ${scan.name}:`, error)
          
          // If timeout, show warning but continue
          if (error instanceof Error && error.message === 'Timeout') {
            console.warn(`${scan.name} timed out, skipping...`)
            showToast(`⚠️ ${scan.name} memakan waktu terlalu lama, di-skip`, 'warning')
          }
          
          // Mark as completed even if failed/timeout
          setCompletedScans(prev => [...prev, scan.name])
          
          // Continue with next scan even if one fails
        }
      }

      // Log all collected results
      console.group('📦 ALL SCAN RESULTS SUMMARY')
      console.log('Complete Results Object:', results)
      console.log('Web Vulnerabilities:', results.web?.vulnerabilities)
      console.log('Web Issues Count:', results.web?.issues_count)
      console.log('SSL Data:', results.ssl)
      console.log('Headers Data:', results.headers)
      console.log('XSS Data:', results.xss)
      console.log('Ports Data:', results.ports)
      console.groupEnd()

      setScanProgress('🤖 Menganalisis hasil dengan AI...')
      setCurrentScan('AI Analysis')

      // Log what we're sending to transform function
      console.log('🔄 Sending to transformScanResultsToAuditResult:', {
        url: auditData.url,
        scanResults: results,
        options: {
          focusArea: auditData.focusArea,
          notes: auditData.notes,
          useLLM: true,
        }
      })

      // Transform API results to AuditResult format
      const auditResult = await transformScanResultsToAuditResult(
        auditData.url,
        results,
        {},
        {
          focusArea: auditData.focusArea,
          notes: auditData.notes,
          useLLM: true,
        }
      )
      
      // Log transformed result
      console.group('🎯 TRANSFORMED AUDIT RESULT')
      console.log('Audit Result:', auditResult)
      console.log('Total Findings:', auditResult.findings.length)
      console.log('Findings Details:', auditResult.findings)
      console.log('Recommendations:', auditResult.recommendations)
      console.log('Action Items:', auditResult.actionItems)
      console.groupEnd()

      setAuditResult(auditResult)
      setIsProcessing(false)
      setScanProgress('')
      setCurrentScan('')
      
      showToast('✅ Audit selesai! Lihat hasil audit Anda.', 'success')
      router.push('/result')
    } catch (error) {
      console.error('Scan error:', error)
      setIsProcessing(false)
      setScanProgress('')
      
      // More user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat melakukan scan'
      
      // Check if error mentions scan completion
      if (errorMessage.includes('SSL analysis completed') || errorMessage.includes('Scan completed')) {
        showToast('Scan selesai namun terjadi error. Silakan coba lagi atau hubungi support.', 'warning')
      } else {
        showToast(
          `Error: ${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? '...' : ''}`,
          'error'
        )
      }
    }
  }

  if (!paymentState.isPaid || paymentState.paymentStatus !== 'verified') {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-12 bg-dark-950 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="card mb-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">Pembayaran Terverifikasi ✓</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Audit Website Blackbox
            </h1>
            <p className="text-primary-100">
              Masukkan URL website dan lakukan pengujian blackbox terhadap performa, keamanan, SEO, dan aksesibilitas.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                  Mulai Audit Blackbox
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      URL Website <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      value={auditData.url}
                      onChange={handleUrlChange}
                      placeholder="https://www.contoh.com"
                    />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-semibold">
                        Pilih Fokus Area Audit
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowFocusInfo(!showFocusInfo)}
                        className="p-1 rounded-full bg-[#1FB6FF]/10 hover:bg-[#1FB6FF]/20 text-[#1FB6FF]"
                        aria-label="Info fokus area"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    {showFocusInfo && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#0F1421]/90 backdrop-blur-sm p-3 text-sm text-[#A0AEC0]">
                        Semua aspek akan tetap diaudit. Pilih fokus utama untuk pendalaman.
                      </div>
                    )}
                    <select
                      className="input-field"
                      value={auditData.focusArea}
                      onChange={(e) => setAuditData({ ...auditData, focusArea: e.target.value })}
                    >
                      <option value="">-- Pilih Fokus Area (Opsional) --</option>
                      <option value="performance">Performa</option>
                      <option value="security">Keamanan</option>
                      <option value="seo">SEO</option>
                      <option value="accessibility">Aksesibilitas</option>
                      <option value="functional">Fungsional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      className="input-field min-h-[100px]"
                      value={auditData.notes}
                      onChange={(e) => setAuditData({ ...auditData, notes: e.target.value })}
                      placeholder="Masukkan konteks singkat audit, misal: halaman penting, form yang perlu diuji, dsb."
                    />
                  </div>

                  {/* Quick Mode Toggle */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="quickMode"
                        checked={quickMode}
                        onChange={(e) => setQuickMode(e.target.checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor="quickMode" className="font-semibold cursor-pointer">
                          ⚡ Quick Mode (Recommended)
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Skip SQL Injection scan yang memakan waktu lama (~3-5 menit). 
                          Quick mode hanya butuh ~2-3 menit untuk menyelesaikan semua scan lainnya.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="bg-gradient-to-r from-[#1FB6FF]/10 to-primary-600/10 border border-[#1FB6FF]/20 rounded-lg p-6 mb-4">
                      {/* Current Scan Progress */}
                      <div className="flex items-center gap-3 mb-4">
                        <Loader2 className="w-6 h-6 text-[#1FB6FF] animate-spin" />
                        <div className="flex-1">
                          <div className="font-semibold text-white">{scanProgress}</div>
                          {currentScan && (
                            <div className="text-sm text-[#A0AEC0] mt-1">
                              {completedScans.length}/{quickMode ? 8 : 9} scans completed
                              {quickMode && ' (Quick Mode)'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                        <div 
                          className="bg-gradient-to-r from-[#1FB6FF] to-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(completedScans.length / (quickMode ? 8 : 9)) * 100}%` }}
                        />
                      </div>

                      {/* Scan Checklist */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                          { name: 'SSL Certificate', icon: '🔒', skippable: false },
                          { name: 'Security Headers', icon: '🛡️', skippable: false },
                          { name: 'Port Scan', icon: '🔍', skippable: false },
                          { name: 'Web Vulnerabilities', icon: '🌐', skippable: false },
                          { name: 'XSS Testing', icon: '⚠️', skippable: false },
                          { name: 'SQL Injection', icon: '💉', skippable: true },
                          { name: 'Technology Detection', icon: '⚙️', skippable: false },
                          { name: 'Subdomain Enumeration', icon: '🔗', skippable: false },
                          { name: 'CDN Bypass', icon: '🌩️', skippable: false },
                        ].map((scan) => {
                          const isSkipped = quickMode && scan.skippable
                          return (
                            <div
                              key={scan.name}
                              className={`flex items-center gap-2 px-3 py-2 rounded ${
                                isSkipped
                                  ? 'bg-gray-900/50 text-gray-600 line-through'
                                  : completedScans.includes(scan.name)
                                  ? 'bg-green-500/20 text-green-400'
                                  : currentScan === scan.name
                                  ? 'bg-[#1FB6FF]/20 text-[#1FB6FF] animate-pulse'
                                  : 'bg-gray-800/50 text-gray-500'
                              }`}
                            >
                              <span>{scan.icon}</span>
                              <span className="text-xs">
                                {scan.name}
                                {isSkipped && ' (Skipped)'}
                              </span>
                              {!isSkipped && completedScans.includes(scan.name) && (
                                <CheckCircle className="w-3 h-3 ml-auto" />
                              )}
                              {!isSkipped && currentScan === scan.name && (
                                <Loader2 className="w-3 h-3 ml-auto animate-spin" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Brain className="inline mr-2 w-5 h-5 animate-pulse" />
                        Memproses Scan...
                      </>
                    ) : (
                      <>
                        Jalankan Audit Blackbox
                        <ArrowRight className="inline ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* History Section */}
              {paymentState.auditResult && (
                <div className="card">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary-600" />
                    Audit Terakhir
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Audit {paymentState.auditResult.type}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(paymentState.auditResult.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{paymentState.auditResult.summary}</p>
                    <Link href="/result" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                      Lihat Detail →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card mb-6">
                <h3 className="font-bold mb-4">Paket Anda</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-600">Paket</div>
                    <div className="font-semibold">{paymentState.orderData?.package}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tipe Audit</div>
                    <div className="font-semibold">Website Blackbox</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Perusahaan</div>
                    <div className="font-semibold">{paymentState.orderData?.company}</div>
                  </div>
                  {paymentState.orderData?.websiteUrl && (
                    <div>
                      <div className="text-gray-600">Website</div>
                      <div className="font-semibold break-all">{paymentState.orderData?.websiteUrl}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold mb-4">Tips untuk Audit yang Optimal</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Gunakan URL produksi atau staging yang stabil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Jelaskan halaman kritikal dan form yang perlu diuji</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Pastikan tidak ada blokir bot pada robots/security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Proses audit memakan waktu 2-5 menit</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

