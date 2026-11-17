// ---- /blog sayfası: yazı listesi (kategori filtresi, arama, sayfalama) ----
import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import Button from "@/components/ui/Button";
import FilterChips from "@/components/ui/FilterChips";
import Pagination from "@/components/ui/Pagination";
import { serverApi } from "@/lib/api";
import type { Category, Paginated, PostSummary } from "@/types";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ category?: string; q?: string; page?: string }> };

export default async function BlogListPage({ searchParams }: Props) {
  const { category, q, page } = await searchParams;
  const query = new URLSearchParams({ pageSize: "9", page: String(Math.max(1, Number(page) || 1)) });
  if (category) query.set("category", category);
  if (q) query.set("q", q);

  const [posts, { categories }] = await Promise.all([
    serverApi<Paginated<PostSummary>>(`/posts?${query}`),
    serverApi<{ categories: Category[] }>("/categories"),
  ]);

  const pageHref = (n: number) => {
    const params = new URLSearchParams(query);
    params.delete("pageSize");
    params.set("page", String(n));
    return `/blog?${params}`;
  };

  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>
          Teknik <span className="gradient-text">Blog</span>
        </h1>
        <p>HSD topluluğunun teknik yazıları. Sen de yaz, onaylanınca puan kazan.</p>
        <Button href="/blog/yeni">Yazı yaz</Button>
      </header>

      <FilterChips basePath="/blog" categories={categories} active={category} search={{ value: q, placeholder: "Yazılarda ara…" }} />

      {posts.items.length === 0 ? (
        <p>{q || category ? "Aramana uygun yazı bulunamadı." : "Henüz yayınlanmış yazı yok."}</p>
      ) : (
        <ul className={styles.grid}>
          {posts.items.map((p) => (
            <li key={p.id}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={posts.page} totalPages={posts.totalPages} href={pageHref} />
    </main>
  );
}
