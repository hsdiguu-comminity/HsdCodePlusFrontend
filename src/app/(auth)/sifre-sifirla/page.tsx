// ---- /sifre-sifirla sayfası (e-postadaki bağlantı buraya gelir) ----
import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Yeni şifre belirle" };

export default function ResetPasswordPage() {
  return (
    <main className={`container ${styles.page}`}>
      <section className={styles.card} aria-labelledby="sifirla-baslik">
        <h1 id="sifirla-baslik">Yeni şifre belirle</h1>
        <p className={styles.lead}>Hesabın için yeni bir şifre seç.</p>
        {/* Formda useSearchParams kullanıldığı için Suspense gerekir */}
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
