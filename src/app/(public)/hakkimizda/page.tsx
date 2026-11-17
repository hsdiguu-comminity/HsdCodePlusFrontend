// ---- /hakkimizda sayfası ----
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ClipboardCheck, Cpu, Rocket, TrendingUp, Users, type LucideIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Huawei Student Developers programı ve İGÜ HSD Gelişim topluluğu hakkında.",
};

// Kart renk vurguları (page.module.css içinde tanımlı)
type Accent = "purple" | "cyan" | "orange" | "green" | "pink" | "blue";

// Bir bilgi kartının verisi
interface InfoItem {
  icon: LucideIcon;
  tag?: string;
  title: string;
  text: string;
  accent: Accent;
  href?: string; // varsa kartın altında bağlantı gösterilir
  cta?: string;
}

// HSD'nin vizyonu bölümü kartları
const VISION: InfoItem[] = [
  { icon: Cpu, accent: "purple", tag: "TEKNİK GELİŞİM", title: "Yapay Zekâ ve Teknolojiler", text: "Yapay zekâ, mobil teknolojiler, bulut sistemleri ve yazılım geliştirme gibi alanlarda yeni bilgiler edinmeye ve uygulama deneyimi kazanmaya odaklanır." },
  { icon: Users, accent: "cyan", tag: "TOPLULUK", title: "Liderlik ve Takım Çalışması", text: "Öğrencilerin fikir alışverişinde bulunmasını, ekiplerle birlikte çalışmasını ve topluluk içinde sorumluluk almasını destekler." },
  { icon: TrendingUp, accent: "orange", tag: "KARİYER", title: "Sektörle Etkileşim", text: "Eğitimler, etkinlikler ve uygun fırsatlar aracılığıyla öğrencilerin teknoloji sektörünü tanımalarına ve kariyer hedeflerini keşfetmelerine yardımcı olmayı amaçlar." },
  { icon: Rocket, accent: "green", tag: "UYGULAMA", title: "Projeler ve Yarışmalar", text: "Öğrencileri fikirlerini projelere dönüştürmeye, teknik problemler üzerinde çalışmaya ve uygun teknoloji yarışmalarını değerlendirmeye teşvik eder." },
];

// İGÜ HSD Gelişim çalışma alanları
const IGU = [
  { label: "TEKNİK EKİPLER", title: "Teknik Geliştirme Takımları", text: "Web geliştirme, mobil uygulamalar, veri bilimi ve makine öğrenmesi gibi alanlarda ekip çalışmaları ve proje geliştirme süreçlerine odaklanıyoruz." },
  { label: "ÖĞRENME", title: "Eğitim ve Atölyeler", text: "Kodlama, algoritma ve yazılım araçları üzerine bilgi paylaşımını destekleyen eğitimler ve uygulamalı çalışma fırsatları oluşturmayı hedefliyoruz." },
  { label: "PROJE GELİŞTİRME", title: "Araştırma ve Yarışmalar", text: "Öğrencilerin araştırma fikirlerini geliştirmelerine, proje ekipleri oluşturmalarına ve TÜBİTAK ya da Teknofest gibi uygun fırsatları değerlendirmelerine destek olmayı amaçlıyoruz." },
  { label: "İLETİŞİM", title: "Topluluk ve Sektör Buluşmaları", text: "Teknoloji alanındaki gelişmeleri takip ediyor; öğrencilerin birbirleriyle, profesyonellerle ve sektör temsilcileriyle iletişim kurabilecekleri fırsatları önemsiyoruz." },
];

// HSDCode+ platformu kartları
const PLATFORM: InfoItem[] = [
  { icon: BookOpen, accent: "pink", title: "Teknik Bloglar", text: "Yazılım ve teknoloji alanlarındaki içerikleri keşfet, yeni konular öğren ve bilgi paylaşımına katıl.", href: "/blog", cta: "Yazılara git" },
  { icon: ClipboardCheck, accent: "blue", title: "Bilgi Testleri", text: "Testlerle öğrendiklerini pekiştir ve hangi konularda kendini geliştirebileceğini keşfet.", href: "/quiz", cta: "Quizlere git" },
];

// Bölüm başlığı (küçük etiket + başlık + açıklama)
function SectionHead({ label, id, children, text }: { label: string; id: string; children: React.ReactNode; text: string }) {
  return (
    <header className={styles.head}>
      <span className={styles.label}>{label}</span>
      <h2 id={id}>{children}</h2>
      <p>{text}</p>
    </header>
  );
}

// Bilgi kartı
function InfoCard({ item }: { item: InfoItem }) {
  const Icon = item.icon;
  return (
    <li>
      <article className={styles.card} data-accent={item.accent}>
        <div className={styles.icon}>
          <Icon size={22} aria-hidden />
        </div>
        {item.tag && <span className={styles.tag}>{item.tag}</span>}
        <h3>{item.title}</h3>
        <p>{item.text}</p>
        {item.href && (
          <Link href={item.href} className={styles.cardLink}>
            {item.cta}
          </Link>
        )}
      </article>
    </li>
  );
}

