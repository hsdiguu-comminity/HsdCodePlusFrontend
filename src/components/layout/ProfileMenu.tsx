"use client";
// ---- Sağ üstteki "Profilim" menüsü (sadece giriş yapılmışsa görünür) ----
// Tıklayınca açılır: ad soyad, e-posta, HSD topluluğu + Profil / Panel / Çıkış bağlantıları.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { logout } from "@/lib/auth";
import type { Session } from "@/types";
import styles from "./ProfileMenu.module.css";

export default function ProfileMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false); // menü açık mı?
  const wrapRef = useRef<HTMLDivElement>(null); // dışarı tıklamayı anlamak için
  const router = useRouter();

  // Menü açıkken: menünün dışına tıklanırsa ya da Esc tuşuna basılırsa kapat
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Çıkış: oturumu sil, ana sayfaya dön
  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/");
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {/* Menüyü açan düğme */}
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <User size={18} aria-hidden />
        <span className={styles.label}>Profilim</span>
        <ChevronDown size={16} aria-hidden className={open ? styles.rotated : undefined} />
      </button>

      {open && (
        <div className={styles.panel} role="menu">
          {/* Üye bilgileri: ad soyad, e-posta ve HSD üyeliği (kayıtta yazılan topluluk) */}
          <div className={styles.info}>
            <strong>{session.name}</strong>
            <span className={styles.email}>{session.email}</span>
            <span className={styles.badge}>HSD: {session.community}</span>
          </div>

          <Link href="/profilim" role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
            <Settings size={16} aria-hidden /> Profilim ve ayarlar
          </Link>
          <Link href="/dashboard" role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
            <LayoutDashboard size={16} aria-hidden /> Panelim
          </Link>
          <button type="button" role="menuitem" className={`${styles.item} ${styles.danger}`} onClick={handleLogout}>
            <LogOut size={16} aria-hidden /> Çıkış yap
          </button>
        </div>
      )}
    </div>
  );
}
