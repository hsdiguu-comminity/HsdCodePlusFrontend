// ---- /quiz sayfası: yayındaki quizler (kategori filtresiyle) ----
import type { Metadata } from "next";
import QuizCard from "@/components/quiz/QuizCard";
import FilterChips from "@/components/ui/FilterChips";
import { serverApi } from "@/lib/api";
import type { Category, QuizSummary } from "@/types";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Quizler" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ category?: string }> };

export default async function QuizListPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [{ quizzes }, { categories }] = await Promise.all([
    serverApi<{ quizzes: QuizSummary[] }>(category ? `/quizzes?category=${encodeURIComponent(category)}` : "/quizzes"),
    serverApi<{ categories: Category[] }>("/categories"),
  ]);

  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>
          Bilgini test et, <span className="gradient-text">kendini geliştir.</span>
        </h1>
        <p>Quiz çözmek için üye girişi gerekir. Her quiz bir kez çözülür; puanların sıralamaya otomatik eklenir.</p>
      </header>

      <FilterChips basePath="/quiz" categories={categories} active={category} />

      {quizzes.length === 0 ? (
        <p>{category ? "Bu kategoride yayında quiz yok." : "Şu an yayında quiz yok."}</p>
      ) : (
        <ul className={styles.grid}>
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <QuizCard quiz={quiz} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
