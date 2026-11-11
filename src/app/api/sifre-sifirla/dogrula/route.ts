// ============================================================
//  POST /api/sifre-sifirla/dogrula
//  E-postadaki bağlantının anahtarı gerçek ve süresi dolmamış mı diye kontrol eder.
//  Geçerliyse e-postayı ve anahtar numarasını döner.
// ============================================================
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyResetToken } from "@/lib/resetToken";

export const runtime = "nodejs";

const bodySchema = z.object({ token: z.string().min(10).max(2000) });

export async function POST(request: Request) {
  try {
    const { token } = bodySchema.parse(await request.json());
    const result = verifyResetToken(token);
    if (!result) throw new Error("geçersiz");
    return NextResponse.json({ ok: true, email: result.email, tokenId: result.tokenId });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Bu bağlantı geçersiz ya da süresi dolmuş. Yeni bir bağlantı iste." },
      { status: 400 },
    );
  }
}
