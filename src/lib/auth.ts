// ---- GEÇİCİ üyelik sistemi (localStorage) ----
// Backend hazır olunca bu dosyadaki fonksiyonlar API isteklerine çevrilecek.
// Oturum bilgisi o zaman HttpOnly cookie ile tutulacak (localStorage'a yazılmayacak).
import type { Session, StoredUser } from "@/types";

const USERS_KEY = "hsdcode-users"; // tüm üyelerin listesi
const SESSION_KEY = "hsdcode-session"; // giriş yapmış kullanıcı
export const AUTH_EVENT = "hsdcode-auth"; // giriş/çıkış olunca yayınlanan olay

// İşlem sonucu: başarılı ya da hata mesajı
export type AuthResult = { ok: true } | { ok: false; message: string };

// localStorage'dan güvenli okuma (hata olursa varsayılan değeri döner)
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// localStorage'a güvenli yazma (başarılıysa true)
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// "Ali Yılmaz" -> "aliyilmaz" gibi kullanıcı adı üretir (Türkçe karakterleri sadeleştirir)
function slugify(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Yalnızca site içi adreslere yönlendirmeye izin verir (güvenlik için)
export function safeNext(value: string | null, fallback = "/dashboard"): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

// ---------- Kayıt ----------
export function registerUser(input: {
  name: string;
  email: string;
  password: string;
  community?: string;
}): AuthResult {
  const users = read<StoredUser[]>(USERS_KEY, []);
  const email = input.email.trim().toLowerCase();

  // Aynı e-posta ile ikinci kayıt engellenir
  if (users.some((u) => u.email === email)) {
    return { ok: false, message: "Bu e-posta ile kayıtlı bir hesap var. Giriş yapmayı dene." };
  }

  // Kullanıcı adı: e-postanın @ öncesi; doluysa sonuna sayı eklenir
  const base = slugify(email.split("@")[0]) || "uye";
  let username = base;
  let counter = 1;
  while (users.some((u) => u.username === username)) {
    counter += 1;
    username = `${base}${counter}`;
  }

  users.push({
    name: input.name.trim(),
    email,
    password: input.password,
    community: input.community?.trim() || "Belirtilmedi",
    username,
  });

  return write(USERS_KEY, users)
    ? { ok: true }
    : { ok: false, message: "Tarayıcı depolaması kapalı olduğu için hesap oluşturulamadı." };
}

// ---------- Giriş ----------
export function loginUser(emailInput: string, password: string): AuthResult {
  const users = read<StoredUser[]>(USERS_KEY, []);

  // Hiç üye yoksa
  if (users.length === 0) {
    return { ok: false, message: "Kayıtlı hesap bulunamadı. Önce kayıt ol." };
  }

  const email = emailInput.trim().toLowerCase();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { ok: false, message: "E-posta veya şifre yanlış." };
  }

  // Oturuma şifre yazılmaz
  const session: Session = {
    name: user.name,
    email: user.email,
    community: user.community,
    username: user.username,
    role: "user",
  };
  write(SESSION_KEY, session);
  window.dispatchEvent(new Event(AUTH_EVENT)); // Navbar vb. güncellensin
  return { ok: true };
}

