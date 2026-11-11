"use client";
// ---- Üye profili (herkese açık özet) ----
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserResults, percentOf, summarizeByQuiz } from "@/lib/results";
import type { QuizResult } from "@/types";
import styles from "./ProfileView.module.css";

export default function ProfileView({ username }: { username: string }) {
  // null = henüz okunmadı
  const [results, setResults] = useState<QuizResult[] | null>(null);

  useEffect(() => {
    setResults(getUserResults(username));
  }, [username]);

  if (results === null) return <p className={styles.state} role="status">Yükleniyor…</p>;

  // Hiç sonucu yoksa kısa bilgi
  if (results.length === 0) {
    return (
      <div className={styles.box}>
        <h1>@{username}</h1>
        <p>Bu üye henüz quiz çözmemiş ya da profil bu tarayıcıda bulunamadı.</p>
        <Link href="/siralama" className={styles.link}>Sıralamaya dön</Link>
      </div>
    );
  }

  const summaries = summarizeByQuiz(results);
  const totalPoints = summaries.reduce((sum, s) => sum + s.best.points, 0);
  const { name, community } = results[0];

  return (
    <div className={styles.box}>
      <h1>{name}</h1>
      <p>
        @{username} · {community}
      </p>
      <dl className={styles.stats}>
        <div><dt>Toplam puan</dt><dd>{totalPoints}</dd></div>
        <div><dt>Çözülen quiz</dt><dd>{summaries.length}</dd></div>
      </dl>
      <ul className={styles.list}>
        {summaries.map((s) => (
          <li key={s.quizId}>
            <span>{s.quizTitle}</span>
            <span>
              {s.best.correct}/{s.best.total} · %{percentOf(s.best)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
