"use client";
// ---- Soru formu: metin, açıklama, puan ve 2-6 şık (tam bir doğru) ----
import { useState } from "react";
import type { AdminQuestion } from "@/types";
import styles from "@/app/admin/admin.module.css";

export type QuestionFormValues = {
  text: string;
  explanation: string | null;
  points: number;
  options: { text: string; isCorrect: boolean }[];
};

export default function QuestionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: AdminQuestion;
  submitLabel: string;
  onSubmit: (values: QuestionFormValues) => Promise<boolean>; // true dönerse form temizlenir
  onCancel?: () => void;
}) {
  const [text, setText] = useState(initial?.text ?? "");
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [points, setPoints] = useState(String(initial?.points ?? 10));
  const [options, setOptions] = useState(
    initial?.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) ?? [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  );
  const [busy, setBusy] = useState(false);

  const updateOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, text: value } : o)));
  const markCorrect = (index: number) => setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index })));
  const removeOption = (index: number) =>
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.some((o) => o.isCorrect)) next[0] = { ...next[0], isCorrect: true };
      return next;
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const done = await onSubmit({
      text: text.trim(),
      explanation: explanation.trim() || null,
      points: Number(points),
      options: options.map((o) => ({ ...o, text: o.text.trim() })),
    });
    setBusy(false);
    if (done && !initial) {
      setText("");
      setExplanation("");
      setOptions(options.map((_, i) => ({ text: "", isCorrect: i === 0 })));
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`soru-${initial?.id ?? "yeni"}`}>Soru</label>
        <textarea id={`soru-${initial?.id ?? "yeni"}`} className={styles.textarea} required minLength={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <fieldset className={styles.field} style={{ border: 0, padding: 0 }}>
        <legend className={styles.label}>Şıklar (doğru olanı işaretle)</legend>
        {options.map((option, i) => (
          <div key={i} className={styles.optionRow}>
            <input
              type="radio"
              name={`dogru-${initial?.id ?? "yeni"}`}
              checked={option.isCorrect}
              onChange={() => markCorrect(i)}
              aria-label={`${String.fromCharCode(65 + i)} şıkkı doğru`}
            />
            <input
              className={styles.input}
              required
              maxLength={500}
              placeholder={`${String.fromCharCode(65 + i)} şıkkı`}
              value={option.text}
              onChange={(e) => updateOption(i, e.target.value)}
            />
            {options.length > 2 && (
              <button type="button" className={styles.btn} onClick={() => removeOption(i)} aria-label={`${String.fromCharCode(65 + i)} şıkkını sil`}>
                ✕
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <div>
            <button type="button" className={styles.btn} onClick={() => setOptions((prev) => [...prev, { text: "", isCorrect: false }])}>
              + Şık ekle
            </button>
          </div>
        )}
      </fieldset>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`puan-${initial?.id ?? "yeni"}`}>Puan</label>
          <input id={`puan-${initial?.id ?? "yeni"}`} className={styles.input} type="number" required min={1} max={1000} value={points} onChange={(e) => setPoints(e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`aciklama-${initial?.id ?? "yeni"}`}>Açıklama (isteğe bağlı)</label>
        <textarea
          id={`aciklama-${initial?.id ?? "yeni"}`}
          className={styles.textarea}
          maxLength={2000}
          placeholder="Quiz bitince doğru cevapla birlikte gösterilir."
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={busy}>
          {busy ? "Kaydediliyor…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={styles.btn} onClick={onCancel}>
            Vazgeç
          </button>
        )}
      </div>
    </form>
  );
}
