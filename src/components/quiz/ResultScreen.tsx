// ---- Quiz sonuç ve analiz ekranı ----
import Link from "next/link";
import { percentOf } from "@/lib/results";
import type { QuizDetail, QuizResult } from "@/types";
import styles from "./ResultScreen.module.css";

interface ResultScreenProps {
  quiz: QuizDetail;
  result: QuizResult; // kaydedilmiş sonuç
  answers: (number | null)[]; // kullanıcının seçtiği şıklar (boşsa null)
  onRetry: () => void; // "tekrar çöz" butonu
}

export default function ResultScreen({ quiz, result, answers, onRetry }: ResultScreenProps) {
  const percent = percentOf(result);
  const blank = answers.filter((a) => a === null).length; // boş bırakılanlar (süre dolunca olabilir)
  const wrong = result.total - result.correct - blank;

  // Başarıya göre kısa değerlendirme
  const message =
    percent >= 90
      ? "Harika! Konuya çok iyi hâkimsin."
      : percent >= 70
        ? "Çok iyi! Biraz daha pratikle ilerleyebilirsin."
        : percent >= 50
          ? "Güzel bir başlangıç. Açıklamaları inceleyebilirsin."
          : "Öğrenmeye devam et; tekrar deneyerek gelişebilirsin.";

  return (
    <section className={styles.result} aria-labelledby="sonuc-baslik">
      <h2 id="sonuc-baslik">
        Sonucun: {result.correct} / {result.total}
      </h2>
      <p className={styles.message}>
        {message} Kazandığın puan: <strong>{result.points}</strong>
      </p>

      {/* Özet kutuları */}
      <dl className={styles.stats}>
        <div><dt>Başarı oranı</dt><dd>%{percent}</dd></div>
        <div><dt>Doğru</dt><dd>{result.correct}</dd></div>
        <div><dt>Yanlış</dt><dd>{wrong}</dd></div>
        <div><dt>Boş</dt><dd>{blank}</dd></div>
      </dl>

      <p className={styles.note}>
        Sıralamada her quizin <strong>en yüksek</strong> sonucun sayılır. Tekrar çözmek puanını düşürmez.
      </p>

      {/* Soru soru analiz */}
      <h3 className={styles.reviewTitle}>Cevaplarını incele</h3>
      <ol className={styles.review}>
        {quiz.questions.map((question, i) => {
          const given = answers[i];
          const isCorrect = given === question.correctIndex;
          return (
            <li key={question.text} className={`${styles.item} ${isCorrect ? styles.ok : styles.bad}`}>
              <p className={styles.question}>
                {i + 1}. {question.text}
              </p>
              <p>
                Senin cevabın: {given === null ? "Boş bıraktın" : question.options[given]}{" "}
                <span className={styles.badge}>{isCorrect ? "Doğru" : "Yanlış"}</span>
              </p>
              {!isCorrect && <p>Doğru cevap: {question.options[question.correctIndex]}</p>}
              <p className={styles.explain}>{question.explanation}</p>
            </li>
          );
        })}
      </ol>

      {/* Yönlendirmeler */}
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onRetry}>
          Quizi yeniden çöz
        </button>
        <Link href="/siralama" className={styles.secondary}>Sıralamayı gör</Link>
        <Link href="/dashboard" className={styles.secondary}>Analizlerim</Link>
      </div>
    </section>
  );
}
