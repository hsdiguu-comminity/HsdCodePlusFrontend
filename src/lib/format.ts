// ---- Ortak biçimlendirme yardımcıları ----

// "2 Kasım 2026"
export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "";

// "2 Kasım 14:30"
export const formatDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
    : "";

export const fullName = (person: { firstName: string; lastName: string }) => `${person.firstName} ${person.lastName}`;

// Saniyeyi dakikaya çevirir (yukarı yuvarlar): 90 -> 2
export const minutesOf = (seconds: number) => Math.max(1, Math.ceil(seconds / 60));

// Başarı yüzdesi (örn. 7/10 -> 70)
export const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

export const POST_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Taslak",
  PENDING: "Onay bekliyor",
  APPROVED: "Yayında",
  REJECTED: "Reddedildi",
};

export const USER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Onay bekliyor",
  ACTIVE: "Aktif",
  RESTRICTED: "Kısıtlı",
  BANNED: "Banlı",
};
