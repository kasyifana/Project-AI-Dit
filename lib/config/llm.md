# Konfigurasi LLM untuk Analisis AI

Sistem ini mendukung analisis berbasis LLM untuk memberikan insight yang lebih cerdas dari hasil scan.

## Setup

Tambahkan environment variables di `.env.local`:

### OpenAI
```env
NEXT_PUBLIC_LLM_API_URL=https://api.openai.com/v1/chat/completions
NEXT_PUBLIC_LLM_API_KEY=sk-your-openai-api-key
```

### Anthropic Claude
```env
NEXT_PUBLIC_LLM_API_URL=https://api.anthropic.com/v1/messages
NEXT_PUBLIC_LLM_API_KEY=your-anthropic-api-key
```

### Local LLM (Ollama)
```env
NEXT_PUBLIC_LLM_API_URL=http://localhost:11434/api/generate
NEXT_PUBLIC_LLM_API_KEY=not-needed
```

## Cara Kerja

1. **Jika LLM dikonfigurasi**: Sistem akan menggunakan LLM untuk menganalisis hasil scan dan menghasilkan:
   - Executive summary yang lebih kontekstual
   - Findings dengan penjelasan yang lebih detail
   - Rekomendasi yang lebih actionable
   - Action items dengan prioritas yang lebih tepat

2. **Jika LLM tidak dikonfigurasi**: Sistem akan fallback ke rule-based analysis (analisis berbasis aturan)

## Catatan

- LLM analysis membutuhkan API key yang valid
- Pastikan API key tidak di-commit ke repository (gunakan .env.local)
- Biaya API LLM akan dikenakan per penggunaan

