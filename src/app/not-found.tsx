// ---- 404 sayfası: olmayan adres açılınca gösterilir ----
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="container" style={{ padding: "96px 0", textAlign: "center" }}>
      <h1 style={{ fontSize: "4rem" }}>404</h1>
      <p style={{ color: "var(--color-muted)", margin: "12px 0 24px" }}>Aradığın sayfa bulunamadı.</p>
      <Button href="/">Ana sayfaya dön</Button>
    </main>
  );
}
