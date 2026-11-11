// ---- Ortak kart kutusu ----
import styles from "./Card.module.css";

export default function Card({ children }: { children: React.ReactNode }) {
  return <article className={styles.card}>{children}</article>;
}
