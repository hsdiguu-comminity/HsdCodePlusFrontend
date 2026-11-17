"use client";
// ---- /admin: genel bakış (bekleyen işler) ----
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import type { AdminQuiz, Paginated } from "@/types";
import styles from "./admin.module.css";

export default function AdminHome() {
  const pendingUsers = useApi<Paginated<unknown>>("/admin/users?status=PENDING&pageSize=1");
  const pendingPosts = useApi<Paginated<unknown>>("/admin/posts?status=PENDING&pageSize=1");
  const quizzes = useApi<{ quizzes: AdminQuiz[] }>("/admin/quizzes");

  const count = (value: number | undefined, loading: boolean) => (loading ? "…" : (value ?? "–"));
  const published = quizzes.data?.quizzes.filter((q) => q.isPublished).length;

  return (
    <>
      <header className={styles.pageHead}>
        <h1>Genel bakış</h1>
        <p>Onay bekleyen işler ve hızlı erişim.</p>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <strong>{count(pendingUsers.data?.total, pendingUsers.loading)}</strong>
          <span>Onay bekleyen üye</span>
          <Link href="/admin/uyeler">Üyelere git →</Link>
        </div>
        <div className={styles.stat}>
          <strong>{count(pendingPosts.data?.total, pendingPosts.loading)}</strong>
          <span>Onay bekleyen yazı</span>
          <Link href="/admin/yazilar">Yazılara git →</Link>
        </div>
        <div className={styles.stat}>
          <strong>{count(published, quizzes.loading)}</strong>
          <span>Yayındaki quiz (toplam {quizzes.data?.quizzes.length ?? "–"})</span>
          <Link href="/admin/quizler">Quizlere git →</Link>
        </div>
      </div>

      {(pendingUsers.error || pendingPosts.error || quizzes.error) && (
        <p className={styles.error} role="alert">
          {pendingUsers.error ?? pendingPosts.error ?? quizzes.error}
        </p>
      )}

      <section className={styles.card}>
        <h2>Hatırlatma</h2>
        <ul className={styles.options}>
          <li>Yeni üyeler onaylanana kadar giriş yapamaz; onaylanınca e-posta ile bilgilendirilir.</li>
          <li>Onaylanan her yazı yazarına puan kazandırır; reddederken gerekçe yazın, yazara gösterilir.</li>
          <li>Quizler taslak olarak oluşur; soruları ekledikten sonra yayınlayın. Çözülmeye başlanan quizin soruları değiştirilemez.</li>
          <li>Tüm yönetici işlemleri &quot;İşlem geçmişi&quot; sayfasına kaydedilir.</li>
        </ul>
      </section>
    </>
  );
}
