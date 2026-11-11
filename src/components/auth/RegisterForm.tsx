"use client";
// ---- Kayıt formu ----
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import { registerUser, safeNext } from "@/lib/auth";
import { registerSchema, type RegisterValues } from "@/lib/schemas";
import styles from "./AuthForm.module.css";

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();

  // Quiz sayfasından geldiyse (?next=...) giriş sonrası oraya dönmek için taşınır
  const rawNext = params.get("next");
  const next = safeNext(rawNext);

  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  // Form geçerliyse hesap oluşturulur, sonra giriş sayfasına gidilir
  const onSubmit: SubmitHandler<RegisterValues> = (values) => {
    const result = registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
      community: values.community,
    });
    if (!result.ok) {
      setFormError(result.message); // örn. "Bu e-posta ile kayıtlı bir hesap var."
      return;
    }
    const nextPart = rawNext ? `&next=${encodeURIComponent(next)}` : "";
    router.push(`/giris?kayit=basarili${nextPart}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Input id="ad" label="Ad Soyad" type="text" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input
          id="topluluk"
          label="HSD topluluğu (isteğe bağlı)"
          type="text"
          placeholder="Örn. İstanbul Gelişim Üniversitesi HSD"
          hint="Sıralama tablosunda adının yanında görünür."
          error={errors.community?.message}
          {...register("community")}
        />
        <Input id="eposta" label="E-posta" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          id="sifre"
          label="Şifre"
          type="password"
          autoComplete="new-password"
          hint="En az 8 karakter; büyük harf, küçük harf ve özel karakter (@ . , ! ? # $ % & *) içermeli."
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          id="sifre2"
          label="Şifre tekrar"
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
          Hesap oluştur
        </button>
      </form>

      <p className={styles.switch}>
        Zaten hesabın var mı? <Link href={rawNext ? `/giris?next=${encodeURIComponent(next)}` : "/giris"}>Giriş yap</Link>
      </p>
    </>
  );
}
