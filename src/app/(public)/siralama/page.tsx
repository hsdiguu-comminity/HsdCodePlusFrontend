// ---- /siralama sayfası ----
import type { Metadata } from "next";
import LeaderboardView from "@/components/leaderboard/LeaderboardView";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Sıralama" };

export default function LeaderboardPage() {
  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>
          Liderlik <span className="gradient-text">Tablosu</span>
        </h1>
        <p>Quizlerde topladığın puanlarla sıralamadaki yerini takip et.</p>
      </header>
      <LeaderboardView />
    </main>
  );
}
