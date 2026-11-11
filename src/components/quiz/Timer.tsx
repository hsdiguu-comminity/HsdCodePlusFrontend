"use client";
// ---- Quiz geri sayım sayacı ----
// Süre bitince onExpire fonksiyonunu çağırır.
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import styles from "./Timer.module.css";

interface TimerProps {
  seconds: number; // toplam süre (saniye)
  onExpire: () => void; // süre bitince çalışacak fonksiyon
}

export default function Timer({ seconds, onExpire }: TimerProps) {
  const [left, setLeft] = useState(seconds);

  // onExpire'ın her zaman en güncel hâli saklanır (eski cevapları kullanmasın diye)
  const expireRef = useRef(onExpire);
  useEffect(() => {
    expireRef.current = onExpire;
  });

  // Her saniye 1 azalt
  useEffect(() => {
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Süre bitti mi?
  useEffect(() => {
    if (left <= 0) expireRef.current();
  }, [left]);

  // 00:00 biçiminde göster
  const safe = Math.max(left, 0);
  const text = `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;

  return (
    <span className={`${styles.timer} ${left <= 30 ? styles.low : ""}`} role="timer" aria-label={`Kalan süre ${text}`}>
      <Clock size={16} aria-hidden /> {text}
    </span>
  );
}
