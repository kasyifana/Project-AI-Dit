'use client'

import { useState } from 'react'
import { scanWeb } from '@/lib/services/auditApi'

export default function DebugPage() {
  const [url, setUrl] = useState('https://pomodoro-henna-three.vercel.app/')
  const [rawResponse, setRawResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    try {
      const response = await scanWeb(url)
      setRawResponse(response)
      console.log('Raw Response from scanWeb:', response)
      console.log('Response Data:', response.data)
      console.log('Vulnerabilities:', response.data?.vulnerabilities)
    } catch (error) {
      console.error('Error:', error)
      setRawResponse({ error: String(error) })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug: Compare API Response</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <label className="block mb-2 font-semibold">Test URL:</label>
          <div className="flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded"
              placeholder="http://103.31.39.95:3000"
            />
            <button
              onClick={handleTest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Web Scan'}
            </button>
          </div>
        </div>

        {rawResponse && (
          <div className="space-y-6">
            {/* Success Status */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Response Status</h2>
              <div className="space-y-2">
                <div>Success: <span className={rawResponse.success ? 'text-green-400' : 'text-red-400'}>
                  {String(rawResponse.success)}
                </span></div>
                <div>Has Data: <span className={rawResponse.data ? 'text-green-400' : 'text-red-400'}>
                  {String(!!rawResponse.data)}
                </span></div>
                {rawResponse.error && (
                  <div className="text-red-400">Error: {rawResponse.error}</div>
                )}
              </div>
            </div>

            {/* Vulnerabilities Summary */}
            {rawResponse.data && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Vulnerabilities Summary</h2>
                <div className="space-y-2">
                  <div>Type: {Array.isArray(rawResponse.data.vulnerabilities) ? 'Array ✅' : typeof rawResponse.data.vulnerabilities}</div>
                  <div>Count: {rawResponse.data.vulnerabilities?.length || 0}</div>
                  <div>Issues Count Field: {rawResponse.data.issues_count || 'N/A'}</div>
                </div>
              </div>
            )}

            {/* Vulnerabilities List */}
            {rawResponse.data?.vulnerabilities && Array.isArray(rawResponse.data.vulnerabilities) && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">
                  Vulnerabilities List ({rawResponse.data.vulnerabilities.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {rawResponse.data.vulnerabilities.map((vuln: any, idx: number) => (
                    <div key={idx} className="bg-gray-700 rounded p-4">
                      <div className="font-semibold">{idx + 1}. {vuln.title || vuln.id || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">Severity: {vuln.severity || 'N/A'}</div>
                      <div className="text-sm text-gray-400 mt-1">{vuln.description || vuln.message || 'No description'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Raw JSON Response</h2>
              <pre className="bg-gray-900 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>

            {/* Copy Button */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2))
                  alert('Copied to clipboard!')
                }}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold"
              >
                📋 Copy Raw JSON
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(rawResponse, null, 2)
                  const dataBlob = new Blob([dataStr], { type: 'application/json' })
                  const url = URL.createObjectURL(dataBlob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = 'web-scan-response.json'
                  link.click()
                }}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-semibold"
              >
                💾 Download JSON
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mt-8">
          <h3 className="font-bold mb-2">📖 How to Compare with Postman:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Run the same scan in Postman with the same URL</li>
            <li>Click "Test Web Scan" button above</li>
            <li>Compare the "Vulnerabilities Count" in both</li>
            <li>Check if the vulnerability list matches</li>
            <li>Copy the raw JSON and compare structure</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
