"use client";
// ---- Sıralama görünümü: dönemi seçtir, o dönemin sıralamasını göster ----
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { buildLeaderboard } from "@/lib/results";
import type { Period, RankEntry } from "@/types";
import PeriodTabs from "./PeriodTabs";
import RankTable from "./RankTable";
import styles from "./LeaderboardView.module.css";

const CAPTIONS: Record<Period, string> = {
  daily: "Bugünün sıralaması",
  weekly: "Son 7 günün sıralaması",
  monthly: "Son 30 günün sıralaması",
};

export default function LeaderboardView() {
  const [period, setPeriod] = useState<Period>("weekly");
  // null = henüz hesaplanmadı (tarayıcı verisi okunuyor)
  const [entries, setEntries] = useState<RankEntry[] | null>(null);

  // Dönem değişince sıralamayı yeniden hesapla (veri tarayıcıda olduğu için effect içinde)
  useEffect(() => {
    setEntries(buildLeaderboard(period));
  }, [period]);

  return (
    <div>
      <PeriodTabs value={period} onChange={setPeriod} />

      <div role="tabpanel" id="rank-panel" aria-labelledby={`tab-${period}`}>
        {entries === null ? (
          <p className={styles.state} role="status">Yükleniyor…</p>
        ) : entries.length === 0 ? (
          // Boş durum: henüz kimse quiz çözmemiş
          <div className={styles.empty}>
            <h2>Bu dönemde henüz sonuç yok</h2>
            <p>İlk quizi çözen sen ol ve sıralamada yerini al.</p>
            <Button href="/quiz">Quizlere git</Button>
          </div>
        ) : (
          <RankTable entries={entries} caption={CAPTIONS[period]} />
        )}
      </div>

      <p className={styles.info}>
        Puan, her kullanıcının her quizdeki en yüksek sonucu toplanarak hesaplanır. Sıralama şimdilik bu
        tarayıcıdaki kayıtlardan oluşur.
      </p>
    </div>
  );
}
