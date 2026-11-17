"use client";
// ---- Giriş yapmış kullanıcıyı okuyan hook ----
// ready=false: oturum henüz backend'den kontrol edilmedi
import { useSyncExternalStore } from "react";
import { getSessionSnapshot, subscribeAuth } from "@/lib/auth";
import type { Session } from "@/types";

export function useSession(): { session: Session | null; ready: boolean } {
  // Sunucuda "undefined" döner -> henüz hazır değil; tarayıcıda /api/auth/me sonucu gelir
  const value = useSyncExternalStore(subscribeAuth, getSessionSnapshot, () => undefined);
  return { session: value ?? null, ready: value !== undefined };
}
