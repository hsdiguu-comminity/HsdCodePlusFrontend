// ---- /blog/[slug] sayfası: yazı detayı ----
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownView from "@/components/blog/MarkdownView";
import Badge from "@/components/ui/Badge";
import { ApiError, serverApi } from "@/lib/api";
import { formatDate, fullName } from "@/lib/format";
import type { PostDetail } from "@/types";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string): Promise<PostDetail | null> {
  try {
    const { post } = await serverApi<{ post: PostDetail }>(`/posts/${encodeURIComponent(slug)}`);
    return post;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  return { title: post ? post.title : "Yazı bulunamadı" };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className={`container ${styles.page}`}>
      <article className={styles.article}>
        <Link href="/blog" className={styles.back}>← Tüm yazılar</Link>
        <Badge>{post.category.name}</Badge>
        <h1>{post.title}</h1>
        <p className={styles.meta}>
          <Link href={`/profil/${post.author.username}`}>{fullName(post.author)}</Link> ·{" "}
          {formatDate(post.publishedAt)} · {post.readMinutes} dk okuma
        </p>
        {post.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- kapak görseli farklı kaynaklardan gelebilir
          <img src={post.coverUrl} alt="" style={{ width: "100%", borderRadius: "var(--radius-lg)" }} />
        )}
        <MarkdownView content={post.contentMd} />
      </article>
    </main>
  );
}
