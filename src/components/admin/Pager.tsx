// ---- Yönetim paneli için basit sayfalama (buton tabanlı) ----
import styles from "@/app/admin/admin.module.css";

export default function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.pager}>
      <button type="button" className={styles.btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Önceki
      </button>
      <span className={styles.muted}>
        {page} / {totalPages}
      </span>
      <button type="button" className={styles.btn} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Sonraki →
      </button>
    </div>
  );
}
