// ---- Blog yazısı kartı ----
import Link from "next/link";
import { Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Post } from "@/types";
import styles from "./PostCard.module.css";

export default function PostCard({ post }: { post: Post }) {
  const date = new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return (
    <Card>
      <Badge>{post.category}</Badge>
      <h3 className={styles.title}>
        <Link href={`/blog/${post.slug}`} className={styles.link}>
          {post.title}
        </Link>
      </h3>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <div className={styles.meta}>
        <span>{post.author.name}</span>
        <span className={styles.read}>
          <Clock size={14} aria-hidden /> {post.readMinutes} dk okuma · <time dateTime={post.date}>{date}</time>
        </span>
      </div>
    </Card>
  );
}
