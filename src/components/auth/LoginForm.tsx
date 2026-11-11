"use client";
// ---- Giriş formu ----
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import { loginUser, safeNext } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import styles from "./AuthForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  // ?next=/quiz/ai gibi: girişten sonra gidilecek sayfa
  const rawNext = params.get("next");
  const next = safeNext(rawNext);
  // Kayıttan yeni geldiyse küçük bilgi mesajı göster
  const justRegistered = params.get("kayit") === "basarili";
  // Şifre sıfırlama başarılıysa (/giris?sifre=yenilendi) bilgi mesajı göster
  const passwordReset = params.get("sifre") === "yenilendi";

  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // Form geçerliyse giriş denenir
  const onSubmit: SubmitHandler<LoginValues> = (values) => {
    const result = loginUser(values.email, values.password);
    if (!result.ok) {
      setFormError(result.message); // "E-posta veya şifre yanlış." vb.
      return;
    }
    router.push(next);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        {justRegistered && (
          <p className={styles.success} role="status">
            Hesabın oluşturuldu. Şimdi giriş yapabilirsin.
          </p>
        )}

        {passwordReset && (
          <p className={styles.success} role="status">
            Şifren değiştirildi. Yeni şifrenle giriş yapabilirsin.
          </p>
        )}

        <Input id="eposta" label="E-posta" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          id="sifre"
          label="Şifre"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {/* Şifremi unuttum: e-postaya sıfırlama bağlantısı gönderilen sayfaya gider */}
        <Link href="/sifremi-unuttum" className={styles.forgot}>
          Şifremi unuttum
        </Link>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          Giriş yap
        </button>
      </form>

      <p className={styles.switch}>
        Hesabın yok mu? <Link href={rawNext ? `/kayit?next=${encodeURIComponent(next)}` : "/kayit"}>Kayıt ol</Link>
      </p>
    </>
  );
}
