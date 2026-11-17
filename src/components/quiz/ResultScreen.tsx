// ---- Quiz sonuç ve analiz ekranı ----
// Doğru cevaplar ve açıklamalar sunucudan, quiz bittikten sonra gelir.
import Link from "next/link";
import { percent } from "@/lib/format";
import type { QuizResult } from "@/types";
import styles from "./ResultScreen.module.css";

export default function ResultScreen({ result, note }: { result: QuizResult; note?: string }) {
  const rate = percent(result.correctCount, result.questionCount);
  const blank = result.questions.filter((q) => q.selectedOptionId === null).length;
  const wrong = result.questionCount - result.correctCount - blank;

  const message =
    rate >= 90
      ? "Harika! Konuya çok iyi hâkimsin."
      : rate >= 70
        ? "Çok iyi! Biraz daha pratikle ilerleyebilirsin."
        : rate >= 50
          ? "Güzel bir başlangıç. Açıklamaları inceleyebilirsin."
          : "Öğrenmeye devam et; açıklamalar konuyu pekiştirmene yardımcı olur.";

  return (
    <section className={styles.result} aria-labelledby="sonuc-baslik">
      {note && <p className={styles.note}>{note}</p>}
      <h2 id="sonuc-baslik">
        {result.quiz.title}: {result.correctCount} / {result.questionCount}
      </h2>
      <p className={styles.message}>
        {message} Kazandığın puan: <strong>{result.score}</strong> / {result.totalPoints}
      </p>

      <dl className={styles.stats}>
        <div><dt>Başarı oranı</dt><dd>%{rate}</dd></div>
        <div><dt>Doğru</dt><dd>{result.correctCount}</dd></div>
        <div><dt>Yanlış</dt><dd>{wrong}</dd></div>
        <div><dt>Boş</dt><dd>{blank}</dd></div>
      </dl>

      <h3 className={styles.reviewTitle}>Cevaplarını incele</h3>
      <ol className={styles.review}>
        {result.questions.map((question, i) => {
          const given = question.options.find((o) => o.id === question.selectedOptionId);
          const correct = question.options.find((o) => o.id === question.correctOptionId);
          return (
            <li key={question.id} className={`${styles.item} ${question.isCorrect ? styles.ok : styles.bad}`}>
              <p className={styles.question}>
                {i + 1}. {question.text}
              </p>
              <p>
                Senin cevabın: {given ? given.text : "Boş bıraktın"}{" "}
                <span className={styles.badge}>{question.isCorrect ? "Doğru" : "Yanlış"}</span>
              </p>
              {!question.isCorrect && correct && <p>Doğru cevap: {correct.text}</p>}
              {question.explanation && <p className={styles.explain}>{question.explanation}</p>}
            </li>
          );
        })}
      </ol>

      <div className={styles.actions}>
        <Link href="/quiz" className={styles.primary}>Diğer quizler</Link>
        <Link href="/siralama" className={styles.secondary}>Sıralamayı gör</Link>
        <Link href="/dashboard" className={styles.secondary}>Panelim</Link>
      </div>
    </section>
  );
}
