<div align="center">
<h1 align="center">MENS SPACE - Dijital Muhasebe Sistemi</h1>
<p align="center">Berber salonları için profesyonel gelir, gider ve komisyon takip uygulaması.</p>
</div>

## 🚀 Özellikler
- **Berber Yönetimi:** 8 farklı berber için ayrı ayrı komisyon ve işlem takibi.
- **Gelir/Gider Takibi:** Günlük masrafların ve ek gelirlerin yönetimi.
- **Bulut Senkronizasyonu:** KVDB üzerinden cihazlar arası veri eşleştirme.
- **Arşivleme:** Gün sonu raporları ve geçmiş işlem araması.
- **Dinamik Hesaplama:** Bahşiş (Kasiyer/Berber) ve kozmetik satış yönetimi.

## 🛠️ Kurulum

1. Depoyu klonlayın:
   `git clone [repo-url]`
2. Bağımlılıkları yükleyin:
   `npm install`
3. `.env.local` dosyası oluşturun ve API anahtarınızı ekleyin:
   `VITE_GEMINI_API_KEY=your_api_key_here`
4. Uygulamayı başlatın:
   `npm run dev`

> Not: `.env.local` dosyasını kesinlikle repo'ya koymayın. Bu dosya `.gitignore` içinde zaten hariç tutulmuştur.

## 📦 Teknolojiler
- React 19
- Vite
- TypeScript
- Tailwind CSS
- KVDB.io (Senkronizasyon için)

## 🚀 GitHub Pages'de Yayınlama

### Otomatik Yayınlama (GitHub Actions)
1. Depoyu GitHub'a push edin
2. GitHub Actions otomatik olarak `main` branch'ine her push'da:
   - Projeyi build eder
   - `dist` klasörünü GitHub Pages'de yayınlar
   - Uygulamaya şu URL'den erişin: `https://emzarmamedov05-maker.github.io/Kasa/`

### Manuel Yayınlama
Eğer GitHub Actions kullanmak istemezseniz:
```bash
npm run deploy
```

⚠️ **Önemli:** GitHub Pages'i etkinleştirmek için:
1. Repo Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` (otomatik oluşturulacak)

## 📝 Lisans
MIT
