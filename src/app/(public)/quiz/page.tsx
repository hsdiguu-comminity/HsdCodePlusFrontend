// ---- /quiz sayfası: tüm quizlerin listesi ----
import type { Metadata } from "next";
import QuizCard from "@/components/quiz/QuizCard";
import { quizList } from "@/mocks/quizzes"; // MOCK: backend gelince API'den
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Quizler" };

export default function QuizListPage() {
  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>
          Bilgini test et, <span className="gradient-text">kendini geliştir.</span>
        </h1>
        <p>Quiz çözmek için üye girişi gerekir. Puanların sıralamaya otomatik eklenir.</p>
      </header>

      <ul className={styles.grid}>
        {quizList.map((quiz) => (
          <li key={quiz.id}>
            <QuizCard quiz={quiz} />
          </li>
        ))}
      </ul>
    </main>
  );
}
