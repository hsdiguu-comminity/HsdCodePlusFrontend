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

  // ?next=/quiz/abc gibi: girişten sonra gidilecek sayfa
  const rawNext = params.get("next");
  const next = safeNext(rawNext);
  const justRegistered = params.get("kayit") === "basarili";
  const passwordReset = params.get("sifre") === "yenilendi";

  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit: SubmitHandler<LoginValues> = async (values) => {
    setFormError("");
    const result = await loginUser(values.email, values.password);
    if (!result.ok) {
      // "E-posta veya şifre hatalı", "Üyeliğiniz henüz onaylanmadı" vb. backend'den gelir
      setFormError(result.message);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        {justRegistered && (
          <p className={styles.success} role="status">
            Kaydın alındı! Hesabın yönetici onayından sonra aktif olacak; onaylanınca e-posta ile haber vereceğiz.
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
        <Link href="/sifremi-unuttum" className={styles.forgot}>
          Şifremi unuttum
        </Link>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>

      <p className={styles.switch}>
        Hesabın yok mu? <Link href={rawNext ? `/kayit?next=${encodeURIComponent(next)}` : "/kayit"}>Kayıt ol</Link>
      </p>
    </>
  );
}
