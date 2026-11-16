"use client";
// ---- Quiz çözme akışı: giriş kontrolü -> başlangıç -> sorular -> sonuç ----
// Sorular "başlat" ile sunucudan alınır, puan sunucuda hesaplanır.
// Her quiz bir kez çözülür; çözülmüş quizde doğrudan sonuç gösterilir.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, HelpCircle, Trophy } from "lucide-react";
import RequireAuth from "@/components/auth/RequireAuth";
import { api, ApiError, errorMessage } from "@/lib/api";
import { minutesOf } from "@/lib/format";
import type { QuizDetail, QuizResult, QuizSummary, StartedQuiz } from "@/types";
import ResultScreen from "./ResultScreen";
import Timer from "./Timer";
import styles from "./QuizRunner.module.css";

type Phase =
  | { name: "loading" }
  | { name: "intro"; inProgress: boolean }
  | { name: "running"; started: StartedQuiz }
  | { name: "done"; result: QuizResult; note?: string };

export default function QuizRunner({ quiz }: { quiz: QuizSummary }) {
  return (
    <RequireAuth message="Quiz çözmek için üye olup giriş yapmalısın.">
      {() => <QuizSession quiz={quiz} />}
    </RequireAuth>
  );
}

function QuizSession({ quiz }: { quiz: QuizSummary }) {
  const [phase, setPhase] = useState<Phase>({ name: "loading" });
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitted = useRef(false); // cevapların iki kez gönderilmesini engeller

  const showResult = useCallback(async (note?: string) => {
    const result = await api<QuizResult>(`/quizzes/${quiz.id}/result`);
    setPhase({ name: "done", result, note });
  }, [quiz.id]);

  // Kullanıcının bu quizdeki durumunu öğren (çözmüş mü, yarıda mı bırakmış?)
  useEffect(() => {
    api<{ quiz: QuizDetail }>(`/quizzes/${quiz.id}`)
      .then(({ quiz: detail }) => {
        if (detail.myAttempt?.finishedAt) return showResult("Bu quizi daha önce çözdün. Sonucun aşağıda.");
        setPhase({ name: "intro", inProgress: detail.myAttempt !== null });
      })
      .catch((err) => {
        setError(errorMessage(err));
        setPhase({ name: "intro", inProgress: false });
      });
  }, [quiz.id, showResult]);

  async function start() {
    setBusy(true);
    setError("");
    try {
      const started = await api<StartedQuiz>(`/quizzes/${quiz.id}/start`, { method: "POST" });
      submitted.current = false;
      setPhase({ name: "running", started });
    } catch (err) {
      if (err instanceof ApiError && (err.code === "ALREADY_ATTEMPTED" || err.code === "TIME_UP")) {
        await showResult(err.message).catch(() => setError(err.message));
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  }

  const finish = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setBusy(true);
    try {
      const payload = Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId }));
      const result = await api<QuizResult>(`/quizzes/${quiz.id}/submit`, { method: "POST", body: { answers: payload } });
      setPhase({ name: "done", result });
    } catch (err) {
      if (err instanceof ApiError && (err.code === "TIME_UP" || err.code === "ALREADY_SUBMITTED")) {
        await showResult(err.message).catch(() => setError(err.message));
      } else {
        submitted.current = false; // ağ hatasında tekrar denenebilsin
        setError(errorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  }, [answers, quiz.id, showResult]);

  // ---------- Yükleniyor ----------
  if (phase.name === "loading") {
    return <p className={styles.note} role="status">Yükleniyor…</p>;
  }

  // ---------- Sonuç ----------
  if (phase.name === "done") {
    return (
      <div className={styles.panel}>
        <ResultScreen result={phase.result} note={phase.note} />
      </div>
    );
  }

  // ---------- Başlangıç ekranı ----------
  if (phase.name === "intro") {
    const closed = !phase.inProgress && quiz.status !== "ACTIVE";
    return (
      <div className={styles.panel}>
        <Link href="/quiz" className={styles.back}>
          <ArrowLeft size={16} aria-hidden /> Tüm quizler
        </Link>
        <h1 className={styles.title}>{quiz.title}</h1>
        {quiz.description && <p className={styles.desc}>{quiz.description}</p>}

        <ul className={styles.stats}>
          <li><HelpCircle size={16} aria-hidden /> {quiz.questionCount} soru</li>
          <li><Clock size={16} aria-hidden /> {minutesOf(quiz.timeLimitSec)} dakika</li>
          <li><Trophy size={16} aria-hidden /> {quiz.totalPoints} puan</li>
        </ul>

        <p className={styles.note}>
          Her quiz yalnızca <strong>bir kez</strong> çözülebilir. Başlayınca süre durmaz; sayfayı yenilesen de
          süre işlemeye devam eder. Süre dolarsa o ana kadar verdiğin cevaplar gönderilir. Bitirince doğru
          cevapları ve açıklamaları görebilirsin.
        </p>

        {error && <p className={styles.warning} role="alert">{error}</p>}

        {closed ? (
          <p className={styles.warning}>
            {quiz.status === "UPCOMING" ? "Bu quiz henüz başlamadı." : "Bu quizin süresi sona erdi."}
          </p>
        ) : (
          <button type="button" className={styles.primary} onClick={start} disabled={busy}>
            {busy ? "Hazırlanıyor…" : phase.inProgress ? "Kaldığın yerden devam et" : "Quizi başlat"}
          </button>
        )}
      </div>
    );
  }

  // ---------- Sorular ----------
  const { started } = phase;
  const total = started.questions.length;
  const question = started.questions[current];
  const progress = ((current + 1) / total) * 100;

  function next() {
    if (!answers[question.id]) {
      setWarning("Devam etmek için bir cevap seçmelisin.");
      return;
    }
    setWarning("");
    if (current < total - 1) setCurrent((c) => c + 1);
    else void finish();
  }

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <h1 className={styles.runTitle}>{started.quiz.title}</h1>
        <span className={styles.count}>
          {current + 1} / {total}
        </span>
        <Timer expiresAt={started.expiresAt} onExpire={finish} />
      </div>

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

      <fieldset className={styles.question}>
        <legend className={styles.questionText}>
          {current + 1}. {question.text}
        </legend>
        <div className={styles.answers}>
          {question.options.map((option, i) => (
            <label key={option.id} className={styles.answer}>
              <input
                type="radio"
                name={`soru-${question.id}`}
                checked={answers[question.id] === option.id}
                onChange={() => {
                  setAnswers((prev) => ({ ...prev, [question.id]: option.id }));
                  setWarning("");
                }}
              />
              <span>
                {String.fromCharCode(65 + i)}) {option.text}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className={styles.warning} role="alert">
        {warning || error}
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setCurrent((c) => c - 1)}
          style={{ visibility: current === 0 ? "hidden" : "visible" }}
        >
          ← Önceki
        </button>
        <button type="button" className={styles.primary} onClick={next} disabled={busy}>
          {current === total - 1 ? (busy ? "Gönderiliyor…" : "Testi bitir ✓") : "Sonraki soru →"}
        </button>
      </div>
    </div>
  );
}
