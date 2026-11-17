"use client";
// ---- /dashboard: kullanıcının puanları, sıralaması, quiz geçmişi ve yazıları (giriş gerekli) ----
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import Button from "@/components/ui/Button";
import { logout } from "@/lib/auth";
import { formatDateTime, POST_STATUS_LABELS } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import type { Dashboard, Session } from "@/types";
import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <main className={`container ${styles.page}`}>
      <RequireAuth message="Panelini görmek için giriş yapmalısın.">
        {(session) => <DashboardContent session={session} />}
      </RequireAuth>
    </main>
  );
}

const rankText = (rank: number | null) => (rank ? `${rank}.` : "–");

function DashboardContent({ session }: { session: Session }) {
  const router = useRouter();
  const { data, error, loading } = useApi<Dashboard>("/users/me/dashboard");

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1>Merhaba, {session.name}</h1>
          <p>
            {session.community?.name}
            {session.status === "RESTRICTED" && " · Hesabın kısıtlı: şu an yazı gönderemezsin."}
          </p>
        </div>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          Çıkış yap
        </button>
      </header>

      {loading ? (
        <p role="status">Yükleniyor…</p>
      ) : error || !data ? (
        <p role="alert">{error ?? "Panel bilgileri alınamadı."}</p>
      ) : (
        <>
          <dl className={styles.stats}>
            <div><dt>Toplam puan</dt><dd>{data.points.total}</dd></div>
            <div><dt>Bu hafta</dt><dd>{data.points.weekly} puan</dd></div>
            <div><dt>Haftalık sıra</dt><dd>{rankText(data.rankings.weekly)}</dd></div>
            <div><dt>Çözülen quiz</dt><dd>{data.quizzes.completed}</dd></div>
          </dl>

          <section aria-labelledby="analiz-baslik" className={styles.block}>
            <h2 id="analiz-baslik">Özet</h2>
            <ul className={styles.insights}>
              <li>
                <strong>Sıralamadaki yerin:</strong> bugün {rankText(data.rankings.daily)}, bu hafta{" "}
                {rankText(data.rankings.weekly)}, bu ay {rankText(data.rankings.monthly)}{" "}
                <Link href="/siralama">Sıralamayı gör</Link>
              </li>
              {data.quizzes.completed > 0 && (
                <li>
                  <strong>Quiz performansın:</strong> ortalama {data.quizzes.averageScore} puan, en yüksek{" "}
                  {data.quizzes.highestScore} puan
                </li>
              )}
              <li>
                <strong>Yazıların:</strong> {data.posts.approved} yayında, {data.posts.pending} onay bekliyor,{" "}
                {data.posts.rejected} reddedildi <Link href="/blog/yeni">Yeni yazı yaz</Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="quiz-baslik" className={styles.block}>
            <h2 id="quiz-baslik">Son çözdüğün quizler</h2>
            {data.quizzes.recent.length === 0 ? (
              <div className={styles.empty}>
                <h3>Henüz quiz çözmedin</h3>
                <p>İlk quizini çöz, sonuçların burada görünsün.</p>
                <Button href="/quiz">Quizlere git</Button>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Quiz</th>
                      <th scope="col">Kategori</th>
                      <th scope="col">Puan</th>
                      <th scope="col">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quizzes.recent.map((attempt) => (
                      <tr key={attempt.quiz.id}>
                        <td><Link href={`/quiz/${attempt.quiz.id}`}>{attempt.quiz.title}</Link></td>
                        <td>{attempt.quiz.category.name}</td>
                        <td>{attempt.score}</td>
                        <td>{formatDateTime(attempt.finishedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-labelledby="yazi-baslik" className={styles.block}>
            <h2 id="yazi-baslik">Yazıların</h2>
            {data.posts.recent.length === 0 ? (
              <div className={styles.empty}>
                <h3>Henüz yazı göndermedin</h3>
                <p>Teknik bilgini paylaş; yazın onaylanınca puan kazanırsın.</p>
                <Button href="/blog/yeni">Yazı yaz</Button>
              </div>
            ) : (
              <ul className={styles.recent}>
                {data.posts.recent.map((post) => (
                  <li key={post.id}>
                    <span>
                      {post.status === "APPROVED" ? <Link href={`/blog/${post.slug}`}>{post.title}</Link> : post.title}
                      {post.status === "REJECTED" && post.rejectReason && (
                        <>
                          <br />
                          <small>Red gerekçesi: {post.rejectReason}</small>
                        </>
                      )}
                    </span>
                    <span>{POST_STATUS_LABELS[post.status]}</span>
                    <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
