"use client";
// ---- /admin/islem-gecmisi: yönetici işlemlerinin kaydı (audit log) ----
import { useState } from "react";
import Pager from "@/components/admin/Pager";
import { formatDateTime, fullName } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import type { AuditLog, Paginated } from "@/types";
import styles from "../admin.module.css";

const ACTION_LABELS: Record<string, string> = {
  USER_APPROVE: "Üyelik onaylandı",
  USER_REJECT: "Başvuru reddedildi",
  USER_RESTRICT: "Üye kısıtlandı",
  USER_BAN: "Üye banlandı",
  USER_UNBAN: "Ceza kaldırıldı",
  POST_APPROVE: "Yazı onaylandı",
  POST_REJECT: "Yazı reddedildi",
  QUIZ_CREATE: "Quiz oluşturuldu",
  QUIZ_UPDATE: "Quiz güncellendi",
  QUIZ_PUBLISH: "Quiz yayınlandı",
  QUIZ_UNPUBLISH: "Quiz yayından kaldırıldı",
  QUIZ_DELETE: "Quiz silindi",
  QUESTION_CREATE: "Soru eklendi",
  QUESTION_UPDATE: "Soru güncellendi",
  QUESTION_DELETE: "Soru silindi",
  CATEGORY_CREATE: "Kategori eklendi",
  CATEGORY_UPDATE: "Kategori güncellendi",
  CATEGORY_DELETE: "Kategori silindi",
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, error, loading } = useApi<Paginated<AuditLog>>(`/admin/audit-logs?page=${page}&pageSize=30`);

  return (
    <>
      <header className={styles.pageHead}>
        <h1>İşlem geçmişi</h1>
        <p>Yöneticilerin yaptığı tüm onay, red, ban ve içerik işlemleri burada kayıtlıdır.</p>
      </header>

      {loading ? (
        <p role="status">Yükleniyor…</p>
      ) : error ? (
        <p className={styles.error} role="alert">{error}</p>
      ) : !data || data.items.length === 0 ? (
        <div className={styles.card}><p className={styles.empty}>Henüz kayıtlı işlem yok.</p></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Tarih</th>
                <th scope="col">Yönetici</th>
                <th scope="col">İşlem</th>
                <th scope="col">Hedef</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{fullName(log.admin)}</td>
                  <td>{ACTION_LABELS[log.action] ?? log.action}</td>
                  <td className={styles.muted}>
                    {log.targetType} · {log.targetId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </>
  );
}
