"use client";
// ---- /admin/uyeler: üye onayı, red, kısıtlama, ban ve ban kaldırma ----
import { useState } from "react";
import Link from "next/link";
import Pager from "@/components/admin/Pager";
import { api, errorMessage } from "@/lib/api";
import { formatDate, fullName, USER_STATUS_LABELS } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import type { AdminUser, Paginated, UserStatus } from "@/types";
import styles from "../admin.module.css";

const TABS: { value: UserStatus | ""; label: string }[] = [
  { value: "PENDING", label: "Onay bekleyenler" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "RESTRICTED", label: "Kısıtlı" },
  { value: "BANNED", label: "Banlı" },
  { value: "", label: "Tümü" },
];

const STATUS_BADGE: Record<UserStatus, string> = {
  PENDING: styles.badgeWarn,
  ACTIVE: styles.badgeOk,
  RESTRICTED: styles.badgeWarn,
  BANNED: styles.badgeBad,
};

type Panel = { userId: string; kind: "restrict" | "ban" } | null;

export default function AdminUsersPage() {
  const [status, setStatus] = useState<UserStatus | "">("PENDING");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const params = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) params.set("status", status);
  if (query) params.set("q", query);
  const { data, error, loading, reload } = useApi<Paginated<AdminUser>>(`/admin/users?${params}`);

  async function run(userId: string, action: string, body?: unknown, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(userId);
    setMessage(null);
    try {
      const result = await api<{ message: string }>(`/admin/users/${userId}/${action}`, { method: "POST", body });
      setMessage({ type: "ok", text: result.message });
      setPanel(null);
      reload();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  function changeTab(value: UserStatus | "") {
    setStatus(value);
    setPage(1);
    setPanel(null);
  }

  return (
    <>
      <header className={styles.pageHead}>
        <h1>Üyeler</h1>
        <p>Başvuruları onayla veya reddet; kural ihlallerinde kısıtla ya da banla.</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Üye durumu">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              className={status === tab.value ? styles.tabActive : styles.tab}
              onClick={() => changeTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form
          className={styles.actions}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
            setPage(1);
          }}
        >
          <label htmlFor="uye-ara" className="sr-only">Üye ara</label>
          <input id="uye-ara" className={styles.input} type="search" placeholder="Ad, e-posta, kullanıcı adı…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className={styles.btn}>Ara</button>
        </form>
      </div>

      {message && <p className={message.type === "ok" ? styles.success : styles.error} role={message.type === "ok" ? "status" : "alert"}>{message.text}</p>}

      {loading ? (
        <p role="status">Yükleniyor…</p>
      ) : error ? (
        <p className={styles.error} role="alert">{error}</p>
      ) : !data || data.items.length === 0 ? (
        <div className={styles.card}><p className={styles.empty}>Bu listede üye yok.</p></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Üye</th>
                <th scope="col">Topluluk</th>
                <th scope="col">Durum</th>
                <th scope="col">Kayıt</th>
                <th scope="col">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{fullName(user)}</strong>
                    <br />
                    <span className={styles.muted}>
                      {user.status === "ACTIVE" || user.status === "RESTRICTED" ? <Link href={`/profil/${user.username}`}>@{user.username}</Link> : `@${user.username}`} · {user.email}
                    </span>
                  </td>
                  <td>{user.community.name}</td>
                  <td>
                    <span className={STATUS_BADGE[user.status]}>{USER_STATUS_LABELS[user.status]}</span>
                    {user.role === "ADMIN" && <> <span className={styles.badge}>Yönetici</span></>}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <UserActions
                      user={user}
                      busy={busyId === user.id}
                      panel={panel?.userId === user.id ? panel.kind : null}
                      onPanel={(kind) => setPanel(kind ? { userId: user.id, kind } : null)}
                      onRun={(action, body, confirmText) => run(user.id, action, body, confirmText)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </>
  );
}

function UserActions({
  user,
  busy,
  panel,
  onPanel,
  onRun,
}: {
  user: AdminUser;
  busy: boolean;
  panel: "restrict" | "ban" | null;
  onPanel: (kind: "restrict" | "ban" | null) => void;
  onRun: (action: string, body?: unknown, confirmText?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("");

  if (user.role === "ADMIN") return <span className={styles.muted}>—</span>;

  if (user.status === "PENDING") {
    return (
      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} disabled={busy} onClick={() => onRun("approve")}>Onayla</button>
        <button type="button" className={styles.btnDanger} disabled={busy} onClick={() => onRun("reject", undefined, `${fullName(user)} adlı kişinin başvurusu reddedilip silinecek. Emin misin?`)}>
          Reddet
        </button>
      </div>
    );
  }

  const submitPanel = (e: React.FormEvent) => {
    e.preventDefault();
    const numberOfDays = days.trim() ? Number(days) : null;
    if (panel === "restrict") onRun("restrict", { reason, days: numberOfDays });
    else onRun("ban", { reason, days: numberOfDays }, numberOfDays ? undefined : `${fullName(user)} kalıcı olarak banlanacak. Emin misin?`);
  };

  return (
    <>
      <div className={styles.actions}>
        {(user.status === "ACTIVE" || user.status === "RESTRICTED") && (
          <button type="button" className={styles.btn} disabled={busy} onClick={() => onPanel(panel === "restrict" ? null : "restrict")}>Kısıtla</button>
        )}
        {user.status !== "BANNED" && (
          <button type="button" className={styles.btnDanger} disabled={busy} onClick={() => onPanel(panel === "ban" ? null : "ban")}>Banla</button>
        )}
        {(user.status === "RESTRICTED" || user.status === "BANNED") && (
          <button type="button" className={styles.btnPrimary} disabled={busy} onClick={() => onRun("unban")}>Cezayı kaldır</button>
        )}
      </div>
      {panel && (
        <form className={styles.inlineForm} onSubmit={submitPanel}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`gerekce-${user.id}`}>Gerekçe</label>
            <input id={`gerekce-${user.id}`} className={styles.input} required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`gun-${user.id}`}>{panel === "restrict" ? "Süre (gün)" : "Süre (gün, boşsa kalıcı)"}</label>
            <input id={`gun-${user.id}`} className={styles.input} type="number" min={1} required={panel === "restrict"} value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
          <button type="submit" className={panel === "ban" ? styles.btnDanger : styles.btnPrimary} disabled={busy}>
            {panel === "restrict" ? "Kısıtla" : "Banla"}
          </button>
        </form>
      )}
    </>
  );
}
