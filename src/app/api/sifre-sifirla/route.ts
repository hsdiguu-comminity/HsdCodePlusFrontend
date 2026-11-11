// ============================================================
//  POST /api/sifre-sifirla
//  "Şifremi unuttum" formundan gelen e-postaya sıfırlama bağlantısı gönderir.
//
//  E-posta ayarı (.env.local) yoksa:
//   - "npm run dev" sırasında bağlantı TERMİNALE yazılır ve ekranda da gösterilir (test için).
//   - Canlı ortamda hata döner (ayar yapılmadan e-posta gönderilemez).
// ============================================================
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { createResetToken } from "@/lib/resetToken";

export const runtime = "nodejs"; // nodemailer ve crypto için Node ortamı gerekir

const bodySchema = z.object({ email: z.string().trim().email() });

// Basit hız sınırı: aynı e-postaya 60 saniyede en fazla 1 mesaj (spam'i önler)
const lastSent = new Map<string, number>();
const COOLDOWN_MS = 60 * 1000;

export async function POST(request: Request) {
  // 1) Gelen veriyi doğrula
  let email: string;
  try {
    email = bodySchema.parse(await request.json()).email.toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, message: "Geçerli bir e-posta adresi yazmadınız." }, { status: 400 });
  }

  // 2) Hız sınırı kontrolü
  const previous = lastSent.get(email) ?? 0;
  if (Date.now() - previous < COOLDOWN_MS) {
    return NextResponse.json(
      { ok: false, message: "Çok sık denedin. Bir dakika bekleyip tekrar dene." },
      { status: 429 },
    );
  }
  lastSent.set(email, Date.now());

  // 3) Bağlantıyı hazırla (adres .env.local'daki SITE_URL'den, yoksa isteğin geldiği adresten)
  const baseUrl = process.env.SITE_URL || new URL(request.url).origin;
  const link = `${baseUrl}/sifre-sifirla?token=${encodeURIComponent(createResetToken(email))}`;

  // 4) E-posta sunucusu ayarlı mı?
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  const mailConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

  if (!mailConfigured) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false, message: "E-posta servisi henüz ayarlanmamış." }, { status: 500 });
    }
    // Geliştirme modu: e-posta atılamaz, bağlantıyı terminale yaz
    console.log(`\n[HSD] E-posta ayarı yok. ${email} için şifre sıfırlama bağlantısı:\n${link}\n`);
    return NextResponse.json({ ok: true, devLink: link });
  }

  // 5) E-postayı gönder
  try {
    const port = Number(SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: email,
      subject: "HSDCode+ şifre sıfırlama",
      text:
        `Merhaba,\n\nHSDCode+ hesabın için şifre sıfırlama isteği aldık.\n` +
        `Yeni şifre belirlemek için aşağıdaki bağlantıyı aç (30 dakika geçerli):\n\n${link}\n\n` +
        `Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin; şifren değişmez.`,
      html:
        `<p>Merhaba,</p><p>HSDCode+ hesabın için şifre sıfırlama isteği aldık.</p>` +
        `<p><a href="${link}">Yeni şifre belirle</a> (bağlantı 30 dakika geçerli)</p>` +
        `<p>Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin; şifren değişmez.</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[HSD] E-posta gönderilemedi:", error);
    lastSent.delete(email); // hata olduysa kullanıcı hemen tekrar deneyebilsin
    return NextResponse.json({ ok: false, message: "E-posta gönderilemedi. Daha sonra tekrar dene." }, { status: 500 });
  }
}
