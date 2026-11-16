// ---- Ana sayfa (/) ----
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PostCard from "@/components/blog/PostCard";
import QuizCard from "@/components/quiz/QuizCard";
import WeeklyTop from "@/components/leaderboard/WeeklyTop";
import { serverApi } from "@/lib/api";
import type { Paginated, PostSummary, QuizSummary, RankEntry } from "@/types";
import styles from "./page.module.css";

// Her istekte güncel veri (build sırasında backend'e bağlanmaya çalışmaz)
export const dynamic = "force-dynamic";

// Bir bölümün verisi gelmezse sayfa çökmesin, o bölüm boş görünsün
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [posts, quizzes, weeklyTop] = await Promise.all([
    safe(serverApi<Paginated<PostSummary>>("/posts?pageSize=3").then((r) => r.items), []),
    safe(serverApi<{ quizzes: QuizSummary[] }>("/quizzes").then((r) => r.quizzes.slice(0, 3)), []),
    safe(serverApi<{ items: RankEntry[] }>("/leaderboard?period=weekly&limit=5").then((r) => r.items), []),
  ]);

  return (
    <main id="anasayfa">
      {/* ---------- HERO ---------- */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>İGÜ-HSD Teknik Topluluk Platformu</p>
          <h1 id="hero-title">
            Hoş geldin <span className="gradient-text">HSDCode+</span>
          </h1>
          <p className={styles.heroText}>
            Teknik bilgini paylaş, quizlerle kendini test et ve haftalık sıralamada yerini al.
            Türkiye&rsquo;nin dört bir yanındaki HSD toplulukları burada buluşuyor.
          </p>
          <div className={styles.heroButtons}>
            <Button href="/quiz">
              Quizleri keşfet <ArrowRight size={16} aria-hidden />
            </Button>
            <Button href="/blog" variant="outline">
              Blog yazılarını incele
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- ÖNE ÇIKAN YAZILAR ---------- */}
      <section className={`${styles.section} ${styles.alt}`} aria-labelledby="posts-title">
        <div className="container">
          <header className={styles.sectionHead}>
            <h2 id="posts-title">Son yazılar</h2>
            <Link href="/blog" className={styles.more}>
              Tüm yazılar <ArrowRight size={15} aria-hidden />
            </Link>
          </header>
          {posts.length === 0 ? (
            <p>Henüz yayınlanmış yazı yok. <Link href="/blog/yeni">İlk yazıyı sen yaz!</Link></p>
          ) : (
            <ul className={styles.grid}>
              {posts.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------- AKTİF QUİZLER ---------- */}
      <section className={styles.section} aria-labelledby="quiz-title">
        <div className="container">
          <header className={styles.sectionHead}>
            <h2 id="quiz-title">Quizler</h2>
            <Link href="/quiz" className={styles.more}>
              Tüm quizler <ArrowRight size={15} aria-hidden />
            </Link>
          </header>
          {quizzes.length === 0 ? (
            <p>Şu an yayında quiz yok. Yakında yenileri eklenecek.</p>
          ) : (
            <ul className={styles.grid}>
              {quizzes.map((q) => (
                <li key={q.id}>
                  <QuizCard quiz={q} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------- HAFTANIN İLK 5'İ ---------- */}
      <section className={`${styles.section} ${styles.alt}`} aria-labelledby="top-title">
        <div className="container">
          <header className={styles.sectionHead}>
            <h2 id="top-title">Haftanın ilk 5&rsquo;i</h2>
            <Link href="/siralama" className={styles.more}>
              Tüm sıralama <ArrowRight size={15} aria-hidden />
            </Link>
          </header>
          <WeeklyTop entries={weeklyTop} />
        </div>
      </section>

      {/* ---------- KATILIM ÇAĞRISI ---------- */}
      <section className={styles.section} aria-labelledby="cta-title">
        <div className="container">
          <div className={styles.cta}>
            <h2 id="cta-title">Teknik topluluğun bir parçası ol</h2>
            <p>Yaz, quiz çöz, puan topla. Quiz çözmek için üye olman yeterli.</p>
            <Button href="/kayit">
              Hemen üye ol <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
