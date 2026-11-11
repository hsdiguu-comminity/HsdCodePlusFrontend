// ---- Sıralama tablosu ----
import Link from "next/link";
import type { RankEntry } from "@/types";
import styles from "./RankTable.module.css";

export default function RankTable({ entries, caption }: { entries: RankEntry[]; caption: string }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Sıra</th>
            <th scope="col">Ad Soyad</th>
            <th scope="col" className={styles.community}>HSD topluluğu</th>
            <th scope="col" className={styles.points}>Puan</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.username} className={e.rank === 1 ? styles.first : undefined}>
              <td className={styles.rank}>{e.rank}</td>
              <td><Link href={`/profil/${e.username}`}>{e.name}</Link></td>
              <td className={styles.community}>{e.community}</td>
              <td className={styles.points}>{e.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
