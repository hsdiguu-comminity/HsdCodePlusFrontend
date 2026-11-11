"use client";
// ============================================================
//  /profilim: Giriş yapan üyenin profil + ayar sayfası (giriş gerekli)
//  Bölümler:
//   1) Üst kart      : ad soyad, kullanıcı adı, HSD topluluğu
//   2) Hesap bilgileri: ad, soyad, HSD topluluğu düzenlenir (e-posta değiştirilemez)
//   3) Şifre değiştir : mevcut şifre + yeni şifre
//   4) Çözdüğüm quizler: sıralama seçeneğiyle (en yeni / en yüksek puan / A-Z)
// ============================================================
import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RequireAuth from "@/components/auth/RequireAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { changePassword, updateProfile } from "@/lib/auth";
import { getUserResults, percentOf, summarizeByQuiz, updateResultsIdentity } from "@/lib/results";
import {
  passwordChangeSchema,
  profileSchema,
  type PasswordChangeValues,
  type ProfileValues,
} from "@/lib/schemas";
import type { Session } from "@/types";
import styles from "./page.module.css";

// Tarihi "2 Kasım 2026" biçiminde göster
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

// "Ali Can Yılmaz" -> ad: "Ali Can", soyad: "Yılmaz" (son kelime soyad kabul edilir)
function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { first: parts[0] ?? "", last: "" };
  const last = parts.pop() as string;
  return { first: parts.join(" "), last };
}

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
  return (
    <>
      {/* 1) Üst kart */}
      <header className={styles.head}>
        {/* Baş harfler: avatar yerine */}
        <div className={styles.avatar} aria-hidden>
          {session.name.trim().charAt(0).toLocaleUpperCase("tr-TR")}
        </div>
        <div>
          <h1>{session.name}</h1>
          <p className={styles.muted}>@{session.username}</p>
          <span className={styles.badge}>HSD: {session.community}</span>
        </div>
      </header>

      <div className={styles.grid}>
        <ProfileForm session={session} />
        <PasswordForm session={session} />
      </div>

      <SolvedQuizzes session={session} />
    </>
  );
}

// ---------- 2) Hesap bilgileri formu ----------
function ProfileForm({ session }: { session: Session }) {
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const initial = splitName(session.name);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initial.first,
      lastName: initial.last,
      // "Belirtilmedi" kayıtta otomatik yazılan değer; kutuda boş gösterilir
      community: session.community === "Belirtilmedi" ? "" : session.community,
    },
  });

  const onSubmit: SubmitHandler<ProfileValues> = (values) => {
    const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;
    const community = values.community?.trim() || "Belirtilmedi";

    const result = updateProfile(session.email, { name: fullName, community });
    if (!result.ok) {
      setMessage({ type: "error", text: result.message });
      return;
    }
    // Eski quiz sonuçlarında da yeni ad görünsün (sıralama tablosu için)
    updateResultsIdentity(session.username, fullName, community);
    setMessage({ type: "ok", text: "Bilgilerin güncellendi." });
  };

  return (
    <section className={styles.card} aria-labelledby="bilgi-baslik">
      <h2 id="bilgi-baslik">Hesap bilgileri</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input id="p-ad" label="Ad" type="text" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
        <Input id="p-soyad" label="Soyad" type="text" autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
        <Input
          id="p-topluluk"
          label="HSD topluluğu"
          type="text"
          placeholder="Örn. İstanbul Gelişim Üniversitesi HSD"
          hint="Sıralama tablosunda adının yanında görünür."
          error={errors.community?.message}
          {...register("community")}
        />
        {/* E-posta giriş bilgisi olduğu için değiştirilemez (salt okunur) */}
        <Input id="p-eposta" label="E-posta" type="email" value={session.email} readOnly hint="E-posta adresi değiştirilemez." />

        {message && (
          <p className={message.type === "ok" ? styles.success : styles.error} role={message.type === "ok" ? "status" : "alert"}>
            {message.text}
          </p>
        )}
        <button type="submit" className={styles.save} disabled={isSubmitting}>
          Bilgileri kaydet
        </button>
      </form>
    </section>
  );
}

// ---------- 3) Şifre değiştirme formu ----------
function PasswordForm({ session }: { session: Session }) {
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeValues>({ resolver: zodResolver(passwordChangeSchema) });

  const onSubmit: SubmitHandler<PasswordChangeValues> = (values) => {
    const result = changePassword(session.email, values.current, values.password);
    if (!result.ok) {
      setMessage({ type: "error", text: result.message });
      return;
    }
    reset(); // şifre kutularını temizle
    setMessage({ type: "ok", text: "Şifren değiştirildi." });
  };

  return (
    <section className={styles.card} aria-labelledby="sifre-baslik">
      <h2 id="sifre-baslik">Şifre değiştir</h2>
      {/* Güvenlik: mevcut şifre asla ekranda gösterilmez */}
      <p className={styles.muted}>Güvenliğin için şifren burada gösterilmez; yalnızca yenisini belirleyebilirsin.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input id="p-mevcut" label="Mevcut şifre" type="password" autoComplete="current-password" error={errors.current?.message} {...register("current")} />
        <Input
          id="p-yeni"
          label="Yeni şifre"
          type="password"
          autoComplete="new-password"
          hint="En az 8 karakter; büyük harf, küçük harf ve özel karakter (@ . , ! ? # $ % & *) içermeli."
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
          Şifreyi değiştir
        </button>
      </form>
    </section>
  );
}

// ---------- 4) Çözdüğüm quizler (sıralanabilir liste) ----------
type SortKey = "recent" | "points" | "name";

function SolvedQuizzes({ session }: { session: Session }) {
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  // Bu üyenin quiz bazında özetleri (her quizin en iyi sonucu, deneme sayısı...)
  const summaries = useMemo(() => summarizeByQuiz(getUserResults(session.username)), [session.username]);

  // Seçilen sıralamaya göre listeyi düzenle
  const sorted = useMemo(() => {
    const list = [...summaries];
    if (sortKey === "recent") list.sort((a, b) => (a.lastDate < b.lastDate ? 1 : -1)); // en yeni üstte
    if (sortKey === "points") list.sort((a, b) => b.best.points - a.best.points); // en yüksek puan üstte
    if (sortKey === "name") list.sort((a, b) => a.quizTitle.localeCompare(b.quizTitle, "tr")); // A-Z
    return list;
  }, [summaries, sortKey]);

  return (
    <section className={`${styles.card} ${styles.wide}`} aria-labelledby="quizler-baslik">
      <div className={styles.listHead}>
        <h2 id="quizler-baslik">Çözdüğüm quizler ({summaries.length})</h2>
        {summaries.length > 1 && (
          <label className={styles.sort}>
            Sırala:{" "}
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              <option value="recent">En yeni</option>
              <option value="points">En yüksek puan</option>
              <option value="name">Quiz adı (A-Z)</option>
            </select>
          </label>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className={styles.empty}>
          <p>Henüz quiz çözmedin.</p>
          <Button href="/quiz">Quizlere git</Button>
        </div>
      ) : (
        <ul className={styles.quizList}>
          {sorted.map((s) => (
            <li key={s.quizId}>
              <Link href={`/quiz/${s.quizId}`} className={styles.quizTitle}>
                {s.quizTitle}
              </Link>
              <span>
                {s.best.correct}/{s.best.total} · %{percentOf(s.best)} · {s.best.points} puan
              </span>
              <span className={styles.muted}>
                {s.attempts} deneme · {formatDate(s.lastDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
