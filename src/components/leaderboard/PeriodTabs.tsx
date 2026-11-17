"use client";
// ---- Günlük / Haftalık / Aylık sekmeleri ----
import type { Period } from "@/types";
import styles from "./PeriodTabs.module.css";

const TABS: { value: Period; label: string }[] = [
  { value: "daily", label: "Günlük" },
  { value: "weekly", label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
];

interface PeriodTabsProps {
  value: Period; // seçili dönem
  onChange: (period: Period) => void; // seçim değişince
}

export default function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <div role="tablist" aria-label="Sıralama dönemi" className={styles.tabs}>
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          id={`tab-${tab.value}`}
          aria-selected={value === tab.value}
          aria-controls="rank-panel"
          className={`${styles.tab} ${value === tab.value ? styles.active : ""}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
