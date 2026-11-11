// ---- /sifremi-unuttum sayfası ----
import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Şifremi unuttum" };

export default function ForgotPasswordPage() {
  return (
    <main className={`container ${styles.page}`}>
      <section className={styles.card} aria-labelledby="unuttum-baslik">
        <h1 id="unuttum-baslik">Şifremi unuttum</h1>
        <p className={styles.lead}>
          Kayıt olurken kullandığın e-postayı yaz, sana yeni şifre belirleyebileceğin bir bağlantı gönderelim.
        </p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
