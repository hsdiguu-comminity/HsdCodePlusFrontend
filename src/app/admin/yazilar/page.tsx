"use client";
// ---- /admin/yazilar: yazı onayı / reddi (gerekçeyle) ve silme ----
import { useState } from "react";
import Link from "next/link";
import MarkdownView from "@/components/blog/MarkdownView";
import Pager from "@/components/admin/Pager";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime, fullName, POST_STATUS_LABELS } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import type { AdminPost, Paginated, PostStatus } from "@/types";
import styles from "../admin.module.css";

const TABS: { value: PostStatus; label: string }[] = [
  { value: "PENDING", label: "Onay bekleyenler" },
  { value: "APPROVED", label: "Yayında" },
  { value: "REJECTED", label: "Reddedilenler" },
];

export default function AdminPostsPage() {
  const [status, setStatus] = useState<PostStatus>("PENDING");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const { data, error, loading, reload } = useApi<Paginated<AdminPost>>(`/admin/posts?status=${status}&page=${page}`);

  async function run(request: () => Promise<{ message: string }>) {
    setMessage(null);
    try {
      const result = await request();
      setMessage({ type: "ok", text: result.message });
      reload();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  }

  return (
    <>
      <header className={styles.pageHead}>
        <h1>Yazılar</h1>
        <p>Gönderilen yazıları incele. Onaylanan yazı yayınlanır ve yazarına puan kazandırır.</p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Yazı durumu">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={status === tab.value}
            className={status === tab.value ? styles.tabActive : styles.tab}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && <p className={message.type === "ok" ? styles.success : styles.error} role={message.type === "ok" ? "status" : "alert"}>{message.text}</p>}

      {loading ? (
        <p role="status">Yükleniyor…</p>
      ) : error ? (
        <p className={styles.error} role="alert">{error}</p>
      ) : !data || data.items.length === 0 ? (
        <div className={styles.card}><p className={styles.empty}>Bu listede yazı yok.</p></div>
      ) : (
        <ul className={styles.list}>
          {data.items.map((post) => (
            <PostReview
              key={post.id}
              post={post}
              onApprove={() => run(() => api(`/admin/posts/${post.id}/approve`, { method: "POST" }))}
              onReject={(reason) => run(() => api(`/admin/posts/${post.id}/reject`, { method: "POST", body: { reason } }))}
              onDelete={() => {
                if (window.confirm(`"${post.title}" kalıcı olarak silinecek. Emin misin?`)) {
                  void run(() => api(`/posts/${post.id}`, { method: "DELETE" }));
                }
              }}
            />
          ))}
        </ul>
      )}

      {data && <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </>
  );
}

function PostReview({
  post,
  onApprove,
  onReject,
  onDelete,
}: {
  post: AdminPost;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(post.status === "PENDING");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  return (
    <li className={styles.item}>
      <div className={styles.itemHead}>
        <div>
          <strong>{post.title}</strong>
          <p className={styles.muted}>
            {fullName(post.author)} (@{post.author.username}) · {post.category.name} · {formatDateTime(post.createdAt)} ·{" "}
            {POST_STATUS_LABELS[post.status]}
          </p>
          {post.rejectReason && <p className={styles.muted}>Red gerekçesi: {post.rejectReason}</p>}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={() => setOpen((o) => !o)}>
            {open ? "İçeriği gizle" : "İçeriği göster"}
          </button>
          {post.status === "PENDING" && (
            <>
              <button type="button" className={styles.btnPrimary} disabled={busy} onClick={() => act(onApprove)}>Onayla</button>
              <button type="button" className={styles.btnDanger} disabled={busy} onClick={() => setRejecting((r) => !r)}>Reddet</button>
            </>
          )}
          {post.status === "APPROVED" && <Link href={`/blog/${post.slug}`} className={styles.btn}>Yazıyı aç</Link>}
          <button type="button" className={styles.btn} disabled={busy} onClick={onDelete}>Sil</button>
        </div>
      </div>

      {rejecting && (
        <form
          className={styles.inlineForm}
          onSubmit={(e) => {
            e.preventDefault();
            void act(() => onReject(reason));
          }}
        >
          <div className={styles.field} style={{ flex: 1 }}>
            <label className={styles.label} htmlFor={`red-${post.id}`}>Red gerekçesi (yazara gösterilir)</label>
            <textarea id={`red-${post.id}`} className={styles.textarea} required minLength={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <button type="submit" className={styles.btnDanger} disabled={busy}>Reddet</button>
        </form>
      )}

      {open && (
        <div className={styles.preview}>
          {post.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- yönetici önizlemesi
            <img src={post.coverUrl} alt="" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} />
          )}
          <MarkdownView content={post.contentMd} />
        </div>
      )}
    </li>
  );
}
