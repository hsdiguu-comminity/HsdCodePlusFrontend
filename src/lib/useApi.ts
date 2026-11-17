"use client";
// ---- Client component'lerde GET isteği için küçük hook ----
// Kullanım: const { data, error, loading, reload } = useApi<Tip>("/leaderboard?period=weekly");
// path null verilirse istek atılmaz (ör. kullanıcı henüz yüklenmediyse).
import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false; // sayfa değişirse eski cevabı yok say
    setLoading(true);
    setError(null);
    api<T>(path)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, error, loading, reload };
}
