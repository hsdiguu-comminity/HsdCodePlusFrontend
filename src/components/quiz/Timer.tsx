"use client";
// ---- Quiz geri sayım sayacı ----
// Süre, sunucunun verdiği bitiş zamanına (expiresAt) göre hesaplanır;
// sayfa yenilense bile kalan süre doğru görünür. Süre bitince onExpire çağrılır.
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import styles from "./Timer.module.css";

interface TimerProps {
  expiresAt: string; // ISO tarih
  onExpire: () => void;
}

const secondsLeft = (expiresAt: string) => Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));

export default function Timer({ expiresAt, onExpire }: TimerProps) {
  const [left, setLeft] = useState(() => secondsLeft(expiresAt));

  // onExpire'ın her zaman en güncel hâli saklanır (eski cevapları kullanmasın diye)
  const expireRef = useRef(onExpire);
  useEffect(() => {
    expireRef.current = onExpire;
  });

  useEffect(() => {
    const id = setInterval(() => setLeft(secondsLeft(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    if (left <= 0) expireRef.current();
  }, [left]);

  const text = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  return (
    <span className={`${styles.timer} ${left <= 30 ? styles.low : ""}`} role="timer" aria-label={`Kalan süre ${text}`}>
      <Clock size={16} aria-hidden /> {text}
    </span>
  );
}
