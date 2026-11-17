"use client";
// ---- /admin/quizler/[id]: quiz bilgileri ve soru yönetimi ----
import { use, useState } from "react";
import Link from "next/link";
import QuestionForm, { type QuestionFormValues } from "@/components/admin/QuestionForm";
import QuizForm, { type QuizFormValues } from "@/components/admin/QuizForm";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { AdminQuizDetail } from "@/types";
import styles from "../../admin.module.css";

type Message = { type: "ok" | "error"; text: string } | null;

export default function AdminQuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, reload } = useApi<{ quiz: AdminQuizDetail }>(`/admin/quizzes/${id}`);
  const [message, setMessage] = useState<Message>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function run(request: () => Promise<unknown>, okText: string): Promise<boolean> {
    setMessage(null);
    try {
      await request();
      setMessage({ type: "ok", text: okText });
      reload();
      return true;
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
      return false;
    }
  }

  if (loading && !data) return <p role="status">Yükleniyor…</p>;
  if (error && !data) return <p className={styles.error} role="alert">{error}</p>;
  if (!data) return null;

  const { quiz } = data;
  const locked = quiz._count.attempts > 0; // çözülmüş quizin soruları değiştirilemez
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <>
      <header className={styles.pageHead}>
        <p><Link href="/admin/quizler">← Tüm quizler</Link></p>
        <h1>{quiz.title}</h1>
        <p>
          <span className={quiz.isPublished ? styles.badgeOk : styles.badgeWarn}>{quiz.isPublished ? "Yayında" : "Taslak"}</span>{" "}
          {quiz.questions.length} soru · {totalPoints} puan · {quiz._count.attempts} kişi çözdü
        </p>
      </header>

      {message && <p className={message.type === "ok" ? styles.success : styles.error} role={message.type === "ok" ? "status" : "alert"}>{message.text}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className={quiz.isPublished ? styles.btn : styles.btnPrimary}
          onClick={() =>
            run(
              () => api(`/admin/quizzes/${quiz.id}`, { method: "PATCH", body: { isPublished: !quiz.isPublished } }),
              quiz.isPublished ? "Quiz yayından kaldırıldı" : "Quiz yayınlandı",
            )
          }
        >
          {quiz.isPublished ? "Yayından kaldır" : "Yayınla"}
        </button>
        {quiz.isPublished && <Link href={`/quiz/${quiz.id}`} className={styles.btn}>Quiz sayfasını aç</Link>}
      </div>

      <section className={styles.card}>
        <h2>Quiz bilgileri</h2>
        <QuizForm
          key={quiz.id + quiz.title + quiz.timeLimitSec}
          initial={quiz}
          submitLabel="Bilgileri kaydet"
          onSubmit={async (values: QuizFormValues) => {
            await run(() => api(`/admin/quizzes/${quiz.id}`, { method: "PATCH", body: values }), "Quiz bilgileri kaydedildi");
          }}
        />
      </section>

      <section className={styles.card}>
        <h2>Sorular ({quiz.questions.length})</h2>
        {locked && (
          <p className={styles.notice}>
            Bu quiz çözülmeye başlandığı için soruları değiştirilemez (puanlar tutarsız olmasın diye). Bilgileri ve
            yayın durumunu yine de değiştirebilirsin.
          </p>
        )}

        {quiz.questions.length === 0 ? (
          <p className={styles.empty}>Henüz soru yok. Aşağıdan ilk soruyu ekle.</p>
        ) : (
          <ol className={styles.list}>
            {quiz.questions.map((question, index) => (
              <li key={question.id} className={styles.item}>
                {editingId === question.id ? (
                  <QuestionForm
                    initial={question}
                    submitLabel="Soruyu kaydet"
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (values: QuestionFormValues) => {
                      const ok = await run(
                        () => api(`/admin/quizzes/${quiz.id}/questions/${question.id}`, { method: "PATCH", body: { ...values, order: question.order } }),
                        "Soru güncellendi",
                      );
                      if (ok) setEditingId(null);
                      return ok;
                    }}
                  />
                ) : (
                  <>
                    <div className={styles.itemHead}>
                      <strong>
                        {index + 1}. {question.text}
                      </strong>
                      <span className={styles.badge}>{question.points} puan</span>
                    </div>
                    <ul className={styles.options}>
                      {question.options.map((option, i) => (
                        <li key={option.id} className={option.isCorrect ? styles.correct : undefined}>
                          {String.fromCharCode(65 + i)}) {option.text} {option.isCorrect && "✓"}
                        </li>
                      ))}
                    </ul>
                    {question.explanation && <p className={styles.muted}>Açıklama: {question.explanation}</p>}
                    {!locked && (
                      <div className={styles.actions}>
                        <button type="button" className={styles.btn} onClick={() => setEditingId(question.id)}>Düzenle</button>
                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => {
                            if (window.confirm("Bu soru silinecek. Emin misin?")) {
                              void run(() => api(`/admin/quizzes/${quiz.id}/questions/${question.id}`, { method: "DELETE" }), "Soru silindi");
                            }
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {!locked && (
        <section className={styles.card}>
          <h2>Yeni soru ekle</h2>
          <QuestionForm
            submitLabel="Soruyu ekle"
            onSubmit={(values) => run(() => api(`/admin/quizzes/${quiz.id}/questions`, { method: "POST", body: values }), "Soru eklendi")}
          />
        </section>
      )}
    </>
  );
}
