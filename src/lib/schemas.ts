// ---- Form doğrulama şemaları (Zod) ----
// Kurallar backend'deki kurallarla uyumludur; son kontrol her zaman backend'dedir.
import { z } from "zod";

// E-posta kuralı (tüm formlarda ortak)
const email = z.string().trim().email("Geçerli bir e-posta adresi yazmadınız.");

// Şifre kuralı: kayıt, şifre değiştirme ve şifre sıfırlamada AYNI kural kullanılır
// (backend en az 8 karakter + harf + rakam ister; burada ek olarak büyük/küçük harf ve özel karakter istenir)
const strongPassword = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı.")
  .max(128, "Şifre en fazla 128 karakter olabilir.")
  .regex(/[A-ZÇĞİÖŞÜ]/, "Büyük harf kullanmadınız.")
  .regex(/[a-zçğıöşü]/, "Küçük harf kullanmadınız.")
  .regex(/[0-9]/, "Rakam kullanmadınız.")
  .regex(/[@.,!?#$%&*_-]/, "Özel karakter kullanmadınız.");

export const PASSWORD_HINT =
  "En az 8 karakter; büyük harf, küçük harf, rakam ve özel karakter (@ . , ! ? # $ % & * _ -) içermeli.";

// Giriş formu
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Şifrenizi yazmadınız."),
});

// Kayıt formu
export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(50),
    lastName: z.string().trim().min(2, "Soyad en az 2 karakter olmalı.").max(50),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Kullanıcı adı en az 3 karakter olmalı.")
      .max(30, "Kullanıcı adı en fazla 30 karakter olabilir.")
      .regex(/^[a-z0-9_]+$/, "Kullanıcı adı yalnızca İngilizce harf, rakam ve _ içerebilir."),
    communityId: z.string().min(1, "HSD topluluğunu seçmedin."),
    email,
    password: strongPassword,
    password2: z.string(),
  })
  // İki şifre aynı mı?
  .refine((d) => d.password === d.password2, { message: "Şifreler aynı değil.", path: ["password2"] });

// "Şifremi unuttum" formu: sadece e-posta
export const forgotSchema = z.object({ email });

// "Yeni şifre belirle" formu (e-postadaki bağlantıdan gelinir)
export const resetSchema = z
  .object({ password: strongPassword, password2: z.string() })
  .refine((d) => d.password === d.password2, { message: "Şifreler aynı değil.", path: ["password2"] });

// Profil bilgileri formu
const optionalUrl = (pattern: RegExp, message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || pattern.test(v), message);

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(50),
  lastName: z.string().trim().min(2, "Soyad en az 2 karakter olmalı.").max(50),
  communityId: z.string().min(1, "HSD topluluğunu seçmedin."),
  bio: z.string().trim().max(500, "Biyografi en fazla 500 karakter olabilir."),
  githubUrl: optionalUrl(/^https:\/\/(www\.)?github\.com\/[\w.-]+\/?$/, "Örn. https://github.com/kullaniciadi"),
  linkedinUrl: optionalUrl(/^https:\/\/(www\.)?linkedin\.com\/in\/[\w%.-]+\/?$/, "Örn. https://linkedin.com/in/kullaniciadi"),
});

// Profilden şifre değiştirme formu
export const passwordChangeSchema = z
  .object({ current: z.string().min(1, "Mevcut şifreni yazmadın."), password: strongPassword, password2: z.string() })
  .refine((d) => d.password === d.password2, { message: "Şifreler aynı değil.", path: ["password2"] })
  .refine((d) => d.password !== d.current, { message: "Yeni şifre eskisiyle aynı olamaz.", path: ["password"] });

// Yazı oluşturma formu
export const postSchema = z.object({
  title: z.string().trim().min(3, "Başlık en az 3 karakter olmalı.").max(120, "Başlık en fazla 120 karakter olabilir."),
  categoryId: z.string().min(1, "Kategori seçmedin."),
  contentMd: z.string().trim().min(1, "Yazı içeriği boş olamaz.").max(20000, "Yazı en fazla 20.000 karakter olabilir."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
export type PostValues = z.infer<typeof postSchema>;
