"use client";
// ---- Sıralama görünümü: dönemi seçtir, o dönemin sıralamasını backend'den göster ----
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useApi } from "@/lib/useApi";
import type { Period, RankEntry } from "@/types";
import PeriodTabs from "./PeriodTabs";
import RankTable from "./RankTable";
import styles from "./LeaderboardView.module.css";

const CAPTIONS: Record<Period, string> = {
  daily: "Bugünün sıralaması",
  weekly: "Bu haftanın sıralaması",
  monthly: "Bu ayın sıralaması",
};

export default function LeaderboardView() {
  const [period, setPeriod] = useState<Period>("weekly");
  const { data, error, loading } = useApi<{ items: RankEntry[] }>(`/leaderboard?period=${period}`);

  return (
    <div>
      <PeriodTabs value={period} onChange={setPeriod} />

      <div role="tabpanel" id="rank-panel" aria-labelledby={`tab-${period}`}>
        {loading ? (
          <p className={styles.state} role="status">Yükleniyor…</p>
        ) : error ? (
          <p className={styles.state} role="alert">{error}</p>
        ) : !data || data.items.length === 0 ? (
          <div className={styles.empty}>
            <h2>Bu dönemde henüz puan alan yok</h2>
            <p>İlk quizi çözen sen ol ve sıralamada yerini al.</p>
            <Button href="/quiz">Quizlere git</Button>
          </div>
        ) : (
          <RankTable entries={data.items} caption={CAPTIONS[period]} />
        )}
      </div>

      <p className={styles.info}>
        Puanlar quizlerden ve onaylanan blog yazılarından gelir. Günlük, haftalık ve aylık dönemler Türkiye
        saatine göre hesaplanır (hafta pazartesi başlar).
      </p>
    </div>
  );
}
