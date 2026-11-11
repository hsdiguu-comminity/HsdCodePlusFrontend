// ---- /kayit sayfası ----
import { Suspense } from "react";
import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Kayıt ol" };

export default function RegisterPage() {
  return (
    <main className={`container ${styles.page}`}>
      <section className={styles.card} aria-labelledby="kayit-baslik">
        <h1 id="kayit-baslik">Hesap oluştur</h1>
        <p className={styles.lead}>HSDCode+ topluluğuna katıl, quiz çöz ve puan topla.</p>
        {/* Formda useSearchParams kullanıldığı için Suspense gerekir */}
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </section>
    </main>
  );
}
