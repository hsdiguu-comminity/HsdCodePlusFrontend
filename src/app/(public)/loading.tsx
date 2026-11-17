// ---- Sayfa yüklenirken gösterilen ekran ----
export default function Loading() {
  return (
    <main className="container" style={{ padding: "96px 0", textAlign: "center" }} aria-busy="true">
      <p role="status">Yükleniyor…</p>
    </main>
  );
}
