# HSDCode+ — Frontend Proje Dokümanı

> **Proje:** HSDCode+ — Türkiye'deki tüm Huawei Student Developer (HSD) toplulukları için teknik bilgi paylaşımı, quiz ve yarışma platformu
> **Sahibi:** İstanbul Gelişim Üniversitesi HSD
> **Frontend Ekibi:** Ümmügülsüm (Frontend Lead), Aleyna
> **Süre:** 6 hafta (1.5 ay) — Backend ile paralel ilerler

---

## 1. Amaç

Kullanıcıların:

- Teknik yazı, görsel ve deneyim paylaşabildiği,
- Yöneticilerin hazırladığı quizleri çözüp puan toplayabildiği,
- Günlük / haftalık / aylık sıralamada yer alabildiği,
- Kendi ve başkalarının profilini görüntüleyebildiği

hızlı, mobil uyumlu ve erişilebilir bir arayüz geliştirmek.

---

## 2. Teknoloji Yığını

| Katman | Teknoloji | Not |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Sayfa yönlendirme, SSR/SSG |
| Dil | **TypeScript** | Tüm bileşenler `.tsx` |
| İşaretleme | HTML5 (JSX) | Semantik etiketler (`header`, `main`, `article`, `nav`) |
| Stil | **CSS Modules** + global CSS değişkenleri | `*.module.css` — tema renkleri `globals.css` içinde |
| Etkileşim | JavaScript / TypeScript | Form doğrulama, quiz zamanlayıcı vb. |
| Form | React Hook Form + Zod | Backend ile aynı doğrulama şemaları |
| Blog editörü | Markdown editörü (ör. `@uiw/react-md-editor`) | Kod bloğu desteği önemli |
| İkonlar | `lucide-react` | |
| Kod kalitesi | ESLint + Prettier | Commit öncesi çalıştırılır |
| Editör | Visual Studio Code | Önerilen eklentiler: ESLint, Prettier, CSS Modules, GitLens |

> **Not:** Mevcut `index.html` tasarımı Ana Sayfa için referans alınacak ve Next.js bileşenlerine bölünerek taşınacaktır.

---

## 3. Sayfa / Menü Yapısı

| # | Sayfa | Rota | Giriş gerekli mi? | Açıklama |
|---|---|---|---|---|
| 1 | Ana Sayfa | `/` | Hayır | `index.html` referanslı; hero, öne çıkan yazılar, aktif quizler, haftanın ilk 5'i |
| 2 | Quiz Listesi | `/quiz` | Hayır (çözmek için evet) | Kategori filtresi: Yapay Zeka, Siber Güvenlik, Web, Veri Bilimi |
| 3 | Quiz Çözme | `/quiz/[id]` | Evet | Soru ekranı, zamanlayıcı, ilerleme çubuğu, sonuç ekranı |
| 4 | Blog Listesi | `/blog` | Hayır | Kategori/etiket filtresi, arama, sayfalama |
| 5 | Blog Detay | `/blog/[slug]` | Hayır | Markdown render, kod vurgulama, yazar kartı |
| 6 | Yazı Oluştur | `/blog/yeni` | Evet | Markdown editör, kapak görseli, önizleme, "Onaya Gönder" |
| 7 | Leaderboard | `/siralama` | Hayır | Sekmeler: Günlük / Haftalık / Aylık; Ad-Soyad, HSD topluluğu, puan |
| 8 | Hakkımızda | `/hakkimizda` | Hayır | Topluluk tanıtımı, ekip kartları, iletişim |
| 9 | Dashboard | `/dashboard` | Evet | Kendi puanı, yazıları (onay durumu), quiz geçmişi, profil düzenleme |
| 10 | Profil | `/profil/[kullaniciAdi]` | Hayır | Başka üyelerin herkese açık profili |
| 11 | Giriş / Kayıt | `/giris`, `/kayit` | Hayır | Kayıt sonrası "Onay bekleniyor" ekranı |
| 12 | Şifremi Unuttum | `/sifremi-unuttum`, `/sifre-sifirla` | Hayır | E-posta ile sıfırlama akışı |
| 13 | Admin Paneli | `/admin/*` | Evet (admin) | Üye onayı, yazı onayı, ban, quiz yönetimi |
| 14 | 404 / Hata | `not-found.tsx`, `error.tsx` | — | |

---

## 4. Klasör Yapısı (Öneri)

```
hsdcode-plus/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx               # Ana sayfa
│   │   │   ├── blog/
│   │   │   ├── quiz/
│   │   │   ├── siralama/
│   │   │   ├── hakkimizda/
│   │   │   └── profil/[kullaniciAdi]/
│   │   ├── (auth)/
│   │   │   ├── giris/
│   │   │   ├── kayit/
│   │   │   └── sifremi-unuttum/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/          # Button, Input, Card, Modal, Badge, Tabs, Spinner
│   │   ├── layout/      # Navbar, Footer, Sidebar
│   │   ├── blog/        # PostCard, PostEditor, MarkdownView
│   │   ├── quiz/        # QuizCard, QuestionView, Timer, ResultScreen
│   │   └── leaderboard/ # RankTable, PeriodTabs
│   ├── lib/             # api istemcisi, yardımcı fonksiyonlar
│   ├── types/           # Ortak TypeScript tipleri
│   └── styles/          # tema değişkenleri
└── public/              # logo, görseller
```

