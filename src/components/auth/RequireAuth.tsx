"use client";
// ---- Giriş zorunluluğu: giriş yoksa içeriği göstermez, giriş/kayıt butonu gösterir ----
// Kullanım: <RequireAuth>{(session) => <Icerik session={session} />}</RequireAuth>
// admin: true verilirse yalnızca yöneticiler içeriği görür.
// Not: Bu yalnızca arayüz kolaylığıdır; asıl yetki kontrolü backend'de her istekte yapılır.
import { usePathname } from "next/navigation";
import { Lock, ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSession } from "@/lib/useSession";
import type { Session } from "@/types";
import styles from "./RequireAuth.module.css";

interface RequireAuthProps {
  message?: string;
  admin?: boolean;
  children: (session: Session) => React.ReactNode;
}

export default function RequireAuth({
  message = "Bu sayfayı görmek için giriş yapmalısın.",
  admin = false,
  children,
}: RequireAuthProps) {
  const { session, ready } = useSession();
  const pathname = usePathname();

  if (!ready) {
    return (
      <p className={styles.state} role="status">
        Yükleniyor…
      </p>
    );
  }

  if (!session) {
    const next = encodeURIComponent(pathname);
    return (
      <div className={styles.box}>
        <Lock size={32} aria-hidden />
        <h2>Giriş gerekli</h2>
        <p>{message}</p>
        <div className={styles.actions}>
          <Button href={`/giris?next=${next}`}>Giriş yap</Button>
          <Button href={`/kayit?next=${next}`} variant="outline">
            Kayıt ol
          </Button>
        </div>
      </div>
    );
  }

  if (admin && !session.isAdmin) {
    return (
      <div className={styles.box}>
        <ShieldAlert size={32} aria-hidden />
        <h2>Yetkin yok</h2>
        <p>Bu sayfa yalnızca yöneticiler içindir.</p>
        <div className={styles.actions}>
          <Button href="/">Ana sayfaya dön</Button>
        </div>
      </div>
    );
  }

  return <>{children(session)}</>;
}
