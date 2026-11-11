// ---- /blog sayfası: yazı listesi (şimdilik örnek veri) ----
import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import home from "@/mocks/home.json"; // MOCK: backend gelince API'den
import type { Post } from "@/types";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Blog" };

const posts = home.posts as Post[];

export default function BlogListPage() {
  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>
          Teknik <span className="gradient-text">Blog</span>
        </h1>
        <p>HSD topluluğunun teknik yazıları. Kategori filtresi, arama ve yazı oluşturma sonraki aşamada eklenecek.</p>
      </header>

      <ul className={styles.grid}>
        {posts.map((p) => (
          <li key={p.id}>
            <PostCard post={p} />
          </li>
        ))}
      </ul>
    </main>
  );
}
