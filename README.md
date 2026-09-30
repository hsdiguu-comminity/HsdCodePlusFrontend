# HSDCode+ Frontend

İstanbul Gelişim Üniversitesi HSD — HSDCode+ platformunun arayüzü (Next.js 15 + TypeScript + CSS Modules).

> Detaylı plan: [docs/01_FRONTEND.md](docs/01_FRONTEND.md) · Görev dağılımı: [docs/03_GOREV_DAGILIMI.md](docs/03_GOREV_DAGILIMI.md)
> Tasarım referansı: [docs/reference/HSDCode_Demo_1.html](docs/reference/HSDCode_Demo_1.html)

## Klasör Yapısı ve Sorumlular

| Klasör / Dosya | İçerik | Sorumlu |
|---|---|---|
| `src/app/(public)/page.tsx` + `components/home/` | Ana sayfa (demo HTML'den taşınacak) | Ümmügülsüm |
| `src/app/(public)/hakkimizda` | Hakkımızda | Aleyna |
| `src/app/(public)/blog`, `blog/[slug]`, `blog/yeni` | Blog liste / detay / yazı oluştur | Aleyna |
| `src/app/(public)/quiz`, `quiz/[id]` | Quiz liste / çözme | Ümmügülsüm |
| `src/app/(public)/siralama` | Leaderboard | Aleyna |
| `src/app/(public)/profil/[kullaniciAdi]` | Herkese açık profil | Ümmügülsüm |
| `src/app/(auth)/*` | Giriş, Kayıt, Şifremi Unuttum, Şifre Sıfırla | Ümmügülsüm |
| `src/app/dashboard` | Kullanıcı paneli | Ümmügülsüm |
| `src/app/admin/*` | Admin paneli (üyeler, yazılar, quizler, kategoriler, işlem geçmişi) | Ümmügülsüm |
| `src/components/ui` | Button, Input, Card, Badge, Spinner, EmptyState, Toast | Aleyna |
| `src/components/ui` | Modal, Tabs, Pagination | Ümmügülsüm |
| `src/components/layout` | Navbar, Footer, Sidebar | Ümmügülsüm |
| `src/lib/api.ts` | Tek API istemcisi | Ümmügülsüm |
| `src/types` | Ortak TypeScript tipleri | Ümmügülsüm |
| `src/mocks` | Backend hazır olana kadar mock JSON veriler | Ekip |
| `src/styles` | Tema / renk / tipografi değişkenleri | Ümmügülsüm |

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Git Kuralları

- `main` → canlı (yalnızca Alp birleştirir), `develop` → test, `feature/*`, `fix/*`
- Doğrudan `main`/`develop`'a push yok, her şey PR ile. Frontend PR'larını Ümmügülsüm inceler.
- Commit: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`
