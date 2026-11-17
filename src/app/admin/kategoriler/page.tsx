"use client";
// ---- /admin/kategoriler: kategori ekleme, yeniden adlandırma ve silme ----
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { AdminCategory } from "@/types";
import styles from "../admin.module.css";

export default function AdminCategoriesPage() {
  const { data, error, loading, reload } = useApi<{ categories: AdminCategory[] }>("/admin/categories");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function run(request: () => Promise<unknown>, okText: string) {
    setMessage(null);
    try {
      await request();
      setMessage({ type: "ok", text: okText });
      reload();
      return true;
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
      return false;
    }
  }

  return (
    <>
      <header className={styles.pageHead}>
        <h1>Kategoriler</h1>
        <p>Blog yazıları ve quizler bu kategorilere ayrılır. İçinde yazı veya quiz olan kategori silinemez.</p>
      </header>

      <section className={styles.card}>
        <h2>Yeni kategori</h2>
        <form
          className={styles.inlineForm}
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run(() => api("/admin/categories", { method: "POST", body: { name } }), "Kategori eklendi")) setName("");
          }}
        >
          <div className={styles.field} style={{ flex: 1 }}>
            <label className={styles.label} htmlFor="kategori-adi">Kategori adı</label>
            <input id="kategori-adi" className={styles.input} required minLength={2} maxLength={50} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button type="submit" className={styles.btnPrimary}>Ekle</button>
        </form>
        <p className={styles.hint}>Adres (slug) addan otomatik üretilir: &quot;Siber Güvenlik&quot; → siber-guvenlik</p>
      </section>

      {message && <p className={message.type === "ok" ? styles.success : styles.error} role={message.type === "ok" ? "status" : "alert"}>{message.text}</p>}

      {loading ? (
        <p role="status">Yükleniyor…</p>
      ) : error ? (
        <p className={styles.error} role="alert">{error}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Kategori</th>
                <th scope="col">Adres</th>
                <th scope="col">Yazı / Quiz</th>
                <th scope="col">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {(data?.categories ?? []).map((category) => (
                <tr key={category.id}>
                  <td>
                    {editing?.id === category.id ? (
                      <form
                        className={styles.actions}
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (await run(() => api(`/admin/categories/${category.id}`, { method: "PATCH", body: { name: editing.name } }), "Kategori güncellendi")) {
                            setEditing(null);
                          }
                        }}
                      >
                        <label htmlFor={`kat-${category.id}`} className="sr-only">Yeni ad</label>
                        <input id={`kat-${category.id}`} className={styles.input} required minLength={2} maxLength={50} value={editing.name} onChange={(e) => setEditing({ id: category.id, name: e.target.value })} />
                        <button type="submit" className={styles.btnPrimary}>Kaydet</button>
                        <button type="button" className={styles.btn} onClick={() => setEditing(null)}>Vazgeç</button>
                      </form>
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className={styles.muted}>{category.slug}</td>
                  <td>
                    {category._count.posts} / {category._count.quizzes}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.btn} onClick={() => setEditing({ id: category.id, name: category.name })}>Yeniden adlandır</button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        disabled={category._count.posts + category._count.quizzes > 0}
                        title={category._count.posts + category._count.quizzes > 0 ? "İçinde yazı veya quiz var" : undefined}
                        onClick={() => {
                          if (window.confirm(`"${category.name}" kategorisi silinecek. Emin misin?`)) {
                            void run(() => api(`/admin/categories/${category.id}`, { method: "DELETE" }), "Kategori silindi");
                          }
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