export default function AboutPage() {
  return (
    <main>
      {/* ---------- Giriş: genel HSD tanıtımı ---------- */}
      <section className={styles.hero} aria-labelledby="hakkimizda-baslik">
        <div className="container">
          <Badge>Huawei Student Developers</Badge>
          <h1 id="hakkimizda-baslik">
            Geleceğin Teknolojilerini
            <br />
            <span className="gradient-text">Birlikte Keşfediyoruz.</span>
          </h1>
          <p className={styles.lead}>
            Huawei Student Developers (HSD), teknolojiye ilgi duyan öğrencileri öğrenme, üretme ve paylaşma
            etrafında buluşturan küresel bir öğrenci geliştirici programıdır. Teorik bilgiyi uygulamayla
            birleştirmeyi, yeni teknolojileri keşfetmeyi ve öğrencilerin gelişimini desteklemeyi amaçlar.
          </p>
          <div className={styles.buttons}>
            <Button href="#hsd-vizyon">HSD&apos;yi keşfet</Button>
            <Button href="#igu-hsd" variant="outline">İGÜ HSD Gelişim</Button>
          </div>
          <ul className={styles.chips}>
            <li>Öğrenme</li>
            <li>Üretme</li>
            <li>Paylaşma</li>
            <li>Gelişim</li>
          </ul>
        </div>
      </section>

      {/* ---------- HSD'nin vizyonu ---------- */}
      <section id="hsd-vizyon" className={styles.section} aria-labelledby="vizyon-baslik">
        <div className="container">
          <SectionHead
            label="KÜRESEL EKOSİSTEM"
            id="vizyon-baslik"
            text="Huawei'nin geliştirici ekosistemiyle bağlantılı HSD programı, öğrencilerin teknik yeteneklerini geliştirmelerine ve teknoloji topluluklarında deneyim kazanmalarına katkı sağlamayı hedefler."
          >
            HSD&apos;nin <span className="gradient-text">Vizyonu</span>
          </SectionHead>
          <ul className={styles.grid}>
            {VISION.map((item) => (
              <InfoCard key={item.title} item={item} />
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- İGÜ HSD Gelişim ---------- */}
      <section id="igu-hsd" className={styles.section} aria-labelledby="igu-baslik">
        <div className="container">
          <div className={styles.igu}>
            <div className={styles.iguTop}>
              <SectionHead
                label="İGÜ HSD GELİŞİM"
                id="igu-baslik"
                text="İstanbul Gelişim Üniversitesi bünyesindeki HSD Gelişim topluluğunda hedefimiz; öğrencilerin teknolojiye olan ilgilerini geliştirebilecekleri, bilgilerini paylaşabilecekleri ve birlikte projeler üretebilecekleri bir ortam oluşturmaktır."
              >
                Gelişim Kampüsünde <span className="gradient-text">Üretiyoruz.</span>
              </SectionHead>
              <Badge>Öğrenci topluluğu</Badge>
            </div>

            <ul className={styles.iguGrid}>
              {IGU.map((item) => (
                <li key={item.title} className={styles.iguCard}>
                  <span className={styles.miniLabel}>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>

            <p className={styles.disclaimer}>
              Bu bölüm, İGÜ HSD Gelişim&apos;in hedeflerini ve çalışma alanlarını tanıtır. Belirli bir eğitim,
              yarışma, proje veya sektör etkinliği yalnızca gerçekten gerçekleştirildiğinde tamamlanmış
              faaliyet olarak duyurulmalıdır.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- HSDCode+ platformu ---------- */}
      <section id="platform" className={styles.section} aria-labelledby="platform-baslik">
        <div className="container">
          <SectionHead
            label="DİJİTAL ÖĞRENME"
            id="platform-baslik"
            text="HSDCode+, teknik içerikleri ve etkileşimli özellikleri bir araya getirerek öğrencilerin öğrenme süreçlerini desteklemek amacıyla geliştirilen bir platformdur."
          >
            HSDCode+ ile <span className="gradient-text">Bilgini Geliştir.</span>
          </SectionHead>
          <ul className={styles.grid}>
            {PLATFORM.map((item) => (
              <InfoCard key={item.title} item={item} />
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Katılım çağrısı ---------- */}
      <section className={styles.section} aria-labelledby="katil-baslik">
        <div className="container">
          <div className={styles.join}>
            <span className={styles.label}>BİRLİKTE DAHA GÜÇLÜYÜZ</span>
            <h2 id="katil-baslik">
              Üreten Ekibin <span className="gradient-text">Parçası Ol.</span>
            </h2>
            <p>
              Bölümün ne olursa olsun teknolojiye, yazılıma veya yeni fikirler geliştirmeye meraklıysan HSD
              Gelişim&apos;in duyurularını takip ederek topluluk faaliyetlerini keşfedebilirsin.
            </p>
            <Button href="https://www.instagram.com/hsdgelisim/" external>
              HSD Gelişim&apos;i takip et
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
