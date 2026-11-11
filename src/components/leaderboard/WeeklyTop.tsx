"use client";
// ---- Ana sayfadaki "Haftanın ilk 5'i" ----
// Gerçek quiz sonucu varsa onu gösterir; yoksa örnek (mock) veriyi gösterir.
import { useEffect, useState } from "react";
import { buildLeaderboard } from "@/lib/results";
import type { RankEntry } from "@/types";
import RankTable from "./RankTable";
import styles from "./LeaderboardView.module.css";

export default function WeeklyTop({ sample }: { sample: RankEntry[] }) {
  const [entries, setEntries] = useState<RankEntry[]>(sample);
  const [isSample, setIsSample] = useState(true);

  // Tarayıcıda gerçek sonuçları oku
  useEffect(() => {
    const real = buildLeaderboard("weekly").slice(0, 5);
    if (real.length > 0) {
      setEntries(real);
      setIsSample(false);
    }
  }, []);

  return (
    <>
      <RankTable entries={entries} caption="Bu haftanın en yüksek puanlı beş üyesi" />
      {isSample && <p className={styles.info}>Örnek veri gösteriliyor. Quiz çözdükçe gerçek sıralama burada görünür.</p>}
    </>
  );
}
