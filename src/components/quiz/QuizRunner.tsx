"use client";
// ---- Quiz çözme akışı: giriş kontrolü -> başlangıç -> sorular -> sonuç ----
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, HelpCircle, Trophy } from "lucide-react";
import RequireAuth from "@/components/auth/RequireAuth";
import { POINTS_PER_QUESTION, saveResult } from "@/lib/results";
import type { QuizDetail, QuizResult, Session } from "@/types";
import ResultScreen from "./ResultScreen";
import Timer from "./Timer";
import styles from "./QuizRunner.module.css";

type Phase = "intro" | "running" | "done"; // başlangıç | çözülüyor | bitti

// Dışarıya açılan bileşen: önce giriş şartını kontrol eder (üye olmayan quiz çözemez)
export default function QuizRunner({ quiz }: { quiz: QuizDetail }) {
  return (
    <RequireAuth message="Quiz çözmek için üye olup giriş yapmalısın.">
      {(session) => <QuizSession quiz={quiz} session={session} />}
    </RequireAuth>
  );
}

// Giriş yapmış kullanıcı için quiz oturumu
function QuizSession({ quiz, session }: { quiz: QuizDetail; session: Session }) {
  const total = quiz.questions.length;

  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0); // şu anki soru sırası
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [warning, setWarning] = useState(""); // "cevap seçmelisin" uyarısı
  const [result, setResult] = useState<QuizResult | null>(null);
  const finished = useRef(false); // sonucun iki kez kaydedilmesini engeller

  // Bir şık seçildiğinde cevabı kaydet
  function selectAnswer(optionIndex: number) {
    setAnswers((prev) => prev.map((a, i) => (i === current ? optionIndex : a)));
    setWarning("");
  }

  // Quizi bitir: puanı hesapla, sonucu kaydet (sıralamaya yansır)
  function finish() {
    if (finished.current) return;
    finished.current = true;

    const correct = quiz.questions.filter((question, i) => answers[i] === question.correctIndex).length;
    const saved = saveResult({
      quizId: quiz.id,
      quizTitle: quiz.title,
      username: session.username,
      name: session.name,
      community: session.community,
      correct,
      total,
      points: correct * POINTS_PER_QUESTION,
    });
    setResult(saved);
    setPhase("done");
  }

  // "Sonraki soru" / "Testi bitir"
  function next() {
    if (answers[current] === null) {
      setWarning("Devam etmek için bir cevap seçmelisin.");
      return;
    }
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setWarning("");
    } else {
      finish();
    }
  }

  // Quizi baştan başlat
  function restart() {
    finished.current = false;
    setAnswers(Array(total).fill(null));
    setCurrent(0);
    setWarning("");
    setResult(null);
    setPhase("intro");
  }

  // ---------- 3) Sonuç ve analiz ----------
  if (phase === "done" && result) {
    return (
      <div className={styles.panel}>
        <ResultScreen quiz={quiz} result={result} answers={answers} onRetry={restart} />
      </div>
    );
  }

  // ---------- 1) Başlangıç ekranı ----------
  if (phase === "intro") {
    return (
      <div className={styles.panel}>
        <Link href="/quiz" className={styles.back}>
          <ArrowLeft size={16} aria-hidden /> Tüm quizler
        </Link>
        <h1 className={styles.title}>{quiz.title}</h1>
        <p className={styles.desc}>{quiz.description}</p>

        <ul className={styles.stats}>
          <li><HelpCircle size={16} aria-hidden /> {quiz.questionCount} soru</li>
          <li><Clock size={16} aria-hidden /> {quiz.durationMin} dakika</li>
          <li><Trophy size={16} aria-hidden /> {quiz.points} puan</li>
        </ul>

        <p className={styles.note}>
          Başlayınca süre durmaz. Süre dolarsa quiz otomatik biter ve verdiğin cevaplar değerlendirilir.
          Sıralamada her quizin en yüksek sonucun sayılır.
        </p>

        <button type="button" className={styles.primary} onClick={() => setPhase("running")}>
          Quizi başlat
        </button>
      </div>
    );
  }

  // ---------- 2) Sorular ----------
  const question = quiz.questions[current];
  const progress = ((current + 1) / total) * 100;

  return (
    <div className={styles.panel}>
      {/* Üst bilgi: başlık, soru sayısı, sayaç */}
      <div className={styles.head}>
        <h1 className={styles.runTitle}>{quiz.title}</h1>
        <span className={styles.count}>
          {current + 1} / {total}
        </span>
        <Timer seconds={quiz.durationMin * 60} onExpire={finish} />
      </div>

      {/* İlerleme çubuğu */}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-label="Quiz ilerlemesi"
      >
        <div className={styles.bar} style={{ width: `${progress}%` }} />
      </div>

      {/* Soru ve şıklar */}
      <fieldset className={styles.question}>
        <legend className={styles.questionText}>
          {current + 1}. {question.text}
        </legend>
        <div className={styles.answers}>
          {question.options.map((option, i) => (
            <label key={option} className={styles.answer}>
              <input
                type="radio"
                name={`soru-${current}`}
                checked={answers[current] === i}
                onChange={() => selectAnswer(i)}
              />
              <span>
                {String.fromCharCode(65 + i)}) {option}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className={styles.warning} role="alert">
        {warning}
      </p>

      {/* Önceki / Sonraki */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setCurrent((c) => c - 1)}
          style={{ visibility: current === 0 ? "hidden" : "visible" }}
        >
          ← Önceki
        </button>
        <button type="button" className={styles.primary} onClick={next}>
          {current === total - 1 ? "Testi bitir ✓" : "Sonraki soru →"}
        </button>
      </div>
    </div>
  );
}
