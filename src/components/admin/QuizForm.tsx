"use client";
// ---- Quiz bilgileri formu (oluşturma ve düzenleme) ----
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { AdminQuiz, Category } from "@/types";
import styles from "@/app/admin/admin.module.css";

export type QuizFormValues = {
  title: string;
  description: string | null;
  categoryId: string;
  timeLimitSec: number;
  startsAt: string | null;
  endsAt: string | null;
};

// ISO tarih <-> datetime-local kutusu ("2026-11-20T14:30")
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

export default function QuizForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: AdminQuiz;
  submitLabel: string;
  onSubmit: (values: QuizFormValues) => Promise<void>;
}) {
  const categories = useApi<{ categories: Category[] }>("/categories");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category.id ?? "");
  const [minutes, setMinutes] = useState(String(initial ? Math.round(initial.timeLimitSec / 60) : 10));
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.startsAt ?? null));
  const [endsAt, setEndsAt] = useState(toLocalInput(initial?.endsAt ?? null));
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      categoryId,
      timeLimitSec: Math.round(Number(minutes) * 60),
      startsAt: fromLocalInput(startsAt),
      endsAt: fromLocalInput(endsAt),
    });
    setBusy(false);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="quiz-baslik">Başlık</label>
        <input id="quiz-baslik" className={styles.input} required minLength={3} maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="quiz-aciklama">Açıklama (isteğe bağlı)</label>
        <textarea id="quiz-aciklama" className={styles.textarea} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="quiz-kategori">Kategori</label>
          <select id="quiz-kategori" className={styles.select} required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Seç</option>
            {(categories.data?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="quiz-sure">Süre (dakika)</label>
          <input id="quiz-sure" className={styles.input} type="number" required min={1} max={180} step={0.5} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="quiz-baslangic">Başlangıç (isteğe bağlı)</label>
          <input id="quiz-baslangic" className={styles.input} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="quiz-bitis">Bitiş (isteğe bağlı)</label>
          <input id="quiz-bitis" className={styles.input} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
      </div>
      <p className={styles.hint}>Başlangıç/bitiş boş bırakılırsa quiz yayınlandığı andan itibaren süresiz açık kalır.</p>
      <div>
        <button type="submit" className={styles.btnPrimary} disabled={busy}>
          {busy ? "Kaydediliyor…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
