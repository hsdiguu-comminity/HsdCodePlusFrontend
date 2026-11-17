"use client";
// ---- /blog/yeni: yazı oluşturma (giriş gerekli) ----
import RequireAuth from "@/components/auth/RequireAuth";
import PostEditor from "@/components/blog/PostEditor";
import styles from "../page.module.css";

export default function NewPostPage() {
  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>
          Yeni <span className="gradient-text">yazı</span>
        </h1>
        <p>Teknik bilgini Markdown ile yaz. Yazın yönetici onayından sonra yayınlanır ve sana puan kazandırır.</p>
      </header>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <RequireAuth message="Yazı yazmak için giriş yapmalısın.">{() => <PostEditor />}</RequireAuth>
      </div>
    </main>
  );
}
