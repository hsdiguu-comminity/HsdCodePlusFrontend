"use client";
// ---- Giriş yapmış kullanıcıyı okuyan hook ----
// ready=false: tarayıcı henüz kontrol edilmedi (sunucu tarafı çizimi sırasında)
import { useMemo, useSyncExternalStore } from "react";
import { getSessionRaw, parseSession, subscribeAuth } from "@/lib/auth";
import type { Session } from "@/types";

export function useSession(): { session: Session | null; ready: boolean } {
  // Sunucuda "undefined" döner -> henüz hazır değil; tarayıcıda gerçek değer gelir
  const raw = useSyncExternalStore<string | null | undefined>(subscribeAuth, getSessionRaw, () => undefined);
  const session = useMemo(() => (raw ? parseSession(raw) : null), [raw]);
  return { session, ready: raw !== undefined };
}
