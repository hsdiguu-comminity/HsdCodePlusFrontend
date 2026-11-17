// ---- Blog yazısı kartı ----
import Link from "next/link";
import { Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { fullName } from "@/lib/format";
import type { PostSummary } from "@/types";
import styles from "./PostCard.module.css";

export default function PostCard({ post }: { post: PostSummary }) {
  const iso = post.publishedAt ?? post.createdAt;
  const date = new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return (
    <Card>
      <Badge>{post.category.name}</Badge>
      <h3 className={styles.title}>
        <Link href={`/blog/${post.slug}`} className={styles.link}>
          {post.title}
        </Link>
      </h3>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <div className={styles.meta}>
        <Link href={`/profil/${post.author.username}`}>{fullName(post.author)}</Link>
        <span className={styles.read}>
          <Clock size={14} aria-hidden /> {post.readMinutes} dk okuma · <time dateTime={iso}>{date}</time>
        </span>
      </div>
    </Card>
  );
}
