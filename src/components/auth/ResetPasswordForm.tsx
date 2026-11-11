"use client";
// ---- "Yeni şifre belirle" formu ----
// E-postadaki bağlantıdan gelinir: /sifre-sifirla?token=...
// Önce sunucu anahtarı doğrular; geçerliyse yeni şifre formu açılır.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import { resetPasswordWithToken } from "@/lib/auth";
import { resetSchema, type ResetValues } from "@/lib/schemas";
import styles from "./AuthForm.module.css";

// Bağlantının durumu: kontrol ediliyor / geçersiz / geçerli
type TokenState =
  | { status: "checking" }
  | { status: "invalid"; message: string }
  | { status: "valid"; email: string; tokenId: string };

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");

  const [state, setState] = useState<TokenState>({ status: "checking" });
  const [formError, setFormError] = useState("");

  // Sayfa açılınca bağlantıdaki anahtarı sunucuya doğrulat
  useEffect(() => {
    if (!token) {
      setState({ status: "invalid", message: "Bağlantı eksik. E-postadaki bağlantıya tekrar tıkla." });
      return;
    }
    let cancelled = false; // sayfa kapanırsa sonucu yoksay
    fetch("/api/sifre-sifirla/dogrula", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json() as Promise<{ ok: boolean; email?: string; tokenId?: string; message?: string }>)
      .then((data) => {
        if (cancelled) return;
        if (data.ok && data.email && data.tokenId) {
          setState({ status: "valid", email: data.email, tokenId: data.tokenId });
        } else {
          setState({ status: "invalid", message: data.message ?? "Bağlantı geçersiz." });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "invalid", message: "Sunucuya ulaşılamadı. Tekrar dene." });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  // Form geçerliyse yeni şifre kaydedilir
  const onSubmit: SubmitHandler<ResetValues> = (values) => {
    if (state.status !== "valid") return;
    const result = resetPasswordWithToken(state.email, values.password, state.tokenId);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    router.push("/giris?sifre=yenilendi"); // giriş sayfası "şifren değişti" mesajı gösterir
  };

  if (state.status === "checking") {
    return (
      <p className={styles.switch} role="status">
        Bağlantı kontrol ediliyor…
      </p>
    );
  }

  if (state.status === "invalid") {
    return (
      <>
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
        <p className={styles.switch}>
          <Link href="/sifremi-unuttum">Yeni bağlantı iste</Link>
        </p>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      <p className={styles.hintBox}>
        Hesap: <strong>{state.email}</strong>
      </p>
      <Input
        id="yeni-sifre"
        label="Yeni şifre"
        type="password"
        autoComplete="new-password"
        hint="En az 8 karakter; büyük harf, küçük harf ve özel karakter (@ . , ! ? # $ % & *) içermeli."
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        id="yeni-sifre2"
        label="Yeni şifre tekrar"
        type="password"
        autoComplete="new-password"
        error={errors.password2?.message}
        {...register("password2")}
      />

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        Şifreyi değiştir
      </button>
    </form>
  );
}
