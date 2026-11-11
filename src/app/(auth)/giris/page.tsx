// ---- /giris sayfası ----
import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Giriş yap" };

export default function LoginPage() {
  return (
    <main className={`container ${styles.page}`}>
      <section className={styles.card} aria-labelledby="giris-baslik">
        <h1 id="giris-baslik">Giriş yap</h1>
        <p className={styles.lead}>Quiz çözmek ve sıralamaya girmek için hesabınla giriş yap.</p>
        {/* Formda useSearchParams kullanıldığı için Suspense gerekir */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
