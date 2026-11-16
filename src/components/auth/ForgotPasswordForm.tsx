"use client";
// ---- "Şifremi unuttum" formu ----
// Akış: e-posta yazılır -> backend e-postaya sıfırlama bağlantısı gönderir -> kullanıcı bağlantıdan yeni şifre belirler.
import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import { requestPasswordReset } from "@/lib/auth";
import { forgotSchema, type ForgotValues } from "@/lib/schemas";
import styles from "./AuthForm.module.css";

export default function ForgotPasswordForm() {
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit: SubmitHandler<ForgotValues> = async (values) => {
    setFormError("");
    // Güvenlik: backend, e-posta kayıtlı olsa da olmasa da aynı cevabı verir
    const result = await requestPasswordReset(values.email);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <>
        <p className={styles.success} role="status">
          Bu e-posta ile kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderdik. Gelen kutunu (ve spam
          klasörünü) kontrol et. Bağlantı 30 dakika geçerli ve tek kullanımlık.
        </p>
        <p className={styles.switch}>
          <Link href="/giris">Giriş sayfasına dön</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Input id="eposta" label="E-posta" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
        </button>
      </form>

      <p className={styles.switch}>
        Şifreni hatırladın mı? <Link href="/giris">Giriş yap</Link>
      </p>
    </>
  );
}
