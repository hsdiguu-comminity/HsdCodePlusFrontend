"use client";
// ---- Kayıt formu ----
// Kayıt sonrası hesap "onay bekliyor" durumundadır; yönetici onaylayınca giriş yapılabilir.
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { registerUser, safeNext } from "@/lib/auth";
import { PASSWORD_HINT, registerSchema, type RegisterValues } from "@/lib/schemas";
import { useApi } from "@/lib/useApi";
import type { Community } from "@/types";
import styles from "./AuthForm.module.css";

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next");
  const next = safeNext(rawNext);

  const [formError, setFormError] = useState("");
  const communities = useApi<{ communities: Community[] }>("/communities");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit: SubmitHandler<RegisterValues> = async (values) => {
    setFormError("");
    // "Şifre tekrar" alanı yalnızca formda kontrol edilir, backend'e gönderilmez
    const result = await registerUser({
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username,
      communityId: values.communityId,
      email: values.email,
      password: values.password,
    });
    if (!result.ok) {
      setFormError(result.message); // örn. "Bu e-posta adresi zaten kayıtlı"
      return;
    }
    const nextPart = rawNext ? `&next=${encodeURIComponent(next)}` : "";
    router.push(`/giris?kayit=basarili${nextPart}`);
  };

  const communityOptions = (communities.data?.communities ?? []).map((c) => ({
    value: c.id,
    label: `${c.name} (${c.university})`,
  }));

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Input id="ad" label="Ad" type="text" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
        <Input id="soyad" label="Soyad" type="text" autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
        <Input
          id="kullanici-adi"
          label="Kullanıcı adı"
          type="text"
          autoComplete="username"
          hint="Profil adresinde görünür: hsdcode/profil/kullaniciadi"
          error={errors.username?.message}
          {...register("username")}
        />
        <Select
          id="topluluk"
          label="HSD topluluğu"
          placeholder={communities.loading ? "Yükleniyor…" : "Topluluğunu seç"}
          options={communityOptions}
          hint="Sıralama tablosunda adının yanında görünür."
          error={errors.communityId?.message ?? communities.error ?? undefined}
          defaultValue=""
          {...register("communityId")}
        />
        <Input id="eposta" label="E-posta" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          id="sifre"
          label="Şifre"
          type="password"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
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
          {isSubmitting ? "Hesap oluşturuluyor…" : "Hesap oluştur"}
        </button>
      </form>

      <p className={styles.switch}>
        Zaten hesabın var mı? <Link href={rawNext ? `/giris?next=${encodeURIComponent(next)}` : "/giris"}>Giriş yap</Link>
      </p>
    </>
  );
}
