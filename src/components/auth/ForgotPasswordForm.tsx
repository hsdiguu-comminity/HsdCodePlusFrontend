"use client";
// ---- "Şifremi unuttum" formu ----
// Akış: e-posta yazılır -> sunucu e-postaya sıfırlama bağlantısı gönderir -> kullanıcı bağlantıdan yeni şifre belirler.
import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import { userExists } from "@/lib/auth";
import { forgotSchema, type ForgotValues } from "@/lib/schemas";
import styles from "./AuthForm.module.css";

export default function ForgotPasswordForm() {
  const [formError, setFormError] = useState(""); // sunucudan gelen hata
  const [sent, setSent] = useState(false); // mesaj gönderildi mi?
  const [devLink, setDevLink] = useState(""); // sadece "npm run dev" testinde dolar

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit: SubmitHandler<ForgotValues> = async (values) => {
    setFormError("");

    // Güvenlik: e-posta kayıtlı olsa da olmasa da kullanıcıya AYNI mesaj gösterilir
    // (kimin üye olduğu başkaları tarafından tahmin edilemesin diye).
    // Üyelik şimdilik bu tarayıcıda durduğu için, kayıtlı değilse sunucuya hiç istek atmıyoruz.
    if (!userExists(values.email)) {
      setSent(true);
      return;
    }

    try {
      const response = await fetch("/api/sifre-sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = (await response.json()) as { ok: boolean; message?: string; devLink?: string };
      if (!data.ok) {
        setFormError(data.message ?? "Bir sorun oluştu. Tekrar dene.");
        return;
      }
      if (data.devLink) setDevLink(data.devLink);
      setSent(true);
    } catch {
      setFormError("Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.");
    }
  };

  // Gönderildikten sonra form yerine bilgi mesajı gösterilir
  if (sent) {
    return (
      <>
        <p className={styles.success} role="status">
          Bu e-posta ile kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderdik. Gelen kutunu (ve spam
          klasörünü) kontrol et. Bağlantı 30 dakika geçerli.
        </p>
        {/* Sadece geliştirme modunda: e-posta ayarı yokken bağlantıyı doğrudan göster */}
        {devLink && (
          <p className={styles.hintBox}>
            <strong>Geliştirme modu:</strong> E-posta ayarı (.env.local) yapılmadığı için mail gönderilmedi.
            Test için bağlantı: <a href={devLink}>Yeni şifre belirle</a>
          </p>
        )}
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
