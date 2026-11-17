// ---- Ana sayfadaki "Haftanın ilk 5'i" ----
import Button from "@/components/ui/Button";
import type { RankEntry } from "@/types";
import RankTable from "./RankTable";
import styles from "./LeaderboardView.module.css";

export default function WeeklyTop({ entries }: { entries: RankEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Bu hafta henüz puan alan yok</h2>
        <p>Bir quiz çöz, haftanın ilk beşine gir.</p>
        <Button href="/quiz">Quizlere git</Button>
      </div>
    );
  }
  return <RankTable entries={entries} caption="Bu haftanın en yüksek puanlı beş üyesi" />;
}
