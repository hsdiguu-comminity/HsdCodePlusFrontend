// ---- Form doğrulama şemaları (Zod) ----
// Backend ile aynı kurallar kullanılacağı için ileride ortak pakete taşınabilir.
import { z } from "zod";

// E-posta kuralı (iki formda da ortak)
const email = z.string().trim().email("Geçerli bir e-posta adresi yazmadınız.");

// Şifre kuralı: kayıt, şifre değiştirme ve şifre sıfırlamada AYNI kural kullanılır
const strongPassword = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı.")
  .regex(/[A-ZÇĞİÖŞÜ]/, "Büyük harf kullanmadınız.")
  .regex(/[a-zçğıöşü]/, "Küçük harf kullanmadınız.")
  .regex(/[@.,!?#$%&*]/, "Özel karakter kullanmadınız.");

// Giriş formu
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Şifrenizi yazmadınız."),
});

// Kayıt formu
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı."),
    community: z.string().trim().optional(), // HSD topluluğu (sıralamada görünür)
    email,
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalı.")
      .regex(/[A-ZÇĞİÖŞÜ]/, "Büyük harf kullanmadınız.")
      .regex(/[a-zçğıöşü]/, "Küçük harf kullanmadınız.")
      .regex(/[@.,!?#$%&*]/, "Özel karakter kullanmadınız."),
    password2: z.string(),
  })
  // İki şifre aynı mı?
  .refine((d) => d.password === d.password2, {
    message: "Şifreler aynı değil.",
    path: ["password2"],
  });

// "Şifremi unuttum" formu: sadece e-posta
export const forgotSchema = z.object({ email });

// "Yeni şifre belirle" formu (e-postadaki bağlantıdan gelinir)
export const resetSchema = z
  .object({ password: strongPassword, password2: z.string() })
  .refine((d) => d.password === d.password2, { message: "Şifreler aynı değil.", path: ["password2"] });

// Profil bilgileri formu (ad, soyad, HSD topluluğu)
export const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Ad en az 2 karakter olmalı."),
  lastName: z.string().trim().min(2, "Soyad en az 2 karakter olmalı."),
  community: z.string().trim().optional(),
});

// Profilden şifre değiştirme formu
export const passwordChangeSchema = z
  .object({ current: z.string().min(1, "Mevcut şifreni yazmadın."), password: strongPassword, password2: z.string() })
  .refine((d) => d.password === d.password2, { message: "Şifreler aynı değil.", path: ["password2"] })
  .refine((d) => d.password !== d.current, { message: "Yeni şifre eskisiyle aynı olamaz.", path: ["password"] });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
