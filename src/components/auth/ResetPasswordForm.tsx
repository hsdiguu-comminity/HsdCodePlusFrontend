"use client";
// ---- "Yeni şifre belirle" formu ----
// E-postadaki bağlantıdan gelinir: /sifre-sifirla?token=...
// Bağlantının geçerliliği şifre gönderildiğinde backend tarafından kontrol edilir.
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import { resetPasswordWithToken } from "@/lib/auth";
import { PASSWORD_HINT, resetSchema, type ResetValues } from "@/lib/schemas";
import styles from "./AuthForm.module.css";

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");

  const [formError, setFormError] = useState("");
  const [invalidLink, setInvalidLink] = useState(!token);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const onSubmit: SubmitHandler<ResetValues> = async (values) => {
    if (!token) return;
    setFormError("");
    const result = await resetPasswordWithToken(token, values.password);
    if (!result.ok) {
      if (result.code === "INVALID_TOKEN") setInvalidLink(true);
      else setFormError(result.message);
      return;
    }
    router.push("/giris?sifre=yenilendi");
  };

  if (invalidLink) {
    return (
      <>
        <p className={styles.formError} role="alert">
          {token
            ? "Bu bağlantı geçersiz, süresi dolmuş ya da daha önce kullanılmış."
            : "Bağlantı eksik. E-postadaki bağlantıya tekrar tıkla."}
        </p>
        <p className={styles.switch}>
          <Link href="/sifremi-unuttum">Yeni bağlantı iste</Link>
        </p>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      <Input
        id="yeni-sifre"
        label="Yeni şifre"
        type="password"
        autoComplete="new-password"
        hint={PASSWORD_HINT}
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
        {isSubmitting ? "Kaydediliyor…" : "Şifreyi değiştir"}
      </button>
    </form>
  );
}
