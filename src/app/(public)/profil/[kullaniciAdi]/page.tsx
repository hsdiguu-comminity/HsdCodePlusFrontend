// ---- /profil/[kullaniciAdi] sayfası: üyenin herkese açık profili ----
import type { Metadata } from "next";
import ProfileView from "@/components/profile/ProfileView";

type Props = { params: Promise<{ kullaniciAdi: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kullaniciAdi } = await params;
  return { title: `Profil: ${decodeURIComponent(kullaniciAdi)}` };
}

export default async function ProfilePage({ params }: Props) {
  const { kullaniciAdi } = await params;
  return (
    <main className="container" style={{ padding: "48px 0 64px" }}>
      <ProfileView username={decodeURIComponent(kullaniciAdi)} />
    </main>
  );
}