// ---------- Çıkış ----------
export function logout(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* depolama kapalıysa yapacak bir şey yok */
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

// ---------- useSession hook'u için yardımcılar ----------
// Oturumun ham (JSON metni) hâlini okur
export function getSessionRaw(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

// JSON metnini Session nesnesine çevirir (bozuksa null)
export function parseSession(raw: string): Session | null {
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

// Oturum değişince haber verir (aynı sekmede ve diğer sekmelerde)
export function subscribeAuth(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// ============================================================
//  YENİ: PROFİL, ŞİFRE DEĞİŞTİRME VE ŞİFRE SIFIRLAMA İŞLEMLERİ
//  (Bunlar da GEÇİCİ: backend gelince API isteklerine çevrilecek.)
// ============================================================

const USED_RESET_KEY = "hsdcode-used-reset"; // daha önce kullanılmış sıfırlama bağlantıları

// E-postadan üyeyi bulur (bulamazsa undefined)
function findUser(email: string): StoredUser | undefined {
  const mail = email.trim().toLowerCase();
  return read<StoredUser[]>(USERS_KEY, []).find((u) => u.email === mail);
}

// Bu e-posta ile kayıtlı bir üye var mı? (şifremi unuttum ekranında kullanılır)
export function userExists(email: string): boolean {
  return findUser(email) !== undefined;
}

// Üyenin kayıtlı bilgilerini yazıp (şifre hariç) dışarı verir
export function getProfile(email: string): Omit<StoredUser, "password"> | null {
  const user = findUser(email);
  if (!user) return null;
  // Şifreyi bilerek dışarı vermiyoruz: ekranda asla gösterilmemeli
  return { name: user.name, email: user.email, community: user.community, username: user.username };
}

// ---------- Profil bilgilerini güncelle (ad soyad + HSD topluluğu) ----------
export function updateProfile(email: string, input: { name: string; community: string }): AuthResult {
  const users = read<StoredUser[]>(USERS_KEY, []);
  const mail = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email === mail);
  if (index === -1) return { ok: false, message: "Hesap bulunamadı." };

  // Üye listesindeki kaydı güncelle
  users[index] = {
    ...users[index],
    name: input.name.trim(),
    community: input.community.trim() || "Belirtilmedi",
  };
  if (!write(USERS_KEY, users)) {
    return { ok: false, message: "Tarayıcı depolaması kapalı olduğu için kaydedilemedi." };
  }

  // Açık oturumdaki bilgiyi de güncelle (Navbar anında yeni adı göstersin)
  const raw = getSessionRaw();
  const current = raw ? parseSession(raw) : null;
  if (current) {
    write(SESSION_KEY, { ...current, name: users[index].name, community: users[index].community });
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
  return { ok: true };
}

// ---------- Giriş yapmış üyenin şifresini değiştir ----------
export function changePassword(email: string, currentPassword: string, newPassword: string): AuthResult {
  const users = read<StoredUser[]>(USERS_KEY, []);
  const mail = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email === mail);
  if (index === -1) return { ok: false, message: "Hesap bulunamadı." };

  // Güvenlik: mevcut şifre doğru girilmeden yenisi kabul edilmez
  if (users[index].password !== currentPassword) {
    return { ok: false, message: "Mevcut şifren yanlış." };
  }
  users[index] = { ...users[index], password: newPassword };
  return write(USERS_KEY, users)
    ? { ok: true }
    : { ok: false, message: "Tarayıcı depolaması kapalı olduğu için şifre değiştirilemedi." };
}

// ---------- Şifremi unuttum: e-postadaki bağlantıyla yeni şifre belirle ----------
// tokenId: bağlantının imzası; aynı bağlantı ikinci kez kullanılamasın diye saklanır
export function isResetTokenUsed(tokenId: string): boolean {
  return read<string[]>(USED_RESET_KEY, []).includes(tokenId);
}

export function resetPasswordWithToken(email: string, newPassword: string, tokenId: string): AuthResult {
  if (isResetTokenUsed(tokenId)) {
    return { ok: false, message: "Bu bağlantı daha önce kullanılmış. Yeni bir bağlantı iste." };
  }
  const users = read<StoredUser[]>(USERS_KEY, []);
  const mail = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email === mail);
  if (index === -1) {
    // Backend yokken üyelik yalnızca kayıt olunan tarayıcıda durur
    return {
      ok: false,
      message: "Bu e-posta ile kayıtlı hesap bu tarayıcıda bulunamadı. Bağlantıyı hesabı açtığın tarayıcıda aç.",
    };
  }
  users[index] = { ...users[index], password: newPassword };
  if (!write(USERS_KEY, users)) {
    return { ok: false, message: "Tarayıcı depolaması kapalı olduğu için şifre değiştirilemedi." };
  }
  // Bağlantıyı "kullanıldı" olarak işaretle (tek kullanımlık)
  write(USED_RESET_KEY, [...read<string[]>(USED_RESET_KEY, []), tokenId]);
  return { ok: true };
}
