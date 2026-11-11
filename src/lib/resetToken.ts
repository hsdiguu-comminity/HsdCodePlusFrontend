// ============================================================
//  ŞİFRE SIFIRLAMA BAĞLANTISI İÇİN İMZALI ANAHTAR (SADECE SUNUCUDA ÇALIŞIR)
//
//  Nasıl çalışır?
//  1) Kullanıcı "şifremi unuttum" deyince burada bir anahtar (token) üretilir.
//     Anahtarın içinde: e-posta + son geçerlilik zamanı + gizli anahtarla atılmış imza vardır.
//  2) Anahtar e-postadaki bağlantıya konur.
//  3) Kullanıcı bağlantıya tıklayınca anahtar tekrar burada kontrol edilir.
//     İmza tutmuyorsa ya da süre dolduysa kabul edilmez -> kimse sahte bağlantı üretemez.
//
//  Bu dosya "use client" bileşenlerinden İÇE AKTARILMAMALIDIR (gizli anahtar sızar).
// ============================================================
import { createHmac, timingSafeEqual } from "crypto";

// Bağlantı kaç dakika geçerli? (30 dakika)
const TTL_MS = 30 * 60 * 1000;

// İmza için gizli anahtarı verir (.env.local içindeki RESET_SECRET)
function getSecret(): string {
  const secret = process.env.RESET_SECRET;
  if (secret && secret.length >= 32) return secret;

  // Canlı (production) ortamda gizli anahtar ŞART: yoksa güvensiz olur, bu yüzden hata veriyoruz
  if (process.env.NODE_ENV === "production") {
    throw new Error("RESET_SECRET tanımlı değil (en az 32 karakter olmalı).");
  }
  // Sadece "npm run dev" sırasında kolaylık için sabit bir geliştirme anahtarı kullanılır
  return "hsd-gelistirme-anahtari-sadece-npm-run-dev-icin-0123456789";
}

// Verilen metnin imzasını hesaplar
function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

// E-posta için yeni bir sıfırlama anahtarı üretir
export function createResetToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ e: email.trim().toLowerCase(), x: Date.now() + TTL_MS })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

// Anahtarı doğrular. Geçerliyse e-posta ve imzayı döner, değilse null.
export function verifyResetToken(token: string): { email: string; tokenId: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  // İmza karşılaştırması sabit sürede yapılır (zamanlama saldırılarına karşı)
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as { e: string; x: number };
    if (typeof data.e !== "string" || typeof data.x !== "number") return null;
    if (Date.now() > data.x) return null; // süresi dolmuş
    return { email: data.e, tokenId: signature };
  } catch {
    return null;
  }
}
