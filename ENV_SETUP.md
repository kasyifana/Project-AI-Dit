# Setup Environment Variables

## File yang perlu dibuat: `.env.local`

Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
# API Configuration (Required)
NEXT_PUBLIC_API_BASE_URL=http://103.31.39.95:3000

# LLM Configuration (Optional - untuk AI analysis)
# NEXT_PUBLIC_LLM_API_URL=https://api.openai.com/v1/chat/completions
# NEXT_PUBLIC_LLM_API_KEY=your-api-key-here
```

## Catatan Penting

1. **File `.env.local` tidak di-commit ke git** (sudah ada di `.gitignore`)
2. **NEXT_PUBLIC_** prefix diperlukan untuk variable yang diakses dari client-side
3. Restart dev server setelah mengubah environment variables

## Verifikasi

Setelah setup, pastikan:
- API server di `http://103.31.39.95:3000` dapat diakses
- Next.js API route `/api/scan` berfungsi sebagai proxy
- Tidak ada error CORS di browser console

