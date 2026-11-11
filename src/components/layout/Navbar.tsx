"use client";
// ---- Üst menü (sayfa kaydırılırken sabit kalır) ----
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSession } from "@/lib/useSession";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
import styles from "./Navbar.module.css";

// Menü bağlantıları (soldan sağa bu sırayla görünür)
// Navbar app/layout.tsx içinde olduğu için TÜM sayfalarda aynı yerde sabit durur;
// böylece Hakkımızda'yı okuyan biri geri tuşuna basmadan doğrudan Quiz'e geçebilir.
const LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/blog", label: "Blog" },
  { href: "/quiz", label: "Quiz" },
  { href: "/siralama", label: "Sıralama" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false); // mobil menü açık mı?
  const pathname = usePathname();
  const { session, ready } = useSession(); // giriş durumu

  // Bulunulan sayfa menüde vurgulanır
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.inner}`} aria-label="Ana menü">
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          HSDCode<span className="gradient-text">+</span>
        </Link>

        {/* Mobil menü butonu */}
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.menuBtn}`}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>

        {/* Sayfa bağlantıları */}
        <ul id="nav-links" className={`${styles.links} ${open ? styles.open : ""}`}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={isActive(l.href) ? styles.active : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Sağ taraf: tema + giriş durumuna göre: girişliyse "Profilim" menüsü, değilse giriş/kayıt */}
        <div className={styles.actions}>
          <ThemeToggle />
          {ready &&
            (session ? (
              <ProfileMenu session={session} />
            ) : (
              <>
                <Button href="/giris" variant="outline" className={styles.hideSm}>
                  Giriş yap
                </Button>
                <Button href="/kayit">Kayıt ol</Button>
              </>
            ))}
        </div>
      </nav>
    </header>
  );
}
