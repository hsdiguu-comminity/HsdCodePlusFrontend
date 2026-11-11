// ---- Ana sayfa (/) ----
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PostCard from "@/components/blog/PostCard";
import QuizCard from "@/components/quiz/QuizCard";
import WeeklyTop from "@/components/leaderboard/WeeklyTop";
import home from "@/mocks/home.json"; // MOCK veri: backend gelince API'den çekilecek
import type { Post, Quiz, RankEntry } from "@/types";
import styles from "./page.module.css";

const posts = home.posts as Post[];
const quizzes = home.quizzes as Quiz[];
const sampleTop = home.weeklyTop as RankEntry[];

export default function HomePage() {
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
            <h2 id="posts-title">Öne çıkan yazılar</h2>
            <Link href="/blog" className={styles.more}>
              Tüm yazılar <ArrowRight size={15} aria-hidden />
            </Link>
          </header>
          <ul className={styles.grid}>
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- AKTİF QUİZLER ---------- */}
      <section className={styles.section} aria-labelledby="quiz-title">
        <div className="container">
          <header className={styles.sectionHead}>
            <h2 id="quiz-title">Aktif quizler</h2>
            <Link href="/quiz" className={styles.more}>
              Tüm quizler <ArrowRight size={15} aria-hidden />
            </Link>
          </header>
          <ul className={styles.grid}>
            {quizzes.map((q) => (
              <li key={q.id}>
                <QuizCard quiz={q} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- HAFTANIN İLK 5'İ (gerçek sonuç varsa onu, yoksa örnek veriyi gösterir) ---------- */}
      <section className={`${styles.section} ${styles.alt}`} aria-labelledby="top-title">
        <div className="container">
          <header className={styles.sectionHead}>
            <h2 id="top-title">Haftanın ilk 5&rsquo;i</h2>
            <Link href="/siralama" className={styles.more}>
              Tüm sıralama <ArrowRight size={15} aria-hidden />
            </Link>
          </header>
          <WeeklyTop sample={sampleTop} />
        </div>
      </section>

      {/* ---------- KATILIM ÇAĞRISI: "Hemen üye ol" -> /kayit ---------- */}
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
