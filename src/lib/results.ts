// ---- GEÇİCİ sonuç kaydı ve sıralama hesabı (localStorage) ----
// Backend hazır olunca: saveResult -> POST /api/quiz/:id/submit, buildLeaderboard -> GET /api/leaderboard
import type { Period, QuizResult, RankEntry } from "@/types";

const RESULTS_KEY = "hsdcode-results";

// Her doğru cevap kaç puan? (quiz toplam puanı da buradan hesaplanır)
export const POINTS_PER_QUESTION = 10;

// Başarı yüzdesi (örn. 7/10 -> 70)
export const percentOf = (r: Pick<QuizResult, "correct" | "total">): number =>
  Math.round((r.correct / r.total) * 100);

// Kayıtlı tüm sonuçları okur
export function getResults(): QuizResult[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? (JSON.parse(raw) as QuizResult[]) : [];
  } catch {
    return [];
  }
}

// Yeni bir sonucu kaydeder ve kaydedilmiş hâlini döner
export function saveResult(input: Omit<QuizResult, "id" | "date">): QuizResult {
  const result: QuizResult = {
    ...input,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    date: new Date().toISOString(),
  };
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify([...getResults(), result]));
  } catch {
    /* depolama kapalıysa sonuç kaydedilemez, ekranda yine gösterilir */
  }
  return result;
}

// Profilde ad / topluluk değişince eski sonuç kayıtlarındaki ad da güncellenir
// (sıralama tablosu adı bu kayıtlardan okuduğu için gereklidir)
export function updateResultsIdentity(username: string, name: string, community: string): void {
  try {
    const updated = getResults().map((r) => (r.username === username ? { ...r, name, community } : r));
    localStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
  } catch {
    /* depolama kapalıysa güncellenemez; sorun değil */
  }
}

// Tek bir kullanıcının sonuçları
export function getUserResults(username: string): QuizResult[] {
  return getResults().filter((r) => r.username === username);
}

// Dönemin başlangıç zamanı: günlük = bugün 00:00, haftalık = son 7 gün, aylık = son 30 gün
function periodStart(period: Period): number {
  if (period === "daily") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  const days = period === "weekly" ? 7 : 30;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

// Sıralama: her kullanıcının HER QUİZDEKİ EN YÜKSEK puanı toplanır
// (aynı quizi tekrar tekrar çözerek puan şişirmeyi engeller)
export function buildLeaderboard(period: Period): RankEntry[] {
  const since = periodStart(period);

  // 1) kullanıcı + quiz başına en iyi sonucu bul
  const best = new Map<string, QuizResult>();
  for (const r of getResults()) {
    if (new Date(r.date).getTime() < since) continue; // dönem dışı
    const key = `${r.username}|${r.quizId}`;
    const current = best.get(key);
    if (!current || r.points > current.points) best.set(key, r);
  }

  // 2) kullanıcı başına puanları topla
  const totals = new Map<string, { name: string; community: string; points: number }>();
  for (const r of best.values()) {
    const t = totals.get(r.username) ?? { name: r.name, community: r.community, points: 0 };
    t.points += r.points;
    totals.set(r.username, t);
  }

  // 3) puana göre sırala ve sıra numarası ver
  return [...totals.entries()]
    .map(([username, t]) => ({ username, name: t.name, community: t.community, points: t.points, rank: 0 }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "tr"))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

// Panel analizi için: quiz bazında özet
export interface QuizSummary {
  quizId: string;
  quizTitle: string;
  attempts: number; // kaç kez çözüldü
  best: QuizResult; // en iyi sonuç
  lastDate: string; // son deneme tarihi
  avgPercent: number; // ortalama başarı %
}

export function summarizeByQuiz(results: QuizResult[]): QuizSummary[] {
  // sonuçları quizId'ye göre grupla
  const groups = new Map<string, QuizResult[]>();
  for (const r of results) groups.set(r.quizId, [...(groups.get(r.quizId) ?? []), r]);

  return [...groups.values()].map((list) => {
    const best = list.reduce((a, b) => (b.points > a.points ? b : a));
    const last = list.reduce((a, b) => (b.date > a.date ? b : a));
    const avg = Math.round(list.reduce((sum, r) => sum + percentOf(r), 0) / list.length);
    return {
      quizId: best.quizId,
      quizTitle: best.quizTitle,
      attempts: list.length,
      best,
      lastDate: last.date,
      avgPercent: avg,
    };
  });
}
