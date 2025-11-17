# Testing Guide - API Integration

## Setup Sebelum Testing

1. **Buat file `.env.local`** di root project:
```env
NEXT_PUBLIC_API_BASE_URL=http://103.31.39.95:3000
```

2. **Start dev server**:
```bash
npm run dev
```

## Testing Manual

### 1. Test API Proxy Route
Buka browser dan test:
```
http://localhost:3000/api/scan
```

Dengan POST request body:
```json
{
  "endpoint": "/scan/headers",
  "data": {
    "target": "https://example.com"
  }
}
```

### 2. Test dari Dashboard
1. Buka `http://localhost:3000/dashboard`
2. Masukkan URL (misal: `https://example.com`)
3. Klik "Jalankan Audit Blackbox"
4. Periksa console browser untuk error

## Format Request yang Benar

Semua endpoint membutuhkan field `target`:

```json
{
  "target": "example.com"  // atau "https://example.com"
}
```

**Catatan**: Untuk `/scan/multi`, sistem akan otomatis extract hostname dari URL.

## Troubleshooting

### Error: "Failed to fetch"
- **Penyebab**: CORS issue atau API server tidak accessible
- **Solusi**: Pastikan menggunakan Next.js API route proxy (`/api/scan`)

### Error: "Field required: target"
- **Penyebab**: Format request salah
- **Solusi**: Pastikan menggunakan field `target` bukan `url`

### Error: "Request timeout"
- **Penyebab**: Scan memakan waktu lama (>5 menit)
- **Solusi**: Normal untuk scan yang kompleks, tunggu hingga selesai

## Endpoint yang Tersedia

1. `/scan/ports` - Nmap port scan
2. `/scan/sql` - SQLMap injection test
3. `/scan/web` - Nikto web vulnerability scan
4. `/scan/xss` - XSS vulnerability test
5. `/scan/ssl` - SSL certificate check
6. `/scan/headers` - Security headers check
7. `/scan/tech` - Technology detection
8. `/scan/subdomains` - Subdomain enumeration
9. `/scan/multi` - Multi-scan (semua scan sekaligus) ⭐

