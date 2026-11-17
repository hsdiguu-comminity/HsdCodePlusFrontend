// ---- Sayfalama (bağlantı tabanlı, sunucu sayfalarında da çalışır) ----
import Link from "next/link";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  href: (page: number) => string; // sayfa numarasından adres üretir
}

export default function Pagination({ page, totalPages, href }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label="Sayfalar">
      {page > 1 ? (
        <Link href={href(page - 1)} className={styles.link}>← Önceki</Link>
      ) : (
        <span className={styles.disabled}>← Önceki</span>
      )}
      <span className={styles.current} aria-current="page">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={styles.link}>Sonraki →</Link>
      ) : (
        <span className={styles.disabled}>Sonraki →</span>
      )}
    </nav>
  );
}
