"use client";
// ---- Yönetim paneli düzeni: yan menü + içerik (yalnızca yöneticiler) ----
// Not: Asıl yetki kontrolü backend'dedir; admin olmayanların /api/admin/* istekleri 403 döner.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderTree, History, LayoutDashboard, ListChecks, Users } from "lucide-react";
import RequireAuth from "@/components/auth/RequireAuth";
import styles from "./admin.module.css";

const LINKS = [
  { href: "/admin", label: "Genel bakış", icon: LayoutDashboard },
  { href: "/admin/uyeler", label: "Üyeler", icon: Users },
  { href: "/admin/yazilar", label: "Yazılar", icon: FileText },
  { href: "/admin/quizler", label: "Quizler", icon: ListChecks },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/islem-gecmisi", label: "İşlem geçmişi", icon: History },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <main className="container">
      <RequireAuth admin message="Yönetim paneline girmek için giriş yapmalısın.">
        {() => (
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <p className={styles.sidebarTitle}>Yönetim</p>
              <nav aria-label="Yönetim menüsü">
                <ul className={styles.nav}>
                  {LINKS.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={isActive(href) ? styles.navActive : styles.navLink}
                        aria-current={isActive(href) ? "page" : undefined}
                      >
                        <Icon size={16} aria-hidden /> {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
            <div className={styles.content}>{children}</div>
          </div>
        )}
      </RequireAuth>
    </main>
  );
}
