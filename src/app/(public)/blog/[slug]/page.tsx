// ---- /blog/[slug] sayfası: yazı detayı (YER TUTUCU) ----
// Markdown görüntüleme ve yazar kartı sonraki aşamada eklenecek.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import home from "@/mocks/home.json"; // MOCK: backend gelince API'den
import type { Post } from "@/types";
import styles from "./page.module.css";

const posts = home.posts as Post[];
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  return { title: post ? post.title : "Yazı bulunamadı" };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound(); // yazı yoksa 404

  return (
    <main className={`container ${styles.page}`}>
      <article className={styles.article}>
        <Link href="/blog" className={styles.back}>← Tüm yazılar</Link>
        <Badge>{post.category}</Badge>
        <h1>{post.title}</h1>
        <p className={styles.meta}>
          {post.author.name} · {post.readMinutes} dk okuma
        </p>
        <p className={styles.lead}>{post.excerpt}</p>
        <p className={styles.placeholder}>
          Yazının tam içeriği, backend bağlandığında Markdown olarak burada gösterilecek.
        </p>
      </article>
    </main>
  );
}
