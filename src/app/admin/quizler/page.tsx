"use client";
// ---- /admin/quizler: quiz listesi, oluşturma, yayınlama ve silme ----
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QuizForm, { type QuizFormValues } from "@/components/admin/QuizForm";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime, minutesOf } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import type { AdminQuiz } from "@/types";
import styles from "../admin.module.css";

export default function AdminQuizzesPage() {
  const router = useRouter();
  const { data, error, loading, reload } = useApi<{ quizzes: AdminQuiz[] }>("/admin/quizzes");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function create(values: QuizFormValues) {
    setMessage(null);
    try {
      const { quiz } = await api<{ quiz: AdminQuiz }>("/admin/quizzes", { method: "POST", body: values });
      router.push(`/admin/quizler/${quiz.id}`); // soruları eklemek için düzenleme sayfasına git
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  }

  async function run(request: () => Promise<unknown>, okText: string) {
    setMessage(null);
    try {
      await request();
      setMessage({ type: "ok", text: okText });
      reload();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  }

  return (
    <>
      <header className={styles.pageHead}>
        <h1>Quizler</h1>
        <p>Quizler taslak olarak oluşur. Soruları ekledikten sonra yayınla.</p>
      </header>

      <div>
        <button type="button" className={styles.btnPrimary} onClick={() => setCreating((c) => !c)}>
          {creating ? "Vazgeç" : "+ Yeni quiz"}
        </button>
      </div>

      {creating && (
        <section className={styles.card}>
          <h2>Yeni quiz</h2>
          <QuizForm submitLabel="Oluştur ve soruları ekle" onSubmit={create} />
        </section>
      )}

      {message && <p className={message.type === "ok" ? styles.success : styles.error} role={message.type === "ok" ? "status" : "alert"}>{message.text}</p>}

      {loading ? (
        <p role="status">Yükleniyor…</p>
      ) : error ? (
        <p className={styles.error} role="alert">{error}</p>
      ) : !data || data.quizzes.length === 0 ? (
        <div className={styles.card}><p className={styles.empty}>Henüz quiz yok. İlk quizi oluştur.</p></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Quiz</th>
                <th scope="col">Soru / Çözen</th>
                <th scope="col">Süre</th>
                <th scope="col">Durum</th>
                <th scope="col">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {data.quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>
                    <Link href={`/admin/quizler/${quiz.id}`}><strong>{quiz.title}</strong></Link>
                    <br />
                    <span className={styles.muted}>
                      {quiz.category.name}
                      {quiz.startsAt && ` · başlangıç ${formatDateTime(quiz.startsAt)}`}
                      {quiz.endsAt && ` · bitiş ${formatDateTime(quiz.endsAt)}`}
                    </span>
                  </td>
                  <td>
                    {quiz._count.questions} / {quiz._count.attempts}
                  </td>
                  <td>{minutesOf(quiz.timeLimitSec)} dk</td>
                  <td>
                    <span className={quiz.isPublished ? styles.badgeOk : styles.badgeWarn}>{quiz.isPublished ? "Yayında" : "Taslak"}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/quizler/${quiz.id}`} className={styles.btn}>Düzenle</Link>
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
                      {quiz._count.attempts === 0 && (
                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => {
                            if (window.confirm(`"${quiz.title}" ve tüm soruları silinecek. Emin misin?`)) {
                              void run(() => api(`/admin/quizzes/${quiz.id}`, { method: "DELETE" }), "Quiz silindi");
                            }
                          }}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
