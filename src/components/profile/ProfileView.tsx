"use client";
// ---- Üye profili (herkese açık özet) ----
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { formatDate, fullName } from "@/lib/format";
import type { PublicProfile } from "@/types";
import styles from "./ProfileView.module.css";

export default function ProfileView({ username }: { username: string }) {
  const { data, error, loading } = useApi<PublicProfile>(`/users/${encodeURIComponent(username)}`);

  if (loading) return <p className={styles.state} role="status">Yükleniyor…</p>;

  if (error || !data) {
    return (
      <div className={styles.box}>
        <h1>@{username}</h1>
        <p>{error ?? "Bu üye bulunamadı."}</p>
        <Link href="/siralama" className={styles.link}>Sıralamaya dön</Link>
      </div>
    );
  }

  const { user, points, quizzesCompleted, posts } = data;

  return (
    <div className={styles.box}>
      <h1>{fullName(user)}</h1>
      <p>
        @{user.username} · {user.community.name} · {formatDate(user.createdAt)} tarihinden beri üye
      </p>
      {user.profile?.bio && <p>{user.profile.bio}</p>}
      {(user.profile?.githubUrl || user.profile?.linkedinUrl) && (
        <p>
          {user.profile.githubUrl && (
            <a href={user.profile.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
              GitHub
            </a>
          )}
          {user.profile.githubUrl && user.profile.linkedinUrl && " · "}
          {user.profile.linkedinUrl && (
            <a href={user.profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
              LinkedIn
            </a>
          )}
        </p>
      )}

      <dl className={styles.stats}>
        <div><dt>Toplam puan</dt><dd>{points.total}</dd></div>
        <div><dt>Bu hafta</dt><dd>{points.weekly}</dd></div>
        <div><dt>Çözülen quiz</dt><dd>{quizzesCompleted}</dd></div>
        <div><dt>Yayındaki yazı</dt><dd>{posts.length}</dd></div>
      </dl>

      {posts.length > 0 && (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              <span>
                {post.category.name} · {formatDate(post.publishedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