> Frontend ve Backend **aynı Next.js reposunda** çalışır (`app/api/*` backend'e aittir). Bu, iki ekibin tipleri paylaşmasını kolaylaştırır.

---

## 5. Tasarım Sistemi

- **Renkler:** Huawei kırmızısı vurgu rengi (`--color-primary: #C7000B`), nötr gri tonlar, açık/koyu tema desteği.
- **Tipografi:** Başlıklar için tek bir sans-serif font (ör. Inter), kod için monospace (ör. JetBrains Mono).
- **Boşluk ölçeği:** 4px tabanlı (`4, 8, 12, 16, 24, 32, 48`).
- **Responsive kırılım noktaları:** 480px, 768px, 1024px, 1280px. **Mobile-first** yaklaşım.
- **Erişilebilirlik:** Tüm görsellerde `alt`, klavye ile gezinme, yeterli renk kontrastı, form hatalarının ekran okuyucuya bildirilmesi.
- Hafta 1'de Figma (veya kâğıt üzerinde) wireframe'ler hazırlanır ve ekipçe onaylanır.

---

## 6. Ortak Bileşenler (Hafta 1–2'de hazır olmalı)

| Bileşen | Sorumlu | Açıklama |
|---|---|---|
| `Navbar` / `Footer` | Ümmügülsüm | Giriş durumuna göre menü değişir |
| `Button`, `Input`, `Card`, `Badge` | Aleyna (Ümmügülsüm eşliğinde) | Başlangıç için ideal, basit bileşenler |
| `Modal`, `Tabs`, `Pagination` | Ümmügülsüm | |
| `Spinner`, `EmptyState`, `Toast` | Aleyna | |

---

## 7. Backend ile Entegrasyon

- Tüm istekler `src/lib/api.ts` içindeki tek bir istemci üzerinden yapılır.
- API sözleşmesi (endpoint listesi) **Backend dokümanında** yer alır. Endpoint hazır değilse frontend **mock veri** (`src/mocks/*.json`) ile ilerler — bu sayede iki ekip birbirini beklemez.
- Oturum bilgisi HttpOnly cookie ile tutulur; frontend token'ı `localStorage`'a **yazmaz**.
- Hata mesajları backend'den `{ error: { code, message } }` formatında gelir; frontend bunu `Toast` ile gösterir.

---

## 8. Haftalık Frontend Planı

| Hafta | Ümmügülsüm | Aleyna |
|---|---|---|
| **1** | Next.js kurulumu, klasör yapısı, tema/renk değişkenleri, wireframe'ler | Git/VS Code/Next.js temelleri eğitimi, `Button`, `Input`, `Card` bileşenleri |
| **2** | `Navbar`, `Footer`, layout; `index.html`'in Ana Sayfa'ya taşınması | Hakkımızda sayfası, `Badge`, `Spinner`, `Toast` |
| **3** | Giriş / Kayıt / Şifremi Unuttum sayfaları + form doğrulama | Blog liste sayfası (mock veri), `PostCard` |
| **4** | Quiz liste + Quiz çözme ekranı (zamanlayıcı, sonuç) | Blog detay sayfası, Markdown görüntüleme |
| **5** | Dashboard + Profil sayfaları; Admin paneli arayüzü | Leaderboard (sekmeler, tablo), Yazı oluşturma sayfası |
| **6** | Gerçek API entegrasyonu, performans, erişilebilirlik kontrolü | Responsive testler (mobil/tablet), hata ve boş durum ekranları |

---

## 9. Kod Standartları

- Bileşen adları `PascalCase`, dosyalar bileşen adıyla aynı (`PostCard.tsx`, `PostCard.module.css`).
- `any` kullanılmaz; tipler `src/types/` altında tanımlanır.
- Her sayfa için `loading.tsx` ve gerektiğinde `error.tsx` eklenir.
- Görseller için `next/image` kullanılır.
- Commit mesajları: `feat:`, `fix:`, `style:`, `refactor:`, `docs:` önekleriyle.
- Her PR en az bir kişi tarafından (Aleyna'nın PR'ları Ümmügülsüm tarafından) incelenir.

---

## 10. Tamamlanma Kriterleri (Definition of Done)

- [ ] Sayfa mobil, tablet ve masaüstünde düzgün görünüyor
- [ ] ESLint hatası yok, TypeScript derleniyor
- [ ] Yükleniyor / hata / boş veri durumları var
- [ ] Gerçek API'ye bağlı (veya mock olduğu açıkça belirtilmiş)
- [ ] PR incelendi ve `develop` dalına birleştirildi
