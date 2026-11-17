"use client";
// ============================================================
//  /profilim: Giriş yapan üyenin profil + ayar sayfası (giriş gerekli)
//  Bölümler:
//   1) Üst kart       : ad soyad, kullanıcı adı, HSD topluluğu
//   2) Hesap bilgileri: ad, soyad, HSD topluluğu, biyografi, GitHub/LinkedIn
//   3) Şifre değiştir : mevcut şifre + yeni şifre
//   4) Çözdüğüm quizler
// ============================================================
import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RequireAuth from "@/components/auth/RequireAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { changePassword, updateProfile } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  PASSWORD_HINT,
  passwordChangeSchema,
  profileSchema,
  type PasswordChangeValues,
  type ProfileValues,
} from "@/lib/schemas";
import { useApi } from "@/lib/useApi";
import type { Community, Dashboard, Session } from "@/types";
import styles from "./page.module.css";

type Message = { type: "ok" | "error"; text: string } | null;

export default function ProfilePage() {
  return (
    <main className={`container ${styles.page}`}>
      <RequireAuth message="Profilini görmek için giriş yapmalısın.">
        {(session) => <ProfileContent session={session} />}
      </RequireAuth>
    </main>
  );
}

function ProfileContent({ session }: { session: Session }) {
  const dashboard = useApi<Dashboard>("/users/me/dashboard");

  return (
    <>
      <header className={styles.head}>
        <div className={styles.avatar} aria-hidden>
          {session.firstName.trim().charAt(0).toLocaleUpperCase("tr-TR")}
        </div>
        <div>
          <h1>{session.name}</h1>
          <p className={styles.muted}>
            @{session.username} · <Link href={`/profil/${session.username}`}>Herkese açık profilim</Link>
          </p>
          {session.community && <span className={styles.badge}>HSD: {session.community.name}</span>}
        </div>
      </header>

      <div className={styles.grid}>
        {dashboard.data ? (
          <ProfileForm session={session} dashboard={dashboard.data} />
        ) : (
          <section className={styles.card}>
            <p role="status">{dashboard.error ?? "Yükleniyor…"}</p>
          </section>
        )}
        <PasswordForm />
      </div>

      <SolvedQuizzes dashboard={dashboard.data} />
    </>
  );
}

// ---------- 2) Hesap bilgileri formu ----------
function ProfileForm({ session, dashboard }: { session: Session; dashboard: Dashboard }) {
  const [message, setMessage] = useState<Message>(null);
  const communities = useApi<{ communities: Community[] }>("/communities");
  const profile = dashboard.user.profile;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: session.firstName,
      lastName: session.lastName,
      communityId: session.communityId,
      bio: profile?.bio ?? "",
      githubUrl: profile?.githubUrl ?? "",
      linkedinUrl: profile?.linkedinUrl ?? "",
    },
  });

  const onSubmit: SubmitHandler<ProfileValues> = async (values) => {
    setMessage(null);
    const result = await updateProfile(values);
    setMessage(result.ok ? { type: "ok", text: "Bilgilerin güncellendi." } : { type: "error", text: result.message });
  };

  const options = (communities.data?.communities ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.university})` }));

  return (
    <section className={styles.card} aria-labelledby="bilgi-baslik">
      <h2 id="bilgi-baslik">Hesap bilgileri</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input id="p-ad" label="Ad" type="text" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
        <Input id="p-soyad" label="Soyad" type="text" autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
        {communities.data && (
          <Select
            id="p-topluluk"
            label="HSD topluluğu"
            options={options}
            hint="Sıralama tablosunda adının yanında görünür."
            error={errors.communityId?.message}
            {...register("communityId")}
          />
        )}
        <Input id="p-bio" label="Kısa biyografi (isteğe bağlı)" type="text" maxLength={500} error={errors.bio?.message} {...register("bio")} />
        <Input id="p-github" label="GitHub (isteğe bağlı)" type="url" placeholder="https://github.com/kullaniciadi" error={errors.githubUrl?.message} {...register("githubUrl")} />
        <Input id="p-linkedin" label="LinkedIn (isteğe bağlı)" type="url" placeholder="https://linkedin.com/in/kullaniciadi" error={errors.linkedinUrl?.message} {...register("linkedinUrl")} />
        <Input id="p-eposta" label="E-posta" type="email" value={session.email} readOnly hint="E-posta adresi değiştirilemez." />

        {message && (
          <p className={message.type === "ok" ? styles.success : styles.error} role={message.type === "ok" ? "status" : "alert"}>
            {message.text}
          </p>
        )}
        <button type="submit" className={styles.save} disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor…" : "Bilgileri kaydet"}
        </button>
      </form>
    </section>
  );
}

// ---------- 3) Şifre değiştirme formu ----------
function PasswordForm() {
  const [message, setMessage] = useState<Message>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeValues>({ resolver: zodResolver(passwordChangeSchema) });

  const onSubmit: SubmitHandler<PasswordChangeValues> = async (values) => {
    setMessage(null);
    const result = await changePassword(values.current, values.password);
    if (!result.ok) {
      setMessage({ type: "error", text: result.message });
      return;
    }
    reset();
    setMessage({ type: "ok", text: "Şifren değiştirildi." });
  };

  return (
    <section className={styles.card} aria-labelledby="sifre-baslik">
      <h2 id="sifre-baslik">Şifre değiştir</h2>
      <p className={styles.muted}>Güvenliğin için şifren burada gösterilmez; yalnızca yenisini belirleyebilirsin.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input id="p-mevcut" label="Mevcut şifre" type="password" autoComplete="current-password" error={errors.current?.message} {...register("current")} />
        <Input
          id="p-yeni"
          label="Yeni şifre"
          type="password"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input id="p-yeni2" label="Yeni şifre tekrar" type="password" autoComplete="new-password" error={errors.password2?.message} {...register("password2")} />

        {message && (
          <p className={message.type === "ok" ? styles.success : styles.error} role={message.type === "ok" ? "status" : "alert"}>
            {message.text}
          </p>
        )}
        <button type="submit" className={styles.save} disabled={isSubmitting}>
          {isSubmitting ? "Değiştiriliyor…" : "Şifreyi değiştir"}
        </button>
      </form>
    </section>
  );
}

// ---------- 4) Çözdüğüm quizler ----------
function SolvedQuizzes({ dashboard }: { dashboard: Dashboard | null }) {
  const quizzes = dashboard?.quizzes.recent ?? [];
  return (
    <section className={`${styles.card} ${styles.wide}`} aria-labelledby="quizler-baslik">
      <div className={styles.listHead}>
        <h2 id="quizler-baslik">Son çözdüğüm quizler ({dashboard?.quizzes.completed ?? 0})</h2>
      </div>

      {quizzes.length === 0 ? (
        <div className={styles.empty}>
          <p>Henüz quiz çözmedin.</p>
          <Button href="/quiz">Quizlere git</Button>
        </div>
      ) : (
        <ul className={styles.quizList}>
          {quizzes.map((attempt) => (
            <li key={attempt.quiz.id}>
              <Link href={`/quiz/${attempt.quiz.id}`} className={styles.quizTitle}>
                {attempt.quiz.title}
              </Link>
              <span>{attempt.score} puan</span>
              <span className={styles.muted}>
                {attempt.quiz.category.name} · {formatDate(attempt.finishedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
