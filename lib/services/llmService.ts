// LLM Service for AI-powered analysis of audit results

import type { MultiScanResult } from '../types/audit'
import type { AuditResult } from '@/context/PaymentContext'

const LLM_API_URL = process.env.NEXT_PUBLIC_LLM_API_URL || ''
const LLM_API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY || ''

interface LLMAnalysisRequest {
  scanResults: MultiScanResult
  url: string
  focusArea?: string
  notes?: string
}

interface LLMAnalysisResponse {
  summary: string
  findings: Array<{
    title: string
    severity: 'High' | 'Medium' | 'Low'
    description: string
    impact: string
  }>
  recommendations: string[]
  actionItems: Array<{
    task: string
    priority: 'High' | 'Medium' | 'Low'
    deadline: string
  }>
}

/**
 * Analyze scan results using LLM
 * This function can use OpenAI, Anthropic, or any LLM API
 */
export async function analyzeWithLLM(
  request: LLMAnalysisRequest
): Promise<LLMAnalysisResponse | null> {
  // If no LLM API configured, return null to use fallback
  if (!LLM_API_URL || !LLM_API_KEY) {
    console.warn('LLM API not configured, using rule-based analysis')
    return null
  }

  try {
    // Prepare prompt for LLM
    const prompt = createAnalysisPrompt(request)

    // Call LLM API (example using OpenAI format, adjust based on your LLM provider)
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4', // or your preferred model
        messages: [
          {
            role: 'system',
            content:
              'Anda adalah ahli keamanan siber dan audit website. Analisis hasil scan dan berikan insight yang actionable.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`)
    }

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)

    return {
      summary: analysis.summary || '',
      findings: analysis.findings || [],
      recommendations: analysis.recommendations || [],
      actionItems: analysis.actionItems || [],
    }
  } catch (error) {
    console.error('LLM analysis error:', error)
    return null // Fallback to rule-based analysis
  }
}

/**
 * Create analysis prompt for LLM
 */
function createAnalysisPrompt(request: LLMAnalysisRequest): string {
  const { scanResults, url, focusArea, notes } = request

  return `Analisis hasil audit website blackbox untuk ${url} dan berikan laporan yang komprehensif.

${focusArea ? `Fokus Area: ${focusArea}` : ''}
${notes ? `Catatan: ${notes}` : ''}

Hasil Scan:
${JSON.stringify(scanResults, null, 2)}

Berdasarkan hasil scan di atas, berikan analisis dalam format JSON dengan struktur berikut:
{
  "summary": "Ringkasan eksekutif singkat (2-3 kalimat) tentang temuan utama dan status keamanan website",
  "findings": [
    {
      "title": "Judul temuan",
      "severity": "High|Medium|Low",
      "description": "Penjelasan detail temuan",
      "impact": "Dampak terhadap bisnis/keamanan"
    }
  ],
  "recommendations": [
    "Rekomendasi actionable untuk perbaikan"
  ],
  "actionItems": [
    {
      "task": "Tugas spesifik yang perlu dilakukan",
      "priority": "High|Medium|Low",
      "deadline": "YYYY-MM-DD"
    }
  ]
}

Panduan:
- Prioritaskan temuan yang paling kritis dan berdampak tinggi
- Berikan rekomendasi yang spesifik dan dapat diimplementasikan
- Tentukan deadline yang realistis untuk action items
- Gunakan bahasa Indonesia yang profesional
- Fokus pada aspek keamanan, performa, dan best practices`
}

/**
 * Alternative: Use local LLM or different provider
 * This is a placeholder for other LLM integrations
 */
export async function analyzeWithLocalLLM(
  request: LLMAnalysisRequest
): Promise<LLMAnalysisResponse | null> {
  // Implement if you have a local LLM or different provider
  // For example: Ollama, Hugging Face, etc.
  return null
}

