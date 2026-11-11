"use client";
// ---- /dashboard: kullanıcının puanı ve quiz analizleri (giriş gerekli) ----
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import Button from "@/components/ui/Button";
import { logout } from "@/lib/auth";
import { getUserResults, percentOf, summarizeByQuiz } from "@/lib/results";
import type { Session } from "@/types";
import styles from "./page.module.css";

// Tarihi "2 Kasım 14:30" biçiminde göster
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function DashboardPage() {
  return (
    <main className={`container ${styles.page}`}>
      <RequireAuth message="Panelini görmek için giriş yapmalısın.">
        {(session) => <DashboardContent session={session} />}
      </RequireAuth>
    </main>
  );
}

function DashboardContent({ session }: { session: Session }) {
  const router = useRouter();

  // Bu kullanıcının sonuçları ve quiz bazında özetleri
  const results = useMemo(() => getUserResults(session.username), [session.username]);
  const summaries = useMemo(() => summarizeByQuiz(results), [results]);

  // Genel istatistikler
  const totalPoints = summaries.reduce((sum, s) => sum + s.best.points, 0); // her quizin en iyisi
  const avgPercent = results.length
    ? Math.round(results.reduce((sum, r) => sum + percentOf(r), 0) / results.length)
    : 0;

  // Güçlü ve zayıf konu: ortalama başarıya göre
  const sorted = [...summaries].sort((a, b) => b.avgPercent - a.avgPercent);
  const strongest = sorted[0];
  const weakest = sorted.length > 1 ? sorted[sorted.length - 1] : null;

  // Son 5 deneme
  const recent = [...results].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <>
      {/* Üst bilgi */}
      <header className={styles.head}>
        <div>
          <h1>Merhaba, {session.name}</h1>
          <p>{session.community}</p>
        </div>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          Çıkış yap
        </button>
      </header>

      {/* Genel istatistik kutuları */}
      <dl className={styles.stats}>
        <div><dt>Toplam puan</dt><dd>{totalPoints}</dd></div>
        <div><dt>Çözülen quiz</dt><dd>{summaries.length}</dd></div>
        <div><dt>Toplam deneme</dt><dd>{results.length}</dd></div>
        <div><dt>Ortalama başarı</dt><dd>%{avgPercent}</dd></div>
      </dl>

      {results.length === 0 || !strongest ? (
        // Boş durum
        <div className={styles.empty}>
          <h2>Henüz quiz çözmedin</h2>
          <p>İlk quizini çöz, analizlerin burada görünsün.</p>
          <Button href="/quiz">Quizlere git</Button>
        </div>
      ) : (
        <>
          {/* Güçlü / gelişime açık konu */}
          <section aria-labelledby="analiz-baslik" className={styles.block}>
            <h2 id="analiz-baslik">Analiz</h2>
            <ul className={styles.insights}>
              <li>
                <strong>En güçlü konun:</strong> {strongest.quizTitle} (ortalama %{strongest.avgPercent})
              </li>
              {weakest && (
                <li>
                  <strong>Gelişime açık konun:</strong> {weakest.quizTitle} (ortalama %{weakest.avgPercent}){" "}
                  <Link href={`/quiz/${weakest.quizId}`}>Tekrar çöz</Link>
                </li>
              )}
            </ul>
          </section>

          {/* Quiz bazında tablo */}
          <section aria-labelledby="quiz-baslik" className={styles.block}>
            <h2 id="quiz-baslik">Quiz sonuçların</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Quiz</th>
                    <th scope="col">Deneme</th>
                    <th scope="col">En iyi</th>
                    <th scope="col">Ortalama</th>
                    <th scope="col">Son deneme</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => (
                    <tr key={s.quizId}>
                      <td><Link href={`/quiz/${s.quizId}`}>{s.quizTitle}</Link></td>
                      <td>{s.attempts}</td>
                      <td>{s.best.correct}/{s.best.total} ({s.best.points} puan)</td>
                      <td>%{s.avgPercent}</td>
                      <td>{formatDate(s.lastDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Son denemeler */}
          <section aria-labelledby="son-baslik" className={styles.block}>
            <h2 id="son-baslik">Son denemeler</h2>
            <ul className={styles.recent}>
              {recent.map((r) => (
                <li key={r.id}>
                  <span>{r.quizTitle}</span>
                  <span>{r.correct}/{r.total} · %{percentOf(r)}</span>
                  <time dateTime={r.date}>{formatDate(r.date)}</time>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
