// ---- Alt bilgi: topluluk, sosyal medya ve site bağlantıları ----
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import styles from "./Footer.module.css";

// Sosyal medya ikonlarının SVG yolları (Instagram, LinkedIn, TikTok)
const ICONS = {
  instagram:
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7zm5 3.1a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 2.2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5.1-3.7a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z",
  linkedin:
    "M5.2 3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM3.3 9h3.8v12H3.3V9zm6.2 0h3.6v1.6h.1a4 4 0 0 1 3.6-2c3.9 0 4.6 2.4 4.6 5.5V21h-3.8v-6.1c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V21H9.5V9z",
  tiktok:
    "M19.6 7.2a6.9 6.9 0 0 1-4.2-1.4v8.4a6.1 6.1 0 1 1-6.1-6.1c.4 0 .8 0 1.1.1v3.4a2.8 2.8 0 1 0 1.8 2.6V2h3.3c.3 2.2 1.9 3.9 4.1 4.2v1z",
} as const;

// İGÜ HSD Gelişim hesapları
const COMMUNITY = [
  { label: "Instagram", href: "https://www.instagram.com/hsdgelisim/", icon: ICONS.instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hsdigu/posts/", icon: ICONS.linkedin },
  { label: "TikTok", href: "https://www.tiktok.com/@hsdgelisim", icon: ICONS.tiktok },
];

// HSD ekosistemi bağlantıları (icon yoksa dış bağlantı ikonu gösterilir)
const ECOSYSTEM = [
  { label: "HSD Türkiye LinkedIn", href: "https://tr.linkedin.com/company/hsdturkiye", icon: ICONS.linkedin },
  { label: "Huawei Resmî Sitesi", href: "https://www.huawei.com/", icon: null },
];

// Tek bir sosyal bağlantı satırı
function SocialLink({ label, href, icon }: { label: string; href: string; icon: string | null }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <span className={styles.icon} aria-hidden="true">
        {icon ? (
          <svg viewBox="0 0 24 24">
            <path d={icon} />
          </svg>
        ) : (
          <ExternalLink size={16} />
        )}
      </span>
      {label}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          {/* Platform tanıtımı */}
          <div className={styles.about}>
            <Link href="/" className={styles.logo}>
              HSDCode<span className="gradient-text">+</span>
            </Link>
            <p>
              Öğrenmeyi, üretmeyi ve teknoloji alanında bilgi paylaşımını destekleyen öğrenci odaklı bir
              platform.
            </p>
          </div>

          {/* İGÜ HSD Gelişim sosyal medya */}
          <div>
            <h2 className={styles.colTitle}>HSD Gelişim</h2>
            <ul className={styles.social}>
              {COMMUNITY.map((s) => (
                <li key={s.label}>
                  <SocialLink {...s} />
                </li>
              ))}
            </ul>
          </div>

          {/* HSD ekosistemi */}
          <div>
            <h2 className={styles.colTitle}>HSD Ekosistemi</h2>
            <ul className={styles.social}>
              {ECOSYSTEM.map((s) => (
                <li key={s.label}>
                  <SocialLink {...s} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alt şerit: telif + site bağlantıları */}
        <div className={styles.bottom}>
          <p>© 2026 İGÜ HSD Gelişim · Tüm hakları saklıdır.</p>
          <nav aria-label="Alt menü">
            <ul className={styles.links}>
              <li><Link href="/hakkimizda">Hakkımızda</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/quiz">Quizler</Link></li>
              <li><Link href="/siralama">Sıralama</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
