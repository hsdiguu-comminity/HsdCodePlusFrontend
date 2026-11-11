"use client";
// ---- Giriş zorunluluğu: giriş yoksa içeriği göstermez, giriş/kayıt butonu gösterir ----
// Kullanım: <RequireAuth>{(session) => <Icerik session={session} />}</RequireAuth>
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSession } from "@/lib/useSession";
import type { Session } from "@/types";
import styles from "./RequireAuth.module.css";

interface RequireAuthProps {
  message?: string;
  children: (session: Session) => React.ReactNode;
}

export default function RequireAuth({ message = "Bu sayfayı görmek için giriş yapmalısın.", children }: RequireAuthProps) {
  const { session, ready } = useSession();
  const pathname = usePathname();

  // Tarayıcı oturumu henüz kontrol edilmedi
  if (!ready) {
    return (
      <p className={styles.state} role="status">
        Yükleniyor…
      </p>
    );
  }

  // Giriş yok: girişten sonra bu sayfaya geri dönmek için ?next= eklenir
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

  // Giriş var: asıl içeriği göster
  return <>{children(session)}</>;
}
