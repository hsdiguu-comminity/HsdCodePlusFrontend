"use client";
// ---- Beklenmeyen hata sayfası: bir sayfa çökerse gösterilir ----
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container" style={{ padding: "96px 0", textAlign: "center" }}>
      <h1>Bir şeyler ters gitti</h1>
      <p style={{ color: "var(--color-muted)", margin: "12px 0 24px" }}>
        Sayfa yüklenirken bir hata oluştu. Tekrar deneyebilirsin.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: "12px 18px",
          color: "#fff",
          background: "var(--gradient-button)",
          border: 0,
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Tekrar dene
      </button>
    </main>
  );
}
